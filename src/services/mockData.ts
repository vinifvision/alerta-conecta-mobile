// src/services/mockData.ts
import { Occurrence, User, FilterOption } from "../types";

// Usuário Mock
export const MOCK_USER: User = {
  status: "sucesso (mock)",
  name: "Desenvolvedor Gerente (Mock)",
  email: "dev@mock.com",
  role: "Gerente",
  cpf: "000.000.000-00",
};

// Lista de Ocorrências Mock
export const MOCK_OCCURRENCES: Occurrence[] = [
  {
    id: 101,
    titule: "Incêndio em Edificação Residencial",
    type: 1,
    nome_tipo: "Incêndio",
    date: "2025-10-25T14:30:00",
    status: "Em_andamento",
    priority: "Alta",
    victims: "2 inalação de fumaça",
    details: "Fogo no 2º andar. Combate iniciado.",
    BackendAddress: "Rua da Aurora, 123, Recife - PE",
    lat: -8.063169,
    lng: -34.871139,
  },
  {
    id: 102,
    titule: "Resgate Veicular na BR-101",
    type: 2,
    nome_tipo: "Resgate",
    date: "2025-10-25T16:00:00",
    status: "Encerrada",
    priority: "Media",
    victims: "1 vítima leve",
    details: "Colisão carro x moto.",
    BackendAddress: "BR-101, km 40, Abreu e Lima - PE",
    lat: -7.908988,
    lng: -34.902683,
  },
  {
    id: 103,
    titule: "Vazamento de Gás GLP",
    type: 5,
    nome_tipo: "Ocorrência Ambiental",
    date: "2025-10-24T09:15:00",
    status: "Cancelada",
    priority: "Baixa",
    victims: null,
    details: "Alarme falso, cheiro de gás dispersou.",
    BackendAddress: "Rua do Sol, Olinda - PE",
  },
  {
    id: 104,
    titule: "Deslizamento de Barreira",
    type: 7,
    nome_tipo: "Desastre Natural",
    date: "2025-10-24T18:45:00",
    status: "Em_andamento",
    priority: "Alta",
    victims: "Busca em andamento",
    details: "Risco de novo deslizamento.",
    BackendAddress: "Córrego do Jenipapo, Recife - PE",
  },
];

// Opções para o Formulário de Registro
export const MOCK_FORM_OPTIONS = {
  types: [
    { value: "1", label: "Incêndio" },
    { value: "2", label: "Resgate" },
    { value: "3", label: "APH" },
    { value: "4", label: "Prevenção" },
    { value: "5", label: "Ambiental" },
    { value: "6", label: "Administrativa" },
    { value: "7", label: "Desastre" },
  ] as FilterOption[],

  subTypes: {
    "1": [
      { value: "101", label: "Incêndio em Edificação" },
      { value: "102", label: "Incêndio Florestal" },
    ],
    "2": [
      { value: "201", label: "Resgate em Altura" },
      { value: "202", label: "Resgate Veicular" },
    ],
    "3": [
      { value: "301", label: "Atendimento Clínico" },
      { value: "302", label: "Trauma" },
    ],
    // ... adicione os outros conforme necessário
  } as Record<string, FilterOption[]>,

  priorities: [
    { value: "Baixa", label: "Baixa" },
    { value: "Media", label: "Média" },
    { value: "Alta", label: "Alta" },
    { value: "Critica", label: "Crítica" },
  ] as FilterOption[],
};
