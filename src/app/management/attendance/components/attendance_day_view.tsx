import { Users } from "lucide-react";

import type {
  AttendanceActionLoading,
  AttendanceRecord,
  Profile,
} from "../types";

import AttendanceActions from "./attendance_actions";
import AttendanceMobileCard from "./attendance_mobile_card";
import AttendanceStatusBadge from "./attendance_status_badge";

import {
  formatDate,
  formatTime,
  getInitials,
  getTodayDate,
  isFutureDate,
} from "../utils/attendance_dates";

type Props = {
  profiles: Profile[];
  attendanceByProfile: Map<string, AttendanceRecord>;
  selectedDate: string;
  loading: AttendanceActionLoading;

  onOpenEmployee: (profile: Profile) => void;
  onGoToToday: () => void;

  onCheckIn: (id: string) => Promise<void>;
  onCheckOut: (id: string) => Promise<void>;
  onMarkLate: (id: string) => Promise<void>;
  onMarkAbsent: (id: string) => Promise<void>;
};

export default function AttendanceDayView({
  profiles,
  attendanceByProfile,
  selectedDate,
  loading,
  onOpenEmployee,
  onGoToToday,
  onCheckIn,
  onCheckOut,
  onMarkLate,
  onMarkAbsent,
}: Props) {
  const today = getTodayDate();
  const future = isFutureDate(selectedDate);
  const isToday = selectedDate === today;

  const title = isToday
    ? "Presença de hoje"
    : formatDate(selectedDate);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-[#002950]">
            {title}
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            {formatDate(selectedDate)}
          </p>
        </div>

        {!isToday && (
          <button
            type="button"
            onClick={onGoToToday}
            className="self-start text-sm font-semibold text-[#BD9655] hover:underline sm:self-auto"
          >
            Voltar a hoje
          </button>
        )}
      </div>

      {/* Future-date notice */}
      {future && (
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <p className="text-xs font-medium text-slate-500">
            A presença não pode ser registada para uma data
            futura.
          </p>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Membro",
                "Área",
                "Entrada",
                "Saída",
                "Estado",
                "Acção",
              ].map((heading, index) => (
                <th
                  key={heading}
                  scope="col"
                  className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${index === 5
                      ? "text-right"
                      : ""
                    }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {profiles.map((profile) => {
              const record =
                attendanceByProfile.get(
                  profile.profile_id,
                ) ?? null;

              const name =
                `${profile.first_name} ${profile.last_name}`.trim();

              return (
                <tr
                  key={profile.profile_id}
                  className="transition hover:bg-slate-50/70"
                >
                  {/* Member */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenEmployee(profile)
                      }
                      className="flex items-center gap-3 text-left"
                    >
                      {profile.profile_picture ? (
                        <img
                          src={
                            profile.profile_picture
                          }
                          alt={name}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#002950]/10 text-xs font-semibold text-[#002950]"
                        >
                          {getInitials(
                            profile.first_name,
                            profile.last_name,
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#002950]">
                          {name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {profile.job_title ??
                            "—"}
                        </p>
                      </div>
                    </button>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {profile.department ?? "—"}
                  </td>

                  {/* Check-in */}
                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {formatTime(record?.check_in ?? "-")}
                  </td>

                  {/* Check-out */}
                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {formatTime(record?.check_out ?? "-")}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <AttendanceStatusBadge
                      status={
                        record?.status ??
                        "Em falta"
                      }
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    {!future && (
                      <AttendanceActions
                        profile={profile}
                        record={record}
                        loading={loading}
                        isFuture={isFutureDate(selectedDate)}
                        onCheckIn={onCheckIn}
                        onCheckOut={onCheckOut}
                        onMarkLate={onMarkLate}
                        onMarkAbsent={onMarkAbsent}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="grid gap-3 p-4 md:hidden">
        {profiles.map((profile) => (
          <AttendanceMobileCard
            key={profile.profile_id}
            profile={profile}
            record={
              attendanceByProfile.get(
                profile.profile_id,
              ) ?? null
            }
            loading={loading}
            onOpen={() => onOpenEmployee(profile)}
            onCheckIn={onCheckIn}
            onCheckOut={onCheckOut}
            onMarkLate={onMarkLate}
            onMarkAbsent={onMarkAbsent}
          />
        ))}
      </div>

      {/* Empty state */}
      {profiles.length === 0 && (
        <div className="px-5 py-12 text-center">
          <Users className="mx-auto h-8 w-8 text-slate-300" />

          <p className="mt-3 text-sm font-medium text-slate-600">
            Nenhum membro encontrado.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Ajuste a pesquisa ou os filtros.
          </p>
        </div>
      )}
    </section>
  );
}