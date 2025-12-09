import { Occurrence, User, FilterOption } from "../types";

export const MOCK_USER: User = {
  status: "sucesso",
  name: "Sargento Peixoto",
  email: "peixoto@bombeiros.pe.gov.br",
  role: "Comandante de Operações",
  registry: "MAT-998877",
  phone: "(81) 99999-1234",
  cpf: "123.456.789-00",
  avatarUrl: "",
};

export const MOCK_OCCURRENCES: Occurrence[] = [
  {
    id: 101,
    titule: "Incêndio em Edificação Residencial", // Java usa 'titule' (typo mantido)
    date: "2025-10-25T14:30:00",
    status: "Em_andamento",
    priority: "Alta",
    victims: "2 inalação de fumaça",
    details: "Fogo no 2º andar. Combate iniciado.",

    // Objeto Tipo (Não apenas ID)
    type: {
      id: 1,
      name: "Incêndio",
      description: "Fogo em local fechado",
    },

    // Objeto Endereço (Não apenas string)
    address: {
      street: "Rua da Aurora",
      number: "123",
      complement: "Apto 101",
      idDistrict: 1,
    },

    // Coordenadas
    lat: -8.063169,
    lng: -34.871139,
  },
  {
    id: 102,
    titule: "Resgate Veicular na BR-101",
    date: "2025-10-25T16:00:00",
    status: "Encerrada",
    priority: "Media",
    victims: "1 vítima leve",
    details: "Colisão carro x moto.",

    type: {
      id: 2,
      name: "Resgate",
      description: "Salvamento veicular",
    },

    address: {
      street: "BR-101",
      number: "Km 40",
      complement: "",
      idDistrict: 2,
    },

    lat: -7.908988,
    lng: -34.902683,
  },
];

export const MOCK_FORM_OPTIONS = {
  types: [
    { value: "1", label: "Incêndio" },
    { value: "2", label: "Resgate" },
    { value: "3", label: "Acidente" },
    { value: "4", label: "Outro" },
  ] as FilterOption[],
  subTypes: {} as Record<string, FilterOption[]>,
  priorities: [
    { value: "Baixa", label: "Baixa" },
    { value: "Media", label: "Média" },
    { value: "Alta", label: "Alta" },
  ] as FilterOption[],
};
