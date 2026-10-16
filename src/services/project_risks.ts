import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

export const RISK_CATEGORIES = [
  "schedule", "cost", "quality", "safety", "resources",
  "technical", "legal", "environmental", "operational", "other",
] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];
export type RiskStrategy = "avoid" | "mitigate" | "transfer" | "accept";
export type RiskStatus = "identified" | "assessing" | "awaiting_approval" | "mitigating" | "occurred" | "closed";
export type RiskSeverity = "low" | "moderate" | "high" | "critical";

export type ProjectRisk = {
  risk_id: string;
  project_id: string;
  phase_id: string | null;
  risk_code: string;
  title: string;
  description: string;
  category: RiskCategory;
  response_strategy: RiskStrategy;
  probability: number;
  impact: number;
  risk_score: number;
  severity: RiskSeverity;
  estimated_exposure: number;
  budget_impact: number;
  mitigation_plan: string | null;
  contingency_plan: string | null;
  owner_id: string | null;
  status: RiskStatus;
  approval_status: "not_required" | "pending" | "approved" | "rejected";
  review_date: string | null;
  created_at: string;
  updated_at: string;
};

export function assessSeverity(probability: number, impact: number): RiskSeverity {
  const score = probability * impact;
  if (score >= 17) return "critical";
  if (score >= 10) return "high";
  if (score >= 5) return "moderate";
  return "low";
}

export async function getProjectRisks(projectId: string): Promise<ProjectRisk[]> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from("project_risks")
    .select("risk_id, project_id, phase_id, risk_code, title, description, category, response_strategy, probability, impact, risk_score, severity, estimated_exposure, budget_impact, mitigation_plan, contingency_plan, owner_id, status, approval_status, review_date, created_at, updated_at")
    .eq("project_id", projectId)
    .order("risk_score", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Não foi possível carregar os riscos: ${error.message}`);
  return (data ?? []) as ProjectRisk[];
}

export async function getRiskFormOptions(projectId: string) {
  const supabase = await createClient(await cookies());
  const [{ data: phases, error: phaseError }, { data: members, error: memberError }] = await Promise.all([
    supabase.from("project_phases").select("phase_id, name").eq("project_id", projectId).order("name"),
    supabase.from("project_members").select("profile_id, profiles(profile_id, first_name, last_name)").eq("project_id", projectId),
  ]);
  if (phaseError) throw new Error(`Não foi possível carregar as fases: ${phaseError.message}`);
  if (memberError) throw new Error(`Não foi possível carregar a equipa: ${memberError.message}`);
  return {
    phases: phases ?? [],
    members: (members ?? []).map((row: any) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        profile_id: row.profile_id as string,
        name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Utilizador",
      };
    }),
  };
}
