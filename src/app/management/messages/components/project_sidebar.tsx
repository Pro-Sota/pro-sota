"use client";

import {
  Building2,
  Calendar,
  Users,
  FolderOpen,
} from "lucide-react";

import { LABELS } from "./chat_labels";
import InfoCard from "./info_card";

import type {
  ProjectSidebarData,
} from "@/services/project_sidebar";

interface ProjectSideBarProps {
  data: ProjectSidebarData;
}

export default function ProjectSideBar({
  data,
}: ProjectSideBarProps) {
  return (
    <aside className="hidden h-full min-h-0 w-[320px] shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white xl:flex">
      {/* Header */}
      <header className="flex h-[73px] shrink-0 items-center justify-center border-b border-slate-200 bg-white px-6">
        <h2 className="font-semibold text-slate-900">
          {LABELS.projectInfo}
        </h2>
      </header>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Project status */}
          <InfoCard
            icon={<Building2 size={16} />}
            label={LABELS.status}
            value={
              data.project.status ?? "—"
            }
          />

          {/* Deadline */}
          <InfoCard
            icon={<Calendar size={16} />}
            label={LABELS.deadline}
            value={
              data.project.end_date
                ? new Date(
                    data.project.end_date,
                  ).toLocaleDateString(
                    "pt-AO",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )
                : "—"
            }
          />

          {/* Team */}
          <InfoCard
            icon={<Users size={16} />}
            label={LABELS.team}
            value={`${data.members.length} ${LABELS.members}`}
          />

          {/* Recent file */}
          <InfoCard
            icon={<FolderOpen size={16} />}
            label={LABELS.recentFiles}
            value={
              data.recentFile?.name ?? "—"
            }
          />

          {data.members.length > 0 && (
            <>
              <div className="my-4 h-px bg-slate-200" />

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Membros da Equipa
                </h3>

                <div className="space-y-3">
                  {data.members.map(
                    ({ profile, role }) => {
                      const fullName = [
                        profile.first_name,
                        profile.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ")
                        .trim();

                      const name =
                        fullName ||
                        profile.first_name ||
                        "Utilizador";

                      const initials = name
                        .split(" ")
                        .filter(Boolean)
                        .map(
                          (part) =>
                            part[0],
                        )
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <div
                          key={
                            profile.profile_id
                          }
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-semibold text-white">
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {role ??
                                "Membro"}
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}