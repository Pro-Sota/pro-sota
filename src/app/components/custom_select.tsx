"use client0";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Select({
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {

    const [open, setOpen] = useState(false);

    const inputStyle =
        "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10";

    return (
        <div className="relative">
            <select {...props}
                className={`${inputStyle} appearance-none pr-10`}
                onMouseDown={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onChange={(e) => {
                    setOpen(false);
                    props.onChange?.(e);
                }}
            >
                {children}
            </select>
            <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform duration-300 ${open ? "rotate-[180deg]" : ""}`} />
        </div>
    );
}