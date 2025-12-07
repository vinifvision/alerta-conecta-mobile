import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
// import { toast } from "sonner";

// Imports da Arquitetura
import { occurrenceService } from "../services/occurrenceService";
import { FilterOption, FormOptionsData, OccurrencePriority } from "../types";

export default function RegisterOccurrence() {
  const navigation = useNavigation();

  // --- Estados de Controle ---
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<FormOptionsData>({
    types: [],
    subTypes: {},
    priorities: [],
  });

  // --- Estados do Formulário ---
  const [type, setType] = useState<FilterOption | null>(null);
  const [subType, setSubType] = useState<FilterOption | null>(null);
  const [date, setDate] = useState(""); // DD/MM/AAAA
  const [time, setTime] = useState(""); // HH:MM
  const [priority, setPriority] = useState<FilterOption | null>(null);
  const [victims, setVictims] = useState("");
  const [details, setDetails] = useState("");

  // Endereço (Backend exige separado)
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [districtId, setDistrictId] = useState(""); // ID do bairro (inteiro)

  // --- Estados de Modal (Selects) ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "type" | "subtype" | "priority" | null
  >(null);

  // 1. Carregar Opções ao Iniciar
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await occurrenceService.getFormOptions();
        setOptions(data);

        // Preenche data/hora atuais
        const now = new Date();
        setDate(now.toLocaleDateString("pt-BR"));
        setTime(
          now.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } catch (error) {
        Alert.alert(
          "Erro",
          "Não foi possível carregar as opções do formulário.",
        );
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  // Resetar subtipo quando trocar o tipo
  useEffect(() => {
    setSubType(null);
  }, [type]);

  // --- Máscaras ---
  const handleDateChange = (text: string) => {
    let clean = text.replace(/\D/g, "");
    if (clean.length > 8) clean = clean.substring(0, 8);
    let formatted = clean;
    if (clean.length > 2) formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    if (clean.length > 4)
      formatted = `${formatted.slice(0, 5)}/${clean.slice(5)}`;
    setDate(formatted);
  };

  const handleTimeChange = (text: string) => {
    let clean = text.replace(/\D/g, "");
    if (clean.length > 4) clean = clean.substring(0, 4);
    let formatted = clean;
    if (clean.length > 2) formatted = `${clean.slice(0, 2)}:${clean.slice(2)}`;
    setTime(formatted);
  };

  // --- Envio do Formulário ---
  const handleSubmit = async () => {
    // Validação Básica
    if (
      !type ||
      !subType ||
      !priority ||
      date.length < 10 ||
      time.length < 5 ||
      !street ||
      !number ||
      !districtId
    ) {
      Alert.alert(
        "Campos Obrigatórios",
        "Preencha Tipo, Subtipo, Data, Hora, Prioridade e Endereço (Rua, Nº, Bairro ID).",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Formata Data para ISO (yyyy-MM-ddTHH:mm:ss) esperado pelo Java
      const [day, month, year] = date.split("/");
      const isoDate = `${year}-${month}-${day}T${time}:00`;

      // Monta o Payload exato para o Backend Java
      const payload = {
        titule: subType.label, // Java: getTitule()
        date: isoDate, // Java: getDate()
        victims: victims,
        details: details,
        priority: priority.label as OccurrencePriority, // Java: Enum valueOf

        // Objeto TYPE aninhado
        type: {
          id: Number(type.value),
          name: type.label,
          description: "",
        },

        // Objeto ADDRESS aninhado
        address: {
          street: street,
          number: number,
          complement: complement,
          idDistrict: Number(districtId), // Java espera int
        },
      };

      console.log("Enviando Payload:", JSON.stringify(payload, null, 2));

      // Chama o serviço (que decide se usa Mock ou API real)
      await occurrenceService.create(payload);

      Alert.alert("Sucesso", "Ocorrência registrada com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert("Erro ao Registrar", error.message || "Falha na conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderização do Modal de Seleção ---
  const renderModal = () => {
    let listData: FilterOption[] = [];
    if (modalType === "type") listData = options.types;
    if (modalType === "priority") listData = options.priorities;
    if (modalType === "subtype" && type)
      listData = options.subTypes[String(type.value)] || [];

    return (
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione uma opção</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={listData}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    if (modalType === "type") setType(item);
                    if (modalType === "subtype") setSubType(item);
                    if (modalType === "priority") setPriority(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  // Helper para renderizar Inputs de Seleção
  const renderSelectInput = (
    label: string,
    value: string | undefined,
    type: "type" | "subtype" | "priority",
    disabled = false,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label} *</Text>
      <TouchableOpacity
        style={[styles.selectBox, disabled && styles.disabledInput]}
        onPress={() => {
          if (!disabled) {
            setModalType(type);
            setModalVisible(true);
          }
        }}
      >
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || "Selecione..."}
        </Text>
        <Feather name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  if (loadingOptions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1650A7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Ocorrência</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Classificação</Text>
          {renderSelectInput("Tipo", type?.label, "type")}
          {renderSelectInput("Subtipo", subType?.label, "subtype", !type)}
          {renderSelectInput("Prioridade", priority?.label, "priority")}

          <Text style={styles.sectionTitle}>Data e Hora</Text>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Data *</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={handleDateChange}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Hora *</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={handleTimeChange}
                placeholder="HH:MM"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Detalhes</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vítimas / Envolvidos</Text>
            <TextInput
              style={styles.input}
              value={victims}
              onChangeText={setVictims}
              placeholder="Ex: 2 vítimas leves..."
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={details}
              onChangeText={setDetails}
              placeholder="Descreva a situação..."
              multiline
              numberOfLines={4}
            />
          </View>

          <Text style={styles.sectionTitle}>Endereço</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Rua *</Text>
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="Nome da rua"
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Número *</Text>
              <TextInput
                style={styles.input}
                value={number}
                onChangeText={setNumber}
                placeholder="123"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>ID Bairro *</Text>
              <TextInput
                style={styles.input}
                value={districtId}
                onChangeText={setDistrictId}
                placeholder="Ex: 1"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Complemento</Text>
            <TextInput
              style={styles.input}
              value={complement}
              onChangeText={setComplement}
              placeholder="Apto, Bloco..."
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Registrar Ocorrência</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {renderModal()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },

  header: {
    backgroundColor: "#1650A7",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  backButton: { padding: 5 },

  content: { padding: 20, paddingBottom: 50 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1650A7",
    marginTop: 10,
    marginBottom: 15,
  },

  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, color: "#333", marginBottom: 5, fontWeight: "500" },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
    color: "#333",
  },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 10 },

  selectBox: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: "#DDD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabledInput: { backgroundColor: "#F0F0F0" },
  selectText: { fontSize: 16, color: "#333" },
  placeholderText: { color: "#999" },

  row: { flexDirection: "row" },

  submitButton: {
    backgroundColor: "#1650A7",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  submitText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  modalItemText: { fontSize: 16, color: "#333" },
});
