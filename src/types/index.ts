// src/types/index.ts

export type OccurrenceStatus = "Em_andamento" | "Encerrada" | "Cancelada";
// O Java usa Enum.valueOf, então o texto deve bater exatamente com o Enum do Java (geralmente Capitalized ou Upper)
export type OccurrencePriority = "Baixa" | "Media" | "Alta" | "Critica";

// Estrutura do Endereço (Backend: OccurrenceAddress)
export type BackendAddress = {
  street: string; // Java: getStreet()
  number: string; // Java: getNumber()
  complement: string; // Java: getComplement()
  idDistrict: number; // Java: getIdDistrict()
};

// Estrutura do Tipo (Backend: OccurrenceType)
export type BackendType = {
  id: number;
  name: string; // Java: getName()
  description?: string; // Java: getDescription()
};

// Objeto Principal (Backend: Occurrence)
export type Occurrence = {
  id: number;
  titule: string | null; // CORREÇÃO: Java espera 'titule'
  date: string; // CORREÇÃO: Java espera 'date' (Timestamp ISO)
  victims: string | null;
  details: string | null; // Java: getDetails() -> 'details' ou 'detalhe'? Verifiquei: getDetails() mapeia para 'details' ou 'detalhe' dependendo da serialização. Assumindo 'details'.
  status: OccurrenceStatus;
  priority: OccurrencePriority;

  // Objetos Aninhados
  type: BackendType;
  address?: BackendAddress | null; // Pode vir null no /getall

  // Campos auxiliares front-end (Google Maps)
  lat?: number | null;
  lng?: number | null;
};

// Tipos para Formulários
export type FilterOption = { value: string | number; label: string };

export type FormOptionsData = {
  types: FilterOption[];
  subTypes: Record<string, FilterOption[]>;
  priorities: FilterOption[];
};
