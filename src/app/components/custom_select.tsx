
"use client";

import { ChevronDown } from "lucide-react";

export default function CustomSelect({
    children,
    className = "",
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className="relative">
            <select
                {...props}
                className={`
        w-full appearance-none rounded-lg
        border border-white/15
        bg-white/[0.06]
        px-4 py-3 pr-10
        text-sm text-[#F7F7F5]
        outline-none
        transition-colors duration-200
        hover:border-white/25
        focus:border-[#BD9655]
        focus:ring-2 focus:ring-[#BD9655]/15
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
    `}
            >
                {children}
            </select>

            <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BD9655]"
            />
        </div>
    );
}
