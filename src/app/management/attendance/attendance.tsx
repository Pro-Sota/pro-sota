"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Loader2, X } from "lucide-react";

import AttendanceAttention from "./components/attendance_attention";
import AttendanceDayView from "./components/attendance_day_view";
import AttendanceEmployeeDrawer from "./components/attendance_employee_drawer";
import AttendanceExport from "./components/attendance_export";
import AttendanceFilters from "./components/attendance_filters";
import AttendanceHeader from "./components/attendance_header";
import AttendanceMonthView from "./components/attendance_month_view";
import AttendanceStats from "./components/attendance_stats";

import type { AttendanceWithProfile } from "@/services/attendance";

import type {
  AttendanceAction,
  AttendanceActionLoading,
  AttentionStatus,
  AttendanceProps,
  Profile,
  ViewMode,
} from "./types";

import {
  getMonthDays,
  getNextMonth,
  getPreviousMonth,
  getTodayDate,
} from "./utils/attendance_dates";

import { useAttendance } from "./hooks/use_attendance";

type AttendanceClientProps = Omit<AttendanceProps, "onMarkLate"> & {
  onMarkLateAction: AttendanceProps["onMarkLate"];
};

export default function Attendance(props: AttendanceClientProps) {
  const {
    profiles,
    attendanceRecords,
    monthlyRecords,
    selectedDate,
    selectedMonth,
    view,
    onCheckIn,
    onCheckOut,
    onMarkLateAction,
    onMarkAbsent,
  } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  const [actionLoading, setActionLoading] =
    useState<AttendanceActionLoading>(null);

  const [error, setError] = useState<string | null>(null);

  const [drawerProfile, setDrawerProfile] =
    useState<Profile | null>(null);

  const [drawerDate, setDrawerDate] = useState(selectedDate);

  // Absence reason modal state
  const [absentProfileId, setAbsentProfileId] =
    useState<string | null>(null);

  const [absentReason, setAbsentReason] = useState("");

  const [submittingAbsence, setSubmittingAbsence] =
    useState(false);

  const attendance = useAttendance({
    profiles,
    attendanceRecords,
    monthlyRecords,
  });

  const monthDays = getMonthDays(selectedMonth);

  const absentProfile = absentProfileId
    ? profiles.find(
        (profile) => profile.profile_id === absentProfileId,
      ) ?? null
    : null;

  function updateUrl(
    values: Record<string, string | null>,
    options: { replace?: boolean } = {},
  ) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(values)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const query = params.toString();
    const url = query
      ? `/management/attendance?${query}`
      : "/management/attendance";

    if (options.replace) {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
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
  ): Promise<boolean> {
    if (actionLoading) return false;

    setActionLoading({ profileId, action });
    setError(null);

    try {
      await callback(profileId);
      router.refresh();
      return true;
    } catch (actionError) {
      console.error("Attendance action failed:", actionError);

      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível actualizar o registo de presença. Tente novamente.",
      );

      return false;
    } finally {
      setActionLoading(null);
    }
  }

  function openEmployee(profile: Profile, date = selectedDate) {
    setDrawerProfile(profile);
    setDrawerDate(date);
  }

  function closeEmployee() {
    setDrawerProfile(null);
  }

  // Open the modal instead of immediately marking the employee absent.
  function openAbsenceModal(profileId: string) {
    setError(null);
    setAbsentReason("");
    setAbsentProfileId(profileId);
  }

  function closeAbsenceModal() {
    if (submittingAbsence) return;

    setAbsentProfileId(null);
    setAbsentReason("");
  }

  async function confirmAbsence() {
    if (!absentProfileId || submittingAbsence || actionLoading) {
      return;
    }

    const reason = absentReason.trim();

    if (!reason) {
      setError("Indique o motivo da falta antes de continuar.");
      return;
    }

    setSubmittingAbsence(true);
    setError(null);

    try {
      const success = await runAction(
        absentProfileId,
        "absent",
        (profileId) => onMarkAbsent(profileId, reason),
      );

      if (success) {
        setAbsentProfileId(null);
        setAbsentReason("");
      }
    } finally {
      setSubmittingAbsence(false);
    }
  }

  function handleAttentionStatus(status: AttentionStatus) {
    // "Sem saída" does not have a corresponding status filter.
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
    return (
      attendanceRecords.find(
        (record) =>
          record.profile_id === profileId &&
          record.attendance_date === date,
      ) ?? null
    );
  }

  const drawerAttendance = drawerProfile
    ? attendanceByDate(drawerProfile.profile_id, drawerDate)
    : null;

  const actionProps = {
    loading: actionLoading,

    onCheckIn: async (id: string) => {
      const time = new Date().toTimeString().slice(0, 5);

      await runAction(id, "check-in", (profileId) =>
        onCheckIn(profileId, time),
      );
    },

    onCheckOut: async (id: string) => {
      await runAction(id, "check-out", onCheckOut);
    },

    onMarkLate: async (id: string) => {
      await runAction(id, "late", onMarkLateAction);
    },

    // Clicking "Marcar falta" opens the reason modal.
    onMarkAbsent: async (id: string) => {
      openAbsenceModal(id);
    },
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
          onPreviousMonth={() => changeMonth(previousMonth)}
          onNextMonth={() => changeMonth(nextMonth)}
          onCurrentMonth={goToCurrentMonth}
          onToday={goToToday}
        />

        <AttendanceStats summary={attendance.summary} />

        <AttendanceAttention
          attention={attendance.attention}
          onStatusClick={handleAttentionStatus}
        />

        {error && !absentProfileId && (
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
              onStatusChange={attendance.setStatusFilter}
              groupMode={attendance.groupMode}
              onGroupModeChange={attendance.setGroupMode}
            />
          </div>

          {view === "day" && (
            <div className="shrink-0">
              <AttendanceExport
                profiles={attendance.filteredProfiles}
                attendanceByProfile={attendance.attendanceByProfile}
                selectedDate={selectedDate}
              />
            </div>
          )}
        </div>

        {view === "day" ? (
          attendance.groupMode === "department" ? (
            <div className="space-y-4">
              {attendance.groupedProfiles.map((group) => (
                <div key={group.department ?? "all"}>
                  <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group.department}
                  </div>

                  <AttendanceDayView
                    profiles={group.profiles}
                    attendanceByProfile={attendance.attendanceByProfile}
                    selectedDate={selectedDate}
                    onOpenEmployee={openEmployee}
                    onGoToToday={goToToday}
                    {...actionProps}
                  />
                </div>
              ))}
            </div>
          ) : (
            <AttendanceDayView
              profiles={attendance.filteredProfiles}
              attendanceByProfile={attendance.attendanceByProfile}
              selectedDate={selectedDate}
              onOpenEmployee={openEmployee}
              onGoToToday={goToToday}
              {...actionProps}
            />
          )
        ) : attendance.groupMode === "department" ? (
          <div className="space-y-4">
            {attendance.groupedProfiles.map((group) => (
              <div key={group.department ?? "all"}>
                <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {group.department}
                </div>

                <AttendanceMonthView
                  profiles={group.profiles}
                  monthlyAttendanceMap={attendance.monthlyAttendanceMap}
                  monthDays={monthDays}
                  selectedMonth={selectedMonth}
                  onPreviousMonth={() => changeMonth(previousMonth)}
                  onNextMonth={() => changeMonth(nextMonth)}
                  onCurrentMonth={goToCurrentMonth}
                  onOpenEmployee={openEmployee}
                  onOpenDay={openEmployee}
                />
              </div>
            ))}
          </div>
        ) : (
          <AttendanceMonthView
            profiles={attendance.filteredProfiles}
            monthlyAttendanceMap={attendance.monthlyAttendanceMap}
            monthDays={monthDays}
            selectedMonth={selectedMonth}
            onPreviousMonth={() => changeMonth(previousMonth)}
            onNextMonth={() => changeMonth(nextMonth)}
            onCurrentMonth={goToCurrentMonth}
            onOpenEmployee={openEmployee}
            onOpenDay={openEmployee}
          />
        )}
      </div>

      {/* Absence reason modal */}
      {absentProfileId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAbsenceModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="absence-modal-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h2
                    id="absence-modal-title"
                    className="text-base font-semibold text-slate-900"
                  >
                    Registar falta
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {absentProfile
                      ? `Indique o motivo da falta de ${absentProfile.first_name} ${absentProfile.last_name}.`
                      : "Indique o motivo da falta deste colaborador."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAbsenceModal}
                disabled={submittingAbsence}
                aria-label="Fechar"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void confirmAbsence();
              }}
            >
              <div className="space-y-4 px-5 py-5 sm:px-6">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Data da falta
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {new Date(
                      `${selectedDate}T12:00:00`,
                    ).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="absence-reason"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Motivo da falta
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                  <textarea
                    id="absence-reason"
                    value={absentReason}
                    onChange={(event) => {
                      setAbsentReason(event.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Ex.: doença, motivo pessoal, falta injustificada..."
                    rows={4}
                    maxLength={1000}
                    required
                    autoFocus
                    disabled={submittingAbsence}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15 disabled:bg-slate-50"
                  />

                  <div className="mt-1 flex justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      Registe o motivo para o histórico de presença.
                    </p>
                    <span className="shrink-0 text-xs text-slate-400">
                      {absentReason.length}/1000
                    </span>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeAbsenceModal}
                  disabled={submittingAbsence}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    submittingAbsence ||
                    !absentReason.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#002950] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003967] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingAbsence ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    "Confirmar falta"
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

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