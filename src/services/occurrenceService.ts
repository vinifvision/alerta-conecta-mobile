// src/services/occurrenceService.ts
import { Occurrence } from "../types";
import { MOCK_OCCURRENCES } from "./mockData";

const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database/occurrence";
const USE_MOCK = true; // Mantenha TRUE enquanto o backend não tem o PUT

export const occurrenceService = {
  getAll: async (): Promise<Occurrence[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_OCCURRENCES;
    }
    const response = await fetch(`${API_URL}/getall`);
    if (!response.ok) throw new Error("Falha ao buscar ocorrências");
    return response.json();
  },

  create: async (occurrence: Partial<Occurrence>): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("MOCK Create:", occurrence);
      // Opcional: Adicionar ao MOCK_OCCURRENCES em memória se quiser ver na lista
      return;
    }
    const payload = {
      ...occurrence,
      date: occurrence.date || new Date().toISOString(),
    };
    const response = await fetch(`${API_URL}/registry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Falha ao registrar ocorrência");
  },

  // NOVA FUNÇÃO UPDATE
  update: async (
    id: number,
    occurrence: Partial<Occurrence>,
  ): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`MOCK Update ID ${id}:`, occurrence);
      // Simulação: Encontra e atualiza no array local (apenas para a sessão atual)
      const index = MOCK_OCCURRENCES.findIndex((o) => o.id === id);
      if (index !== -1) {
        MOCK_OCCURRENCES[index] = { ...MOCK_OCCURRENCES[index], ...occurrence };
      }
      return;
    }

    // Chamada Real (Vai funcionar assim que o backend tiver o PUT /{id})
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(occurrence),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Falha ao atualizar ocorrência");
    }
  },

  getById: async (id: number): Promise<Occurrence | undefined> => {
    // Método auxiliar mantido para compatibilidade, se necessário
    if (USE_MOCK) return MOCK_OCCURRENCES.find((o) => o.id === id);
    return undefined;
  },
};
