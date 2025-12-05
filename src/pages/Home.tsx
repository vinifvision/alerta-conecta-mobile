// src/screens/Home.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext"; // Importe o contexto
import FilterModal, { FilterState } from "../components/FilterModal"; // Importe o modal

// --- Tipos ---
type Occurrence = {
  id: number;
  titule: string;
  type: number; // ID do tipo
  nome_tipo: string; // Nome do tipo (Ex: Incêndio)
  date: string;
  status: "Em_andamento" | "Encerrada" | "Cancelada";
  priority: "Baixa" | "Media" | "Alta" | "Critica";
  // Simulação de região (já que a API ainda não manda)
  region?: string;
};

type SectionData = {
  title: string;
  data: Occurrence[];
  count: number;
};

// URL da API
const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database";
const GET_OCCURRENCES_URL = `${API_URL}/occurrence/getall`;

// Fallback para nomes de tipos
const OCCURRENCE_TYPES: Record<number, string> = {
  1: "Incêndio",
  2: "Resgate",
  3: "APH",
  4: "Prevenção",
  5: "Ambiental",
  6: "Administrativa",
  7: "Desastre",
};

// --- DADOS MOCK (ADICIONADO) ---
const MOCK_DATA: Occurrence[] = [
  {
    id: 101,
    titule: "Incêndio em Edificação Residencial",
    type: 1,
    nome_tipo: "Incêndio",
    date: "2025-10-25T14:30:00",
    status: "Em_andamento",
    priority: "Alta",
    region: "RMR",
  },
  {
    id: 102,
    titule: "Resgate Veicular na BR-101",
    type: 2,
    nome_tipo: "Resgate",
    date: "2025-10-25T16:00:00",
    status: "Encerrada",
    priority: "Media",
    region: "Zona da Mata",
  },
  {
    id: 103,
    titule: "Vazamento de Gás GLP",
    type: 5,
    nome_tipo: "Ocorrência Ambiental",
    date: "2025-10-24T09:15:00",
    status: "Cancelada",
    priority: "Baixa",
    region: "Agreste",
  },
  {
    id: 104,
    titule: "Deslizamento de Barreira",
    type: 7,
    nome_tipo: "Desastre Natural",
    date: "2025-10-24T18:45:00",
    status: "Em_andamento",
    priority: "Critica",
    region: "RMR",
  },
  {
    id: 105,
    titule: "Captura de Animal Silvestre",
    type: 5,
    nome_tipo: "Ocorrência Ambiental",
    date: "2025-10-23T10:00:00",
    status: "Encerrada",
    priority: "Baixa",
    region: "Sertão",
  },
  {
    id: 106,
    titule: "Atendimento Pré-Hospitalar (Queda)",
    type: 3,
    nome_tipo: "APH",
    date: "2025-10-23T22:10:00",
    status: "Em_andamento",
    priority: "Media",
    region: "RMR",
  },
];
type RootStackParamList = {
  Home: undefined;
  OccurrenceDetails: { id: number };
  // adicione outros nomes de rotas conforme necessário
};

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();

  // Dados
  const [allOccurrences, setAllOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros e Busca
  const [searchText, setSearchText] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    startDate: "",
    endDate: "",
    status: null,
    region: null,
    type: null,
  });

  // --- Fetch de Dados (USANDO MOCK) ---
  const fetchOccurrences = async () => {
    setRefreshing(true);

    // Simula um delay de rede e carrega os dados Mock
    setTimeout(() => {
      setAllOccurrences(MOCK_DATA);
      setLoading(false);
      setRefreshing(false);
    }, 1000);

    /* CÓDIGO DA API ORIGINAL (Comentado para usar o Mock)
    try {
      const response = await fetch(GET_OCCURRENCES_URL);
      if (response.ok) {
        const data = await response.json();

        // Mapeia os dados para garantir formato correto
        const mappedData = data.map((o: any) => ({
          id: o.id,
          titule: o.titule || `Ocorrência #${o.id}`,
          type: o.type,
          nome_tipo:
            o.nome_tipo || OCCURRENCE_TYPES[o.type] || `Tipo ${o.type}`,
          date: o.date,
          status: o.status === "Em andamento" ? "Em_andamento" : o.status, // Corrige possível erro de digitação da API
          priority: o.priority,
          // Simula Região aleatória para teste (pois a API não manda ainda)
          region: ["RMR", "Zona da Mata", "Agreste", "Sertão"][o.id % 4],
        }));

        setAllOccurrences(mappedData);
      }
    } catch (error) {
      console.error("Erro ao buscar:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    */
  };

  useEffect(() => {
    fetchOccurrences();
  }, []);

  // --- Lógica de Filtragem (Memoizada) ---
  const sections = useMemo(() => {
    // Parse datas
    const parseDate = (s: string) =>
      s.length === 10 ? new Date(s.split("/").reverse().join("-")) : null;
    const start = parseDate(filters.startDate);
    const end = parseDate(filters.endDate);
    if (end) end.setHours(23, 59, 59);

    // 1. Aplica Filtros
    const filtered = allOccurrences.filter((item) => {
      // Busca por ID ou Título
      const matchSearch = searchText
        ? String(item.id).includes(searchText) ||
          item.titule.toLowerCase().includes(searchText.toLowerCase())
        : true;

      const itemDate = new Date(item.date);
      const matchDate =
        (!start || itemDate >= start) && (!end || itemDate <= end);

      const matchStatus = !filters.status || item.status === filters.status;
      const matchRegion = !filters.region || item.region === filters.region;
      const matchType = !filters.type || item.type === filters.type;

      return (
        matchSearch && matchDate && matchStatus && matchRegion && matchType
      );
    });

    // 2. Agrupa por Status (Em Andamento, Encerrada, etc)
    const result: SectionData[] = [];

    // Função auxiliar para criar grupo
    const addGroup = (title: string, statusValue: string) => {
      const groupData = filtered.filter((o) => o.status === statusValue);
      if (groupData.length > 0) {
        result.push({ title, data: groupData, count: groupData.length });
      }
    };

    // Ordem das seções
    addGroup("Em Andamento", "Em_andamento");
    addGroup("Encerradas", "Encerrada");
    addGroup("Canceladas", "Cancelada");

    return result;
  }, [allOccurrences, searchText, filters]);

  // --- Renderização ---
  const renderItem = ({ item }: { item: Occurrence }) => {
    const dateObj = new Date(item.date);
    const formattedDate = `${dateObj.toLocaleDateString("pt-BR")} ${dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

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
            <Text style={styles.cardTitle}>{item.titule}</Text>
            <Text style={styles.cardSubtitle}>
              {item.nome_tipo} • {item.region}
            </Text>
          </View>
          {/* Badge de Prioridade */}
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
            <Text style={styles.dateText}>{formattedDate}</Text>
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

  // Helpers de estilo
  const getStatusColor = (s: string) =>
    s === "Em_andamento"
      ? "#FF8C00"
      : s === "Encerrada"
        ? "#4CAF50"
        : "#9E9E9E";
  const getPriorityColor = (p: string) =>
    p === "Alta" || p === "Critica" ? "#D32F2F" : "#1976D2";
  const getPriorityBg = (p: string) =>
    p === "Alta" || p === "Critica" ? "#FFEBEE" : "#E3F2FD";

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1650A7" />

      {/* Header */}
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

        {/* Busca e Botão de Filtro */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={20}
              color="#666"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Buscar ID ou Título..."
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Feather name="x" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFiltersCount > 0 && styles.filterButtonActive,
            ]}
            onPress={() => setIsFilterVisible(true)}
          >
            <Feather
              name="filter"
              size={22}
              color={activeFiltersCount > 0 ? "#FFF" : "#1650A7"}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1650A7"
          style={{ marginTop: 50 }}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchOccurrences}
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

      {/* Modal de Filtros */}
      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => setIsFilterVisible(false)}
        onClear={() =>
          setFilters({
            startDate: "",
            endDate: "",
            status: null,
            region: null,
            type: null,
          })
        }
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

  searchRow: { flexDirection: "row", gap: 10 },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },
  filterButton: {
    width: 45,
    height: 45,
    backgroundColor: "#FFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonActive: { backgroundColor: "#1650A7" },
  filterBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  filterBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },

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
