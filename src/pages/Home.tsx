import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

// Imports da Nova Arquitetura
import { useAuth } from "../contexts/AuthContext";
import { occurrenceService } from "../services/occurrenceService"; // O serviço faz o trabalho sujo
import { Occurrence } from "../types"; // O tipo vem daqui agora

// Componentes Visuais
import SearchBar from "../components/SearchBar";
// Se você ainda não tem o GenericFilterModal, use o FilterModal simples que você tinha
import FilterModal from "../components/FilterModal";

// Tipos locais para a lista
type SectionData = {
  title: string;
  data: Occurrence[];
  count: number;
};

type RootStackParamList = {
  OccurrenceDetails: { id: number };
  Home: undefined;
};

export default function Home() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // --- Estados ---
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Estados de Filtro ---
  const [searchText, setSearchText] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Estados dos filtros do modal
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: null as string | null,
    adress: null as string | null,
    type: null as number | null,
  });

  // --- 1. Busca de Dados (Limpa) ---
  const loadData = async () => {
    try {
      const data = await occurrenceService.getAll();
      setOccurrences(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as ocorrências.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // --- 2. Lógica de Filtros e Seções (useMemo) ---
  const sections = useMemo(() => {
    // Função auxiliar para converter DD/MM/AAAA para Date
    const parseDate = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      const parts = dateStr.split("/");
      if (parts.length !== 3) return null;
      const [day, month, year] = parts;
      return new Date(`${year}-${month}-${day}`);
    };

    // a) Filtrar
    const filtered = occurrences.filter((item) => {
      // Filtro de busca (ID ou Título)
      const matchSearch = searchText
        ? String(item.id).includes(searchText) ||
          (item.titule &&
            item.titule.toLowerCase().includes(searchText.toLowerCase()))
        : true;

      // Filtro de Data (período)
      let matchDate = true;
      if (filters.startDate || filters.endDate) {
        const itemDate = new Date(item.date);
        if (filters.startDate) {
          const startDate = parseDate(filters.startDate);
          if (startDate && itemDate < startDate) matchDate = false;
        }
        if (filters.endDate) {
          const endDate = parseDate(filters.endDate);
          if (endDate) {
            // Adiciona 1 dia para incluir todo o dia final
            endDate.setDate(endDate.getDate() + 1);
            if (itemDate > endDate) matchDate = false;
          }
        }
      }

      // Filtro de Status
      const matchStatus = filters.status
        ? item.status === filters.status ||
          item.status === filters.status.replace("_", " ")
        : true;

      // Filtro de Tipo
      const matchType = filters.type ? item.type === filters.type : true;

      // Filtro de Região/Endereço
      const matchAdress = filters.adress
        ? item.address?.includes(filters.adress) ||
          item.nome_bairro?.includes(filters.adress) ||
          item.nome_cidade?.includes(filters.adress)
        : true;

      return (
        matchSearch && matchDate && matchStatus && matchType && matchAdress
      );
    });

    // b) Agrupar por Status
    const result: SectionData[] = [];

    const addSection = (title: string, statusKey: string) => {
      // Normaliza status (API pode mandar 'Em_andamento' ou 'Em andamento')
      const group = filtered.filter(
        (o) =>
          o.status === statusKey || o.status === statusKey.replace("_", " "),
      );
      if (group.length > 0) {
        result.push({ title, data: group, count: group.length });
      }
    };

    addSection("Em Andamento", "Em_andamento");
    addSection("Encerradas", "Encerrada");
    addSection("Canceladas", "Cancelada");

    return result;
  }, [occurrences, searchText, filters]);

  // --- 3. Renderização dos Itens ---

  // Helpers de Estilo
  const getStatusColor = (s: string) => {
    if (s.includes("Em")) return "#FF8C00"; // Laranja
    if (s.includes("Encerrada")) return "#4CAF50"; // Verde
    return "#9E9E9E"; // Cinza
  };

  const getPriorityBg = (p: string) =>
    p === "Alta" || p === "Critica" ? "#FFEBEE" : "#E3F2FD";
  const getPriorityColor = (p: string) =>
    p === "Alta" || p === "Critica" ? "#D32F2F" : "#1976D2";

  const renderItem = ({ item }: { item: Occurrence }) => {
    // Formata data se for válida, senão mostra original
    let dateDisplay = item.date;
    try {
      const d = new Date(item.date);
      if (!isNaN(d.getTime())) dateDisplay = d.toLocaleDateString("pt-BR");
    } catch (e) {}

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("OccurrenceDetails", { id: item.id })
        }
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.titule || `Ocorrência #${item.id}`}
            </Text>
            <Text style={styles.cardSubtitle}>
              {item.nome_tipo || `Tipo ${item.type}`}
            </Text>
          </View>
          {/* Badge Prioridade */}
          <View
            style={[
              styles.badge,
              { backgroundColor: getPriorityBg(item.priority) },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getPriorityColor(item.priority) },
              ]}
            >
              {item.priority}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <Feather name="calendar" size={12} color="#999" />
            <Text style={styles.dateText}>{dateDisplay}</Text>
          </View>
          <Text style={styles.idText}>#{item.id}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title, count } }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{count}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1650A7" />

      {/* Header Azul */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>
              Olá, {user?.name?.split(" ")[0] || "Bombeiro"}
            </Text>
            <Text style={styles.headerSubtitle}>Dashboard Operacional</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Feather name="log-out" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Barra de Busca */}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          onClear={() => setSearchText("")}
          placeholder="Buscar ID ou Título..."
          onFilterPress={() => setIsFilterVisible(true)}
          filterActive={
            !!filters.status ||
            !!filters.type ||
            !!filters.adress ||
            !!filters.startDate ||
            !!filters.endDate
          }
          filterCount={
            [
              filters.status,
              filters.type,
              filters.adress,
              filters.startDate,
              filters.endDate,
            ].filter(Boolean).length
          }
        />
      </View>

      {/* Conteúdo */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1650A7" />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Feather name="inbox" size={40} color="#CCC" />
              <Text style={styles.emptyText}>
                Nenhuma ocorrência encontrada.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de Filtro (Reutilizando o que você já tinha ou o Generic) */}
      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={() => setIsFilterVisible(false)}
        onClear={() => {
          setFilters({
            startDate: "",
            endDate: "",
            status: null,
            adress: null,
            type: null,
          });
          setIsFilterVisible(false);
        }}
        filters={filters}
        setFilters={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    backgroundColor: "#1650A7",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerGreeting: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  headerSubtitle: { color: "#E0E0E0", fontSize: 14 },
  logoutButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
  },
  listContent: { padding: 20, paddingBottom: 100 },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { color: "#999", fontSize: 16, marginTop: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  sectionBadge: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionBadgeText: { fontSize: 12, fontWeight: "bold", color: "#666" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  cardSubtitle: { fontSize: 14, color: "#666" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
  },
  footerInfo: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateText: { fontSize: 12, color: "#999" },
  idText: { fontSize: 12, color: "#1650A7", fontWeight: "bold" },
});
