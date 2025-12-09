// src/services/authService.ts
import { User } from "../types";
import { MOCK_USER } from "./mockData";

const API_URL =
  "https://hastily-preaseptic-myrle.ngrok-free.dev/database/user";
const USE_MOCK = false; // Alterado para FALSE para usar o backend real

export const authService = {
  login: async (cpf: string, pass: string): Promise<User> => {
    // Modo Mock (mantido apenas para fallback se necessário)
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (cpf && pass) return MOCK_USER;
      throw new Error("Credenciais inválidas (Simulação)");
    }

    // Modo Real
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, pass }),
    });

    const data = await response.json();

    // O backend retorna 404 se falhar, o que cai no !response.ok
    if (!response.ok || (data.status && data.status !== "sucesso")) {
      throw new Error(data.message || "Usuário ou senha inválidos");
    }

    return data;
  },
};
