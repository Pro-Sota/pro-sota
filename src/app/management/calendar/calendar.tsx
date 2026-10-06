"use client";

import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";

import NewEventModal from "./new_event_modal";
import CalendarFilters from "./components/calendar_filters";
import CalendarGrid from "./components/calendar_grid";
import CalendarStats from "./components/calendar_stats";
import CalendarToolbar from "./components/calendar_toolbar";
import SelectedDayAgenda from "./components/selected_day_agenda";
import UpcomingEvents from "./components/upcoming_events";
import WeeklySummary from "./components/weekly_summary";
import { useCalendar } from "./hooks/use_calendar";

import type { CalendarPageInitProps } from "./types";

export default function CalendarPageInit({
    events,
}: CalendarPageInitProps) {
    const [eventModalDate, setEventModalDate] =
        useState<string | null>(null);

    const calendar = useCalendar({
        events,
    });

    const openEventModal = (date?: string) => {
        setEventModalDate(date ?? calendar.selectedDate);
    };

    const closeEventModal = () => {
        setEventModalDate(null);
    };

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#F7F7F5] px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 sm:gap-6">
                {/* Header */}
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
                            Acompanhe projectos, tarefas, reuniões e
                            prazos.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => openEventModal()}
                        className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#BD9655] px-5 text-sm font-semibold text-[#002950] transition hover:bg-[#a9854b] focus:outline-none focus:ring-4 focus:ring-[#BD9655]/20 sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Novo evento</span>
                    </button>
                </header>

                {/* Stats */}
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

                {/* Calendar + sidebar */}
                <div className="grid min-w-0 items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Main Calendar */}
                    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white">
                        {/* Toolbar */}
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

                        {/* Filters */}
                        <div className="border-b border-neutral-200/80 px-3 py-3 sm:px-5 sm:py-4 lg:px-6">
                            <div className="min-w-0 overflow-x-auto">
                                <CalendarFilters
                                    activeFilter={calendar.activeFilter}
                                    onChange={calendar.setActiveFilter}
                                />
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="min-w-0 p-2 sm:p-4 lg:p-6">
                            <div className="min-w-0 overflow-hidden">
                                <CalendarGrid
                                    calendarDays={calendar.calendarDays}
                                    currentDate={calendar.currentDate}
                                    todayKey={calendar.todayKey}
                                    selectedDate={calendar.selectedDate}
                                    eventsByDate={calendar.eventsByDate}
                                    onSelectDate={
                                        calendar.setSelectedDate
                                    }
                                />
                            </div>
                        </div>
                    </section>

                    {/* Right Panel */}
                    <aside className="grid min-w-0 gap-5 sm:gap-6 xl:flex xl:flex-col">
                        <SelectedDayAgenda
                            selectedDate={calendar.selectedDate}
                            selectedEvents={calendar.selectedEvents}
                            onClear={() =>
                                calendar.setSelectedDate(null)
                            }
                            onAddEvent={() =>
                                openEventModal(
                                    calendar.selectedDate ??
                                        undefined,
                                )
                            }
                        />

                        <UpcomingEvents
                            events={calendar.upcomingEvents}
                            onSelectDate={calendar.setSelectedDate}
                        />

                        <WeeklySummary
                            weekLabel={calendar.weekLabel}
                            eventCount={
                                calendar.thisWeekEvents.length
                            }
                            projectCount={calendar.weekProjectCount}
                        />
                    </aside>
                </div>
            </div>

            {eventModalDate !== null && (
                <NewEventModal
                    open={true}
                    initialDate={eventModalDate}
                    onCloseAction={closeEventModal}
                />
            )}
        </main>
    );
}