export const kpis = [
  { title: "Progresso", value: "30" },
  { title: "Dias restantes", value: "30" },
  { title: "Orçamento usado", value: "$120k" },
  { title: "Questões abertas", value: "10" },
  { title: "Tarefas concluídas", value: "100 / 200" },
  { title: "Aprovações pendentes", value: "7" },
];

export type Status =
  | "Concluído"
  | "Respondido"
  | "Aberto"
  | "Atrasado"
  | "Pendente"
  | "Para revisão";