"use client";

import { MoreVertical, User, Calendar } from "lucide-react";
import { useState } from "react";
import { Submission, SubmissionStatus, TYPE_ICONS, TYPE_LABELS } from "./types";
import { daysUntilDue, formatDate, isOverdue } from "./utils";

type SubmissionCardProps = {
  submission: Submission;
  onStatusChange: (status: SubmissionStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function SubmissionCard({
  submission,
  onStatusChange,
  onEdit,
  onDelete,
}: SubmissionCardProps) {
  const TypeIcon = TYPE_ICONS[submission.type];
  const daysLeft = daysUntilDue(submission.due_date);
  const overdue = isOverdue(submission.due_date, submission.status);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">
            {submission.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
              <TypeIcon size={12} />
              {TYPE_LABELS[submission.type]}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 last:rounded-b-lg"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {submission.description && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {submission.description}
        </p>
      )}

      {/* Footer */}
      <div className="space-y-3 pt-3 border-t border-gray-100">
        {/* Submitted by and date */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <User size={12} />
          <span>{submission.submitted_by}</span>
          <span>•</span>
          <span>{formatDate(submission.submitted_date)}</span>
        </div>

        {/* Due date with urgency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar size={12} className={overdue ? "text-red-600" : "text-gray-400"} />
            <span className={overdue ? "text-red-600 font-medium" : "text-gray-600"}>
              {overdue ? `${Math.abs(daysLeft)} dias atrasado` : `${daysLeft} dias`}
            </span>
          </div>
          <span className="text-xs text-gray-500">{formatDate(submission.due_date)}</span>
        </div>

        {/* Status transitions */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status as SubmissionStatus)}
              disabled={submission.status === status}
              className="text-xs px-2 py-1.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-default
                         enabled:hover:opacity-80 enabled:cursor-pointer
                         bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              {status === "pending" && "Revisão"}
              {status === "approved" && "✓ Aprovar"}
              {status === "rejected" && "✗ Rejeitar"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}