export type EventType =
    | "project"
    | "task"
    | "meeting"
    | "site_visit"
    | "deadline";

export type CalendarEvent = {
    id: string;
    title: string;
    date: string;
    time: string;
    type: EventType;
    project?: string | null;
    location?: string | null;
    people?: string | null;
};

export type CalendarPageInitProps = {
    events: CalendarEvent[];
    todayKey: string;
};