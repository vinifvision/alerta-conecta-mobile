import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [altoContraste, setAltoContraste] = useState(false);
  const [tamanhoFonte, setTamanhoFonte] = useState("Média");
  const [showFontModal, setShowFontModal] = useState(false);

  const fontOptions = ["Pequeno", "Médio", "Grande"];

  const handleSelectFont = (size: string) => {
    setTamanhoFonte(size);
    setShowFontModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card de Acessibilidade */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acessibilidade</Text>

          {/* Alto Contraste */}
          <View style={styles.option}>
            <Text style={styles.optionText}>Alto contraste</Text>
            <Switch
              value={altoContraste}
              onValueChange={setAltoContraste}
              trackColor={{ false: "#D1D5DB", true: "#003366" }}
              thumbColor={altoContraste ? "#ffffff" : "#F3F4F6"}
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          {/* Tamanho da Fonte */}
          <View style={styles.option}>
            <Text style={styles.optionText}>Tamanho da Fonte</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowFontModal(true)}
            >
              <Text style={styles.dropdownText}>{tamanhoFonte}</Text>
              <Ionicons name="chevron-down" size={18} color="#003366" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Botões Inferiores */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.redefinirButton}>
          <Text style={styles.redefinirButtonText}>Redefinir senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sairButton} onPress={logout}>
          <Text style={styles.sairButtonText}>Sair da Conta</Text>
          <Ionicons name="exit-outline" size={22} color="#D31C30" />
        </TouchableOpacity>
      </View>

      {/*Seleção de Tamanho da Fonte */}
      <Modal
        visible={showFontModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFontModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFontModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tamanho da Fonte</Text>
            {fontOptions.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.modalOption,
                  tamanhoFonte === size && styles.modalOptionSelected,
                ]}
                onPress={() => handleSelectFont(size)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    tamanhoFonte === size && styles.modalOptionTextSelected,
                  ]}
                >
                  {size}
                </Text>
                {tamanhoFonte === size && (
                  <Ionicons name="checkmark" size={20} color="#003366" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  content: {
    padding: 20,
    paddingBottom: 200,
  },
  card: {
    backgroundColor: "#D6E4F5",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C8D9EC",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: "#003366",
    fontWeight: "500",
  },
  bottomButtons: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    gap: 12,
  },
  redefinirButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4A90E2",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
  },
  redefinirButtonText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
  },
  sairButton: {
    backgroundColor: "#FFE5E5",
    borderWidth: 2,
    borderColor: "#D31C30",
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sairButtonText: {
    color: "#D31C30",
    fontSize: 16,
    fontWeight: "600",
  },
  // Seleção de tamanho da fonte
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 15,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: "#D6E4F5",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalOptionTextSelected: {
    color: "#003366",
    fontWeight: "600",
  },
});