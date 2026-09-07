"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  Users,
  FolderOpen,
} from "lucide-react";
import { useParams } from "next/navigation";

import { LABELS } from "./chat_labels";
import InfoCard from "./info_card";
import EmptyProjectInfo from "./empty_project_state";
import {
  getProjectSidebarData,
  ProjectSidebarData,
} from "@/services/project_sidebar";

export default function ProjectSideBar() {
  const params = useParams<{
    projectId?: string;
    chatId?: string;
  }>();

  const projectId = params.projectId;
  const chatId = params.chatId;

  const [data, setData] = useState<ProjectSidebarData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId || !chatId) {
      return;
    }

    async function loadProjectInfo() {
      setLoading(true);

      try {
        const result = await getProjectSidebarData(projectId!);
        setData(result);
      } catch (error) {
        console.error("Failed to load project sidebar:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadProjectInfo();
  }, [projectId, chatId]);

  const showProjectInfo = Boolean(projectId && chatId);

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l border-slate-200 bg-white xl:flex">
      {/* Header */}
      <header className="h-[73px] border-b border-[#BD9655] px-6 flex items-center justify-center bg-white">
        <h2 className="font-semibold text-slate-900">
          {LABELS.projectInfo}
        </h2>
      </header>

      {!showProjectInfo ? (
        <EmptyProjectInfo />
      ) : loading ? (
        <div className="flex-1 p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-16 rounded-lg bg-slate-100" />
            <div className="h-16 rounded-lg bg-slate-100" />
            <div className="h-16 rounded-lg bg-slate-100" />
            <div className="h-16 rounded-lg bg-slate-100" />
          </div>
        </div>
      ) : !data ? (
        <EmptyProjectInfo />
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {/* Project status */}
          <InfoCard
            icon={<Building2 size={16} />}
            label={LABELS.status}
            value={data.project.status ?? "—"}
          />

          {/* Deadline */}
          <InfoCard
            icon={<Calendar size={16} />}
            label={LABELS.deadline}
            value={
              data.project.end_date
                ? new Date(data.project.end_date).toLocaleDateString(
                    "pt-PT",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
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
            value={data.recentFile?.name ?? "—"}
          />

          <div className="my-4 h-px bg-slate-200" />

          {/* Team Members */}
          {data.members.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Membros da Equipa
              </h3>

              <div className="space-y-3">
                {data.members.map(({ profile, role }) => {
                  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
                  const name =
                    fullName ||
                    profile.first_name ||
                    "Utilizador";

                  const initials = name
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={profile.profile_id}
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
                          {role ?? "Membro"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}