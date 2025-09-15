import type { Court, PlaySlotConfig } from "@/lib/types";

export const APP_NAME = "Fúria Treinamentos Futevôlei";

// adminUserUids array foi removido. A verificação de admin agora é feita via coleção 'admins' no Firestore.

export const courts: Court[] = [
  {
    id: "main-court",
    name: "Refúgio Arena — Quadra Principal",
    type: "covered",
    imageUrl:
      "https://lh3.googleusercontent.com/p/AF1QipNY9b4RN45xrsy9_66ouZ3YziNstov9vo-1Tpoi=s680-w680-h510-rw",
    description:
      "Quadra oficial de futevôlei (8m x 16m) na Refúgio Arena, com areia tratada e estrutura confortável.",
    dataAiHint: "futevolei arena refugio",
  },
  {
    id: "alphaville-court",
    name: "Refúgio Arena — Alphaville",
    type: "covered",
    imageUrl: "https://placehold.co/800x600.png?text=Alphaville",
    description:
      "Unidade Alphaville com a mesma areia tratada e metodologia Fúria para treinos exclusivos em um ambiente privativo.",
    dataAiHint: "futevolei alphaville",
    availabilityStatus: "sold-out",
    availabilityMessage: "Todos os horários estão esgotados no momento nesta unidade.",
  },
];

export const availableTimeSlots: string[] = ["17:00", "18:00", "19:00"];

// Configuração das aulas diárias com três horários de uma hora cada (17h–20h)
export const playSlotsConfig: PlaySlotConfig[] = [
  {
    key: "domingo-17",
    label: "Aula",
    dayOfWeek: 0,
    timeRange: "17:00 - 18:00",
  },
  {
    key: "domingo-18",
    label: "Aula",
    dayOfWeek: 0,
    timeRange: "18:00 - 19:00",
  },
  {
    key: "domingo-19",
    label: "Aula",
    dayOfWeek: 0,
    timeRange: "19:00 - 20:00",
  },
  {
    key: "segunda-17",
    label: "Aula",
    dayOfWeek: 1,
    timeRange: "17:00 - 18:00",
  },
  {
    key: "segunda-18",
    label: "Aula",
    dayOfWeek: 1,
    timeRange: "18:00 - 19:00",
  },
  {
    key: "segunda-19",
    label: "Aula",
    dayOfWeek: 1,
    timeRange: "19:00 - 20:00",
  },
  { key: "terca-17", label: "Aula", dayOfWeek: 2, timeRange: "17:00 - 18:00" },
  { key: "terca-18", label: "Aula", dayOfWeek: 2, timeRange: "18:00 - 19:00" },
  { key: "terca-19", label: "Aula", dayOfWeek: 2, timeRange: "19:00 - 20:00" },
  { key: "quarta-17", label: "Aula", dayOfWeek: 3, timeRange: "17:00 - 18:00" },
  { key: "quarta-18", label: "Aula", dayOfWeek: 3, timeRange: "18:00 - 19:00" },
  { key: "quarta-19", label: "Aula", dayOfWeek: 3, timeRange: "19:00 - 20:00" },
  { key: "quinta-17", label: "Aula", dayOfWeek: 4, timeRange: "17:00 - 18:00" },
  { key: "quinta-18", label: "Aula", dayOfWeek: 4, timeRange: "18:00 - 19:00" },
  { key: "quinta-19", label: "Aula", dayOfWeek: 4, timeRange: "19:00 - 20:00" },
  { key: "sexta-17", label: "Aula", dayOfWeek: 5, timeRange: "17:00 - 18:00" },
  { key: "sexta-18", label: "Aula", dayOfWeek: 5, timeRange: "18:00 - 19:00" },
  { key: "sexta-19", label: "Aula", dayOfWeek: 5, timeRange: "19:00 - 20:00" },
  { key: "sabado-17", label: "Aula", dayOfWeek: 6, timeRange: "17:00 - 18:00" },
  { key: "sabado-18", label: "Aula", dayOfWeek: 6, timeRange: "18:00 - 19:00" },
  { key: "sabado-19", label: "Aula", dayOfWeek: 6, timeRange: "19:00 - 20:00" },
];

export const numberOfWeeksToDisplayPlaySlots = 4;
// Capacidade atual por aula
export const maxParticipantsPerPlaySlot = 12;
