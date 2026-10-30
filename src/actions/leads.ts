"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import type {
    ActionResult,
    CreateLeadInput,
    CreateLeadNoteInput,
    CreateLeadReminderInput,
    Lead,
    LeadActivity,
    LeadNote,
    LeadReminder,
    LeadReminderStatus,
    LeadStatus,
    UpdateLeadInput,
    UpdateLeadNoteInput,
    UpdateLeadReminderInput,
} from "@/app/management/leads/types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const LEAD_SELECT = `
    lead_id,
    name,
    company,
    email,
    phone,
    project_name,
    project_type,
    budget,
    location,
    status,
    created_by,
    created_at,
    updated_at,
    source,
    description,
    urgency,
    notes
`;

const NOTE_SELECT = `
    note_id,
    lead_id,
    content,
    created_by,
    updated_by,
    created_at,
    updated_at
`;

const REMINDER_SELECT = `
    reminder_id,
    lead_id,
    event_id,
    title,
    description,
    due_at,
    status,
    created_by,
    assigned_to,
    completed_at,
    created_at,
    updated_at
`;

const VALID_STATUSES: LeadStatus[] = [
    "new",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "won",
    "lost",
];

const VALID_REMINDER_STATUSES: LeadReminderStatus[] = [
    "pending",
    "completed",
    "cancelled",
];

/* -------------------------------------------------------------------------- */
/* Server utilities                                                           */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
    return createClient(await cookies());
}

async function verifyLeadAccess() {
    const supabase = await getSupabase();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Utilizador não autenticado.");
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("profile_id, role_id, department")
        .eq("profile_id", user.id)
        .single();

    if (error || !profile) {
        throw new Error("Perfil do utilizador não encontrado.");
    }

    const isAdmin = profile.role_id === 1;

    const department = String(profile.department ?? "")
        .trim()
        .toLowerCase();

    const isCommercial =
        department === "comercial" ||
        department === "commercial";

    if (!isAdmin && !isCommercial) {
        throw new Error(
            "Não tem permissão para aceder aos leads."
        );
    }

    return {
        supabase,
        userId: user.id,
    };
}

function normalizeText(value?: string | null) {
    return value?.trim() || null;
}

function validateBudget(value?: number | null) {
    if (
        value !== null &&
        value !== undefined &&
        (!Number.isFinite(value) || value < 0)
    ) {
        throw new Error("O orçamento introduzido não é válido.");
    }
}

function validateDate(value: string) {
    const timestamp = new Date(value).getTime();

    if (!Number.isFinite(timestamp)) {
        throw new Error("A data do lembrete não é válida.");
    }

    return new Date(timestamp).toISOString();
}

function revalidateLeadPages() {
    revalidatePath("/management/leads");
    revalidatePath("/management/calendar");
    revalidatePath("/management");
}

async function execute<T>(
    operation: () => Promise<T>,
    shouldRevalidate = false,
): Promise<ActionResult<T>> {
    try {
        const data = await operation();

        if (shouldRevalidate) {
            revalidateLeadPages();
        }

        return {
            success: true,
            error: null,
            data,
        };
    } catch (error: unknown) {
        console.error("Lead action failed:", error);

        let errorMessage = "Não foi possível concluir a operação.";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (
            typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string"
        ) {
            errorMessage = error.message;
        } else if (typeof error === "string") {
            errorMessage = error;
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/* -------------------------------------------------------------------------- */
/* Leads                                                                      */
/* -------------------------------------------------------------------------- */

export async function createLeadAction(
    input: CreateLeadInput
): Promise<ActionResult<Lead>> {
    return execute(async () => {
        const { supabase, userId } = await verifyLeadAccess();

        const name = input.name?.trim();
        const projectName = input.project_name?.trim();
        const projectType = input.project_type?.trim();

        if (!name) {
            throw new Error("O nome do contacto é obrigatório.");
        }

        if (!projectName) {
            throw new Error("O nome do projecto é obrigatório.");
        }

        if (!projectType) {
            throw new Error("O tipo de projecto é obrigatório.");
        }

        validateBudget(input.budget);

        const { data, error } = await supabase
            .from("leads")
            .insert({
                name,
                company: normalizeText(input.company),
                email: normalizeText(input.email),
                phone: normalizeText(input.phone),
                project_name: projectName,
                project_type: projectType,
                budget: input.budget ?? null,
                location: normalizeText(input.location),
                description: normalizeText(input.description),
                urgency: normalizeText(input.urgency),
                status: "new",
                created_by: userId,
            })
            .select(LEAD_SELECT)
            .single();

        if (error) throw error;

        return data as Lead;
    }, true);
}

export async function updateLeadAction(
    leadId: string,
    input: UpdateLeadInput
): Promise<ActionResult<Lead>> {
    return execute(async () => {
        const { supabase } = await verifyLeadAccess();

        if (!leadId?.trim()) {
            throw new Error("Lead inválido.");
        }

        const updateData: Record<string, unknown> = {};

        if (input.name !== undefined) {
            const value = input.name.trim();
            if (!value) throw new Error("O nome do contacto é obrigatório.");
            updateData.name = value;
        }

        if (input.company !== undefined) {
            updateData.company = normalizeText(input.company);
        }

        if (input.email !== undefined) {
            updateData.email = normalizeText(input.email);
        }

        if (input.phone !== undefined) {
            updateData.phone = normalizeText(input.phone);
        }

        if (input.project_name !== undefined) {
            const value = input.project_name.trim();
            if (!value) throw new Error("O nome do projecto é obrigatório.");
            updateData.project_name = value;
        }

        if (input.project_type !== undefined) {
            const value = input.project_type.trim();
            if (!value) throw new Error("O tipo de projecto é obrigatório.");
            updateData.project_type = value;
        }

        if (input.budget !== undefined) {
            validateBudget(input.budget);
            updateData.budget = input.budget;
        }

        if (input.location !== undefined) {
            updateData.location = normalizeText(input.location);
        }

        if (input.description !== undefined) {
            updateData.description = normalizeText(input.description);
        }

        if (input.urgency !== undefined) {
            updateData.urgency = normalizeText(input.urgency);
        }

        if (input.status !== undefined) {
            if (!VALID_STATUSES.includes(input.status)) {
                throw new Error("Estado do lead inválido.");
            }

            updateData.status = input.status;
        }

        if (Object.keys(updateData).length === 0) {
            throw new Error("Nenhuma alteração foi fornecida.");
        }

        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from("leads")
            .update(updateData)
            .eq("lead_id", leadId)
            .select(LEAD_SELECT)
            .single();

        if (error) throw error;

        return data as Lead;
    }, true);
}

export async function updateLeadStatusAction(
    leadId: string,
    status: LeadStatus
): Promise<ActionResult<Lead>> {
    return execute(async () => {
        const { supabase, userId } = await verifyLeadAccess();

        if (!leadId?.trim()) {
            throw new Error("Lead inválido.");
        }

        if (!VALID_STATUSES.includes(status)) {
            throw new Error("Estado do lead inválido.");
        }

        const { data: existing, error: readError } = await supabase
            .from("leads")
            .select("status")
            .eq("lead_id", leadId)
            .single();

        if (readError || !existing) {
            throw new Error("Não foi possível localizar o lead.");
        }

        const previousStatus = existing.status as LeadStatus;

        if (previousStatus === status) {
            const { data, error } = await supabase
                .from("leads")
                .select(LEAD_SELECT)
                .eq("lead_id", leadId)
                .single();

            if (error) throw error;
            return data as Lead;
        }

        const { data, error } = await supabase
            .from("leads")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("lead_id", leadId)
            .select(LEAD_SELECT)
            .single();

        if (error) throw error;

        const { error: historyError } = await supabase
            .from("lead_stage_history")
            .insert({
                lead_id: leadId,
                previous_status: previousStatus,
                new_status: status,
                changed_by: userId,
            });

        if (historyError) {
            console.error(
                "Lead status changed, but history could not be saved:",
                historyError
            );
        }

        return data as Lead;
    }, true);
}

export async function deleteLeadAction(
    leadId: string
): Promise<ActionResult> {
    return execute(async () => {
        const { supabase } = await verifyLeadAccess();

        if (!leadId?.trim()) {
            throw new Error("Lead inválido.");
        }

        const { error } = await supabase
            .from("leads")
            .delete()
            .eq("lead_id", leadId);

        if (error) throw error;
        return undefined;
    }, true);
}

/* -------------------------------------------------------------------------- */
/* Lead notes                                                                 */
/* -------------------------------------------------------------------------- */

export async function getLeadNotesAction(
    leadId: string
): Promise<ActionResult<LeadNote[]>> {
    return execute(async () => {
        const { supabase } = await verifyLeadAccess();

        if (!leadId?.trim()) {
            throw new Error("Lead inválido.");
        }

        const { data, error } = await supabase
            .from("lead_notes")
            .select(NOTE_SELECT)
            .eq("lead_id", leadId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data ?? []) as LeadNote[];
    });
}

export async function createLeadNoteAction(
    input: CreateLeadNoteInput
): Promise<ActionResult<LeadNote>> {
    return execute(async () => {
        const { supabase, userId } = await verifyLeadAccess();

        if (!input.lead_id?.trim()) {
            throw new Error("Lead inválido.");
        }

        const content = input.content?.trim();

        if (!content) {
            throw new Error("Escreva uma nota antes de guardar.");
        }

        const { data, error } = await supabase
            .from("lead_notes")
            .insert({
                lead_id: input.lead_id,
                content,
                created_by: userId,
                updated_by: userId,
            })
            .select(NOTE_SELECT)
            .single();

        if (error) throw error;

        return data as LeadNote;
    }, true);
}

export async function updateLeadNoteAction(
    input: UpdateLeadNoteInput
): Promise<ActionResult<LeadNote>> {
    return execute(async () => {
        const { supabase, userId } = await verifyLeadAccess();

        const content = input.content?.trim();

        if (!input.note_id?.trim() || !content) {
            throw new Error("Os dados da nota são inválidos.");
        }

        const { data, error } = await supabase
            .from("lead_notes")
            .update({
                content,
                updated_by: userId,
                updated_at: new Date().toISOString(),
            })
            .eq("note_id", input.note_id)
            .select(NOTE_SELECT)
            .single();

        if (error) throw error;

        return data as LeadNote;
    }, true);
}

export async function deleteLeadNoteAction(
    noteId: string
): Promise<ActionResult> {
    return execute(async () => {
        const { supabase } = await verifyLeadAccess();

        if (!noteId?.trim()) {
            throw new Error("Nota inválida.");
        }

        const { error } = await supabase
            .from("lead_notes")
            .delete()
            .eq("note_id", noteId);

        if (error) throw error;
        return undefined;
    }, true);
}

/* -------------------------------------------------------------------------- */
/* Lead reminders                                                             */
/* -------------------------------------------------------------------------- */

export async function getLeadRemindersAction(
    leadId: string
): Promise<ActionResult<LeadReminder[]>> {
    return execute(async () => {
        const { supabase } = await verifyLeadAccess();

        if (!leadId?.trim()) {
            throw new Error("Lead inválido.");
        }

        const { data, error } = await supabase
            .from("lead_reminders")
            .select(REMINDER_SELECT)
            .eq("lead_id", leadId)
            .order("due_at", { ascending: true });

        if (error) throw error;

        return (data ?? []) as LeadReminder[];
    });
}

export async function createLeadReminderAction(
    input: CreateLeadReminderInput
): Promise<ActionResult<LeadReminder>> {
    return execute(async () => {
        const { supabase, userId } = await verifyLeadAccess();

        if (!input.lead_id?.trim()) {
            throw new Error("Lead inválido.");
        }

        const title = input.title?.trim();

        if (!title) {
            throw new Error("O título do lembrete é obrigatório.");
        }

        const dueAt = validateDate(input.due_at);

        const { data: event, error: eventError } = await supabase
            .from("calendar_events")
            .insert({
                title,
                description: normalizeText(input.description),
                event_type: "deadline",
                start_at: dueAt,
                end_at: null,
                all_day: false,
                lead_id: input.lead_id,
                created_by: userId,
            })
            .select("event_id")
            .single();

        if (eventError || !event) {
            console.error("Failed to create Calendar event:", eventError);
            throw new Error("Não foi possível criar o evento no Calendário.");
        }

        const { data, error } = await supabase
            .from("lead_reminders")
            .insert({
                lead_id: input.lead_id,
                event_id: event.event_id,
                title,
                description: normalizeText(input.description),
                due_at: dueAt,
                status: "pending",
                created_by: userId,
                assigned_to: input.assigned_to ?? null,
            })
            .select(REMINDER_SELECT)
            .single();

        if (error || !data) {
            console.error("Failed to create lead reminder:", error);

            await supabase
                .from("calendar_events")
                .delete()
                .eq("event_id", event.event_id);

            throw new Error("Não foi possível guardar o lembrete.");
        }

        return data as LeadReminder;
    }, true);
}

export async function updateLeadReminderAction(
    input: UpdateLeadReminderInput
): Promise<ActionResult<LeadReminder>> {
    return execute(async () => {
        const { supabase } = await verifyLeadAccess();

        if (!input.reminder_id?.trim()) {
            throw new Error("Lembrete inválido.");
        }

        const updateData: Record<string, unknown> = {};

        if (input.title !== undefined) {
            const title = input.title.trim();

            if (!title) {
                throw new Error("O título do lembrete é obrigatório.");
            }

            updateData.title = title;
        }

        if (input.description !== undefined) {
            updateData.description = normalizeText(input.description);
        }

        if (input.due_at !== undefined) {
            updateData.due_at = validateDate(input.due_at);
        }

        if (input.assigned_to !== undefined) {
            updateData.assigned_to = input.assigned_to || null;
        }

        if (input.status !== undefined) {
            if (!VALID_REMINDER_STATUSES.includes(input.status)) {
                throw new Error("Estado do lembrete inválido.");
            }

            updateData.status = input.status;
            updateData.completed_at =
                input.status === "completed"
                    ? new Date().toISOString()
                    : null;
        }

        if (Object.keys(updateData).length === 0) {
            throw new Error("Nenhuma alteração foi fornecida.");
        }

        updateData.updated_at = new Date().toISOString();

        const { data: reminder, error: readError } = await supabase
            .from("lead_reminders")
            .select("event_id")
            .eq("reminder_id", input.reminder_id)
            .single();

        if (readError || !reminder) {
            throw new Error("Não foi possível localizar o lembrete.");
        }

        const eventUpdate: Record<string, unknown> = {};

        if (updateData.title !== undefined) {
            eventUpdate.title = updateData.title;
        }

        if (updateData.description !== undefined) {
            eventUpdate.description = updateData.description;
        }

        if (updateData.due_at !== undefined) {
            eventUpdate.start_at = updateData.due_at;
        }

        if (Object.keys(eventUpdate).length > 0) {
            eventUpdate.updated_at = new Date().toISOString();

            const { error: eventError } = await supabase
                .from("calendar_events")
                .update(eventUpdate)
                .eq("event_id", reminder.event_id);

            if (eventError) {
                throw new Error(
                    "Não foi possível actualizar o evento no Calendário."
                );
            }
        }

        const { data, error } = await supabase
            .from("lead_reminders")
            .update(updateData)
            .eq("reminder_id", input.reminder_id)
            .select(REMINDER_SELECT)
            .single();

        if (error) throw error;

        return data as LeadReminder;
    }, true);
}

export async function updateLeadReminderStatusAction(
    reminderId: string,
    status: LeadReminderStatus
): Promise<ActionResult<LeadReminder>> {
    if (!VALID_REMINDER_STATUSES.includes(status)) {
        return {
            success: false,
            error: "Estado do lembrete inválido.",
        };
    }

    return updateLeadReminderAction({
        reminder_id: reminderId,
        status,
    });
}

export async function deleteLeadReminderAction(
    reminderId: string
): Promise<ActionResult> {
    return execute(async () => {
        const { supabase } = await verifyLeadAccess();

        if (!reminderId?.trim()) {
            throw new Error("Lembrete inválido.");
        }

        const { data: reminder, error: readError } = await supabase
            .from("lead_reminders")
            .select("event_id")
            .eq("reminder_id", reminderId)
            .single();

        if (readError || !reminder) {
            throw new Error("Não foi possível localizar o lembrete.");
        }

        const { error } = await supabase
            .from("lead_reminders")
            .delete()
            .eq("reminder_id", reminderId);

        if (error) throw error;

        const { error: eventError } = await supabase
            .from("calendar_events")
            .delete()
            .eq("event_id", reminder.event_id);

        if (eventError) {
            console.error(
                "Reminder deleted, but Calendar event cleanup failed:",
                eventError
            );
        }
        return undefined;
    }, true);
}

/* -------------------------------------------------------------------------- */
/* Lead activity                                                              */
/* -------------------------------------------------------------------------- */

export async function getLeadActivityAction(
    leadId: string
): Promise<ActionResult<LeadActivity>> {
    return execute(async () => {
        const { supabase } = await verifyLeadAccess();

        if (!leadId?.trim()) {
            throw new Error("Lead inválido.");
        }

        const [
            { data: notes, error: notesError },
            { data: reminders, error: remindersError },
        ] = await Promise.all([
            supabase
                .from("lead_notes")
                .select(NOTE_SELECT)
                .eq("lead_id", leadId)
                .order("created_at", { ascending: false }),

            supabase
                .from("lead_reminders")
                .select(REMINDER_SELECT)
                .eq("lead_id", leadId)
                .order("due_at", { ascending: true }),
        ]);

        if (notesError) throw notesError;
        if (remindersError) throw remindersError;

        return {
            notes: (notes ?? []) as LeadNote[],
            reminders: (reminders ?? []) as LeadReminder[],
        };
    });
}