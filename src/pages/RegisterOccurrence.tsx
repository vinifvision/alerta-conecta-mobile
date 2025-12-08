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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location"; // OBRIGATÓRIO: npx expo install expo-location
import { useTheme } from "../contexts/ThemeContext";
import { occurrenceService } from "../services/occurrenceService";
import { OccurrencePriority } from "../types";

export default function RegisterOccurrence() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Estados do Formulário
  const [titulo, setTitulo] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [envolvidos, setEnvolvidos] = useState("");
  const [prioridade, setPrioridade] = useState<OccurrencePriority>("Baixa");
  const [tipoId, setTipoId] = useState("1");
  
  // Endereço Visual (Texto)
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairroId, setBairroId] = useState("1"); 

  // Coordenadas (Invisíveis ou visíveis se quiser debug)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // ---------------------------------------------------------
  // 1. PEGAR LOCALIZAÇÃO ATUAL (GPS -> ENDEREÇO + LAT/LNG)
  // ---------------------------------------------------------
  async function handleGetGpsLocation() {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Habilite a localização nas configurações.");
        return;
      }

      // Pega posição precisa
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;

      // Salva coordenadas
      setCoords({ lat: latitude, lng: longitude });

      // Converte para Endereço (Reverse Geocode)
      const addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        setRua(addr.street || ""); 
        setNumero(addr.streetNumber || "");
        // Nota: O bairro (district) vem como texto, mas seu backend pede ID.
        // O usuário precisará confirmar o bairro no Picker manualmente por enquanto.
        Alert.alert("Localização Encontrada", `Endereço preenchido: ${addr.street}, ${addr.streetNumber}`);
      }
    } catch (error) {
      Alert.alert("Erro no GPS", "Não foi possível obter sua localização.");
      console.log(error);
    } finally {
      setGpsLoading(false);
    }
  }

  // ---------------------------------------------------------
  // 2. ENVIAR FORMULÁRIO (ENDEREÇO DIGITADO -> LAT/LNG)
  // ---------------------------------------------------------
  async function handleRegister() {
    if (!titulo || !rua || !numero) {
      return Alert.alert("Erro", "Preencha os campos obrigatórios.");
    }

    setLoading(true);
    try {
      let finalLat = coords?.lat;
      let finalLng = coords?.lng;

      // Se não temos coordenadas do GPS (o usuário digitou tudo), tentamos converter o endereço em Lat/Lng
      if (!finalLat || !finalLng) {
        try {
          const fullAddress = `${rua}, ${numero}, Pernambuco, Brasil`; // Melhora a precisão
          const geocodeResult = await Location.geocodeAsync(fullAddress);
          
          if (geocodeResult.length > 0) {
            finalLat = geocodeResult[0].latitude;
            finalLng = geocodeResult[0].longitude;
          }
        } catch (geoError) {
          console.log("Erro ao converter endereço em coordenadas:", geoError);
          // Não impedimos o cadastro, apenas segue sem coordenadas
        }
      }

      // Monta o objeto conforme o Backend Java espera
      const novaOcorrencia = {
        titule: titulo,
        victims: envolvidos,
        details: detalhes,
        priority: prioridade,
        status: "Em_andamento",
        date: new Date().toISOString(),
        
        type: {
          id: Number(tipoId),
          name: "Tipo Selecionado", 
        },

        address: {
          street: rua,
          number: numero,
          complement: complemento,
          idDistrict: Number(bairroId),
        },

        // AGORA SIM: Enviamos as coordenadas preparadas para o novo backend
        lat: finalLat || null,
        lng: finalLng || null,
      };

      // @ts-ignore
      await occurrenceService.create(novaOcorrencia);

      Alert.alert("Sucesso", "Ocorrência registrada e geolocalizada!");
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

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 10 }}>
        <Text style={styles.sectionTitle}>Endereço</Text>
        
        {/* BOTÃO INTELIGENTE DE GPS */}
        <TouchableOpacity 
          style={[styles.gpsButton, coords ? { backgroundColor: theme.colors.primary } : {}]}
          onPress={handleGetGpsLocation}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Feather name="map-pin" size={14} color="#FFF" style={{ marginRight: 5 }} />
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
          if (coords) setCoords(null); // Se o usuário editar a rua manualmente, limpamos a coord antiga para forçar recálculo
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
        disabled={loading}
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
      marginTop: 20,
    },
    buttonText: {
      color: "#FFF",
      fontSize: 18 * theme.fontScale,
      fontWeight: "bold",
    },
    gpsButton: {
      flexDirection: 'row',
      backgroundColor: '#28a745',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      alignItems: 'center',
    },
    gpsButtonText: {
      color: '#FFF',
      fontSize: 12 * theme.fontScale,
      fontWeight: 'bold',
    },
  });