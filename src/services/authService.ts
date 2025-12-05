import { User } from "../types";
import { MOCK_USER } from "./mockData";

// URL da API real
const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database";
const USE_MOCK = true; // <--- MUDE PARA FALSE QUANDO QUISER USAR O BACKEND

export const authService = {
  login: async (cpf: string, pass: string): Promise<User> => {
    // Modo Mock
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay fake
      if (cpf && pass) return MOCK_USER;
      throw new Error("Credenciais inválidas (Simulação)");
    }

    // Modo Real
    const response = await fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, pass }),
    });

    const data = await response.json();
    if (!response.ok || data.status !== "sucesso") {
      throw new Error(data.message || "Falha no login");
    }
    return data;
  },
};
