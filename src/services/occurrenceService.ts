import { Occurrence } from "../types";
import { MOCK_OCCURRENCES, MOCK_FORM_OPTIONS } from "./mockData";

const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database";
const USE_MOCK = true; // <--- MUDE PARA FALSE PARA CONECTAR NO BACKEND

export const occurrenceService = {
  // Buscar Todas
  getAll: async (token?: string): Promise<Occurrence[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [...MOCK_OCCURRENCES];
    }

    const response = await fetch(`${API_URL}/occurrence/getall`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Erro ao buscar ocorrências");
    return response.json();
  },

  // Buscar por ID
  getById: async (id: number, token?: string): Promise<Occurrence | null> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_OCCURRENCES.find((o) => o.id === id) || null;
    }

    const response = await fetch(`${API_URL}/occurrence/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Erro ao buscar detalhes");
    return response.json();
  },

  // Criar Nova
  create: async (data: any, token?: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("MOCK CREATE PAYLOAD:", data);
      return;
    }

    const response = await fetch(`${API_URL}/occurrence/registry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Falha ao registrar");
  },

  // Obter Opções de Formulário (Tipos, Subtipos)
  getFormOptions: async () => {
    // Mesmo com backend, podemos manter os selects fixos se eles não mudarem muito
    // ou implementar um endpoint /form-options no futuro.
    return MOCK_FORM_OPTIONS;
  },
};
