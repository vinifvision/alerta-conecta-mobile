import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext"; // <--- IMPORTANTE

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { logout, user } = useAuth();

  // Pegamos as funções e o tema atual do contexto global
  const {
    isLargeText,
    toggleLargeText,
    isHighContrast,
    toggleHighContrast,
    theme,
  } = useTheme();

  const styles = getStyles(theme); // Estilos dinâmicos

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: logout },
    ]);
  };

  const SettingItemSwitch = ({ label, icon, value, onValueChange }: any) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemLeft}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={24} color={theme.colors.primary} />
        </View>
        <Text style={styles.itemText}>{label}</Text>
      </View>
      <Switch
        trackColor={{ false: "#E0E0E0", true: theme.colors.primary }}
        thumbColor={value ? "#FFF" : "#F4F3F4"}
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>ACESSIBILIDADE</Text>
        <View style={styles.sectionBox}>
          <SettingItemSwitch
            label="Texto Grande"
            icon="type"
            value={isLargeText}
            onValueChange={toggleLargeText}
          />
          <View style={styles.divider} />
          <SettingItemSwitch
            label="Alto Contraste"
            icon="eye"
            value={isHighContrast}
            onValueChange={toggleHighContrast}
          />
        </View>

        <Text style={styles.sectionTitle}>CONTA</Text>
        <View style={styles.sectionBox}>
          <View
            style={{
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 18 }}>
                {user?.name?.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={[styles.itemText, { fontWeight: "bold" }]}>
                {user?.name}
              </Text>
              <Text
                style={[
                  styles.itemText,
                  {
                    fontSize: theme.sizes.small,
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.sectionBox, { marginTop: 20 }]}>
          <TouchableOpacity style={styles.itemContainer} onPress={handleLogout}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#FFEBEE" }]}>
                <Feather name="log-out" size={24} color="#D32F2F" />
              </View>
              <Text style={[styles.itemText, { color: "#D32F2F" }]}>
                Sair da Conta
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Função que gera os estilos baseada no tema atual
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      backgroundColor: "#1650A7", // Header mantém a cor da marca
      paddingTop: 50,
      paddingBottom: 15,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      elevation: 4,
    },
    headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
    backButton: { padding: 5 },
    content: { padding: 20 },

    sectionTitle: {
      fontSize: theme.sizes.small, // Usa tamanho dinâmico
      fontWeight: "bold",
      color: theme.colors.textSecondary, // Usa cor dinâmica
      marginBottom: 8,
      marginLeft: 4,
      marginTop: 10,
    },
    sectionBox: {
      backgroundColor: theme.colors.card, // Usa cor dinâmica
      borderRadius: 12,
      overflow: "hidden",
      elevation: 1,
      borderWidth: 1,
      borderColor: theme.colors.border, // Borda para alto contraste
    },

    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconBox: {
      width: 35,
      height: 35,
      borderRadius: 8,
      backgroundColor: theme.colors.tint,
      justifyContent: "center",
      alignItems: "center",
    },
    itemText: {
      fontSize: theme.sizes.body, // USA TAMANHO DINÂMICO
      color: theme.colors.text, // USA COR DINÂMICA
      fontWeight: "500",
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: 60,
    },
  });
