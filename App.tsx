import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";

// Importe TODAS as Telas
import WelcomeScreen from "./src/pages/Welcome";
import LoginScreen from "./src/pages/Login";
import HomeScreen from "./src/pages/Home";
import ProfileScreen from "./src/pages/Profile";
import OccurrenceDetails from "./src/pages/OccurrenceDetails";
import SettingsScreen from "./src/pages/Settings";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- Navegação Interna (Abas: Home + Perfil) ---
function AppTabs() {
  return (
    <Tab.Navigator
      id="AppTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1650A7",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 60, paddingBottom: 5 },
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

// --- Navegação Principal (Stack) ---
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
        // --- Rotas Privadas ---
        <>
          {/* A tela principal contém as abas */}
          <Stack.Screen name="Main" component={AppTabs} />
          {/* Telas secundárias (ficam sobre as abas) */}
          <Stack.Screen
            name="OccurrenceDetails"
            component={OccurrenceDetails}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        // --- Rotas Públicas ---
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
        <ThemeProvider>
          <Routes />
        </ThemeProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
