import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  StatusBar,
  Text,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Occurrence } from "../types";
import { occurrenceService } from "../services/occurrenceService";
import SearchBar from "../components/SearchBar";
import FilterModal, { FilterState } from "../components/FilterModal";

type SectionData = {
  title: string;
  data: Occurrence[];
  count: number;
};

export default function Home() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [allOccurrences, setAllOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estado da Busca de Texto
  const [searchText, setSearchText] = useState("");

  // Estado do Modal de Filtros (REMOVIDO: region)
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    startDate: "",
    endDate: "",
    status: null,
    type: null,
    // region: null, <-- Removido
  });

  const fetchOccurrences = async () => {
    setRefreshing(true);
    try {
      const data = await occurrenceService.getAll();
      setAllOccurrences(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOccurrences();
  }, []);

  // Lógica de Filtragem Otimizada
  const sections = useMemo(() => {
    const filtered = allOccurrences.filter((item) => {
      // 1. Filtro por Texto (Título ou ID)
      const matchSearch = searchText
        ? String(item.id).includes(searchText) ||
          item.titule?.toLowerCase().includes(searchText.toLowerCase())
        : true;

      // 2. Filtro por Status
      const matchStatus = filters.status
        ? item.status === filters.status
        : true;

      // 3. Filtro por Tipo (ID)
      const matchType = filters.type
        ? String(item.type?.id) === String(filters.type)
        : true;

      // 4. Filtro por Data
      let matchDate = true;
      if (filters.startDate) {
        const itemDate = new Date(item.date).getTime();
        const startDate = new Date(filters.startDate).getTime();
        matchDate = matchDate && itemDate >= startDate;
      }
      if (filters.endDate) {
        const itemDate = new Date(item.date).getTime();
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        matchDate = matchDate && itemDate <= endDate.getTime();
      }

      return matchSearch && matchStatus && matchType && matchDate;
    });

    // Agrupamento
    const result: SectionData[] = [];
    const addGroup = (title: string, st: string) => {
      const data = filtered.filter((o) => o.status === st);
      if (data.length) result.push({ title, data, count: data.length });
    };

    addGroup("Em Andamento", "Em_andamento");
    addGroup("Encerradas", "Encerrada");
    addGroup("Canceladas", "Cancelada");

    return result;
  }, [allOccurrences, searchText, filters]);

  // Cores
  const getStatusColor = (s: string) =>
    s === "Em_andamento"
      ? "#FF8C00"
      : s === "Encerrada"
        ? "#4CAF50"
        : "#9E9E9E";
  const getPriorityBg = (p: string) => (p === "Alta" ? "#FFEBEE" : "#E3F2FD");
  const getPriorityColor = (p: string) =>
    p === "Alta" ? "#D32F2F" : "#1976D2";

  // Ícone de filtro ativo (sem region)
  const isFilterActive = !!(
    filters.status ||
    filters.type ||
    filters.startDate ||
    filters.endDate
  );

  const renderItem = ({ item }: { item: Occurrence }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate(
          "OccurrenceDetails" as never,
          { occurrenceData: item } as never,
        )
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
            {item.type?.name || "Sem Tipo"} •{" "}
            {item.address?.street || "Sem endereço"}
          </Text>
        </View>
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
          <Feather
            name="calendar"
            size={12}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString("pt-BR")}
          </Text>
        </View>
        <Text style={styles.idText}>#{item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>
              Olá, {user?.name?.split(" ")[0]}
            </Text>
            <Text style={styles.headerSubtitle}>Dashboard Operacional</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Feather name="log-out" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          onClear={() => setSearchText("")}
          onFilterPress={() => setIsFilterVisible(true)}
          filterActive={isFilterActive}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{section.count}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
              Nenhuma ocorrência encontrada.
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("RegisterOccurrence" as never)}
      >
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => setIsFilterVisible(false)}
        // Limpar filtro atualizado
        onClear={() =>
          setFilters({ startDate: "", endDate: "", status: null, type: null })
        }
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      backgroundColor: theme.colors.primary,
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
    headerGreeting: {
      color: theme.colors.white,
      fontSize: 20 * theme.fontScale,
      fontWeight: "bold",
    },
    headerSubtitle: {
      color: theme.colors.white,
      fontSize: 14 * theme.fontScale,
      opacity: 0.8,
    },
    logoutButton: {
      padding: 8,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 8,
    },
    listContent: { padding: 20, paddingBottom: 100 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      marginTop: 15,
    },
    sectionTitle: {
      fontSize: 18 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.text,
      marginRight: 8,
    },
    sectionBadge: {
      backgroundColor: theme.colors.border,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    sectionBadgeText: {
      fontSize: 12 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.textSecondary,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      fontSize: 16 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 14 * theme.fontScale,
      color: theme.colors.textSecondary,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginLeft: 8,
    },
    badgeText: { fontSize: 12 * theme.fontScale, fontWeight: "bold" },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 10,
    },
    footerInfo: { flexDirection: "row", alignItems: "center", gap: 5 },
    dateText: {
      fontSize: 12 * theme.fontScale,
      color: theme.colors.textSecondary,
    },
    idText: {
      fontSize: 12 * theme.fontScale,
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    fab: {
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });
