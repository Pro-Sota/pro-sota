import CalendarPageInit from "./calendar";
import { getCalendarEvents } from "@/services/calendar";

const TIME_ZONE = "Africa/Luanda";

function getTodayKey() {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
}

function formatDate(date: string) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date(date));

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
}

function formatTime(date: string) {
    return new Intl.DateTimeFormat("pt-AO", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(date));
}

export default async function CalendarPage() {
    const dbEvents = await getCalendarEvents();

    const events = dbEvents.map((event) => ({
        id: event.event_id,
        title: event.title,
        date: formatDate(event.start_at),
        time: event.all_day ? "" : formatTime(event.start_at),
        type: event.event_type,
        project: event.project?.project_name ?? null,
        location: event.location ?? null,
        people: event.creator
            ? `${event.creator.first_name} ${event.creator.last_name}`.trim()
            : null,
    }));

    return (
        <CalendarPageInit
            events={events}
            todayKey={getTodayKey()}
        />
    );
}
