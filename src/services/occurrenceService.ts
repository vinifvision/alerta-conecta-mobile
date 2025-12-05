import { Occurrence } from "../types";
import { MOCK_OCCURRENCES } from "./mockData";

const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database";

// Mude para FALSE quando quiser conectar no backend real
const USE_MOCK = true;

export const occurrenceService = {
  getAll: async (token?: string): Promise<Occurrence[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Fake delay
      return [...MOCK_OCCURRENCES];
    }

    const response = await fetch(`${API_URL}/occurrence/getall`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Erro ao buscar ocorrências");
    return response.json();
  },

  getById: async (id: number, token?: string): Promise<Occurrence | null> => {
    if (USE_MOCK) {
      return MOCK_OCCURRENCES.find((o) => o.id === id) || null;
    }

    const response = await fetch(`${API_URL}/occurrence/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Erro ao buscar detalhes");
    return response.json();
  },

  create: async (data: any, token?: string) => {
    if (USE_MOCK) {
      console.log("MOCK CREATE:", data);
      return { status: "sucesso" };
    }
    // ... lógica fetch real aqui ...
    return { status: "sucesso" };
  },
};
