"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function LogoutButton({
    expanded,
}: {
    expanded: boolean;
}) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }

        router.replace("/");
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            aria-label="Logout"
            title="Logout"
            className={`group flex items-center w-full rounded-md text-gray-300 hover:text-white transition-all duration-300 cursor-pointer hover:bg-neutral-800
                 ${expanded ? "px-3 py-2 gap-3" : "justify-center p-3"}`} >
            <LogOut className="h-5 w-5 flex-shrink-0 text-gray-400" />
            <span
                className={`overflow-hidden whitespace-nowrap   transition-all duration-300 ${expanded
                    ? "opacity-100 max-w-full"
                    : "opacity-0 max-w-0"
                    }`}>
                Logout
            </span>
        </button>
    );
}