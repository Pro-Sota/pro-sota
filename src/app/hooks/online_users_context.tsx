// OnlineUsersProvider.tsx
"use client";

import { createContext, useContext } from "react";
import { useOnlineUsers } from "@/app/hooks/use_online_users";

type Ctx = ReturnType<typeof useOnlineUsers>;
const OnlineUsersContext = createContext<Ctx | null>(null);

export function OnlineUsersProvider({
    profileId,
    children,
}: {
    profileId: string | null | undefined;
    children: React.ReactNode;
}) {
    const value = useOnlineUsers(profileId);
    return (
        <OnlineUsersContext.Provider value={value}>
            {children}
        </OnlineUsersContext.Provider>
    );
}

export function useOnlineUsersContext() {
    const ctx = useContext(OnlineUsersContext);
    if (!ctx) throw new Error("Wrap your app in <OnlineUsersProvider>");
    return ctx;
}