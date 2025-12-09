import { Occurrence } from "../types";
import { MOCK_OCCURRENCES } from "./mockData";

const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database/occurrence";
const USE_MOCK = true; // Mantenha TRUE para testar localmente antes de conectar

export const occurrenceService = {
  getAll: async (): Promise<Occurrence[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return MOCK_OCCURRENCES;
    }
    const response = await fetch(`${API_URL}/getall`);
    if (!response.ok) throw new Error("Falha ao buscar ocorrências");
    return response.json();
  },

  // NOVA VERSÃO: Recebe FormData para suportar Imagens e Campos @RequestPart
  create: async (formData: FormData): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Log para você ver o que está sendo enviado no console
      console.log("Mock Create (FormData):");
      // @ts-ignore
      for (let pair of formData._parts) {
        console.log(pair[0] + ": " + JSON.stringify(pair[1]));
      }
      return;
    }

    const response = await fetch(`${API_URL}/registry`, {
      method: "POST",
      // NÃO defina 'Content-Type': 'multipart/form-data' manualmente!
      // O fetch faz isso automaticamente e adiciona o 'boundary' necessário.
      body: formData,
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(responseText || "Falha ao registrar ocorrência");
    }
  },

  getById: async (id: number): Promise<Occurrence | undefined> => {
    if (USE_MOCK) return MOCK_OCCURRENCES.find((o) => o.id === id);
    return undefined;
  },

  // Update mantido como JSON por enquanto (ou precisaria mudar se o backend exigir)
  update: async (
    id: number,
    occurrence: Partial<Occurrence>,
  ): Promise<void> => {
    if (USE_MOCK) return;
    // Implementação futura...
  },
};
