export type LeadStatus =
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost";

export type LeadReminderStatus = "pending" | "completed" | "cancelled";

export type Lead = {
    lead_id: string;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    project_name: string;
    project_type: string;
    budget: number | null;
    location: string | null;
    status: LeadStatus;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    source?: string | null;
    description?: string | null;
    urgency?: string | null;
    notes?: string | null;
};

export type LeadNote = {
    note_id: string;
    lead_id: string;
    content: string;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
    author?: {
        profile_id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
    } | null;
};

export type LeadReminder = {
    reminder_id: string;
    lead_id: string;
    event_id: string;
    title: string;
    description: string | null;
    due_at: string;
    status: LeadReminderStatus;
    created_by: string | null;
    assigned_to: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
};

export type LeadActivity = {
    notes: LeadNote[];
    reminders: LeadReminder[];
};

export type CreateLeadInput = {
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    project_name: string;
    project_type: string;
    budget?: number | null;
    location?: string | null;
    description?: string | null;
    urgency?: string | null;
};

export type UpdateLeadInput = Partial<CreateLeadInput> & {
    status?: LeadStatus;
};

export type CreateLeadNoteInput = { lead_id: string; content: string };
export type UpdateLeadNoteInput = { note_id: string; content: string };

export type CreateLeadReminderInput = {
    lead_id: string;
    title: string;
    description?: string | null;
    due_at: string;
    assigned_to?: string | null;
};

export type UpdateLeadReminderInput = {
    reminder_id: string;
    title?: string;
    description?: string | null;
    due_at?: string;
    assigned_to?: string | null;
    status?: LeadReminderStatus;
};

export type ActionResult<T = undefined> = {
    success: boolean;
    error: string | null;
    data?: T;
};


