// src/screens/Home.tsx (Com Pesquisa, Filtros e Seções)

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Feather } from "@expo/vector-icons"; // Ícones
import { useAuth } from "../contexts/AuthContext";

// --- Tipos ---
type Occurrence = {
  id: number;
  titule: string | null;
  type: number;
  nome_tipo: string; // Vem do JOIN ou placeholder
  date: string;
  status: "Em_andamento" | "Encerrada" | "Cancelada";
  priority: "Baixa" | "Media" | "Alta" | "Critica";
};

// Tipo para as Seções da Lista
type OccurrenceSection = {
  title: string;
  data: Occurrence[];
  count: number; // Para mostrar (3) ao lado do título
};

const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database";
const GET_OCCURRENCES_URL = `${API_URL}/occurrence/getall`;

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth(); // Token já está salvo no AuthContext? Se não, pegamos do Storage

  // --- Estados ---
  const [allOccurrences, setAllOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de Filtro e Busca
  const [searchText, setSearchText] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  // --- Busca de Dados (API Real) ---
  const fetchOccurrences = async () => {
    // Nota: Em um app real, use o token do contexto. Aqui simulamos o fetch.
    // Se o seu AuthContext expõe o token, use-o. Caso contrário, pegue do AsyncStorage.
    try {
      // Para simplificar neste exemplo, assumimos que o fetch funciona ou usamos mock se falhar
      // No seu caso, descomente a linha do fetch real abaixo:

      const response = await fetch(GET_OCCURRENCES_URL);
      // (Adicione headers: { Authorization: `Bearer ${token}` } se sua API exigir)

      if (response.ok) {
        const data = await response.json();
        // Mapeia os dados para garantir que os campos existam
        const formattedData = data.map((o: any) => ({
          ...o,
          titule: o.titule || `Ocorrência #${o.id}`,
          nome_tipo: o.nome_tipo || `Tipo ${o.type}`,
          // Normaliza o status se vier diferente (ex: "Em andamento" vs "Em_andamento")
          status: o.status === "Em andamento" ? "Em_andamento" : o.status,
        }));
        setAllOccurrences(formattedData);
      } else {
        console.log("Erro ao buscar dados (API). Usando dados vazios.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOccurrences();
  }, []);

  // --- Lógica de Filtragem e Agrupamento ---
  const sections = useMemo(() => {
    // 1. Filtra a lista bruta
    const filtered = allOccurrences.filter((item) => {
      // Filtro por ID (Busca)
      const matchesSearch = searchText
        ? String(item.id).includes(searchText) ||
          item.titule?.toLowerCase().includes(searchText.toLowerCase())
        : true;

      // Filtro por Prioridade
      const matchesPriority = selectedPriority
        ? item.priority === selectedPriority
        : true;

      return matchesSearch && matchesPriority;
    });

    // 2. Agrupa por Status
    const emAndamento = filtered.filter((o) => o.status === "Em_andamento");
    const encerradas = filtered.filter((o) => o.status === "Encerrada");
    const canceladas = filtered.filter((o) => o.status === "Cancelada");

    // 3. Monta as seções (se tiver dados)
    const result: OccurrenceSection[] = [];

    if (emAndamento.length > 0)
      result.push({
        title: "Em Andamento",
        data: emAndamento,
        count: emAndamento.length,
      });
    if (encerradas.length > 0)
      result.push({
        title: "Encerradas",
        data: encerradas,
        count: encerradas.length,
      });
    if (canceladas.length > 0)
      result.push({
        title: "Canceladas",
        data: canceladas,
        count: canceladas.length,
      });

    return result;
  }, [allOccurrences, searchText, selectedPriority]);

  // --- Helpers de UI ---
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "Em_andamento" || status === "Em andamento")
      return "#FF8C00"; // Laranja
    if (status === "Encerrada") return "#4CAF50"; // Verde
    return "#9E9E9E"; // Cinza
  };

  // --- Renderização ---
  const renderItem = ({ item }: { item: Occurrence }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => console.log(`Navegar para Detalhes ID: ${item.id}`)}
      // onPress={() => navigation.navigate('OccurrenceDetails', { id: item.id })} // Futuro
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
            {item.titule}
          </Text>
          <Text style={styles.cardSubtitle}>{item.nome_tipo}</Text>
        </View>
        {/* Badge Prioridade */}
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                item.priority === "Alta" || item.priority === "Critica"
                  ? "#FFEBEE"
                  : "#E3F2FD",
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color:
                  item.priority === "Alta" || item.priority === "Critica"
                    ? "#D32F2F"
                    : "#1976D2",
              },
            ]}
          >
            {item.priority}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Feather name="calendar" size={12} color="#999" />
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.idText}>#{item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({
    section: { title, count },
  }: {
    section: OccurrenceSection;
  }) => (
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

        {/* Barra de Pesquisa e Filtro */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={20}
              color="#666"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Pesquisar ID ou Título..."
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              keyboardType="default"
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
              selectedPriority && styles.filterButtonActive,
            ]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Feather
              name="filter"
              size={22}
              color={selectedPriority ? "#FFF" : "#1650A7"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Seções */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1650A7" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Carregando ocorrências...
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchOccurrences} // Pull to refresh
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Feather name="inbox" size={40} color="#CCC" />
              <Text style={styles.emptyText}>
                {searchText
                  ? "Nenhuma ocorrência encontrada para essa busca."
                  : "Nenhuma ocorrência registrada."}
              </Text>
            </View>
          }
          stickySectionHeadersEnabled={false} // Headers não fixos (design mais limpo)
        />
      )}

      {/* MODAL DE FILTROS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar Ocorrências</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Prioridade:</Text>
            <View style={styles.filterOptions}>
              {["Baixa", "Media", "Alta", "Critica"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.filterChip,
                    selectedPriority === p && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setSelectedPriority(selectedPriority === p ? null : p)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPriority === p && styles.filterChipTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>

            {selectedPriority && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => {
                  setSelectedPriority(null);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.clearFilterText}>Limpar Filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  // Header
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

  // Busca
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
  filterButtonActive: {
    backgroundColor: "#FF8C00", // Laranja quando ativo
    borderColor: "#FFF",
    borderWidth: 1,
  },

  // Lista
  listContent: { padding: 20, paddingBottom: 100 },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },

  // Seções
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
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

  // Card
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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

  // Modal Filtros
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipActive: { backgroundColor: "#E3F2FD", borderColor: "#1650A7" },
  filterChipText: { color: "#666" },
  filterChipTextActive: { color: "#1650A7", fontWeight: "bold" },
  applyButton: {
    backgroundColor: "#1650A7",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  applyButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  clearFilterButton: { marginTop: 15, alignItems: "center" },
  clearFilterText: { color: "#FF4444", fontSize: 14 },
});
