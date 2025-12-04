import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já existe usuário salvo no celular
    async function loadStorageData() {
      const storedUser = await AsyncStorage.getItem("@App:user");
      const storedToken = await AsyncStorage.getItem("@App:token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        // Configurar header padrão da API aqui se usar Axios
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  const login = async (cpf, password) => {
    // ... Lógica de fetch na API ...
    // Se sucesso:
    // await AsyncStorage.setItem('@App:user', JSON.stringify(userData));
    // await AsyncStorage.setItem('@App:token', token);
    // setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ signed: !!user, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
