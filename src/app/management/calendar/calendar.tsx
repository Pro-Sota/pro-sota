
"use client";

import { CalendarDays, Plus } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";

import {
  createCalendarEventAction,
  updateCalendarEventAction,
} from "@/actions/calendar";

import ViewEventModal, {
  type CalendarEventDetails,
} from "./view_event_modal";
import EditEventModal, {
  type UpdateCalendarEventInput,
} from "./edit_event_modal";

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
import CreateMeetingModal from "@/app/components/create_meeting_modal";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */


const ALLOWED_EVENT_TYPES = [
  "meeting",
  "site_visit",
  "deadline",
] as const;

type SupportedEventType = (typeof ALLOWED_EVENT_TYPES)[number];

type CalendarEventWithCreator = CalendarEvent & {
  created_by?: string | null;
  event_id?: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function isSupportedEventType(
  type: string,
): type is SupportedEventType {
  return ALLOWED_EVENT_TYPES.some((allowed) => allowed === type);
}

/**
 * Converts the calendar's event shape into the details-modal shape.
 * Preserve the creator ID so the modal can apply its edit visibility rule.
 */
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
  };
}

function getLuandaDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+01:00`);
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
  const router = useRouter();

  const calendar = useCalendar({
    events,
    participants,
    clients,
    suppliers,
    userInfo,
  });

  const [isCreateEventOpen, setIsCreateEventOpen] =
    useState(false);

  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEventDetails | null>(null);

  const [isViewEventOpen, setIsViewEventOpen] =
    useState(false);

  const [isEditEventOpen, setIsEditEventOpen] =
    useState(false);

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
  /* Update event                                                           */
  /* ---------------------------------------------------------------------- */

  async function handleUpdateEvent(
    input: UpdateCalendarEventInput,
  ) {
    if (!isSupportedEventType(input.event_type)) {
      throw new Error(
        "Este tipo de evento ainda não é suportado.",
      );
    }

    const result = await updateCalendarEventAction({
      ...input,
      event_type: input.event_type,
    });

    if (!result.success) {
      throw new Error(
        result.error ||
        "Não foi possível actualizar o evento.",
      );
    }

    setIsEditEventOpen(false);
    setIsViewEventOpen(false);
    setSelectedEvent(null);

    router.refresh();
  }

  /* ---------------------------------------------------------------------- */
  /* Current user                                                           */
  /* ---------------------------------------------------------------------- */

  const currentUser = userInfo;

  const currentUserId =
    currentUser?.user.id ?? null;

  const currentUserRoleId =
    currentUser?.userRole ?? null;

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F7F5] px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 sm:gap-6">
        <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2 text-sm text-neutral-500">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>Planeamento</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              Calendário
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-5 text-neutral-500">
              Acompanhe projectos, tarefas, reuniões e prazos.
            </p>
          </div>

          <button
            type="button"
            onClick={openEventModal}
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#BD9655] px-5 text-sm font-semibold text-[#002950] transition hover:bg-[#a9854b] sm:w-auto"
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

        <div className="grid min-w-0 items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white">
            <div className="border-b border-neutral-200/80 px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
              <div className="min-w-0 overflow-x-auto">
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
            </div>

            <div className="border-b border-neutral-200/80 px-3 py-3 sm:px-5 sm:py-4 lg:px-6">
              <div className="min-w-0 overflow-x-auto">
                <CalendarFilters
                  activeFilter={calendar.activeFilter}
                  onChange={calendar.setActiveFilter}
                />
              </div>
            </div>

            <div className="min-w-0 p-2 sm:p-4 lg:p-6">
              <div className="min-w-0 overflow-hidden">
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
            </div>
          </section>

          <aside className="grid min-w-0 gap-5 sm:gap-6 xl:flex xl:flex-col">
            <SelectedDayAgenda
              selectedDate={calendar.selectedDate}
              selectedEvents={calendar.selectedEvents}
              onClear={() =>
                calendar.setSelectedDate(null)
              }
              onAddEvent={openEventModal}
              onSelectEvent={handleSelectEvent}
            />

            <UpcomingEvents
              events={calendar.upcomingEvents}
              onSelectDate={calendar.setSelectedDate}
            />

            <WeeklySummary
              weekLabel={calendar.weekLabel}
              eventCount={calendar.thisWeekEvents.length}
              projectCount={calendar.weekProjectCount}
            />
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

      <EditEventModal
        open={isEditEventOpen}
        event={selectedEvent}
        onCloseAction={closeEditEventModal}
        onSaveAction={handleUpdateEvent}
      />
    </main>
  );
}
