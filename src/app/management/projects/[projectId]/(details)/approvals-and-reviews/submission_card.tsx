"use client";

import {
    MoreVertical,
    User,
    Calendar,
} from "lucide-react";
import { useState } from "react";

import type {
    Submission,
    SubmissionStatus,
    SubmissionType,
} from "@/services/submissions";

import {
    TYPE_ICONS,
    TYPE_LABELS,
} from "./types";

import {
    daysUntilDue,
    formatDate,
    isOverdue,
} from "./utils";

type SubmissionCardProps = {
    submission: Submission;
    onStatusChangeAction: (status: SubmissionStatus) => void;
    onEditAction: () => void;
    onDeleteAction: () => void;
};

export default function SubmissionCard({
    submission,
    onStatusChangeAction,
    onEditAction,
    onDeleteAction,
}: SubmissionCardProps) {
    const TypeIcon =
        TYPE_ICONS[submission.type as keyof typeof TYPE_ICONS];

    const daysLeft = daysUntilDue(
        submission.due_date ?? ""
    );

    const overdue = isOverdue(
        submission.due_date ?? "",
        submission.status,
    );

    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                        {submission.title}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <div className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {TypeIcon && (
                                <TypeIcon size={12} />
                            )}

                            {TYPE_LABELS[
                                submission.type as keyof typeof TYPE_LABELS
                            ] ?? submission.type}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        type="button"
                        aria-label="Mais opções"
                        onClick={() =>
                            setShowMenu((value) => !value)
                        }
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                            <button
                                type="button"
                                onClick={() => {
                                    onEditAction();
                                    setShowMenu(false);
                                }}
                                className="block w-full rounded-t-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    onDeleteAction();
                                    setShowMenu(false);
                                }}
                                className="block w-full rounded-b-lg px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                            >
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            {submission.description && (
                <p className="mb-3 line-clamp-2 text-xs text-gray-600">
                    {submission.description}
                </p>
            )}

            {/* Footer */}
            <div className="space-y-3 border-t border-gray-100 pt-3">
                {/* Submitted by and date */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User size={12} />

                    <span>
                        {submission.submitted_by_name ||
                            submission.submitted_by}
                    </span>

                    {submission.submitted_at && (
                        <>
                            <span>•</span>

                            <span>
                                {formatDate(
                                    submission.submitted_at,
                                )}
                            </span>
                        </>
                    )}
                </div>

                {/* Due date with urgency */}
                {submission.due_date && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs">
                            <Calendar
                                size={12}
                                className={
                                    overdue
                                        ? "text-red-600"
                                        : "text-gray-400"
                                }
                            />

                            <span
                                className={
                                    overdue
                                        ? "font-medium text-red-600"
                                        : "text-gray-600"
                                }
                            >
                                {overdue
                                    ? `${Math.abs(daysLeft)} dias atrasado`
                                    : daysLeft === 0
                                      ? "Vence hoje"
                                      : `${daysLeft} dias`}
                            </span>
                        </div>

                        <span className="text-xs text-gray-500">
                            {formatDate(
                                submission.due_date,
                            )}
                        </span>
                    </div>
                )}

                {/* Status transitions */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {(
                        [
                            "pending",
                            "approved",
                            "rejected",
                        ] as SubmissionStatus[]
                    ).map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() =>
                                onStatusChangeAction(status)
                            }
                            disabled={
                                submission.status ===
                                status
                            }
                            className="cursor-pointer rounded-lg bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200 enabled:hover:opacity-80 disabled:cursor-default disabled:opacity-50"
                        >
                            {status === "pending" &&
                                "Revisão"}

                            {status === "approved" &&
                                "✓ Aprovar"}

                            {status === "rejected" &&
                                "✗ Rejeitar"}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}