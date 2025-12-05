import { User } from "../types";
import { MOCK_USER } from "./mockData";

const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database";

// Mude para FALSE quando quiser conectar no backend real
const USE_MOCK = true;

export const authService = {
  login: async (cpf: string, pass: string): Promise<User> => {
    if (USE_MOCK) {
      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (cpf && pass) return MOCK_USER;
      throw new Error("Credenciais inválidas (Mock)");
    }

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
