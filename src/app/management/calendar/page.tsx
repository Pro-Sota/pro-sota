import CalendarPageInit from "./calendar";
import { getCalendarEvents } from "@/services/calendar";

const TIME_ZONE = "Africa/Luanda";

function formatDate(date: string) {
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

    const year = parts.find(
        (part) => part.type === "year",
    )?.value;

    const month = parts.find(
        (part) => part.type === "month",
    )?.value;

    const day = parts.find(
        (part) => part.type === "day",
    )?.value;

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
    const dbEvents = await getCalendarEvents();

    const events = dbEvents.map((event) => ({
        id: event.event_id,
        title: event.title,
        date: formatDate(event.start_at),

        time: event.all_day
            ? ""
            : formatTime(event.start_at),

        type: event.event_type,

        project:
            event.project?.project_name ?? undefined,

        projectId:
            event.project?.project_id ?? undefined,

        location:
            event.location ?? undefined,

        description:
            event.description ?? undefined,

        source: event.event_type,

        sourceId: event.event_id,
    }));

    return (
        <CalendarPageInit
            events={events}
        />
    );
}