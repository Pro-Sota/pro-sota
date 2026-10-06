"use client";

import { Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import type { TaskMember } from "../types";
import {
  getAvatarColor,
  getInitials,
} from "../utils/avatar";

type TaskMembersProps = {
  members?: TaskMember[];
  availableMembers: TaskMember[];
  onAdd: (member: TaskMember) => void;
  onRemove: (profileId: string) => void;
};

export default function TaskMembers({
  members = [],
  availableMembers = [],
  onAdd,
  onRemove,
}: TaskMembersProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return availableMembers
      .filter(
        (member) =>
          !members.some(
            (selected) =>
              selected.profileId === member.profileId,
          ),
      )
      .filter((member) => {
        if (!query) {
          return true;
        }

        const name =
          `${member.firstName ?? ""} ${member.lastName ?? ""}`
            .trim()
            .toLowerCase();

        return name.includes(query);
      })
      .slice(0, 6);
  }, [availableMembers, members, search]);

  function handleToggleAdd() {
    setIsAdding((current) => {
      if (current) {
        setSearch("");
      }

      return !current;
    });
  }

  function handleSelect(member: TaskMember) {
    onAdd(member);
    setSearch("");
    setIsAdding(false);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Membros
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Atribua esta tarefa a um ou mais membros.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleAdd}
          aria-label={
            isAdding
              ? "Fechar pesquisa de membros"
              : "Adicionar membro"
          }
          title={
            isAdding
              ? "Fechar pesquisa"
              : "Adicionar membro"
          }
          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
            isAdding
              ? "border-gray-300 bg-gray-100 text-gray-800"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          {isAdding ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Add member */}
      {isAdding && (
        <div className="relative">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              autoFocus
              placeholder="Pesquisar membro..."
              aria-label="Pesquisar membro"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>

          {filteredMembers.length > 0 ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              {filteredMembers.map((member) => {
                const name =
                  `${member.firstName ?? ""} ${member.lastName ?? ""}`
                    .trim();

                return (
                  <button
                    key={member.profileId}
                    type="button"
                    onClick={() =>
                      handleSelect(member)
                    }
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-gray-50"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${getAvatarColor()}`}
                    >
                      {getInitials(
                        member.firstName,
                        member.lastName,
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-800">
                        {name || "Membro sem nome"}
                      </span>
                    </span>

                    <Plus className="h-4 w-4 shrink-0 text-gray-400" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-xs text-gray-400">
              {search.trim()
                ? "Nenhum membro encontrado."
                : availableMembers.length === 0
                  ? "Nenhum membro disponível."
                  : "Todos os membros já foram atribuídos."}
            </div>
          )}
        </div>
      )}

      {/* Assigned members */}
      {members.length === 0 ? (
        <p className="text-sm text-slate-400">
          Sem membros atribuídos.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {members.map((member) => {
            const name =
              `${member.firstName ?? ""} ${member.lastName ?? ""}`
                .trim();

            return (
              <span
                key={member.profileId}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white ${getAvatarColor()}`}
                >
                  {getInitials(
                    member.firstName,
                    member.lastName,
                  )}
                </span>

                <span className="max-w-40 truncate text-xs font-medium text-slate-700">
                  {name || "Membro"}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onRemove(member.profileId)
                  }
                  aria-label={`Remover ${name || "membro"}`}
                  title={`Remover ${name || "membro"}`}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}