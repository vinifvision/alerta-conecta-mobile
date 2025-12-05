import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  Settings: undefined;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Ícone de Configurações*/}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate("Settings")}
      >
        <Ionicons name="settings-outline" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.role}>{user?.role}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  settingsButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 8,
    borderRadius: 12,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1650A7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: { color: "#FFF", fontSize: 40, fontWeight: "bold" },
  name: { fontSize: 24, fontWeight: "bold", color: "#333" },
  role: { fontSize: 16, color: "#666", marginBottom: 32 },
  logoutButton: {
    backgroundColor: "#D31C30",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  logoutText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});