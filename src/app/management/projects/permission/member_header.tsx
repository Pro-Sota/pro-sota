// src/app/components/management/projects/permissions/permission_member_header.tsx

import { ShieldCheck, UserRound } from "lucide-react";

import type { ProjectPermissionMember } from "./types";

type Props = {
  member: ProjectPermissionMember;
  projectName: string;
  permissionCount: number;
};

export default function PermissionMemberHeader({
  member,
  projectName,
  permissionCount,
}: Props) {
  const fullName = [member.firstName, member.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const initials = [member.firstName, member.lastName]
    .filter(Boolean)
    .map((name) => name?.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-[#E5E5DF] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Member information */}
        <div className="flex min-w-0 items-center gap-4">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#002950] text-sm font-semibold tracking-wide text-white"
          >
            {initials || (
              <UserRound
                size={20}
                strokeWidth={1.8}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck
                size={16}
                strokeWidth={1.8}
                className="shrink-0 text-[#BD9655]"
              />

              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#BD9655]">
                Permissões do projecto
              </span>
            </div>

            <h1 className="truncate text-xl font-semibold tracking-tight text-[#002950] sm:text-2xl">
              {fullName || "Membro do projecto"}
            </h1>

            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
              <span className="truncate">
                {projectName}
              </span>

              <span
                aria-hidden="true"
                className="text-gray-300"
              >
                /
              </span>

              {member.projectRole && (
                <span className="truncate">
                  {member.projectRole}
                </span>
              )}
            </div>

            {member.email && (
              <p className="mt-1 truncate text-xs text-gray-400">
                {member.email}
              </p>
            )}
          </div>
        </div>

        {/* Permission count */}
        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-[#E8E8E2] bg-[#FAFAF8] px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0ECE4]">
            <ShieldCheck
              size={17}
              strokeWidth={1.8}
              className="text-[#BD9655]"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400">
              Permissões atribuídas
            </p>

            <p className="mt-0.5 text-lg font-semibold leading-none text-[#002950]">
              {permissionCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}