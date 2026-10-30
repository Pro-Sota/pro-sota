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
    time?: string;
    type: EventType;
    project?: string;
    projectId?: string;
    location?: string;
    description?: string;
    source: EventType;
    sourceId?: string;

    // Lead association
    lead_id?: string | null;

    // Event permissions and participants
    created_by?: string | null;
    participant_ids?: string[];
};

import type {
  CalendarParticipant,
  CalendarClientOption,
  CalendarSupplierOption,
} from "@/app/management/calendar/components/create_meeting_modal";

import { requireUser } from "@/app/lib/supabase/auth";

export type CalendarPageInitProps = {
  events: CalendarEvent[];
  participants: CalendarParticipant[];
  clients: CalendarClientOption[];
  suppliers: CalendarSupplierOption[];
  userInfo: Awaited<ReturnType<typeof requireUser>>;
};