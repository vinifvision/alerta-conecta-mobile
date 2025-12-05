import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const { login, loading } = useAuth();
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  async function handleLogin() {
    if (!usuario || !senha) {
      return Alert.alert("Atenção", "Preencha usuário e senha.");
    }

    setIsLocalLoading(true);
    try {
      await login(usuario, senha);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha no login.");
    } finally {
      setIsLocalLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/alertaconecta-logo.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Fazer login</Text>
          <Text style={styles.loginSubtitle}>Conecte-se com uma conta</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Usuário (CPF)"
          placeholderTextColor="#BDBDBD"
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#BDBDBD"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLocalLoading || loading}
        >
          {isLocalLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: { alignItems: "center", marginBottom: 40 },
  logo: { width: 117, height: 171, marginBottom: 10 },
  loginContainer: { alignItems: "flex-start", width: "80%", marginBottom: 30 },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 5,
  },
  loginSubtitle: { fontSize: 20, color: "#222" },
  input: {
    width: "85%",
    height: 50,
    backgroundColor: "#ededed",
    borderRadius: 30,
    paddingHorizontal: 20,
    fontSize: 18,
    marginBottom: 15,
    color: "#222",
  },
  loginButton: {
    backgroundColor: "#D31C30",
    paddingVertical: 15,
    paddingHorizontal: 110,
    borderRadius: 50,
    marginTop: 10,
  },
  loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "500" },
});