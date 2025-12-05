import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MapView, { Marker } from "react-native-maps";

// --- MESMOS DADOS MOCK DA HOME (Para garantir que o ID bata) ---
const MOCK_DATA_DETAILS = [
  {
    id: 101,
    titule: "Incêndio em Edificação Residencial",
    type: 1,
    nome_tipo: "Incêndio",
    date: "2025-10-25T14:30:00",
    status: "Em_andamento",
    priority: "Alta",
    details:
      "Fogo no segundo andar, fumaça preta saindo pela janela. Moradores evacuados.",
    victims: "2 adultos (inalação de fumaça)",
    address: "Rua da Aurora, 123, Recife - PE",
    lat: -8.063169,
    lng: -34.871139,
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
    details: "Colisão entre carro e moto. Motociclista consciente.",
    victims: "1 vítima (escoriações leves)",
    address: "BR-101 Norte, km 45, Abreu e Lima - PE",
    lat: -7.908988,
    lng: -34.902683,
    region: "Zona da Mata",
  },
  // ... Adicione os outros IDs se precisar testar todos
];

export default function OccurrenceDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: number }; // Pega o ID que veio da Home

  const [occurrence, setOccurrence] = useState<any>(null);

  useEffect(() => {
    // BUSCA LOCAL NO MOCK (Sem API)
    const found = MOCK_DATA_DETAILS.find((item) => item.id === id);

    if (found) {
      setOccurrence(found);
    } else {
      // Fallback se não achar no mock (apenas para não quebrar)
      setOccurrence({
        id: id,
        titule: `Ocorrência #${id}`,
        nome_tipo: "Tipo Desconhecido",
        date: new Date().toISOString(),
        status: "Em_andamento",
        priority: "Media",
        details: "Detalhes não encontrados no mock local.",
        address: "Localização não disponível",
        lat: -8.047562, // Centro do Recife
        lng: -34.877001,
      });
    }
  }, [id]);

  if (!occurrence)
    return (
      <View style={styles.loading}>
        <Text>Carregando...</Text>
      </View>
    );

  // Helpers de cor
  const getStatusColor = (status: string) => {
    if (status === "Em_andamento") return "#FF8C00";
    if (status === "Encerrada") return "#4CAF50";
    return "#9E9E9E";
  };

  // Formatação de Data
  const dateObj = new Date(occurrence.date);
  const formattedDate = `${dateObj.toLocaleDateString("pt-BR")} às ${dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

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
        {/* Mapa (Estático com Marker) */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: occurrence.lat || -8.047,
              longitude: occurrence.lng || -34.877,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: occurrence.lat || -8.047,
                longitude: occurrence.lng || -34.877,
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
              {occurrence.address}
            </Text>
          </View>
        </View>

        {/* Título e Status */}
        <View style={styles.mainCard}>
          <Text style={styles.occurrenceTitle}>{occurrence.titule}</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.occurrenceType}>{occurrence.nome_tipo}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(occurrence.status) },
              ]}
            >
              <Text style={styles.statusText}>{occurrence.status}</Text>
            </View>
          </View>
        </View>

        {/* Detalhes e Vítimas */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>{occurrence.details}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Vítimas / Envolvidos</Text>
          <Text style={styles.descriptionText}>
            {occurrence.victims || "Nenhuma vítima informada."}
          </Text>
        </View>

        {/* Data e Prioridade */}
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
                { color: occurrence.priority === "Alta" ? "#D32F2F" : "#333" },
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
  content: { padding: 20 },

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
