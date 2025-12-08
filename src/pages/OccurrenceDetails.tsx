import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../contexts/ThemeContext";
import { Occurrence } from "../types";

export default function OccurrenceDetails() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // CORREÇÃO: Pegamos o objeto inteiro enviado pela Home
  // Não fazemos mais fetch(id) para evitar erro com backend offline
  const { occurrenceData } = route.params || {};

  // Se por acaso vier vazio, volta
  if (!occurrenceData) {
    navigation.goBack();
    return null;
  }

  const occurrence: Occurrence = occurrenceData;

  // Usa as coordenadas se existirem, senão usa um padrão (Recife)
  const initialRegion = {
    latitude: occurrence.lat || -8.047,
    longitude: occurrence.lng || -34.877,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const formatAddress = () => {
    if (!occurrence.address) return "Endereço não disponível";
    // Tenta montar com o que tem
    return `${occurrence.address.street || "Rua N/A"}, ${occurrence.address.number || "S/N"}`;
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
        <Text style={styles.headerTitle}>Detalhes #{occurrence.id}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={initialRegion}>
            {occurrence.lat && occurrence.lng && (
              <Marker
                coordinate={{
                  latitude: occurrence.lat,
                  longitude: occurrence.lng,
                }}
              />
            )}
          </MapView>
          <View style={styles.addressBar}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.addressText} numberOfLines={1}>
              {formatAddress()}
            </Text>
          </View>
        </View>

        <View style={styles.mainCard}>
          <Text style={styles.occurrenceTitle}>
            {occurrence.titule || "Sem Título"}
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.occurrenceType}>
              {occurrence.type?.name || "Tipo não informado"}
            </Text>
            <View style={styles.statusBadge}>
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
            {occurrence.victims || "Nenhuma informada."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ... (Mantenha os estilos 'createStyles' que já existiam no arquivo, ou copie do anterior se preferir)
// Vou incluir apenas os estilos essenciais caso tenha perdido
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
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
  });
