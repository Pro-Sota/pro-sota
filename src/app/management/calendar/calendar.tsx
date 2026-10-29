"use client";

import { CalendarDays, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import ViewEventModal, {
  type CalendarEventDetails,
} from "./view_event_modal";

import CalendarFilters from "./components/calendar_filters";
import CalendarGrid from "./components/calendar_grid";
import CalendarStats from "./components/calendar_stats";
import CalendarToolbar from "./components/calendar_toolbar";
import SelectedDayAgenda from "./components/selected_day_agenda";
import UpcomingEvents from "./components/upcoming_events";
import WeeklySummary from "./components/weekly_summary";

import { useCalendar } from "./hooks/use_calendar";

import type {
  CalendarEvent,
  CalendarPageInitProps,
} from "./types";

import CreateMeetingModal from "@/app/management/calendar/components/create_meeting_modal";
import EditMeetingModal, {
  type EditableCalendarEvent,
} from "./edit_event_modal";
import type { SelectedAttendee } from "./components/calendar_event_form";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CalendarEventWithCreator = CalendarEvent & {
  created_by?: string | null;
  event_id?: string;
  participant_ids?: string[];
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function toEventDetails(
  event: CalendarEvent,
): CalendarEventDetails {
  const source = event as CalendarEventWithCreator;
  const allDay = !event.time;

  const startAt = new Date(
    `${event.date}T${event.time ?? "00:00"}:00+01:00`,
  );

  const endAt = new Date(
    startAt.getTime() +
      (allDay ? 24 : 1) * 60 * 60 * 1000,
  );

  return {
    event_id: source.event_id ?? event.id,
    created_by: source.created_by ?? null,
    title: event.title,
    event_type: event.type,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    location: event.location ?? null,
    description: event.description ?? null,
    all_day: allDay,
    participant_ids: source.participant_ids ?? [],
  };
}

/** Maps the details shown in the view modal to what the edit modal expects. */
function toEditableEvent(
  event: CalendarEventDetails,
): EditableCalendarEvent {
  return {
    id: event.event_id,
    title: event.title,
    event_type: event.event_type,
    start_at: event.start_at,
    end_at: event.end_at,
    location: event.location,
    description: event.description,
  };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function CalendarPageInit({
  events,
  participants,
  clients,
  suppliers,
  userInfo,
}: CalendarPageInitProps) {
  const calendar = useCalendar({
    events,
    participants,
    clients,
    suppliers,
    userInfo,
  });

  const [isCreateEventOpen, setIsCreateEventOpen] =
    useState(false);

  // Single source of truth for the event being viewed / edited.
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEventDetails | null>(null);

  const [isViewEventOpen, setIsViewEventOpen] =
    useState(false);

  const [isEditEventOpen, setIsEditEventOpen] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /* Derived data for the edit modal                                        */
  /* ---------------------------------------------------------------------- */

  const editableEvent = useMemo(
    () => (selectedEvent ? toEditableEvent(selectedEvent) : null),
    [selectedEvent],
  );

  // Pre-select the team members already invited to the event.
  const initialAttendees = useMemo<SelectedAttendee[]>(() => {
    const ids = new Set(selectedEvent?.participant_ids ?? []);

    return participants
      .filter((person) => ids.has(person.profile_id))
      .map((person) => ({
        key: `profile:${person.profile_id}`,
        id: person.profile_id,
        name:
          [person.first_name, person.last_name]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          person.email ||
          "Utilizador",
        email: person.email,
        category: "team" as const,
      }));
  }, [selectedEvent, participants]);

  /* ---------------------------------------------------------------------- */
  /* Modal handlers                                                         */
  /* ---------------------------------------------------------------------- */

  function openEventModal() {
    setIsCreateEventOpen(true);
  }

  function closeEventModal() {
    setIsCreateEventOpen(false);
  }

  function closeViewEventModal() {
    setIsViewEventOpen(false);
    setSelectedEvent(null);
  }

  function closeEditEventModal() {
    setIsEditEventOpen(false);
    setSelectedEvent(null);
  }

  function handleSelectEvent(event: CalendarEvent) {
    setSelectedEvent(toEventDetails(event));
    setIsEditEventOpen(false);
    setIsViewEventOpen(true);
  }

  function handleEditEvent(event: CalendarEventDetails) {
    setSelectedEvent(event);
    setIsViewEventOpen(false);
    setIsEditEventOpen(true);
  }

  /* ---------------------------------------------------------------------- */
  /* Current user                                                           */
  /* ---------------------------------------------------------------------- */

  const currentUserId = userInfo?.user.id ?? null;
  const currentUserRoleId = userInfo?.userRole ?? null;

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F7F7F5] px-2 py-3 sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-4 sm:gap-6">
        <header className="flex min-w-0 flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-0">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500 sm:mb-1.5 sm:text-sm">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>Planeamento</span>
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              Calendário
            </h1>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-neutral-500 sm:text-sm">
              Acompanhe projectos, tarefas, reuniões e prazos.
            </p>
          </div>

          <button
            type="button"
            onClick={openEventModal}
            className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#BD9655] px-5 text-sm font-semibold text-[#002950] transition hover:bg-[#a9854b] sm:h-11 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Novo evento</span>
          </button>
        </header>

        <div className="min-w-0">
          <CalendarStats
            monthCount={calendar.monthEvents.length}
            todayCount={calendar.todayEvents.length}
            nextSevenDaysCount={
              calendar.nextSevenDaysEvents.length
            }
            upcomingDeadlinesCount={
              calendar.upcomingDeadlines.length
            }
          />
        </div>

        <div className="grid min-w-0 items-start gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white sm:rounded-2xl">
            {/* Toolbar: wraps instead of scrolling */}
            <div className="min-w-0 border-b border-neutral-200/80 px-2 py-2.5 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
              <CalendarToolbar
                monthLabel={calendar.monthLabel}
                search={calendar.search}
                onSearchChange={calendar.setSearch}
                onPreviousMonth={() =>
                  calendar.changeMonth(-1)
                }
                onNextMonth={() =>
                  calendar.changeMonth(1)
                }
                onToday={calendar.goToday}
              />
            </div>

            {/* Filters: wraps instead of scrolling */}
            <div className="min-w-0 border-b border-neutral-200/80 px-2 py-2.5 sm:px-5 sm:py-4 lg:px-6">
              <CalendarFilters
                activeFilter={calendar.activeFilter}
                onChange={calendar.setActiveFilter}
              />
            </div>

            {/* Grid: fills the available width, no horizontal scroll */}
            <div className="w-full min-w-0 p-1 sm:p-4 lg:p-6">
              <CalendarGrid
                calendarDays={calendar.calendarDays}
                currentDate={calendar.currentDate}
                todayKey={calendar.todayKey}
                selectedDate={calendar.selectedDate}
                eventsByDate={calendar.eventsByDate}
                onSelectDate={calendar.setSelectedDate}
                onSelectEvent={handleSelectEvent}
              />
            </div>
          </section>

          <aside className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-6 xl:flex xl:flex-col">
            {/* Full width on tablets so the agenda stays readable */}
            <div className="min-w-0 sm:col-span-2 xl:col-auto">
              <SelectedDayAgenda
                selectedDate={calendar.selectedDate}
                selectedEvents={calendar.selectedEvents}
                onClear={() =>
                  calendar.setSelectedDate(null)
                }
                onAddEvent={openEventModal}
                onSelectEvent={handleSelectEvent}
              />
            </div>

            <div className="min-w-0">
              <UpcomingEvents
                events={calendar.upcomingEvents}
                onSelectDate={calendar.setSelectedDate}
              />
            </div>

            <div className="min-w-0">
              <WeeklySummary
                weekLabel={calendar.weekLabel}
                eventCount={calendar.thisWeekEvents.length}
                projectCount={calendar.weekProjectCount}
              />
            </div>
          </aside>
        </div>
      </div>

      <CreateMeetingModal
        open={isCreateEventOpen}
        onClose={closeEventModal}
        participants={participants}
        clients={clients}
        suppliers={suppliers}
      />

      <ViewEventModal
        open={isViewEventOpen}
        event={selectedEvent}
        currentUserId={currentUserId}
        currentUserRoleId={currentUserRoleId}
        onCloseAction={closeViewEventModal}
        onEditAction={handleEditEvent}
      />

      <EditMeetingModal
        open={isEditEventOpen}
        event={editableEvent}
        onClose={closeEditEventModal}
        participants={participants}
        clients={clients}
        suppliers={suppliers}
        initialAttendees={initialAttendees}
      />
    </main>
  );
}