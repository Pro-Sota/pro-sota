
import { getCalendarContacts } from "@/services/calendar_contacts";
import {
    getCalendarEvents,
    getCalendarRangeEvents,
} from "@/services/calendar";
import { requireUser } from "@/app/lib/supabase/auth";

import CalendarPageInit from "./calendar";

const TIME_ZONE = "Africa/Luanda";

function formatDate(date: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        throw new Error(`Invalid calendar date: ${date}`);
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(value);

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    if (!year || !month || !day) {
        throw new Error(`Unable to format date: ${date}`);
    }

    return `${year}-${month}-${day}`;
}

function formatTime(date: string) {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        throw new Error(`Invalid calendar time: ${date}`);
    }

    return new Intl.DateTimeFormat("pt-AO", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(value);
}

export default async function CalendarPage() {
    const [dbEvents, rangeEvents, contacts, userInfo] =
        await Promise.all([
            getCalendarEvents(),
            getCalendarRangeEvents(),
            getCalendarContacts(),
            requireUser(),
        ]);

    // Existing calendar events: meetings, visits, deadlines,
    // and any project/task events already generated in calendar_events.
    const events = dbEvents.map((event) => {
        const date = formatDate(event.start_at);

        const isTaskEvent = Boolean(event.task_id && event.task);

        const isProjectEvent =
            Boolean(event.project_id && event.project) &&
            (event.event_type === "project" ||
                event.event_type === "deadline");

        let startDate = date;
        let endDate = date;

        if (isTaskEvent && event.task) {
            startDate = event.task.start_date
                ? formatDate(event.task.start_date)
                : date;

            endDate = event.task.due_date
                ? formatDate(event.task.due_date)
                : startDate;
        } else if (isProjectEvent && event.project) {
            startDate = event.project.start_date
                ? formatDate(event.project.start_date)
                : date;

            endDate = event.project.end_date
                ? formatDate(event.project.end_date)
                : startDate;
        }

        return {
            id: event.event_id,
            title: event.title,
            date,
            startDate,
            endDate,

            time: event.all_day
                ? ""
                : formatTime(event.start_at),

            type: event.event_type,

            project: event.project?.project_name ?? undefined,
            projectId:
                event.project?.project_id ??
                event.project_id ??
                undefined,

            task: event.task?.title ?? undefined,
            taskId:
                event.task?.task_id ??
                event.task_id ??
                undefined,

            location: event.location ?? undefined,
            description: event.description ?? undefined,

            source: event.event_type,
            sourceId: event.event_id,

            event_id: event.event_id,
            created_by: event.created_by,
            start_at: event.start_at,
            end_at: event.end_at ?? event.start_at,
            all_day: event.all_day,

            participant_ids: event.participant_ids ?? [],
            client_ids: event.client_ids ?? [],
            supplier_ids: event.supplier_ids ?? [],
        };
    });

    // Independent project/task/submission ranges.
    // Normalize dates before passing them to the client.
    const normalizedRangeEvents = rangeEvents.map((event) => {
        const startDate = formatDate(event.startDate);

        return {
            ...event,
            date: startDate,
            startDate,
            endDate: formatDate(event.endDate),
        };
    });

    return (
        <CalendarPageInit
            events={events}
            rangeEvents={normalizedRangeEvents}
            participants={contacts.participants}
            clients={contacts.clients}
            suppliers={contacts.suppliers}
            userInfo={userInfo}
        />
    );
}
