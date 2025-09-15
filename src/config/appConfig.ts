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
];

export const availableTimeSlots: string[] = ["10:00", "17:00", "18:00", "19:00", "20:00"];

// Configuração das aulas por dia com horários específicos
export const playSlotsConfig: PlaySlotConfig[] = [
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
  { key: "quarta-18", label: "Aula", dayOfWeek: 3, timeRange: "18:00 - 19:00" },
  { key: "quarta-19", label: "Aula", dayOfWeek: 3, timeRange: "19:00 - 20:00" },
  { key: "quarta-20", label: "Aula", dayOfWeek: 3, timeRange: "20:00 - 21:00" },
  { key: "sexta-19", label: "Aula", dayOfWeek: 5, timeRange: "19:00 - 20:00" },
  { key: "sexta-20", label: "Aula", dayOfWeek: 5, timeRange: "20:00 - 21:00" },
  { key: "sabado-10", label: "Aula", dayOfWeek: 6, timeRange: "10:00 - 11:00" },
];

export const numberOfWeeksToDisplayPlaySlots = 4;
// Capacidade atual por aula
export const maxParticipantsPerPlaySlot = 12;
