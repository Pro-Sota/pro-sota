export type Option = { value: string; label: string };

export const OTHER = "other";
export const NONE = "none";
export const GARAGE = "garage";
export const MAX_PRIORITIES = 3;

export const YES_NO: Option[] = [
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
];

export const STEPS = [
  { title: "Dados pessoais", description: "Como podemos entrar em contacto consigo?" },
  { title: "Terreno e localização", description: "Vamos conhecer o terreno e as suas características." },
  { title: "Família e estilo de vida", description: "Queremos compreender como irá viver a casa." },
  { title: "Programa arquitectónico", description: "Defina os espaços e as características da habitação." },
  { title: "Âmbito e planeamento", description: "Defina os serviços, prioridades e prazo pretendido." },
  { title: "Orçamento e investimento", description: "Qual é o investimento previsto para concretizar o projecto?" },
  { title: "Estética e preferências", description: "Partilhe os estilos, materiais e referências de que gosta." },
  { title: "Revisão", description: "Confirme as informações antes de enviar." },
];

export const DECISION_MAKERS: Option[] = [
  { value: "self", label: "Apenas eu" },
  { value: "spouse", label: "Eu e o cônjuge" },
  { value: "family", label: "Família" },
  { value: "partners", label: "Sócios" },
];

export const PREFERRED_CONTACT: Option[] = [
  { value: "call", label: "Chamada" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "E-mail" },
  { value: "in_person", label: "Presencial" },
];

export const LAND_OWNERSHIP: Option[] = [
  { value: "owner_documented", label: "Sim, com documentação" },
  { value: "owner_undocumented", label: "Sim, sem documentação regularizada" },
  { value: "not_owner", label: "Ainda não" },
];

export const LAND_TYPES: Option[] = [
  { value: "flat", label: "Plano" },
  { value: "sloped", label: "Em declive" },
  { value: "filled", label: "Aterrado" },
  { value: "unknown", label: "Não sei" },
];

export const INFRASTRUCTURES: Option[] = [
  { value: "electricity", label: "Rede eléctrica" },
  { value: "water", label: "Água canalizada" },
  { value: "sewage", label: "Esgoto" },
  { value: "paved_road", label: "Estrada asfaltada" },
  { value: "internet", label: "Internet" },
  { value: NONE, label: "Nenhuma" },
];

export const FAMILY_GROWTH: Option[] = [
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
  { value: "maybe", label: "Talvez" },
];

export const WORKS_FROM_HOME: Option[] = [
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
  { value: "often", label: "Frequentemente" },
];

export const VISITORS: Option[] = [
  { value: "very_often", label: "Sim, muito frequentemente" },
  { value: "often", label: "Sim, frequentemente" },
  { value: "sometimes", label: "Sim, algumas vezes" },
  { value: "rarely", label: "Sim, raramente" },
  { value: "never", label: "Não recebo visitas" },
];

export const SPACES: Option[] = [
  { value: "living_room", label: "Sala de estar" },
  { value: "dining_room", label: "Sala de jantar" },
  { value: "kitchen", label: "Cozinha" },
  { value: "outdoor_kitchen", label: "Cozinha de apoio/exterior" },
  { value: "office", label: "Escritório" },
  { value: "laundry", label: "Lavandaria" },
  { value: "pantry", label: "Despensa" },
  { value: "maid_room", label: "Quarto da empregada" },
  { value: "balcony", label: "Varanda" },
  { value: "terrace", label: "Terraço" },
  { value: "pool", label: "Piscina" },
  { value: "garden", label: "Jardim" },
  { value: "bbq", label: "Churrasqueira/área gourmet" },
  { value: "gym", label: "Ginásio" },
  { value: GARAGE, label: "Garagem" },
  { value: OTHER, label: "Outro" },
];

export const KITCHEN_LAYOUTS: Option[] = [
  { value: "open", label: "Aberta para a sala" },
  { value: "closed", label: "Fechada" },
  { value: "semi_open", label: "Semi-aberta" },
];

export const FLOOR_COUNTS: Option[] = [
  { value: "ground", label: "Rés-do-chão" },
  { value: "one_floor", label: "1 andar" },
  { value: OTHER, label: "Outro" },
];

export const SERVICE_SCOPES: Option[] = [
  { value: "architecture_only", label: "Apenas arquitectura" },
  { value: "architecture_engineering", label: "Arquitectura e engenharia" },
  { value: "full_project", label: "Projecto completo (arquitectura, especialidades e fiscalização)" },
  { value: "turnkey", label: "Projecto e construção (solução chave-na-mão)" },
  { value: "unsure", label: "Ainda não tenho a certeza" },
];

export const PROJECT_PRIORITIES: Option[] = [
  { value: "comfort", label: "Conforto e funcionalidade" },
  { value: "budget_control", label: "Controlo do orçamento" },
  { value: "energy", label: "Eficiência energética" },
  { value: "privacy_security", label: "Privacidade e segurança" },
  { value: "speed", label: "Rapidez de execução" },
  { value: "property_value", label: "Valorização do imóvel" },
  { value: "sustainability", label: "Sustentabilidade" },
  { value: "outdoor_integration", label: "Integração com o exterior" },
  { value: "future_flexibility", label: "Flexibilidade para o futuro" },
];

export const CONSTRUCTION_START: Option[] = [
  { value: "asap", label: "O mais breve possível" },
  { value: "1_3_months", label: "Dentro de 1 a 3 meses" },
  { value: "3_6_months", label: "Dentro de 3 a 6 meses" },
  { value: "6_12_months", label: "Dentro de 6 a 12 meses" },
  { value: "over_12_months", label: "Daqui a mais de 12 meses" },
  { value: "undefined", label: "Ainda não definido" },
];

export const ARCHITECTURAL_STYLES = [
  { value: "contemporary", label: "Contemporâneo", description: "Linhas actuais, volumes marcantes e grandes vãos envidraçados.", image: "/images/briefing_images/contemporary.jpg", position: "center 55%" },
  { value: "minimalist", label: "Minimalista", description: "Formas simples, poucos elementos e uma paleta depurada.", image: "/images/briefing_images/minimalist.jpg", position: "center" },
  { value: "rustic", label: "Rústico", description: "Materiais naturais, madeira, pedra e texturas acolhedoras.", image: "/images/briefing_images/rustic.jpg", position: "center" },
  { value: "tropical", label: "Tropical", description: "Espaços ventilados, sombra e integração com a vegetação.", image: "/images/briefing_images/tropical.jpg", position: "center" },
  { value: "industrial", label: "Industrial", description: "Betão, metal, estruturas aparentes e acabamentos robustos.", image: "/images/briefing_images/industrial.jpg", position: "center" },
  { value: "classic", label: "Clássico", description: "Simetria, proporções tradicionais e detalhes elegantes.", image: "/images/briefing_images/classic.png", position: "center" },
] as const;

/* Files */
export const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf",
];
export const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif|pdf)$/i;
export const ACCEPT = [...ALLOWED_TYPES, ".heic", ".heif"].join(",");
export const MAX_FILES = 5; // per uploader
export const MAX_FILE_MB = 8; // after compression
export const MAX_RAW_MB = 25; // before compression
export const MAX_TOTAL_MB = 40;
export const MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024;
export const MAX_RAW_SIZE = MAX_RAW_MB * 1024 * 1024;
export const MAX_TOTAL_SIZE = MAX_TOTAL_MB * 1024 * 1024;

/* Helpers */
export function labelOf(options: readonly { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function formatBudget(value: string) {
  if (!value) return "";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 0 }).format(amount);
}