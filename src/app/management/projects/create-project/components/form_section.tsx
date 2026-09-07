"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  CalendarDays,
  Users,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { SectionCard } from "../section_card"; // Assuming imported from your components
import { Field } from '../components/field'
import { Select, Input, Textarea, DateInput, CurrencyInputField } from "../components/form_components";
import { TeamMemberSelector } from "../components/team_member_selector";
import { ProjectFormState, PROJECT_TYPES, INPUT_STYLE } from "../types";
import { calculateDuration, getDescriptionRemaining } from "../utils";
import { getClients, type ClientWithProjectCount } from "@/services/clients";

interface FormSectionsProps {
  form: ProjectFormState;
  onChange: (changes: Partial<ProjectFormState>) => void;
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

/**
 * Project information section
 */
export function ProjectInfoSection({
  form,
  onChange,
  sectionRefs,
}: FormSectionsProps) {
  const [clients, setClients] = useState<ClientWithProjectCount[]>([]);

  useEffect(() => {
    let active = true;
    getClients().then((data) => {
      if (active) setClients(data);
    }).catch((error) => console.error("Failed to load clients:", error));
    return () => { active = false; };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({ [name]: value } as any);
  };

  return (
    <SectionCard
      id="info"
      refCb={(el) => (sectionRefs.current.info == el)}
      icon={Building2}
      title="Informação do projecto"
      description="O necessário — o que é este projecto e para quem é."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Cliente" for="client_id">
          <Select
            name="client_id"
            value={form.client_id || ""}
            onChange={handleInputChange}
          >
            <option value="">Sem cliente</option>
            {clients.map((client) => <option key={client.client_id} value={client.client_id}>{client.name}</option>)}
          </Select>
        </Field>

        <Field label="Tipo de projecto" for="type" required>
          <Select name="type" value={form.type || ""} onChange={handleInputChange}>
            <option value="">Seleccionar tipo...</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        <div className="md:col-span-2">
          <Field
            label="Descrição"
            for="description"
            trailing={
              <span
                className={`text-xs font-mono ${
                  form.description && form.description.length >= 450
                    ? "text-rose-500"
                    : "text-slate-400"
                }`}
              >
                {form.description?.length || 0}/500
              </span>
            }
          >
            <Textarea
              rows={4}
              name="description"
              value={form.description || ""}
              onChange={handleInputChange}
              maxLength={500}
              placeholder="Escopo, objectivos, e qualquer contexto que vale apontar..."
            />
          </Field>
        </div>
      </div>
    </SectionCard>
  );
}

/**
 * Location section
 */
export function LocationSection({
  form,
  onChange,
  sectionRefs,
}: FormSectionsProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({ [name]: value } as any);
  };

  return (
    <SectionCard
      id="location"
      refCb={(el) => (sectionRefs.current.location = el)}
      icon={MapPin}
      title="Localização"
      description="O lugar onde o trabalho será feito."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="País" for="country">
          <Input
            name="country"
            autoComplete="country-name"
            value={form.country || ""}
            onChange={handleInputChange}
            placeholder="Angola"
          />
        </Field>

        <Field label="Província" for="state_province" required>
          <Input
            name="state_province"
            value={form.state_province || ""}
            onChange={handleInputChange}
            placeholder="Ex: Luanda"
          />
        </Field>

        <Field label="Município" for="municipality" required>
          <Input
            name="municipality"
            value={form.municipality}
            onChange={handleInputChange}
            placeholder="Ex: Samba"
          />
        </Field>

        <Field label="Rua / Endereço" for="address_line_1" required>
          <Input
            name="address_line_1"
            value={form.address_line_1 || ""}
            onChange={handleInputChange}
            placeholder="Ex: Rua Principal, 123"
          />
        </Field>

        <Field label="Complemento de endereço" for="address_line_2">
          <Input
            name="address_line_2"
            value={form.address_line_2 || ""}
            onChange={handleInputChange}
            placeholder="Apt., andar, etc."
          />
        </Field>

        <Field label="Cidade" for="city">
          <Input
            name="city"
            value={form.city || ""}
            onChange={handleInputChange}
            placeholder="Cidade"
          />
        </Field>
      </div>
    </SectionCard>
  );
}

/**
 * Timeline section
 */
export function TimelineSection({
  form,
  onChange,
  sectionRefs,
}: FormSectionsProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value } as any);
  };

  const duration = calculateDuration(form.start_date!, form.end_date!);

  return (
    <SectionCard
      id="timeline"
      refCb={(el) => (sectionRefs.current.timeline = el)}
      icon={CalendarDays}
      title="Cronologia"
      description="Datas chaves para planejamento e relatório."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Data de inicio" for="start_date" required>
          <DateInput
            name="start_date"
            value={form.start_date || ""}
            onChange={handleDateChange}
          />
        </Field>

        <Field label="Data de término" for="end_date" required>
          <DateInput
            name="end_date"
            value={form.end_date || ""}
            onChange={handleDateChange}
          />
        </Field>
      </div>

      {/* Duration info */}
      {duration && duration.label && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
            duration.invalid
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-[#1B3A5C]/10 bg-[#1B3A5C]/5 text-[#1B3A5C]"
          }`}
        >
          {duration.invalid && (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          {duration.invalid ? (
            <span>A data de término deve ser depois da data de início.</span>
          ) : (
            <span>
              Duração do projecto:{" "}
              <span className="font-semibold">{duration.label}</span>
            </span>
          )}
        </div>
      )}
    </SectionCard>
  );
}

/**
 * Team section
 */
export function TeamSection({
  form,
  onChange,
  sectionRefs,
}: FormSectionsProps) {
  return (
    <SectionCard
      id="team"
      refCb={(el) => (sectionRefs.current.team = el)}
      icon={Users}
      title="Equipa para o projecto"
      description="Quem é o responsável para a entrega deste projecto."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Gestor do projecto" for="projectManagerId">
          <Input
            name="projectManagerId"
            placeholder="Seleccionar responsável"
          />
        </Field>

        <Field label="Membros da equipa" for="team_members">
          <TeamMemberSelector
            members={form.teamMembers || []}
            onChange={(members) => onChange({ teamMembers: members } as any)}
          />
        </Field>
      </div>
    </SectionCard>
  );
}

/**
 * Financial section
 */
export function FinancialSection({
  form,
  onChange,
  sectionRefs,
}: FormSectionsProps) {
  const handleBudgetChange = (value: string) => {
    const numeric = value === "" ? null : Number(value);
    onChange({ budget: numeric });
  };

  return (
    <SectionCard
      id="financial"
      refCb={(el) => (sectionRefs.current.financial = el)}
      icon={Wallet}
      title="Finanças"
      description="Orçamento e números do contrato."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Estimativa de orçamento" for="budget" required>
          <CurrencyInputField
            value={form.budget?.toString() || ""}
            onChange={handleBudgetChange}
          />
        </Field>
      </div>
    </SectionCard>
  );
}
