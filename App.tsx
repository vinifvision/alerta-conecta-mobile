// App.tsx
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Contextos
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext"; // <--- 1. IMPORTAR

// Telas
import WelcomeScreen from "./src/pages/Welcome";
import LoginScreen from "./src/pages/Login";
import HomeScreen from "./src/pages/Home";
import ProfileScreen from "./src/pages/Profile";
import OccurrenceDetails from "./src/pages/OccurrenceDetails";
import SettingsScreen from "./src/pages/Settings";
import RegisterOccurrence from "./src/pages/RegisterOccurrence";
import EditOccurrence from "./src/pages/EditOccurrence"; // Importe a tela

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- 1. Navegação Interna (Abas) ---
function AppTabs() {
  const { theme } = useTheme(); // <--- 2. USAR TEMA PARA A BARRA

  return (
    <Tab.Navigator
      id="AppTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary, // Cor dinâmica
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: theme.colors.card, // Cor dinâmica
          borderTopColor: theme.colors.border,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === "Ocorrências")
            iconName = focused ? "list" : "list-outline";
          else if (route.name === "Perfil")
            iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Ocorrências" component={HomeScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- 2. Navegação Principal (Stack) ---
function Routes() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#D31C30" />
      </View>
    );
  }

  return (
    <Stack.Navigator id="main-stack" screenOptions={{ headerShown: false }}>
      {signed ? (
        <>
          <Stack.Screen name="Main" component={AppTabs} />
          <Stack.Screen
            name="OccurrenceDetails"
            component={OccurrenceDetails}
          />
          <Stack.Screen
            name="RegisterOccurrence"
            component={RegisterOccurrence}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen
            name="EditOccurrence"
            component={EditOccurrence}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        {/* 3. ENVOLVER TUDO COM THEMEPROVIDER */}
        <ThemeProvider>
          <Routes />
        </ThemeProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
