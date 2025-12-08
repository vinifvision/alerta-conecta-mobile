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
  Image, // Importado para mostrar a prévia da foto
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { Feather, MaterialIcons } from "@expo/vector-icons"; // MaterialIcons para ícone de vídeo
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker"; // Importação da biblioteca de imagem
import { useTheme } from "../contexts/ThemeContext";
import { occurrenceService } from "../services/occurrenceService";
import { OccurrencePriority } from "../types";

export default function RegisterOccurrence() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false); // Loading para processamento de mídia

  // Estados do Formulário
  const [titulo, setTitulo] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [envolvidos, setEnvolvidos] = useState("");
  const [prioridade, setPrioridade] = useState<OccurrencePriority>("Baixa");
  const [tipoId, setTipoId] = useState("1");

  // Endereço e Coordenadas
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairroId, setBairroId] = useState("1");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  // --- MÍDIA (FOTO/VÍDEO) ---
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  // Função auxiliar para verificar permissões de câmera
  async function verifyCameraPermission() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à câmera para tirar fotos ou gravar vídeos.",
      );
      return false;
    }
    return true;
  }

  // Função para Tirar Foto
  const handleTakePhoto = async () => {
    const hasPermission = await verifyCameraPermission();
    if (!hasPermission) return;

    setMediaLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Pode mudar para true se quiser que o usuário recorte a foto
        quality: 0.7, // Qualidade para reduzir tamanho do arquivo
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
        setVideoUri(null); // Limpa vídeo se houver, para priorizar uma mídia por vez (opcional)
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    } finally {
      setMediaLoading(false);
    }
  };

  // Função para Gravar Vídeo
  const handleRecordVideo = async () => {
    const hasPermission = await verifyCameraPermission();
    if (!hasPermission) return;

    setMediaLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        videoMaxDuration: 30, // Limite de 30 segundos, por exemplo
        quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (!result.canceled) {
        setVideoUri(result.assets[0].uri);
        setPhotoUri(null); // Limpa foto se houver
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gravar o vídeo.");
    } finally {
      setMediaLoading(false);
    }
  };
  // ---------------------------

  async function handleGetGpsLocation() {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Habilite a localização nas configurações.",
        );
        return;
      }
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
        Alert.alert(
          "Localização Encontrada",
          `Endereço preenchido: ${addr.street}, ${addr.streetNumber}`,
        );
      }
    } catch (error) {
      Alert.alert("Erro no GPS", "Não foi possível obter sua localização.");
    } finally {
      setGpsLoading(false);
    }
  }

  async function handleRegister() {
    if (!titulo || !rua || !numero) {
      return Alert.alert("Erro", "Preencha os campos obrigatórios.");
    }

    setLoading(true);
    try {
      let finalLat = coords?.lat;
      let finalLng = coords?.lng;

      if (!finalLat || !finalLng) {
        try {
          const fullAddress = `${rua}, ${numero}, Pernambuco, Brasil`;
          const geocodeResult = await Location.geocodeAsync(fullAddress);
          if (geocodeResult.length > 0) {
            finalLat = geocodeResult[0].latitude;
            finalLng = geocodeResult[0].longitude;
          }
        } catch (geoError) {
          console.log("Erro ao converter endereço em coordenadas:", geoError);
        }
      }

      // Monta o objeto de dados básicos
      const novaOcorrenciaData = {
        titule: titulo,
        victims: envolvidos,
        details: detalhes,
        priority: prioridade,
        status: "Em_andamento",
        date: new Date().toISOString(),
        type: { id: Number(tipoId), name: "Tipo Selecionado" },
        address: {
          street: rua,
          number: numero,
          complement: complemento,
          idDistrict: Number(bairroId),
        },
        lat: finalLat || null,
        lng: finalLng || null,
      };

      // --- PREPARAÇÃO PARA ENVIO (IMPORTANTE) ---
      // Se houver foto ou vídeo, o envio precisa ser diferente (FormData)
      // Por enquanto, enviamos apenas o JSON, mas os URIs estão prontos aqui:
      console.log("Foto URI para upload:", photoUri);
      console.log("Vídeo URI para upload:", videoUri);

      // @ts-ignore
      await occurrenceService.create(novaOcorrenciaData);

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
      <TextInput
        style={styles.input}
        placeholder="Ex: Incêndio em loja"
        placeholderTextColor={theme.colors.textSecondary}
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipoId}
          onValueChange={(itemValue) => setTipoId(itemValue)}
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
          onValueChange={(itemValue) => setPrioridade(itemValue)}
          style={{ color: theme.colors.text }}
          dropdownIconColor={theme.colors.text}
        >
          <Picker.Item label="Baixa" value="Baixa" />
          <Picker.Item label="Média" value="Media" />
          <Picker.Item label="Alta" value="Alta" />
        </Picker>
      </View>

      {/* --- SEÇÃO DE MÍDIA --- */}
      <Text style={styles.sectionTitle}>Anexos (Opcional)</Text>
      <Text style={styles.helperText}>
        Adicione uma foto OU um vídeo curto.
      </Text>

      <View style={styles.mediaButtonsContainer}>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleTakePhoto}
          disabled={mediaLoading}
        >
          <Feather name="camera" size={24} color={theme.colors.text} />
          <Text style={styles.mediaButtonText}>Tirar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleRecordVideo}
          disabled={mediaLoading}
        >
          <MaterialIcons name="videocam" size={24} color={theme.colors.text} />
          <Text style={styles.mediaButtonText}>Gravar Vídeo</Text>
        </TouchableOpacity>
      </View>

      {mediaLoading && (
        <ActivityIndicator
          style={{ marginTop: 10 }}
          color={theme.colors.primary}
        />
      )}

      {/* Prévia da Mídia */}
      {photoUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.removeMediaButton}
            onPress={() => setPhotoUri(null)}
          >
            <Feather name="x" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
      {videoUri && (
        <View style={styles.previewContainer}>
          {/* Ícone genérico para vídeo, já que player requer mais libs */}
          <View
            style={[
              styles.previewImage,
              {
                backgroundColor: "#000",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <MaterialIcons name="play-circle-filled" size={50} color="#FFF" />
          </View>
          <Text style={{ color: theme.colors.text, marginTop: 5 }}>
            Vídeo gravado pronto para envio.
          </Text>
          <TouchableOpacity
            style={styles.removeMediaButton}
            onPress={() => setVideoUri(null)}
          >
            <Feather name="x" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
      {/* --------------------------- */}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 15,
          marginBottom: 10,
        }}
      >
        <Text style={styles.sectionTitle}>Endereço</Text>

        <TouchableOpacity
          style={[
            styles.gpsButton,
            coords ? { backgroundColor: theme.colors.primary } : {},
          ]}
          onPress={handleGetGpsLocation}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Feather
                name="map-pin"
                size={14}
                color="#FFF"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.gpsButtonText}>
                {coords ? "Localização Atualizada" : "Usar Localização Atual"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Rua *"
        placeholderTextColor={theme.colors.textSecondary}
        value={rua}
        onChangeText={(t) => {
          setRua(t);
          if (coords) setCoords(null);
        }}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          placeholder="Número *"
          placeholderTextColor={theme.colors.textSecondary}
          value={numero}
          onChangeText={setNumero}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Complemento"
          placeholderTextColor={theme.colors.textSecondary}
          value={complemento}
          onChangeText={setComplemento}
        />
      </View>

      <Text style={styles.label}>Envolvidos / Vítimas</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 2 vítimas conscientes"
        placeholderTextColor={theme.colors.textSecondary}
        value={envolvidos}
        onChangeText={setEnvolvidos}
      />

      <Text style={styles.label}>Detalhes</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        placeholder="Descreva a situação..."
        placeholderTextColor={theme.colors.textSecondary}
        value={detalhes}
        onChangeText={setDetalhes}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading || mediaLoading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Registrar Ocorrência</Text>
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
      fontSize: 28 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginBottom: 20,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 20 * theme.fontScale,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: 15,
    },
    helperText: {
      fontSize: 14 * theme.fontScale,
      color: theme.colors.textSecondary,
      marginBottom: 15,
    },
    label: {
      fontSize: 16 * theme.fontScale,
      color: theme.colors.text,
      marginBottom: 5,
      fontWeight: "500",
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
      marginTop: 30,
    },
    buttonText: {
      color: "#FFF",
      fontSize: 18 * theme.fontScale,
      fontWeight: "bold",
    },
    gpsButton: {
      flexDirection: "row",
      backgroundColor: "#28a745",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      alignItems: "center",
    },
    gpsButtonText: {
      color: "#FFF",
      fontSize: 12 * theme.fontScale,
      fontWeight: "bold",
    },
    // Estilos Novos para Mídia
    mediaButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 15,
    },
    mediaButton: {
      alignItems: "center",
      padding: 15,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: "45%",
    },
    mediaButtonText: {
      marginTop: 8,
      color: theme.colors.text,
      fontWeight: "500",
    },
    previewContainer: {
      marginTop: 15,
      alignItems: "center",
      position: "relative",
    },
    previewImage: {
      width: 200,
      height: 200,
      borderRadius: 12,
      resizeMode: "cover",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    removeMediaButton: {
      position: "absolute",
      top: -10,
      right: "20%", // Ajuste fino dependendo da largura da imagem
      backgroundColor: "rgba(255,0,0,0.8)",
      borderRadius: 15,
      padding: 5,
    },
  });
