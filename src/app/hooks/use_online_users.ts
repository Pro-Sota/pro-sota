
"use client";

import { useEffect, useState } from "react";
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

      const presenceState = channel.presenceState();
      setOnlineUserIds(new Set(Object.keys(presenceState)));
    };

    channel
      .on("presence", { event: "sync" }, syncOnlineUsers)
      .on("presence", { event: "join" }, syncOnlineUsers)
      .on("presence", { event: "leave" }, syncOnlineUsers)
      .subscribe(async (status, error) => {
        if (!active) return;

        if (status === "SUBSCRIBED") {
          const trackStatus = await channel.track({
            profile_id: profileId,
            online_at: new Date().toISOString(),
          });

          if (trackStatus !== "ok") {
            console.error(
              "[Presence] Failed to track user:",
              trackStatus,
            );
          }

          syncOnlineUsers();
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("[Presence] Channel error:", error);
          setOnlineUserIds(new Set());
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [profileId]);

  return {
    onlineUserIds,
    isOnline: (id: string | null | undefined) =>
      Boolean(id && onlineUserIds.has(id)),
  };
}
