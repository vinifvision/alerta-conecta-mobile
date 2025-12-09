import { Occurrence } from "../types";
import { MOCK_OCCURRENCES } from "./mockData";

const API_URL =
  "https://hastily-preaseptic-myrle.ngrok-free.dev/database/occurrence";
const USE_MOCK = false; // MANTENHA TRUE ATÉ O BACKEND ESTAR RODANDO

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

  // CRIAÇÃO COM UPLOAD DE ARQUIVO
  create: async (formData: FormData): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("MOCK Create (FormData Enviado)");
      return;
    }

    const response = await fetch(`${API_URL}/registry`, {
      method: "POST",
      body: formData, // O fetch define o Content-Type multipart automaticamente
    });

    const responseText = await response.text();
    if (!response.ok)
      throw new Error(responseText || "Falha ao registrar ocorrência");
  },

  update: async (
    id: number,
    occurrence: Partial<Occurrence>,
  ): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(occurrence),
    });
    if (!response.ok) throw new Error("Falha ao atualizar");
  },

  getById: async (id: number): Promise<Occurrence | undefined> => {
    if (USE_MOCK) return MOCK_OCCURRENCES.find((o) => o.id === id);
    return undefined;
  },
};
