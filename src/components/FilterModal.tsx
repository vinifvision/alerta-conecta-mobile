// src/components/FilterModal.tsx

import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// Tipos de Filtro
export type FilterState = {
  startDate: string;
  endDate: string;
  status: string | null;
  region: string | null;
  type: number | null;
};

// Opções para os filtros
const STATUS_OPTIONS = [
  { label: "Em Andamento", value: "Em_andamento" },
  { label: "Encerrada", value: "Encerrada" },
  { label: "Cancelada", value: "Cancelada" },
];

const REGION_OPTIONS = ["RMR", "Zona da Mata", "Agreste", "Sertão"];

const TYPE_OPTIONS = [
  { label: "Incêndio", value: 1 },
  { label: "Resgate", value: 2 },
  { label: "APH", value: 3 },
  { label: "Prevenção", value: 4 },
  { label: "Ambiental", value: 5 },
  { label: "Administrativa", value: 6 },
  { label: "Desastre", value: 7 },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function FilterModal({
  visible,
  onClose,
  filters,
  setFilters,
  onApply,
  onClear,
}: FilterModalProps) {
  // Helper para atualizar um campo específico
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  // Formata data DD/MM/AAAA
  const handleDateChange = (text: string, key: "startDate" | "endDate") => {
    let clean = text.replace(/\D/g, "");
    if (clean.length > 8) clean = clean.substring(0, 8);

    let formatted = clean;
    if (clean.length > 2) formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    if (clean.length > 4)
      formatted = `${formatted.slice(0, 5)}/${clean.slice(5)}`;

    updateFilter(key, formatted);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            {/* Cabeçalho */}
            <View style={styles.header}>
              <Text style={styles.title}>Filtrar Ocorrências</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              {/* 1. Período */}
              <Text style={styles.sectionTitle}>Período (Data)</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.label}>De:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                    maxLength={10}
                    value={filters.startDate}
                    onChangeText={(t) => handleDateChange(t, "startDate")}
                  />
                </View>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.label}>Até:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                    maxLength={10}
                    value={filters.endDate}
                    onChangeText={(t) => handleDateChange(t, "endDate")}
                  />
                </View>
              </View>

              {/* 2. Status */}
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.chipsRow}>
                {STATUS_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.chip,
                      filters.status === opt.value && styles.chipActive,
                    ]}
                    onPress={() =>
                      updateFilter(
                        "status",
                        filters.status === opt.value ? null : opt.value,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.status === opt.value && styles.chipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 3. Região */}
              <Text style={styles.sectionTitle}>Região</Text>
              <View style={styles.chipsRow}>
                {REGION_OPTIONS.map((region) => (
                  <TouchableOpacity
                    key={region}
                    style={[
                      styles.chip,
                      filters.region === region && styles.chipActive,
                    ]}
                    onPress={() =>
                      updateFilter(
                        "region",
                        filters.region === region ? null : region,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.region === region && styles.chipTextActive,
                      ]}
                    >
                      {region}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 4. Tipo */}
              <Text style={styles.sectionTitle}>Tipo de Ocorrência</Text>
              <View style={styles.chipsRow}>
                {TYPE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.chip,
                      filters.type === opt.value && styles.chipActive,
                    ]}
                    onPress={() =>
                      updateFilter(
                        "type",
                        filters.type === opt.value ? null : opt.value,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.type === opt.value && styles.chipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Rodapé (Botões) */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.clearButton} onPress={onClear}>
                <Text style={styles.clearText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={onApply}>
                <Text style={styles.applyText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: { flex: 1, justifyContent: "flex-end" },
  container: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },

  // Datas
  dateRow: { flexDirection: "row", gap: 15 },
  dateInputWrapper: { flex: 1 },
  label: { fontSize: 12, color: "#666", marginBottom: 4 },
  input: {
    backgroundColor: "#F5F5F5",
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  // Chips
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  chipActive: { backgroundColor: "#E3F2FD", borderColor: "#1650A7" },
  chipText: { color: "#666", fontSize: 13 },
  chipTextActive: { color: "#1650A7", fontWeight: "bold" },

  // Footer
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    gap: 10,
  },
  clearButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  clearText: { color: "#666", fontWeight: "bold" },
  applyButton: {
    flex: 2,
    backgroundColor: "#1650A7",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  applyText: { color: "#FFF", fontWeight: "bold" },
});
