import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Certifique-se que o caminho da imagem está correto */}
        <Image
          source={require("../assets/alertaconecta-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Bem-vindo(a)!</Text>
        <Text style={styles.welcomeSubtitle}>Conecte-se com uma conta</Text>
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login" as never)}
      >
        <Text style={styles.loginButtonText}>Fazer login</Text>
      </TouchableOpacity>
    </View>
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
    logoContainer: {
      alignItems: "center",
      marginBottom: 70,
    },
    logo: {
      width: 117,
      height: 171,
      marginBottom: 10,
    },
    welcomeContainer: {
      alignItems: "flex-start",
      width: "80%",
      marginBottom: 30,
    },
    welcomeTitle: {
      fontSize: 24 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginBottom: 5,
    },
    welcomeSubtitle: {
      fontSize: 20 * theme.fontScale,
      color: theme.colors.text,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 110,
      borderRadius: 50,
      marginTop: 10,
      width: "85%",
      alignItems: "center",
      borderWidth: theme.colors.border === "#FFFFFF" ? 1 : 0, // Borda extra para alto contraste
      borderColor: theme.colors.white,
    },
    loginButtonText: {
      color: theme.colors.white,
      fontSize: 18 * theme.fontScale,
      fontWeight: "500",
    },
  });
