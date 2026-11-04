export type EventType =
  | "meeting"
  | "site_visit"
  | "task"
  | "deadline"
  | "submission"
  | "project";

export type CalendarEvent = {
    id: string;
    event_id?: string;
    title: string;

    date: string;
    startDate?: string;
    endDate?: string;

    time?: string;
    type: EventType;

    project?: string;
    projectId?: string;

    task?: string;
    taskId?: string;

    submission?: string;
    submissionId?: string;

    client?: string;
    clientId?: string;

    location?: string;
    description?: string;

    source: EventType;
    sourceId?: string;

    isGeneratedDeadline?: boolean;

    start_at?: string;
    end_at?: string;
    all_day?: boolean;

    lead_id?: string | null;
    created_by?: string | null;

    participant_ids?: string[];
    client_ids?: string[];
    supplier_ids?: string[];
};