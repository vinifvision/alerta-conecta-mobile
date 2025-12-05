// src/types/index.ts

export type OccurrenceStatus = "Em_andamento" | "Encerrada" | "Cancelada";
export type OccurrencePriority = "Baixa" | "Media" | "Alta" | "Critica";

// Tipo unificado da Ocorrência
export type Occurrence = {
  id: number;
  titule: string | null; // Nome do subtipo (Ex: Incêndio em Edificação)
  type: number; // ID do tipo principal
  nome_tipo?: string; // Nome do tipo principal (Ex: Incêndio)
  date: string; // ISO String (2025-10-24T...)
  status: OccurrenceStatus;
  priority: OccurrencePriority;
  victims: string | null;
  details: string | null;
  address?: string | null; // Endereço formatado
  lat?: number | null;
  lng?: number | null;

  // Campos detalhados de endereço (úteis para edição/registro)
  rua?: string;
  numero?: string;
  nome_bairro?: string;
  nome_cidade?: string;
  nome_estado?: string;
  descricao_tipo?: string;
};

// Tipo do Usuário
export type User = {
  status: string;
  name: string;
  email: string;
  role: string;
  cpf: string;
  token?: string;
};

// Opções para Selects/Dropdowns
export type FilterOption = { value: string | number; label: string };
