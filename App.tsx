// App.tsx
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// 1. Importamos o AuthProvider e o hook useAuth
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

// 2. Importamos as telas
import WelcomeScreen from "./src/pages/Welcome";
import LoginScreen from "./src/pages/Login";
import HomeScreen from "./src/pages/Home"; // <--- Vamos criar essa tela no Passo 2

const Stack = createStackNavigator();

// 3. Criamos um componente que gerencia as rotas
function Routes() {
  const { signed, loading } = useAuth();

  // Enquanto carrega os dados do celular (AsyncStorage), mostra um spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#D31C30" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {signed ? (
        // --- Se estiver logado (signed = true), mostra SÓ a Home ---
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        // --- Se NÃO estiver logado, mostra Welcome e Login ---
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// 4. O App principal apenas fornece o Contexto e a Navegação
export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </NavigationContainer>
  );
}
