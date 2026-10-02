export type EventType =
    | "meeting"
    | "site_visit"
    | "task"
    | "deadline"
    | "submission"
    | "project";

export type CalendarEvent = {
    id: string;
    title: string;
    date: string;
    time?: string;
    type: EventType;
    project?: string;
    projectId?: string;
    location?: string;
    description?: string;
    source: EventType;
    sourceId?: string;
};

export type CalendarPageInitProps = {
    events: CalendarEvent[];
};