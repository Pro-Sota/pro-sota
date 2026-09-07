"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { TeamMember, SelectableTeamMember, INPUT_STYLE } from "../types";

interface TeamMemberSelectorProps {
  members: SelectableTeamMember[];
  onChange: (members: SelectableTeamMember[]) => void;
}

/**
 * Team member selector with search functionality
 */
export function TeamMemberSelector({
  members,
  onChange,
}: TeamMemberSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    const timeout = setTimeout(async () => {
      if (!trimmed) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("profile_id,first_name,last_name,email,avatar_url")
          .or(
            `first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`
          )
          .limit(8);

        if (!error && data) {
          setResults(data as unknown as TeamMember[]);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, trimmed ? 300 : 0);

    return () => clearTimeout(timeout);
  }, [query, supabase]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function addMember(member: TeamMember) {
    if (members.some((m) => m.profile_id === member.profile_id)) return;
    onChange([...members, member]);
    setQuery("");
    setResults([]);
  }

  function removeMember(profile_id: string) {
    onChange(members.filter((m) => m.profile_id !== profile_id));
  }

  return (
    <div ref={wrapperRef} className="space-y-1">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          name="teamMemberSearch"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
          }}
          placeholder="Procurar utilizadores..."
          className={`${INPUT_STYLE} pl-10`}
        />
      </div>

      {/* Dropdown Results */}
      {open && query.trim() && (
        <div className="absolute z-20 w-full max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              A procurar...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">
              Nenhum utilizador encontrado.
            </div>
          )}

          {!loading &&
            results.map((user) => (
              <button
                key={user.profile_id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addMember(user)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B3A5C]/10 text-xs font-semibold text-[#1B3A5C]">
                  {(user.first_name || "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {user.first_name} {user.last_name}
                  </p>
                  {user.email && (
                    <p className="truncate text-xs text-slate-400">
                      {user.email}
                    </p>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}

      {/* Selected Members */}
      {members.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {members.map((member) => (
            <span
              key={member.profile_id}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1B3A5C]/15 bg-[#1B3A5C]/5 px-3 py-1 text-xs font-medium text-[#1B3A5C]"
            >
              {`${member.first_name} ${member.last_name}`}
              <button
                type="button"
                onClick={() => removeMember(member.profile_id)}
                className="cursor-pointer text-current opacity-60 transition hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}