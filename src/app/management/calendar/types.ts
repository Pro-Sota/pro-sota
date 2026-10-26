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
import type {
  CalendarParticipant,
  CalendarClientOption,
  CalendarSupplierOption,
} from "@/app/components/create_meeting_modal";

export type CalendarPageInitProps = {
  events: CalendarEvent[];
  participants: CalendarParticipant[];
  clients: CalendarClientOption[];
  suppliers: CalendarSupplierOption[];
};