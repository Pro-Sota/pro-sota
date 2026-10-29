"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/app/lib/supabase/client";

const PRESENCE_CHANNEL = "prosota:online-users";

export function useOnlineUsers(profileId: string | null | undefined) {
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
        () => new Set(),
    );

    useEffect(() => {
        if (!profileId) {
            setOnlineUserIds(new Set());
            return;
        }

        const supabase = createClient();
        let active = true;
        let channel: RealtimeChannel | null = null;
        const start = async () => {
            // 👇 NEW: add this as the first line
            await supabase.realtime.setAuth();

            const stale = supabase
                .getChannels()
                .find((c) => c.topic === `realtime:${PRESENCE_CHANNEL}`);

            if (stale) {
                await supabase.removeChannel(stale);
            }

            if (!active) return;

            const ch = supabase.channel(PRESENCE_CHANNEL, {
                config: {
                    private: true,
                    presence: { key: profileId },
                },
            });
            channel = ch;

            const syncOnlineUsers = () => {
                if (!active) return;
                setOnlineUserIds(new Set(Object.keys(ch.presenceState())));
            };

            ch.on("presence", { event: "sync" }, syncOnlineUsers)
                .on("presence", { event: "join" }, syncOnlineUsers)
                .on("presence", { event: "leave" }, syncOnlineUsers);

            let tracked = false;

            ch.subscribe(async (status, error) => {
                if (!active) return;

                if (status === "SUBSCRIBED") {
                    if (tracked) return;
                    tracked = true;

                    try {
                        const result = await ch.track({
                            profile_id: profileId,
                            online_at: new Date().toISOString(),
                        });
                        if (!active) return;

                        if (result !== "ok") {
                            console.error("[Presence] Failed to track user:", result);
                            return;
                        }
                        syncOnlineUsers();
                    } catch (trackError) {
                        if (active) {
                            console.error("[Presence] Failed to track user:", trackError);
                        }
                    }
                    return;
                }

                if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                    console.error(
                        "[Presence] Channel error:",
                        status,
                        error?.message ?? error,
                    );
                    setOnlineUserIds(new Set());
                    return;
                }

                if (status === "CLOSED") {
                    setOnlineUserIds(new Set());
                }
            });
        };

        void start();

        return () => {
            active = false;
            if (channel) void supabase.removeChannel(channel);
        };
    }, [profileId]);

    const isOnline = useCallback(
        (id: string | null | undefined) => Boolean(id && onlineUserIds.has(id)),
        [onlineUserIds],
    );

    return { onlineUserIds, isOnline };
}