"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createClient } from "@/app/lib/supabase/client";

export type UnreadCounts = {
  /** All unread notifications (messages included). */
  notifications: number;
  /** Unread notifications of type "message". */
  messages: number;
};

const EMPTY: UnreadCounts = { notifications: 0, messages: 0 };

/**
 * Live unread counters for the sidebar badges.
 * Counts come from public.notifications and refresh through Supabase Realtime
 * (insert / update / delete) and when the tab regains focus.
 *
 * Save as: app/hooks/use-unread-counts.ts
 */
export function useUnreadCounts(): UnreadCounts {
  const [counts, setCounts] = useState<UnreadCounts>(EMPTY);
  const supabaseRef = useRef(createClient());

  const refresh = useCallback(async (userId: string) => {
    const supabase = supabaseRef.current;

    const now = new Date().toISOString();

    const base = () =>
      supabase
        .from("notifications")
        .select("notification_id", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .eq("is_read", false)
        .or(`expires_at.is.null,expires_at.gt.${now}`);

    const [all, messages] = await Promise.all([
      base(),
      base().eq("type", "message"),
    ]);

    if (all.error || messages.error) {
      console.error("Unread counts failed:", all.error ?? messages.error);
      return;
    }

    setCounts({
      notifications: all.count ?? 0,
      messages: messages.count ?? 0,
    });
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let userId: string | null = null;

    // Debounce bursts of events into a single refetch.
    const scheduleRefresh = () => {
      if (!userId) return;
      clearTimeout(timer);
      timer = setTimeout(() => userId && refresh(userId), 250);
    };

    const onFocus = () => scheduleRefresh();

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;

      // ASSUMPTION: profiles.profile_id === auth user id
      userId = data.user.id;
      await refresh(userId);

      channel = supabase
        .channel(`unread-counts:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${userId}`,
          },
          scheduleRefresh,
        )
        .subscribe();

      window.addEventListener("focus", onFocus);
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      if (channel) supabase.removeChannel(channel);
    };
  }, [refresh]);

  return counts;
}