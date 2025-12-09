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
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../contexts/ThemeContext";
import { occurrenceService } from "../services/occurrenceService";
import { Occurrence, OccurrencePriority } from "../types";

export default function EditOccurrence() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { occurrenceData } = route.params;

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(false);

  // Inicialização segura
  const [titulo, setTitulo] = useState(
    occurrenceData.titule || (occurrenceData as any).title || "",
  );
  const [detalhes, setDetalhes] = useState(occurrenceData.details || "");
  const [envolvidos, setEnvolvidos] = useState(occurrenceData.victims || "");
  const [prioridade, setPrioridade] = useState<OccurrencePriority>(
    occurrenceData.priority || "Baixa",
  );
  const [status, setStatus] = useState(occurrenceData.status || "Em_andamento");

  async function handleUpdate() {
    setLoading(true);
    try {
      // Cria objeto de atualização mantendo ID e outros campos
      const updatedData = new FormData();

        updatedData.append("title", titulo); // Mudou de 'titule' para 'title'
        updatedData.append("victims", envolvidos);
        updatedData.append("details", detalhes);
        updatedData.append("status", status);
        updatedData.append("priority", prioridade);
      await occurrenceService.update(occurrenceData.id, updatedData);

      Alert.alert("Sucesso", "Ocorrência atualizada!");
      navigation.navigate("Home" as never);
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Editar Ocorrência #{occurrenceData.id}</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Status</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={status}
          onValueChange={setStatus}
          style={{ color: theme.colors.text }}
          dropdownIconColor={theme.colors.text}
        >
          <Picker.Item label="Em Andamento" value="Em_andamento" />
          <Picker.Item label="Encerrada" value="Encerrada" />
          <Picker.Item label="Cancelada" value="Cancelada" />
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

      <Text style={styles.label}>Envolvidos</Text>
      <TextInput
        style={styles.input}
        value={envolvidos}
        onChangeText={setEnvolvidos}
      />

      <Text style={styles.label}>Detalhes</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        value={detalhes}
        onChangeText={setDetalhes}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Salvar Alterações</Text>
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
      fontSize: 22 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginBottom: 20,
      textAlign: "center",
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
  });
