import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../contexts/ThemeContext"; // Importar Tema
import { occurrenceService } from "../services/occurrenceService";
import { Occurrence } from "../types";

export default function OccurrenceDetails() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { id } = route.params;
  const { theme } = useTheme(); // Hook do tema
  const styles = useMemo(() => createStyles(theme), [theme]); // Estilos dinâmicos

  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await occurrenceService.getById(id);
        if (data) setOccurrence(data);
        else {
          Alert.alert("Erro", "Ocorrência não encontrada.");
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert("Erro", "Falha ao carregar.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  if (!occurrence) return null;

  const initialRegion = {
    latitude: occurrence.lat || -8.047,
    longitude: occurrence.lng || -34.877,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="edit-2" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={initialRegion}>
            <Marker coordinate={initialRegion} />
          </MapView>
          <View style={styles.addressBar}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.addressText} numberOfLines={1}>
              {occurrence.address || "Endereço não disponível"}
            </Text>
          </View>
        </View>

        <View style={styles.mainCard}>
          <Text style={styles.occurrenceTitle}>
            {occurrence.titule || `Ocorrência #${occurrence.id}`}
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.occurrenceType}>
              {occurrence.nome_tipo || `Tipo ${occurrence.type}`}
            </Text>
            <View style={[styles.statusBadge]}>
              <Text style={styles.statusText}>{occurrence.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>
            {occurrence.details || "Sem descrição."}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Vítimas</Text>
          <Text style={styles.descriptionText}>
            {occurrence.victims || "Nenhuma."}
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.smallCard}>
            <Feather
              name="calendar"
              size={20}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.label}>Data</Text>
            <Text style={styles.value}>
              {new Date(occurrence.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.smallCard}>
            <Feather
              name="alert-triangle"
              size={20}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.label}>Prioridade</Text>
            <Text style={[styles.value, { color: theme.colors.primary }]}>
              {occurrence.priority}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    loading: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      backgroundColor: theme.colors.primary,
      paddingTop: 50,
      paddingBottom: 15,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      color: theme.colors.white,
      fontSize: 18 * theme.fontScale,
      fontWeight: "bold",
    },
    backButton: { padding: 5 },
    content: { padding: 20, paddingBottom: 40 },
    mapContainer: {
      height: 200,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 20,
      backgroundColor: theme.colors.border,
    },
    map: { width: "100%", height: "100%" },
    addressBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.card,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      opacity: 0.9,
    },
    addressText: {
      fontSize: 12 * theme.fontScale,
      color: theme.colors.text,
      flex: 1,
    },
    mainCard: {
      backgroundColor: theme.colors.card,
      padding: 20,
      borderRadius: 12,
      marginBottom: 15,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    occurrenceTitle: {
      fontSize: 18 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 5,
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    occurrenceType: {
      fontSize: 14 * theme.fontScale,
      color: theme.colors.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.tint,
    },
    statusText: {
      color: theme.colors.primary,
      fontSize: 10 * theme.fontScale,
      fontWeight: "bold",
    },
    infoCard: {
      backgroundColor: theme.colors.card,
      padding: 20,
      borderRadius: 12,
      marginBottom: 15,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 14 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 8,
    },
    descriptionText: {
      fontSize: 14 * theme.fontScale,
      color: theme.colors.text,
      lineHeight: 20,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 15,
    },
    grid: { flexDirection: "row", gap: 15 },
    smallCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    label: {
      fontSize: 12 * theme.fontScale,
      color: theme.colors.textSecondary,
      marginTop: 5,
      marginBottom: 2,
    },
    value: {
      fontSize: 14 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
    },
  });
