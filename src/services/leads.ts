import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import { Lead, LeadNote, LeadReminder } from "@/app/management/leads/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */



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

/* -------------------------------------------------------------------------- */
/* Supabase                                                                   */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
    return createClient(await cookies());
}

/* -------------------------------------------------------------------------- */
/* Lead queries                                                               */
/* -------------------------------------------------------------------------- */

export async function getLeads(): Promise<Lead[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("leads")
        .select(LEAD_SELECT)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch leads:", error);
        throw new Error("Não foi possível carregar os leads.");
    }

    return (data ?? []) as Lead[];
}

export async function getLeadById(
    leadId: string,
): Promise<Lead | null> {
    if (!leadId?.trim()) {
        return null;
    }

    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("leads")
        .select(LEAD_SELECT)
        .eq("lead_id", leadId)
        .maybeSingle();

    if (error) {
        console.error("Failed to fetch lead:", error);
        throw new Error("Não foi possível carregar o lead.");
    }

    return data as Lead | null;
}

/* -------------------------------------------------------------------------- */
/* Lead note queries                                                          */
/* -------------------------------------------------------------------------- */

export async function getLeadNotes(
    leadId: string,
): Promise<LeadNote[]> {
    if (!leadId?.trim()) {
        return [];
    }

    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("lead_notes")
        .select(NOTE_SELECT)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch lead notes:", error);
        throw new Error("Não foi possível carregar as notas do lead.");
    }

    return (data ?? []) as LeadNote[];
}

/* -------------------------------------------------------------------------- */
/* Lead reminder queries                                                      */
/* -------------------------------------------------------------------------- */

export async function getLeadReminders(
    leadId: string,
): Promise<LeadReminder[]> {
    if (!leadId?.trim()) {
        return [];
    }

    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("lead_reminders")
        .select(REMINDER_SELECT)
        .eq("lead_id", leadId)
        .order("due_at", { ascending: true });

    if (error) {
        console.error("Failed to fetch lead reminders:", error);
        throw new Error("Não foi possível carregar os lembretes.");
    }

    return (data ?? []) as LeadReminder[];
}
