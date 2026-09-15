import Link from "next/link";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { IoIosDocument } from "react-icons/io";
import { Download, ExternalLink, Clock, ArrowUpRight } from "lucide-react";
import { useMemo } from "react";

import { Database } from "@/app/lib/supabase/models";

type Document = Database["public"]["Tables"]["documents"]["Row"];

const DOCUMENT_ICON_MAP: Record<
  string,
  { icon: React.ReactNode; color: string; label: string }
> = {
  pdf: {
    icon: <FaFilePdf className="h-6 w-6" />,
    color: "bg-red-50 text-red-600",
    label: "PDF",
  },
  docx: {
    icon: <FaFileWord className="h-6 w-6" />,
    color: "bg-blue-50 text-blue-600",
    label: "DOCX",
  },
  doc: {
    icon: <FaFileWord className="h-6 w-6" />,
    color: "bg-blue-50 text-blue-600",
    label: "DOC",
  },
  default: {
    icon: <IoIosDocument className="h-6 w-6" />,
    color: "bg-slate-100 text-slate-600",
    label: "Document",
  },
};

interface DocumentCardProps {
  document: Document;
  onDownload?: (documentName: string) => void;
}

function formatDate(dateString: string | null) {
  if (!dateString) return null;

  const date = new Date(dateString);
  const now = new Date();

  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function DocumentCard({
  document,
  onDownload,
}: DocumentCardProps) {
  const fileExtension = useMemo(
    () => document.name.split(".").pop()?.toLowerCase() || "default",
    [document.name]
  );

  const fileInfo = useMemo(
    () => DOCUMENT_ICON_MAP[fileExtension] || DOCUMENT_ICON_MAP.default,
    [fileExtension]
  );

  const createdDate = useMemo(
    () => formatDate(document.created_at),
    [document.created_at]
  );

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDownload?.(document.name);
  };

  return (
    <article
      className="group flex h-full min-h-[210px] w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
      aria-label={`Document: ${document.name}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${fileInfo.color}`}
          aria-hidden="true"
        >
          {fileInfo.icon}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors group-hover:bg-slate-100 group-hover:text-slate-700">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      {/* Information */}
      <div className="mt-5 flex flex-1 flex-col">
        <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {fileInfo.label}
        </span>

        <h3
          className="line-clamp-2 text-[15px] font-semibold leading-5 text-slate-900"
          title={document.name}
        >
          {document.name}
        </h3>

        {createdDate && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{createdDate}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <button
          onClick={handleDownload}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2 active:scale-[0.98]"
          aria-label={`Download ${document.name}`}
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download</span>
        </button>

        <Link
          href=""
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2 active:scale-[0.98]"
          aria-label={`Open ${document.name}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Open</span>
        </Link>
      </div>
    </article>
  );
}