
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createClient } from "@/app/lib/supabase/client";

export type UnreadCounts = {
    /** All unread notifications (messages included). */
    notifications: number;
    /** Unread notifications of type "message". */
    messages: number;
};

const EMPTY: UnreadCounts = {
    notifications: 0,
    messages: 0,
};

// Ensures that separate effect instances never reuse a Realtime topic.
let channelSequence = 0;

/**
 * Live unread counters for the sidebar badges.
 *
 * Counts come from public.notifications and refresh through Supabase
 * Realtime (insert / update / delete) and when the tab regains focus.
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
                .select("notification_id", {
                    count: "exact",
                    head: true,
                })
                .eq("recipient_id", userId)
                .eq("is_read", false)
                .or(`expires_at.is.null,expires_at.gt.${now}`);

        const [all, messages] = await Promise.all([
            base(),
            base().eq("type", "message"),
        ]);

        if (all.error || messages.error) {
            console.error(
                "Unread counts failed:",
                all.error ?? messages.error,
            );
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
        let userId: string | null = null;
        let timer: ReturnType<typeof setTimeout> | undefined;

        let channel: ReturnType<typeof supabase.channel> | null = null;

        const scheduleRefresh = () => {
            if (cancelled || !userId) return;

            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                if (!cancelled && userId) {
                    void refresh(userId);
                }
            }, 250);
        };

        const onFocus = () => {
            scheduleRefresh();
        };

        const initialise = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (cancelled) return;

            if (error || !data.user) {
                setCounts(EMPTY);
                return;
            }

            userId = data.user.id;

            // Register every Realtime callback before subscribe().
            const channelName =
                `unread-counts:${userId}:${++channelSequence}`;

            channel = supabase
                .channel(channelName)
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "notifications",
                        filter: `recipient_id=eq.${userId}`,
                    },
                    scheduleRefresh,
                );

            // Subscribe only after all callbacks have been registered.
            channel.subscribe();

            window.addEventListener("focus", onFocus);

            // Fetch the initial counts after Realtime is configured.
            await refresh(userId);

            if (cancelled) return;
        };

        void initialise();

        return () => {
            cancelled = true;

            if (timer) {
                clearTimeout(timer);
            }

            window.removeEventListener("focus", onFocus);

            if (channel) {
                void supabase.removeChannel(channel);
                channel = null;
            }
        };
    }, [refresh]);

    return counts;
}
