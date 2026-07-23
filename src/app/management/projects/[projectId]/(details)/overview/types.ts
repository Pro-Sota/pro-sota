import {CalendarDays, Wallet, CircleAlert, ListChecks, Clock3Icon, GaugeCircle, TrendingUp } from "lucide-react";

export const kpis = [
  { icon: TrendingUp, title: "Progresso", value: "30%" },
  { icon: CalendarDays, title: "Dias restantes", value: "30" },
  { icon: Wallet, title: "Orçamento usado", value: "$120k" },
  { icon: CircleAlert, title: "Questões abertas", value: "10" },
  { icon: ListChecks, title: "Tarefas concluídas", value: "100 / 200" },
  { icon: Clock3Icon, title: "Aprovações pendentes", value: "7" },
];

export type Status =
  | "Concluído"
  | "Respondido"
  | "Aberto"
  | "Atrasado"
  | "Pendente"
  | "Para revisão";