// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- CONFIGURAÇÃO ---
// Mude para 'false' quando quiser conectar com a API real
const IS_MOCK_MODE = true;

const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database";
const LOGIN_API_URL = `${API_URL}/user/login`;

export interface User {
  status: string;
  name: string;
  email: string;
  role: string;
  cpf: string;
  token?: string;
}

// Usuário Falso para testes
const MOCK_USER: User = {
  status: "sucesso (mock)",
  name: "Bombeiro Operacional",
  email: "mobile@bombeiros.pe.gov.br",
  role: "Operacional",
  cpf: "123.456.789-00",
  token: "token-falso-para-testes-123",
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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
      try {
        const storedUser = await AsyncStorage.getItem("@AlertaConecta:user");
        const storedToken = await AsyncStorage.getItem("@AlertaConecta:token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const login = async (cpf: string, pass: string) => {
    // --- MODO MOCK (SIMULAÇÃO) ---
    if (IS_MOCK_MODE) {
      console.log("Tentando login em MODO MOCK...");

      // Simula um delay de rede de 1 segundo para parecer real
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Aceita qualquer CPF/Senha no modo teste (ou você pode validar se quiser)
      if (cpf && pass) {
        await AsyncStorage.setItem(
          "@AlertaConecta:user",
          JSON.stringify(MOCK_USER),
        );
        await AsyncStorage.setItem("@AlertaConecta:token", MOCK_USER.token!);
        setUser(MOCK_USER);
        return; // Sai da função, pois já logou "falso"
      } else {
        throw new Error("Preencha CPF e senha para testar.");
      }
    }
    // -----------------------------

    // Lógica Real (só executa se IS_MOCK_MODE = false)
    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, pass }),
      });

      const data = await response.json();

      if (response.ok && data.status === "sucesso") {
        const token = data.token || "token-padrao";
        await AsyncStorage.setItem("@AlertaConecta:user", JSON.stringify(data));
        await AsyncStorage.setItem("@AlertaConecta:token", token);
        setUser(data);
      } else {
        throw new Error(data.message || "Falha no login.");
      }
    } catch (err: any) {
      throw err; // Repassa o erro para a tela de login tratar
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      "@AlertaConecta:user",
      "@AlertaConecta:token",
    ]);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signed: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};
