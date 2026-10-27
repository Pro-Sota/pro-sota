"use client";

import {
    createContext,
    useContext,
    type ReactNode,
} from "react";

import { useOnlineUsers } from "@/app/hooks/use_online_users";

type OnlineUsersContextValue = ReturnType<typeof useOnlineUsers>;

const OnlineUsersContext =
    createContext<OnlineUsersContextValue | null>(null);

interface OnlineUsersProviderProps {
    profileId: string | null | undefined;
    children: ReactNode;
}

export function OnlineUsersProvider({
    profileId,
    children,
}: OnlineUsersProviderProps) {
    const presence = useOnlineUsers(profileId);

    return (
        <OnlineUsersContext.Provider value={presence}>
            {children}
        </OnlineUsersContext.Provider>
    );
}

export function useOnlineUsersContext() {
    const context = useContext(OnlineUsersContext);

    if (!context) {
        throw new Error(
            "useOnlineUsersContext must be used inside OnlineUsersProvider.",
        );
    }

    return context;
}