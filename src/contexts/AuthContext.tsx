// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  signed: boolean;
  loading: boolean;
  login: (cpf: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      // Apenas carregamos o usuário persistido
      const storedUser = await AsyncStorage.getItem("@App:user");
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    }
    loadStorageData();
  }, []);

  const login = async (cpf: string, pass: string) => {
    try {
      const userData = await authService.login(cpf, pass);

      await AsyncStorage.setItem("@App:user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    // Removemos apenas o usuário
    await AsyncStorage.removeItem("@App:user");
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

export const useAuth = () => useContext(AuthContext);
