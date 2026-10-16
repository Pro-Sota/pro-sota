"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, Plus, Search, ShieldAlert, X } from "lucide-react";
import type { ProjectRisk, RiskCategory, RiskStrategy } from "@/services/project_risks";
import { createProjectRisk } from "@/actions/project _risks";

type PhaseOption = { phase_id: string; name: string };
type MemberOption = { profile_id: string; name: string };
type Props = { projectId: string; initialRisks: ProjectRisk[]; phases: PhaseOption[]; members: MemberOption[] };

const categoryLabels: Record<RiskCategory, string> = {
  schedule: "Prazo", cost: "Custos", quality: "Qualidade", safety: "Segurança",
  resources: "Recursos", technical: "Técnico", legal: "Legal", environmental: "Ambiental",
  operational: "Operacional", other: "Outro",
};
const severityLabels = { low: "Baixo", moderate: "Moderado", high: "Alto", critical: "Crítico" } as const;
const severityClasses = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  moderate: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  critical: "bg-red-50 text-red-700 ring-red-200",
};
const money = new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 2 });

export function RiskRegister({ projectId, initialRisks, phases, members }: Props) {
  const [risks, setRisks] = useState(initialRisks);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "schedule" as RiskCategory,
    probability: 3, impact: 3, estimatedExposure: "0", budgetImpact: "0",
    ownerId: "", phaseId: "", responseStrategy: "mitigate" as RiskStrategy,
    mitigationPlan: "", contingencyPlan: "", reviewDate: "", approvalJustification: "",
  });

  const visible = useMemo(() => risks.filter((risk) => {
    const matchesQuery = `${risk.risk_code} ${risk.title} ${risk.description} ${categoryLabels[risk.category]}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all"
      || (filter === "critical" && risk.severity === "critical")
      || (filter === "high" && risk.severity === "high")
      || (filter === "pending" && risk.approval_status === "pending")
      || (filter === "open" && risk.status !== "closed");
    return matchesQuery && matchesFilter;
  }), [risks, query, filter]);

  const active = risks.filter((risk) => risk.status !== "closed");
  const critical = active.filter((risk) => risk.severity === "critical").length;
  const pendingApproval = risks.filter((risk) => risk.approval_status === "pending").length;
  const exposure = active.reduce((sum, risk) => sum + Number(risk.estimated_exposure || 0), 0);
  const score = form.probability * form.impact;
  const severity = score >= 17 ? "critical" : score >= 10 ? "high" : score >= 5 ? "moderate" : "low";
  const needsApproval = score >= 10 || Number(form.estimatedExposure) >= 1000000 || Number(form.budgetImpact) >= 1000000 || form.responseStrategy === "accept";

  function submitRisk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice("");
    startTransition(async () => {
      const result = await createProjectRisk(projectId, {
        title: form.title, description: form.description, category: form.category,
        probability: form.probability, impact: form.impact,
        estimatedExposure: Number(form.estimatedExposure), budgetImpact: Number(form.budgetImpact),
        ownerId: form.ownerId || null, phaseId: form.phaseId || null,
        responseStrategy: form.responseStrategy, mitigationPlan: form.mitigationPlan,
        contingencyPlan: form.contingencyPlan, reviewDate: form.reviewDate || null,
        approvalJustification: form.approvalJustification,
      });
      if (!result.success) { setError(result.error); return; }
      setNotice("Risco registado com sucesso. Actualize a página para carregar o registo confirmado.");
      setFormOpen(false);
      // Server action revalidates the route. Refresh is intentionally avoided here;
      // router.refresh can be added if desired when connecting your app conventions.
    });
  }

  return (
    <main className="space-y-6 text-slate-800">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">Gestão do projecto</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#002950]">Registo de riscos</h1>
          <p className="mt-1 text-sm text-slate-500">Identifique, avalie e acompanhe os riscos do projecto.</p>
        </div>
        <button onClick={() => { setFormOpen(true); setError(""); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#003b70]">
          <Plus size={17} /> Novo risco
        </button>
      </header>

      {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
      {error && !formOpen && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Riscos activos" value={String(active.length)} icon={<ClipboardList size={18} />} />
        <Metric label="Riscos críticos" value={String(critical)} icon={<ShieldAlert size={18} />} accent={critical > 0} />
        <Metric label="Exposição estimada" value={`${money.format(exposure)} Kz`} icon={<AlertTriangle size={18} />} />
        <Metric label="Aguardam aprovação" value={String(pendingApproval)} icon={<CheckCircle2 size={18} />} accent={pendingApproval > 0} />
      </section>

      {formOpen && <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 className="font-semibold text-[#002950]">Novo risco</h2><p className="mt-1 text-xs text-slate-500">Os valores de gravidade são calculados automaticamente.</p></div>
          <button aria-label="Fechar formulário" onClick={() => setFormOpen(false)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={submitRisk} className="space-y-5 p-5">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Título" required><input required minLength={3} maxLength={180} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Ex.: Atraso na entrega de materiais" /></Field>
            <Field label="Categoria" required><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as RiskCategory })} className={inputClass}>{Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
            <Field label="Fase do projecto"><select value={form.phaseId} onChange={(e) => setForm({ ...form, phaseId: e.target.value })} className={inputClass}><option value="">Sem fase associada</option>{phases.map((phase) => <option key={phase.phase_id} value={phase.phase_id}>{phase.name}</option>)}</select></Field>
            <Field label="Responsável"><select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} className={inputClass}><option value="">Por atribuir</option>{members.map((member) => <option key={member.profile_id} value={member.profile_id}>{member.name}</option>)}</select></Field>
            <Field label="Probabilidade (1–5)" required><select value={form.probability} onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })} className={inputClass}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} — {probabilityLabel(n)}</option>)}</select></Field>
            <Field label="Impacto (1–5)" required><select value={form.impact} onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })} className={inputClass}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} — {impactLabel(n)}</option>)}</select></Field>
            <Field label="Exposição financeira estimada (Kz)" required><input type="number" min="0" step="0.01" required value={form.estimatedExposure} onChange={(e) => setForm({ ...form, estimatedExposure: e.target.value })} className={inputClass} /></Field>
            <Field label="Impacto no orçamento (Kz)" required><input type="number" min="0" step="0.01" required value={form.budgetImpact} onChange={(e) => setForm({ ...form, budgetImpact: e.target.value })} className={inputClass} /></Field>
            <Field label="Estratégia de resposta" required><select value={form.responseStrategy} onChange={(e) => setForm({ ...form, responseStrategy: e.target.value as RiskStrategy })} className={inputClass}><option value="avoid">Evitar</option><option value="mitigate">Mitigar</option><option value="transfer">Transferir</option><option value="accept">Aceitar</option></select></Field>
            <Field label="Data de revisão"><input type="date" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} className={inputClass} /></Field>
          </div>
          <Field label="Descrição do risco" required><textarea required minLength={3} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="Descreva a causa e as possíveis consequências." /></Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Plano de mitigação"><textarea rows={3} value={form.mitigationPlan} onChange={(e) => setForm({ ...form, mitigationPlan: e.target.value })} className={inputClass} placeholder="Acções para reduzir a probabilidade ou o impacto." /></Field>
            <Field label="Plano de contingência"><textarea rows={3} value={form.contingencyPlan} onChange={(e) => setForm({ ...form, contingencyPlan: e.target.value })} className={inputClass} placeholder="Acções a executar se o risco ocorrer." /></Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-[#F7F7F5] p-4">
            <div><p className="text-sm text-slate-500">Pontuação de risco</p><p className="text-xl font-semibold text-[#002950]">{score}/25 <span className="ml-2 text-sm font-medium">{severityLabels[severity]}</span></p></div>
            <p className="max-w-md text-sm text-slate-600">{needsApproval ? "Este risco exige pedido de aprovação segundo os critérios de gravidade ou exposição financeira." : "Este risco pode seguir o fluxo normal de acompanhamento."}</p>
          </div>
          {needsApproval && <Field label="Justificação para aprovação" required><textarea required minLength={3} rows={2} value={form.approvalJustification} onChange={(e) => setForm({ ...form, approvalJustification: e.target.value })} className={inputClass} placeholder="Justifique a resposta proposta ou a aceitação do risco." /></Field>}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">Cancelar</button><button disabled={pending} type="submit" className="rounded-lg bg-[#002950] px-4 py-2 text-sm font-medium text-white hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-60">{pending ? "A guardar…" : "Registar risco"}</button></div>
        </form>
      </section>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-semibold text-[#002950]">Riscos identificados</h2><p className="mt-1 text-sm text-slate-500">{visible.length} de {risks.length} registos</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar riscos…" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#BD9655] sm:w-64" /></label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar riscos" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#BD9655]"><option value="all">Todos os riscos</option><option value="open">Activos</option><option value="critical">Críticos</option><option value="high">Altos</option><option value="pending">Aguardam aprovação</option></select>
          </div>
        </div>
        {visible.length === 0 ? <div className="px-6 py-14 text-center"><ShieldAlert className="mx-auto text-slate-300" size={32} /><p className="mt-3 font-medium text-slate-700">Ainda não existem riscos neste filtro.</p><p className="mt-1 text-sm text-slate-500">Registe um risco ou ajuste os filtros de pesquisa.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-medium">Risco</th><th className="px-4 py-3 font-medium">Categoria</th><th className="px-4 py-3 font-medium">P × I</th><th className="px-4 py-3 font-medium">Gravidade</th><th className="px-4 py-3 text-right font-medium">Exposição (Kz)</th><th className="px-4 py-3 font-medium">Estado</th><th className="px-4 py-3 font-medium">Aprovação</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((risk) => <tr key={risk.risk_id} className="transition hover:bg-[#F7F7F5]"><td className="px-4 py-4"><p className="font-medium text-slate-800">{risk.title}</p><p className="mt-1 text-xs text-slate-500">{risk.risk_code}</p></td><td className="px-4 py-4 text-slate-600">{categoryLabels[risk.category]}</td><td className="px-4 py-4 tabular-nums text-slate-700">{risk.probability} × {risk.impact} <span className="text-slate-400">({risk.risk_score})</span></td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${severityClasses[risk.severity]}`}>{severityLabels[risk.severity]}</span></td><td className="px-4 py-4 text-right tabular-nums">{money.format(Number(risk.estimated_exposure))}</td><td className="px-4 py-4"><span className="text-slate-600">{statusLabel(risk.status)}</span></td><td className="px-4 py-4"><span className={`text-xs font-medium ${risk.approval_status === "pending" ? "text-amber-700" : risk.approval_status === "rejected" ? "text-red-700" : "text-slate-500"}`}>{approvalLabel(risk.approval_status)}</span></td></tr>)}</tbody></table></div>}
      </section>
    </main>
  );
}

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15";
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <label className="block space-y-1.5"><span className="block text-sm font-medium text-slate-700">{label}{required && <span className="ml-1 text-red-600">*</span>}</span>{children}</label>; }
function Metric({ label, value, icon, accent = false }: { label: string; value: string; icon: React.ReactNode; accent?: boolean }) { return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><span className={accent ? "text-red-600" : "text-[#BD9655]"}>{icon}</span></div><p className="mt-3 break-words text-xl font-semibold tracking-tight text-[#002950]">{value}</p></div>; }
function probabilityLabel(n: number) { return ["", "Muito baixa", "Baixa", "Média", "Alta", "Muito alta"][n]; }
function impactLabel(n: number) { return ["", "Insignificante", "Pequeno", "Moderado", "Significativo", "Severo"][n]; }
function statusLabel(status: ProjectRisk["status"]) { return ({ identified: "Identificado", assessing: "Em avaliação", awaiting_approval: "Aguarda aprovação", mitigating: "Em mitigação", occurred: "Ocorreu", closed: "Encerrado" })[status]; }
function approvalLabel(status: ProjectRisk["approval_status"]) { return ({ not_required: "Não necessária", pending: "Pendente", approved: "Aprovada", rejected: "Rejeitada" })[status]; }
