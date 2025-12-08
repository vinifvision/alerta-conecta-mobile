// src/types/index.ts

export interface User {
  status: string;
  name: string;
  email: string;
  role: string;
  cpf: string;
  registry?: string;
  phone?: string;
}

export type OccurrenceStatus = "Em_andamento" | "Encerrada" | "Cancelada";
export type OccurrencePriority = "Baixa" | "Media" | "Alta";
export type BackendAddress = {
  street: string;
  number: string;
  complement: string;
  idDistrict: number;
};

export type BackendType = {
  id: number;
  name: string;
  description?: string;
};

export type Occurrence = {
  id: number;
  titule?: string | null;
  date: string;
  victims: string | null;
  details: string | null;
  status: OccurrenceStatus;
  priority: OccurrencePriority;

  type: BackendType;
  address?: BackendAddress | null;

  // Deixe lat/lng opcionais para não quebrar com dados antigos
  lat?: number | null;
  lng?: number | null;
};

export type FilterOption = { value: string | number; label: string };

export type FormOptionsData = {
  types: FilterOption[];
  subTypes: Record<string, FilterOption[]>;
  priorities: FilterOption[];
};
