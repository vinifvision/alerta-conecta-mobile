import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../contexts/ThemeContext";
import { occurrenceService } from "../services/occurrenceService";
import { OccurrencePriority } from "../types";

export default function RegisterOccurrence() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Mídia
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  // Formulário
  const [titulo, setTitulo] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [envolvidos, setEnvolvidos] = useState("");
  const [prioridade, setPrioridade] = useState<OccurrencePriority>("Baixa");
  const [tipoId, setTipoId] = useState("1");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairroId, setBairroId] = useState("1");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  // --- MÍDIA ---
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permissão", "Precisamos da câmera.");

    setMediaLoading(true);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    setMediaLoading(false);

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setVideoUri(null);
    }
  };

  // --- GPS ---
  async function handleGetGpsLocation() {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted")
        return Alert.alert("Permissão", "Habilite a localização.");

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setCoords({ lat: latitude, lng: longitude });

      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        setRua(addr.street || "");
        setNumero(addr.streetNumber || "");
        Alert.alert("Localização", "Endereço preenchido.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha no GPS.");
    } finally {
      setGpsLoading(false);
    }
  }

  async function handleRegister() {
    if (!titulo) return Alert.alert("Erro", "O título é obrigatório.");
    setLoading(true);
    try {
      let finalLat = coords?.lat;
      let finalLng = coords?.lng;

      if (!finalLat && rua) {
        try {
          const geo = await Location.geocodeAsync(
            `${rua}, ${numero}, Pernambuco`,
          );
          if (geo.length > 0) {
            finalLat = geo[0].latitude;
            finalLng = geo[0].longitude;
          }
        } catch (e) {}
      }

      // MONTAR FORM DATA
      const formData = new FormData();
      formData.append("title", titulo);
      formData.append("data", new Date().toISOString());
      formData.append("victims", envolvidos);
      formData.append("details", detalhes);
      formData.append("status", "Em_andamento");
      formData.append("priority", prioridade);
      formData.append("latitude", String(finalLat || "0.0"));
      formData.append("longitude", String(finalLng || "0.0"));
      formData.append("occurrencetype", tipoId);

      if (photoUri) {
        const filename = photoUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image`;
        // @ts-ignore
        formData.append("images", { uri: photoUri, name: filename, type });
      } else if (videoUri) {
        const filename = videoUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `video/${match[1]}` : `video`;
        // @ts-ignore
        formData.append("images", { uri: videoUri, name: filename, type });
      }

      await occurrenceService.create(formData);
      Alert.alert("Sucesso", "Ocorrência registrada!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nova Ocorrência</Text>

      <Text style={styles.label}>Título *</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipoId}
          onValueChange={setTipoId}
          style={{ color: theme.colors.text }}
          dropdownIconColor={theme.colors.text}
        >
          <Picker.Item label="Incêndio" value="1" />
          <Picker.Item label="Resgate" value="2" />
          <Picker.Item label="Acidente" value="3" />
          <Picker.Item label="Outro" value="4" />
        </Picker>
      </View>

      <Text style={styles.label}>Prioridade</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={prioridade}
          onValueChange={setPrioridade}
          style={{ color: theme.colors.text }}
          dropdownIconColor={theme.colors.text}
        >
          <Picker.Item label="Baixa" value="Baixa" />
          <Picker.Item label="Média" value="Media" />
          <Picker.Item label="Alta" value="Alta" />
        </Picker>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 15,
        }}
      >
        <Text style={styles.sectionTitle}>Endereço</Text>
        <TouchableOpacity
          style={[
            styles.gpsButton,
            coords ? { backgroundColor: theme.colors.primary } : {},
          ]}
          onPress={handleGetGpsLocation}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Feather name="map-pin" size={14} color="#FFF" />
              <Text style={styles.gpsButtonText}>Usar Localização Atual</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Rua"
        value={rua}
        onChangeText={setRua}
        placeholderTextColor={theme.colors.textSecondary}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          placeholder="Número"
          value={numero}
          onChangeText={setNumero}
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Comp."
          value={complemento}
          onChangeText={setComplemento}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <Text style={styles.label}>Envolvidos</Text>
      <TextInput
        style={styles.input}
        value={envolvidos}
        onChangeText={setEnvolvidos}
        placeholderTextColor={theme.colors.textSecondary}
      />

      <Text style={styles.label}>Detalhes</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={detalhes}
        onChangeText={setDetalhes}
        placeholderTextColor={theme.colors.textSecondary}
      />

      <Text style={styles.sectionTitle}>Mídia</Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 15,
        }}
      >
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleTakePhoto}
          disabled={mediaLoading}
        >
          <Feather name="camera" size={24} color={theme.colors.text} />
          <Text style={styles.mediaText}>Foto</Text>
        </TouchableOpacity>
      </View>

      {mediaLoading && <ActivityIndicator color={theme.colors.primary} />}
      {photoUri && (
        <View
          style={{
            alignItems: "center",
            position: "relative",
            marginBottom: 10,
          }}
        >
          <Image
            source={{ uri: photoUri }}
            style={{ width: 200, height: 200, borderRadius: 10 }}
          />
          <TouchableOpacity
            onPress={() => setPhotoUri(null)}
            style={styles.removeMedia}
          >
            <Feather name="x" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
      {videoUri && (
        <View
          style={{
            alignItems: "center",
            position: "relative",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 200,
              height: 120,
              backgroundColor: "#000",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="play-circle-filled" size={50} color="#FFF" />
          </View>
          <Text style={{ color: theme.colors.text }}>Vídeo gravado!</Text>
          <TouchableOpacity
            onPress={() => setVideoUri(null)}
            style={styles.removeMedia}
          >
            <Feather name="x" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Registrar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20, paddingBottom: 50 },
    title: {
      fontSize: 24 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18 * theme.fontScale,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: 10,
      marginBottom: 5,
    },
    label: {
      fontSize: 16 * theme.fontScale,
      color: theme.colors.text,
      marginBottom: 5,
    },
    input: {
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 15,
      fontSize: 16 * theme.fontScale,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pickerContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 15,
    },
    row: { flexDirection: "row" },
    button: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 20,
    },
    buttonText: {
      color: "#FFF",
      fontSize: 18 * theme.fontScale,
      fontWeight: "bold",
    },
    gpsButton: {
      flexDirection: "row",
      backgroundColor: "#28a745",
      padding: 8,
      borderRadius: 20,
      alignItems: "center",
    },
    gpsButtonText: { color: "#FFF", fontWeight: "bold" },
    mediaButton: {
      alignItems: "center",
      padding: 10,
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      width: "40%",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    mediaText: { color: theme.colors.text, marginTop: 5 },
    removeMedia: {
      position: "absolute",
      top: -10,
      right: 20,
      backgroundColor: "red",
      borderRadius: 15,
      padding: 5,
    },
  });
