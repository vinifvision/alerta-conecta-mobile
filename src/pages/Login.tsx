// pages/Login.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext"; // Importe o hook

export default function LoginScreen({ navigation }: any) {
  // navigation não é mais tão necessário aqui pois o AuthContext redireciona, mas pode manter
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const { login } = useAuth(); // Pega a função do contexto
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    try {
      await login(usuario, senha);
      // Não precisa navegar manualmente, o App.tsx vai detectar a mudança de estado
    } catch (error: any) {
      Alert.alert("Erro no Login", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/alertaconecta-logo.png")}
          style={styles.logo}
        />
      </View>

      {/* Título */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Fazer login</Text>
        <Text style={styles.loginSubtitle}>Conecte-se com uma conta</Text>
      </View>

      {/* Campos de usuário e senha */}
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        placeholderTextColor="#BDBDBD"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#BDBDBD"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      {/* Esqueceu a senha */}
      <TouchableOpacity style={{ alignSelf: "flex-end", marginRight: "10%" }}>
        <Text style={styles.forgot}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      {/* Botão Entrar */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 117,
    height: 171,
    marginBottom: 10,
  },
  loginContainer: {
    alignItems: "flex-start",
    width: "80%",
    marginBottom: 30,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 5,
  },
  loginSubtitle: {
    fontSize: 20,
    color: "#222",
  },
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
  forgot: {
    color: "#003366",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 25,
  },
  loginButton: {
    backgroundColor: "#D31C30",
    paddingVertical: 15,
    paddingHorizontal: 110,
    borderRadius: 50,
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});
