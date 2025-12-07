import React, { useState, useMemo } from "react";
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
import { useTheme } from "../contexts/ThemeContext";

export default function LoginScreen() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const { login, loading } = useAuth();
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
            resizeMode="contain"
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Fazer login</Text>
          <Text style={styles.loginSubtitle}>Conecte-se com uma conta</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Usuário"
          placeholderTextColor={theme.colors.textSecondary}
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={theme.colors.textSecondary}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={{ alignSelf: "flex-end", marginRight: "10%" }}>
          <Text style={styles.forgot}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLocalLoading || loading}
        >
          {isLocalLoading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    logoContainer: { alignItems: "center", marginBottom: 40 },
    logo: { width: 117, height: 171, marginBottom: 10 },
    loginContainer: {
      alignItems: "flex-start",
      width: "80%",
      marginBottom: 30,
    },
    loginTitle: {
      fontSize: 24 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginBottom: 5,
    },
    loginSubtitle: { fontSize: 20 * theme.fontScale, color: theme.colors.text },
    input: {
      width: "85%",
      height: 50,
      backgroundColor: theme.colors.card, // Usa card para input
      borderRadius: 30,
      paddingHorizontal: 20,
      fontSize: 18 * theme.fontScale,
      marginBottom: 15,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    forgot: {
      color: theme.colors.primary,
      fontSize: 15 * theme.fontScale,
      fontWeight: "500",
      marginBottom: 25,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 110,
      borderRadius: 50,
      marginTop: 10,
      width: "85%",
      alignItems: "center",
      borderWidth: theme.colors.border === "#FFFFFF" ? 1 : 0,
      borderColor: theme.colors.white,
    },
    loginButtonText: {
      color: theme.colors.white,
      fontSize: 18 * theme.fontScale,
      fontWeight: "500",
    },
  });
