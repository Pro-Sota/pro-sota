"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
    children: ReactNode;
    className?: string;
    pendingLabel?: string;
};

export default function FormSubmitButton({
    children,
    className,
    pendingLabel = "A guardar...",
}: Props) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-disabled={pending}
            className={className}
        >
            {pending ? pendingLabel : children}
        </button>
    );
}