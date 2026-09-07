"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";


export default function LogoutButton() {
    const expanded = true;
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error("Logout failed:", error);
                return;
            }

            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error("Unexpected logout error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            aria-label="Logout"
            title={expanded ? undefined : "Logout"}
            className={`
                group flex w-full items-center rounded-md
                text-gray-300 transition-all duration-300
                hover:text-[#BD9655] focus:outline-none focus:ring-2 focus:ring-[#BD9655]
                disabled:cursor-not-allowed disabled:opacity-60
                ${expanded
                    ? "gap-3 px-3 py-2"
                    : "justify-center p-3"
                }
            `}
        >
            {loading ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-gray-400" />
            ) : (
                <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-[#BD9655]" />
            )}

            <span
                className={`
                    overflow-hidden whitespace-nowrap
                    transition-all duration-300
                    ${expanded
                        ? "max-w-full opacity-100"
                        : "max-w-0 opacity-0"
                    }
                `}
            >
                {loading ? "Logging out..." : "Logout"}
            </span>
        </button>
    );
}