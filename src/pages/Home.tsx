import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext"; // Importe para poder sair (logout)

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, {user?.name || "Usuário"}</Text>
      <Text style={styles.subtitle}>Bem-vindo ao Alerta Conecta!</Text>

      <View style={styles.card}>
        <Text style={styles.info}>Você está logado no modo MOCK.</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Sair do App</Text>
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
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 5,
  },
  subtitle: { fontSize: 18, color: "#666", marginBottom: 30 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
    elevation: 2,
  },
  info: { fontSize: 16, textAlign: "center", color: "#333" },
  button: {
    backgroundColor: "#D31C30",
    padding: 15,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
