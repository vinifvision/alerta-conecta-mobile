import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

// Importar da Nova Arquitetura
import { occurrenceService } from "../services/occurrenceService"; // Serviço
import { Occurrence } from "../types"; // Tipos centrais

// Tipo dos parâmetros da rota (o ID que vem da Home)
type ParamList = {
  OccurrenceDetails: { id: number };
};

export default function OccurrenceDetails() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, "OccurrenceDetails">>();
  const { id } = route.params; // Pega o ID passado

  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Busca de Dados (Via Serviço) ---
  useEffect(() => {
    const loadDetails = async () => {
      try {
        // O serviço decide se pega do Mock ou da API
        const data = await occurrenceService.getById(id);

        if (data) {
          setOccurrence(data);
        } else {
          Alert.alert("Erro", "Ocorrência não encontrada.");
          navigation.goBack();
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Falha ao carregar detalhes.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1650A7" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Carregando detalhes...
        </Text>
      </View>
    );
  }

  if (!occurrence) return null;

  // Helpers de UI
  const getStatusColor = (status: string) => {
    if (status.includes("Em")) return "#FF8C00";
    if (status.includes("Encerrada")) return "#4CAF50";
    return "#9E9E9E";
  };

  const dateObj = new Date(occurrence.date);
  const formattedDate = `${dateObj.toLocaleDateString("pt-BR")} às ${dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  // Coordenadas padrão (Recife) se não vierem na ocorrência
  const initialRegion = {
    latitude: occurrence.lat || -8.047562,
    longitude: occurrence.lng || -34.877001,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mapa */}
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={initialRegion}>
            <Marker
              coordinate={{
                latitude: initialRegion.latitude,
                longitude: initialRegion.longitude,
              }}
            />
          </MapView>
          <View style={styles.addressBar}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#1650A7"
            />
            <Text style={styles.addressText} numberOfLines={1}>
              {occurrence.address || "Endereço não disponível"}
            </Text>
          </View>
        </View>

        {/* Card Principal */}
        <View style={styles.mainCard}>
          <Text style={styles.occurrenceTitle}>
            {occurrence.titule || `Ocorrência #${occurrence.id}`}
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.occurrenceType}>
              {occurrence.nome_tipo || `Tipo ${occurrence.type}`}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(occurrence.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {occurrence.status.replace("_", " ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Descrição e Vítimas */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>
            {occurrence.details || "Sem descrição."}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Vítimas / Envolvidos</Text>
          <Text style={styles.descriptionText}>
            {occurrence.victims || "Nenhuma vítima informada."}
          </Text>
        </View>

        {/* Grid Data e Prioridade */}
        <View style={styles.grid}>
          <View style={styles.smallCard}>
            <Feather name="calendar" size={20} color="#666" />
            <Text style={styles.label}>Data</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </View>
          <View style={styles.smallCard}>
            <Feather name="alert-triangle" size={20} color="#666" />
            <Text style={styles.label}>Prioridade</Text>
            <Text
              style={[
                styles.value,
                {
                  color:
                    occurrence.priority === "Alta" ||
                    occurrence.priority === "Critica"
                      ? "#D32F2F"
                      : "#333",
                },
              ]}
            >
              {occurrence.priority}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#1650A7",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  backButton: { padding: 5 },
  content: { padding: 20, paddingBottom: 40 },

  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#DDD",
  },
  map: { width: "100%", height: "100%" },
  addressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addressText: { fontSize: 12, color: "#333", flex: 1 },

  mainCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  occurrenceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  occurrenceType: { fontSize: 14, color: "#666" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },

  infoCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  descriptionText: { fontSize: 14, color: "#555", lineHeight: 20 },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 15 },

  grid: { flexDirection: "row", gap: 15 },
  smallCard: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  label: { fontSize: 12, color: "#999", marginTop: 5, marginBottom: 2 },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
});
