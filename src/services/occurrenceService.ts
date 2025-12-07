// src/services/occurrenceService.ts

import { Occurrence, FormOptionsData } from "../types";
import { MOCK_OCCURRENCES, MOCK_FORM_OPTIONS } from "./mockData";

// Ajuste para o IP da sua máquina se for rodar local (ex: http://192.168.0.x:8080/database)
// Ou use a URL de produção se o backend já estiver atualizado lá
const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database";

const USE_MOCK = true; // <--- Mude para FALSE para testar com Backend

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const occurrenceService = {
  // Listar Todas
  getAll: async (token?: string): Promise<Occurrence[]> => {
    if (USE_MOCK) {
      await delay(800);
      return [...MOCK_OCCURRENCES];
    }

    const response = await fetch(`${API_URL}/occurrence/getall`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Erro na API ao buscar ocorrências");
    return response.json();
  },

  // Detalhes (Atenção: Backend precisa criar este endpoint!)
  getById: async (id: number, token?: string): Promise<Occurrence | null> => {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_OCCURRENCES.find((o) => o.id === id) || null;
    }

    try {
      const response = await fetch(`${API_URL}/occurrence/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro na API");
      return response.json();
    } catch (e) {
      console.warn(
        "Backend provavelmente não tem o endpoint GET /id. Usando lista local como fallback se possível.",
      );
      throw e;
    }
  },

  // Obter Opções
  getFormOptions: async (): Promise<FormOptionsData> => {
    // Retorna Mock por enquanto, pois backend não tem endpoint de opções
    return MOCK_FORM_OPTIONS;
  },

  // Criar (Payload Ajustado para o Java)
  create: async (data: any, token?: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(1500);
      console.log("MOCK CREATE (Payload Java):", JSON.stringify(data, null, 2));
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro API: ${errorText}`);
    }
  },

  // Editar (Atenção: Backend precisa criar este endpoint!)
  update: async (id: number, data: any, token?: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(1000);
      console.log("MOCK UPDATE:", data);
      return;
    }
    const response = await fetch(`${API_URL}/occurrence/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar");
  },
};
