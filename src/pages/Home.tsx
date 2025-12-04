// pages/Home.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Mobile</Text>
      <Text style={styles.subtitle}>Bem-vindo, {user?.name}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Cargo:</Text>
        <Text style={styles.info}>{user?.role}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.info}>Conectado (Modo Offline)</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    elevation: 2, // Sombra no Android
    shadowColor: "#000", // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
  },
  info: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#D31C30",
    paddingVertical: 15,
    width: "100%",
    borderRadius: 50,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
