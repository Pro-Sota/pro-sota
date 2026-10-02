"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AttendanceAttention from "./components/attendance_attention";
import AttendanceDayView from "./components/attendance_day_view";
import AttendanceEmployeeDrawer from "./components/attendance_employee_drawer";
import AttendanceExport from "./components/attendance_export";
import AttendanceFilters from "./components/attendance_filters";
import AttendanceHeader from "./components/attendance_header";
import AttendanceMonthView from "./components/attendance_month_view";
import AttendanceStats from "./components/attendance_stats";

import type {
  AttendanceAction,
  AttendanceActionLoading,
  AttentionStatus,
  AttendanceProps,
  Profile,
  ViewMode,
  AttendanceRecord,
} from "./types";

import {
  getMonthDays,
  getNextMonth,
  getPreviousMonth,
  getTodayDate,
} from "./utils/attendance_dates";

import { useAttendance } from "./hooks/use_attendance";
import { AttendanceWithProfile } from "@/services/attendance";

export default function Attendance(props: AttendanceProps) {
  const {
    profiles,
    attendanceRecords,
    monthlyRecords,
    selectedDate,
    selectedMonth,
    view,
    onCheckIn,
    onCheckOut,
    onMarkLate,
    onMarkAbsent,
  } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  const [actionLoading, setActionLoading] =
    useState<AttendanceActionLoading>(null);

  const [error, setError] = useState<string | null>(null);

  const [drawerProfile, setDrawerProfile] =
    useState<Profile | null>(null);

  const [drawerDate, setDrawerDate] =
    useState(selectedDate);

  const attendance = useAttendance({
    profiles,
    attendanceRecords,
    monthlyRecords,
  });

  const monthDays = getMonthDays(selectedMonth);

  function updateUrl(
    values: Record<string, string | null>,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    for (const [key, value] of Object.entries(values)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const query = params.toString();

    router.push(
      query
        ? `/management/attendance?${query}`
        : "/management/attendance",
    );
  }

  function changeView(nextView: ViewMode) {
    if (nextView === "month") {
      updateUrl({
        view: "month",
        month: selectedMonth,
        date: null,
      });

      return;
    }

    updateUrl({
      view: "day",
      date: selectedDate,
      month: null,
    });
  }

  function goToToday() {
    updateUrl({
      view: "day",
      date: getTodayDate(),
      month: null,
    });
  }

  function goToCurrentMonth() {
    const today = getTodayDate();

    updateUrl({
      view: "month",
      month: today.slice(0, 7),
      date: null,
    });
  }

  function changeMonth(month: string) {
    updateUrl({
      view: "month",
      month,
      date: null,
    });
  }

  async function runAction(
    profileId: string,
    action: AttendanceAction,
    callback: (id: string) => Promise<void>,
  ) {
    setActionLoading({
      profileId,
      action,
    });

    setError(null);

    try {
      await callback(profileId);
      router.refresh();
    } catch (actionError) {
      console.error(actionError);

      setError(
        "Não foi possível actualizar o registo de presença. Tente novamente.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  function openEmployee(
    profile: Profile,
    date = selectedDate,
  ) {
    setDrawerProfile(profile);
    setDrawerDate(date);
  }

  function closeEmployee() {
    setDrawerProfile(null);
  }

  function handleAttentionStatus(
    status: AttentionStatus,
  ) {
    // StatusFilter does not include "Sem saída"; keep the current filter for it.
    if (status !== "Sem saída") {
      attendance.setStatusFilter(status);
    }

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

function attendanceByDate(
    profileId: string,
    date: string,
): AttendanceWithProfile | null {
    if (date === selectedDate) {
        return (
            attendance.attendanceByProfile.get(profileId) ??
            null
        );
    }

  // Monthly summaries do not contain the full attendance record required by the drawer.
  return null;
}

const drawerAttendance = drawerProfile
    ? attendanceByDate(
          drawerProfile.profile_id,
          drawerDate,
      )
    : null;

  const actionProps = {
    loading: actionLoading,
    onCheckIn: (id: string) =>
      runAction(id, "check-in", onCheckIn),
    onCheckOut: (id: string) =>
      runAction(id, "check-out", onCheckOut),
    onMarkLate: (id: string) =>
      runAction(id, "late", onMarkLate),
    onMarkAbsent: (id: string) =>
      runAction(id, "absent", onMarkAbsent),
  };

  const previousMonth = getPreviousMonth(selectedMonth);
  const nextMonth = getNextMonth(selectedMonth);

  return (
    <div className="min-h-full bg-[#F7F7F5] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <AttendanceHeader
          view={view}
          selectedDate={selectedDate}
          selectedMonth={selectedMonth}
          onChangeView={changeView}
          onPreviousMonth={() =>
            changeMonth(previousMonth)
          }
          onNextMonth={() =>
            changeMonth(nextMonth)
          }
          onCurrentMonth={goToCurrentMonth}
          onToday={goToToday}
        />

        <AttendanceStats summary={attendance.summary} />

        <AttendanceAttention
          attention={attendance.attention}
          onStatusClick={handleAttentionStatus}
        />

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              Fechar
            </button>
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-stretch">
          <div className="min-w-0 flex-1">
            <AttendanceFilters
              search={attendance.search}
              onSearchChange={attendance.setSearch}
              areaFilter={attendance.areaFilter}
              onAreaChange={attendance.setAreaFilter}
              areas={attendance.areas}
              statusFilter={attendance.statusFilter}
              onStatusChange={
                attendance.setStatusFilter
              }
              groupMode={attendance.groupMode}
              onGroupModeChange={
                attendance.setGroupMode
              }
            />
          </div>

          {view === "day" && (
            <div className="shrink-0">
              <AttendanceExport
                profiles={
                  attendance.filteredProfiles
                }
                attendanceByProfile={
                  attendance.attendanceByProfile
                }
                selectedDate={selectedDate}
              />
            </div>
          )}
        </div>

        {view === "day" ? (
          attendance.groupMode === "department" ? (
            <div className="space-y-4">
              {attendance.groupedProfiles.map(
                (group) => (
                  <div
                    key={
                      group.department ??
                      "all"
                    }
                  >
                    <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {group.department}
                    </div>

                    <AttendanceDayView
                      profiles={
                        group.profiles
                      }
                      attendanceByProfile={
                        attendance.attendanceByProfile
                      }
                      selectedDate={
                        selectedDate
                      }
                      onOpenEmployee={
                        openEmployee
                      }
                      onGoToToday={
                        goToToday
                      }
                      {...actionProps}
                    />
                  </div>
                ),
              )}
            </div>
          ) : (
            <AttendanceDayView
              profiles={
                attendance.filteredProfiles
              }
              attendanceByProfile={
                attendance.attendanceByProfile
              }
              selectedDate={selectedDate}
              onOpenEmployee={openEmployee}
              onGoToToday={goToToday}
              {...actionProps}
            />
          )
        ) : attendance.groupMode === "department" ? (
          <div className="space-y-4">
            {attendance.groupedProfiles.map(
              (group) => (
                <div
                  key={
                    group.department ??
                    "all"
                  }
                >
                  <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group.department}
                  </div>

                  <AttendanceMonthView
                    profiles={group.profiles}
                    monthlyAttendanceMap={
                      attendance.monthlyAttendanceMap
                    }
                    monthDays={monthDays}
                    selectedMonth={
                      selectedMonth
                    }
                    onPreviousMonth={() =>
                      changeMonth(
                        previousMonth,
                      )
                    }
                    onNextMonth={() =>
                      changeMonth(
                        nextMonth,
                      )
                    }
                    onCurrentMonth={
                      goToCurrentMonth
                    }
                    onOpenEmployee={
                      openEmployee
                    }
                    onOpenDay={
                      openEmployee
                    }
                  />
                </div>
              ),
            )}
          </div>
        ) : (
          <AttendanceMonthView
            profiles={
              attendance.filteredProfiles
            }
            monthlyAttendanceMap={
              attendance.monthlyAttendanceMap
            }
            monthDays={monthDays}
            selectedMonth={selectedMonth}
            onPreviousMonth={() =>
              changeMonth(previousMonth)
            }
            onNextMonth={() =>
              changeMonth(nextMonth)
            }
            onCurrentMonth={
              goToCurrentMonth
            }
            onOpenEmployee={openEmployee}
            onOpenDay={openEmployee}
          />
        )}
      </div>

      <AttendanceEmployeeDrawer
        profile={drawerProfile}
        selectedDate={drawerDate}
        attendance={drawerAttendance}
        monthlyRecords={monthlyRecords}
        open={Boolean(drawerProfile)}
        onClose={closeEmployee}
      />
    </div>
  );
}