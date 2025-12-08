import { Occurrence } from "../types";
import { MOCK_OCCURRENCES } from "./mockData";

// URL base do banco de dados
const API_URL =
  "https://alerta-conecta-backend-production.up.railway.app/database/occurrence";
const USE_MOCK = true; // Mude para FALSE para usar o Java

export const occurrenceService = {
  // LISTAR TODAS (GET /getall)
  getAll: async (): Promise<Occurrence[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return MOCK_OCCURRENCES;
    }

    const response = await fetch(`${API_URL}/getall`);
    if (!response.ok) throw new Error("Falha ao buscar ocorrências");

    return response.json();
  },

  // CRIAR NOVA (POST /registry)
  create: async (occurrence: Partial<Occurrence>): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Mock Create:", occurrence);
      return;
    }

    // O Java espera a data em formato ISO compatível ou Timestamp
    // Vamos garantir que a data vá como string ISO
    const payload = {
      ...occurrence,
      date: occurrence.date || new Date().toISOString(),
    };

    const response = await fetch(`${API_URL}/registry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // O Backend retorna texto puro ou JSON dependendo do sucesso
    // Vamos ler como texto primeiro para evitar erro de parse
    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(responseText || "Falha ao registrar ocorrência");
    }
  },

  // OBS: O Backend NÃO tem endpoints para getById, update ou delete (exceto arquivar)
  // Se tentar usar esses métodos abaixo com o backend real, vai dar erro 404/405.

  getById: async (id: number): Promise<Occurrence | undefined> => {
    // Como o backend não tem GET /:id, simulamos buscando na lista local se necessário
    // ou retornamos do mock
    if (USE_MOCK) return MOCK_OCCURRENCES.find((o) => o.id === id);
    throw new Error("Backend não suporta busca por ID único ainda.");
  },
};
