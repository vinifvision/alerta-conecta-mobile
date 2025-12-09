export interface User {
  status?: string;
  name: string;
  role: string;
  registry: string;
  phone: string;
  email: string;
  avatarUrl: string; // Novo
  cpf: string;
}

export type OccurrenceStatus = "Em_andamento" | "Encerrada" | "Cancelada";
export type OccurrencePriority = "Baixa" | "Media" | "Alta" | "Critica";

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
  title?: string | null; // Suporte para ambos os nomes
  date: string;
  victims: string | null;
  details: string | null;
  status: OccurrenceStatus;
  priority: OccurrencePriority;
  type: BackendType;
  address?: BackendAddress | null;
  lat?: number | null;
  lng?: number | null;
  imageUrl?: string | null; // Novo: Link da foto
};

export type FilterOption = { value: string | number; label: string };

export type FormOptionsData = {
  types: FilterOption[];
  subTypes: Record<string, FilterOption[]>;
  priorities: FilterOption[];
};
