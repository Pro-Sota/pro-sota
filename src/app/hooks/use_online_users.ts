"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

const PRESENCE_CHANNEL = "prosota:online-users";

export function useOnlineUsers(
    profileId: string | null | undefined,
) {
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
        let subscribed = false;

        console.log("[Presence] Creating channel", {
            profileId,
            topic: PRESENCE_CHANNEL,
        }); 

        const channel = supabase.channel(PRESENCE_CHANNEL, {
            config: {
                private: true,
                presence: {
                    key: profileId,
                },
            },
        });

        const syncOnlineUsers = () => {
            if (!active) return;

            const ids = Object.keys(channel.presenceState());
            setOnlineUserIds(new Set(ids));
        };

        // Register all callbacks before subscribing.
        channel
            .on("presence", { event: "sync" }, syncOnlineUsers)
            .on("presence", { event: "join" }, syncOnlineUsers)
            .on("presence", { event: "leave" }, syncOnlineUsers);

        console.log("[Presence] Callbacks registered; subscribing");

        channel.subscribe(async (status, error) => {
            if (!active) return;

            console.log("[Presence] Channel status:", status);

            if (status === "SUBSCRIBED") {
                if (subscribed) return;
                subscribed = true;

                try {
                    const result = await channel.track({
                        profile_id: profileId,
                        online_at: new Date().toISOString(),
                    });

                    if (!active) return;

                    if (result !== "ok") {
                        console.error(
                            "[Presence] Failed to track user:",
                            result,
                        );
                        return;
                    }

                    syncOnlineUsers();
                } catch (trackError) {
                    if (!active) return;

                    console.error(
                        "[Presence] Failed to track user:",
                        trackError,
                    );
                }

                return;
            }

            if (
                status === "CHANNEL_ERROR" ||
                status === "TIMED_OUT" ||
                status === "CLOSED"
            ) {
                console.error("[Presence] Channel error:", {
                    status,
                    error,
                });

                setOnlineUserIds(new Set());
            }
        });

        return () => {
            active = false;

            console.log("[Presence] Removing channel", {
                profileId,
                topic: PRESENCE_CHANNEL,
            });

            void supabase.removeChannel(channel);
        };
    }, [profileId]);

    const isOnline = useCallback(
        (id: string | null | undefined) =>
            Boolean(id && onlineUserIds.has(id)),
        [onlineUserIds],
    );

    return {
        onlineUserIds,
        isOnline,
    };
}