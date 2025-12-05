// src/types/index.ts

// Status e Prioridades padronizados (Enum no banco)
export type OccurrenceStatus = "Em_andamento" | "Encerrada" | "Cancelada";
export type OccurrencePriority = "Baixa" | "Media" | "Alta" | "Critica";

// Tipo principal da Ocorrência (reflete o banco de dados + campos calculados)
export type Occurrence = {
  id: number;
  titule: string | null; // Nome do subtipo (Ex: "Incêndio em Edificação")
  type: number; // ID do Tipo Principal (Ex: 1)
  nome_tipo: string; // Nome do Tipo Principal (Ex: "Incêndio")
  date: string; // Data ISO (2025-10-25T14:30:00)
  status: OccurrenceStatus;
  priority: OccurrencePriority;

  // Campos opcionais (podem vir null da API ou não serem usados na lista simples)
  victims?: string | null;
  details?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;

  // Campos auxiliares de endereço (úteis para o registro)
  rua?: string;
  numero?: string;
  nome_bairro?: string;
  nome_cidade?: string;
  nome_estado?: string;
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

// Opções para Dropdowns (Selects)
export type FilterOption = { value: string | number; label: string };
