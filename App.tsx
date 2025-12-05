// App.tsx

import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Contexto
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

// Importe TODAS as telas
import WelcomeScreen from "./src/pages/Welcome";
import LoginScreen from "./src/pages/Login";
import HomeScreen from "./src/pages/Home";
import OccurrenceDetails from "./src/pages/OccurrenceDetails"; // <--- IMPORTANTE

const Stack = createStackNavigator();

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
        // --- Rotas de Usuário Logado ---
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="OccurrenceDetails"
            component={OccurrenceDetails}
          />
        </>
      ) : (
        // --- Rotas de Login ---
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
        <Routes />
      </AuthProvider>
    </NavigationContainer>
  );
}
