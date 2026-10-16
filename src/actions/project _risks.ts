"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { RISK_CATEGORIES, type RiskCategory, type RiskStrategy } from "@/services/project_risks";

export type RiskActionResult = { success: true } | { success: false; error: string };

/**
 * IMPORTANT: Replace this adapter with the canonical project authorization
 * helper used by existing Pro-Sota project pages. Membership alone is not
 * sufficient for every mutation. Must throw when access is denied.
 */
async function assertProjectRiskAccess(
  _projectId: string,
  _mode: "read" | "manage" | "approve",
  _riskScore?: number,
): Promise<{ userId: string; isDirector: boolean }> {
  throw new Error("Ligue assertProjectRiskAccess ao serviço de permissões existente da Pro-Sota antes de activar as mutações.");
}

export async function createProjectRisk(
  projectId: string,
  input: {
    title: string; description: string; category: RiskCategory;
    probability: number; impact: number; estimatedExposure: number;
    budgetImpact: number; ownerId: string | null; phaseId: string | null;
    responseStrategy: RiskStrategy; mitigationPlan: string; contingencyPlan: string;
    reviewDate: string | null; approvalJustification: string;
  },
): Promise<RiskActionResult> {
  try {
    const title = input.title.trim();
    const description = input.description.trim();
    if (!projectId || title.length < 3 || title.length > 180) throw new Error("Indique um título entre 3 e 180 caracteres.");
    if (description.length < 3) throw new Error("A descrição é obrigatória.");
    if (!RISK_CATEGORIES.includes(input.category)) throw new Error("Categoria inválida.");
    if (!Number.isInteger(input.probability) || input.probability < 1 || input.probability > 5) throw new Error("Probabilidade inválida.");
    if (!Number.isInteger(input.impact) || input.impact < 1 || input.impact > 5) throw new Error("Impacto inválido.");
    if (!Number.isFinite(input.estimatedExposure) || input.estimatedExposure < 0 || !Number.isFinite(input.budgetImpact) || input.budgetImpact < 0) throw new Error("Os valores financeiros não podem ser negativos.");

    const score = input.probability * input.impact;
    const access = await assertProjectRiskAccess(projectId, "manage", score);
    const approvalRequired = score >= 10 || input.estimatedExposure >= 1000000 || input.budgetImpact >= 1000000 || input.responseStrategy === "accept";
    const approvalStatus = approvalRequired ? "pending" : "not_required";
    const supabase = await createClient(await cookies());

    // Generate a readable project-local code; unique constraint is the final guard.
    const { count, error: countError } = await supabase.from("project_risks").select("risk_id", { count: "exact", head: true }).eq("project_id", projectId);
    if (countError) throw new Error(countError.message);
    const riskCode = `RSK-${String((count ?? 0) + 1).padStart(4, "0")}`;
    const { data: risk, error } = await supabase.from("project_risks").insert({
      project_id: projectId,
      risk_code: riskCode,
      title,
      description,
      category: input.category,
      probability: input.probability,
      impact: input.impact,
      estimated_exposure: input.estimatedExposure,
      budget_impact: input.budgetImpact,
      owner_id: input.ownerId,
      phase_id: input.phaseId,
      response_strategy: input.responseStrategy,
      mitigation_plan: input.mitigationPlan.trim() || null,
      contingency_plan: input.contingencyPlan.trim() || null,
      review_date: input.reviewDate || null,
      status: approvalRequired ? "awaiting_approval" : "identified",
      approval_required: approvalRequired,
      approval_status: approvalStatus,
      approval_justification: approvalRequired ? input.approvalJustification.trim() : null,
      created_by: access.userId,
    }).select("risk_id").single();
    if (error) throw new Error(error.message);

    if (approvalRequired) {
      const { error: approvalError } = await supabase.from("project_risk_approvals").insert({
        risk_id: risk.risk_id,
        requested_by: access.userId,
        decision: "pending",
        justification: input.approvalJustification.trim() || "Aprovação necessária segundo a política de risco.",
      });
      if (approvalError) throw new Error(approvalError.message);
    }

    const { error: auditError } = await supabase.from("project_risk_audit").insert({
      risk_id: risk.risk_id,
      actor_id: access.userId,
      action: "risk_created",
      changes: { risk_code: riskCode, score, approval_required: approvalRequired },
    });
    if (auditError) throw new Error(auditError.message);

    revalidatePath(`/management/projects/${projectId}/risks`);
    revalidatePath(`/management/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Ocorreu um erro inesperado." };
  }
}

export async function closeProjectRisk(projectId: string, riskId: string, justification: string): Promise<RiskActionResult> {
  try {
    if (justification.trim().length < 3) throw new Error("Indique o motivo do encerramento.");
    const access = await assertProjectRiskAccess(projectId, "manage");
    const supabase = await createClient(await cookies());
    const { data: risk, error: readError } = await supabase.from("project_risks").select("risk_id, project_id, status").eq("risk_id", riskId).eq("project_id", projectId).single();
    if (readError || !risk) throw new Error("Risco não encontrado ou sem acesso.");
    const { error } = await supabase.from("project_risks").update({ status: "closed", closed_at: new Date().toISOString() }).eq("risk_id", riskId).eq("project_id", projectId);
    if (error) throw new Error(error.message);
    const { error: auditError } = await supabase.from("project_risk_audit").insert({ risk_id: riskId, actor_id: access.userId, action: "risk_closed", changes: { justification: justification.trim() } });
    if (auditError) throw new Error(auditError.message);
    revalidatePath(`/management/projects/${projectId}/risks`);
    revalidatePath(`/management/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Ocorreu um erro inesperado." };
  }
}
