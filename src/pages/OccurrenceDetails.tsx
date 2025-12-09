import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useTheme } from "../contexts/ThemeContext";
import { Occurrence } from "../types";

const { width } = Dimensions.get("window");

export default function OccurrenceDetails() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [displayAddress, setDisplayAddress] = useState(
    "Carregando endereço...",
  );

  const { occurrenceData } = route.params || {};

  if (!occurrenceData) {
    return (
      <View style={styles.container}>
        <Text
          style={{
            color: theme.colors.text,
            textAlign: "center",
            marginTop: 50,
          }}
        >
          Erro: Dados não carregados.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text
            style={{
              color: theme.colors.primary,
              textAlign: "center",
              marginTop: 10,
            }}
          >
            Voltar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const occurrence: Occurrence = occurrenceData;
  const itemTitle =
    (occurrence as any).title || (occurrence as any).titule || "Ocorrência";

  // --- TRATAMENTO DE COORDENADAS ---
  const rawLat = (occurrence as any).latitude ?? (occurrence as any).lat;
  const rawLng = (occurrence as any).longitude ?? (occurrence as any).lng;
  const latNum = Number(rawLat);
  const lngNum = Number(rawLng);
  const hasCoords =
    !isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0;

  // --- CORREÇÃO DA IMAGEM ---
  // 1. Pega a lista de imagens vinda do backend
  const imagesList = (occurrence as any).images || [];

  // 2. Pega a primeira imagem, se existir
  let rawImage = imagesList.length > 0 ? imagesList[0] : null;

  // Fallback para campos antigos
  if (!rawImage) {
    rawImage =
      (occurrence as any).fileUrl || (occurrence as any).imageUrl || null;
  }

  // 3. Tratamento PROVISÓRIO para o problema do "file:///D:/"
  // O app não consegue ler D:/ do servidor. Isso deveria ser uma URL http.
  // Se estiver testando no emulador e o backend for local, isso não vai carregar a menos que o backend sirva o arquivo.
  const imageUrl = rawImage;

  const initialRegion = {
    latitude: hasCoords ? latNum : -8.047,
    longitude: hasCoords ? lngNum : -34.877,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  useEffect(() => {
    async function fetchAddress() {
      if (hasCoords) {
        try {
          const addressResponse = await Location.reverseGeocodeAsync({
            latitude: latNum,
            longitude: lngNum,
          });

          if (addressResponse.length > 0) {
            const addr = addressResponse[0];
            const street = addr.street || "Rua não identificada";
            const number = addr.streetNumber || "S/N";
            const district = addr.district || "";

            let formatted = `${street}, ${number}`;
            if (district) formatted += ` - ${district}`;

            setDisplayAddress(formatted);
          } else {
            setDisplayAddress("Endereço não encontrado no mapa.");
          }
        } catch (error) {
          console.log("Erro geocoding:", error);
          setDisplayAddress("Endereço indisponível.");
        }
      } else {
        setDisplayAddress("Localização não registrada.");
      }
    }

    fetchAddress();
  }, [hasCoords, latNum, lngNum]);

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

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate(
              "EditOccurrence" as never,
              { occurrenceData: occurrence } as never,
            )
          }
        >
          <Feather name="edit-2" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={initialRegion}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            {hasCoords && (
              <Marker
                coordinate={{
                  latitude: latNum,
                  longitude: lngNum,
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
            <Text style={styles.addressText}>{displayAddress}</Text>
          </View>
        </View>

        {/* Exibe a imagem se existir */}
        {imageUrl ? (
          <View style={styles.imageContainer}>
            <Image
              // Se a URL começar com http ou file:// o React Native tenta carregar
              source={{ uri: imageUrl }}
              style={styles.occurrenceImage}
              resizeMode="cover"
              // Adiciona um fallback visual caso a imagem falhe (muito provável com caminho D:/)
              onError={(e) =>
                console.log("Erro ao carregar imagem: ", e.nativeEvent.error)
              }
            />
            <View style={styles.imageBadge}>
              <Feather name="image" size={12} color="#FFF" />
              <Text style={styles.imageBadgeText}>Anexo</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.mainCard}>
          <Text style={styles.occurrenceTitle}>{itemTitle}</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.occurrenceType}>
              {occurrence.type?.name || "Tipo não informado"}
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
      </ScrollView>
    </View>
  );
}

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
      position: "relative",
    },
    map: { width: "100%", height: "100%" },
    addressBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    addressText: {
      fontSize: 12 * theme.fontScale,
      color: "#FFF",
      flex: 1,
    },

    imageContainer: {
      height: 220,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 20,
      backgroundColor: theme.colors.card,
      position: "relative",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    occurrenceImage: {
      width: "100%",
      height: "100%",
    },
    imageBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    imageBadgeText: {
      color: "#FFF",
      fontSize: 10,
      fontWeight: "bold",
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
