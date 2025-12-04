// App.tsx

import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Importa o contexto que acabamos de criar
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

// Telas
import WelcomeScreen from "./src/pages/Welcome";
import LoginScreen from "./src/pages/Login";
import HomeScreen from "./src/pages/Home"; // <--- Crie este arquivo (código abaixo)

const Stack = createStackNavigator();

const Routes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#D31C30" />
      </View>
    );
  }

  return (
    <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Rota Privada (Você entra aqui após o login mock)
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        // Rotas Públicas
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </NavigationContainer>
  );
}
