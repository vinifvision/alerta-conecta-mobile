import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function ProfileScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("Settings" as never)}
        >
          <Feather name="settings" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Lógica do Avatar: Se tiver URL, mostra imagem. Se não, mostra inicial */}
      <View style={styles.avatarContainer}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
        )}
      </View>

      <Text style={styles.name}>{user?.name || "Usuário"}</Text>
      <Text style={styles.role}>{user?.role || "Cargo não definido"}</Text>

      <View style={styles.infoContainer}>
        {/* NOVO: Batalhão */}
        <Text style={styles.infoLabel}>Matrícula:</Text>
        <Text style={styles.infoValue}>{user?.registry || "N/A"}</Text>

        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoValue}>{user?.email}</Text>

        <Text style={styles.infoLabel}>Telefone:</Text>
        <Text style={styles.infoValue}>{user?.phone || "Não informado"}</Text>

        <Text style={styles.infoLabel}>CPF:</Text>
        <Text style={styles.infoValue}>{user?.cpf || "Não informado"}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: theme.colors.background,
      paddingTop: 50,
    },
    headerTop: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 30,
    },
    headerTitle: {
      fontSize: 24 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    settingsButton: {
      padding: 8,
      backgroundColor: theme.colors.tint,
      borderRadius: 10,
    },
    avatarContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 4,
      borderColor: theme.colors.card,
      elevation: 5,
      overflow: "hidden", // Importante para cortar a imagem redonda
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    avatarText: {
      color: theme.colors.white,
      fontSize: 48 * theme.fontScale,
      fontWeight: "bold",
    },
    name: {
      fontSize: 26 * theme.fontScale,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    role: {
      fontSize: 18 * theme.fontScale,
      color: theme.colors.primary,
      marginBottom: 32,
      fontWeight: "500",
    },
    infoContainer: {
      width: "90%",
      backgroundColor: theme.colors.card,
      padding: 20,
      borderRadius: 15,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 20,
    },
    infoLabel: {
      color: theme.colors.textSecondary,
      fontSize: 14 * theme.fontScale,
      marginTop: 10,
    },
    infoValue: {
      color: theme.colors.text,
      fontSize: 16 * theme.fontScale,
      fontWeight: "500",
    },
  });
