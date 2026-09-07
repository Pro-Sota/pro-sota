import Link from "next/link";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { IoIosDocument } from "react-icons/io";
import { useMemo } from "react";

import { Database } from "@/app/lib/supabase/models";

type Document = Database["public"]["Tables"]["documents"]["Row"];

// Extract constants
const ICON_CLASSES = "h-10 w-10 text-slate-600 transition-transform duration-300 group-hover:scale-110";
const DOCUMENT_ICON_MAP: Record<string, React.ReactNode> = {
  pdf: <FaFilePdf className={ICON_CLASSES} />,
  docx: <FaFileWord className={ICON_CLASSES} />,
  default: <IoIosDocument className={ICON_CLASSES} />,
};

interface DocumentCardProps {
  document: Document;
  onDownload?: (documentName: string) => void;
}

export default function DocumentCard({ document, onDownload }: DocumentCardProps) {
  const fileExtension = useMemo(() => {
    return document.name.split(".").pop()?.toLowerCase() || "default";
  }, [document.name]);

  const documentIcon = DOCUMENT_ICON_MAP[fileExtension] || DOCUMENT_ICON_MAP.default;

  const handleDownload = () => {
    onDownload?.(document.name);
  };

  return (
    <div
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
      role="article"
      aria-label={`Document: ${document.name}`}
    >
      {/* Background Accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-500 to-yellow-600" />

      {/* Icon */}
      <div
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-slate-100"
        aria-hidden="true"
      >
        {documentIcon}
      </div>

      {/* Title */}
      <h3 className="mx-2 mb-2 line-clamp-2 text-sm font-semibold text-slate-800">
        {document.name}
      </h3>

      {/* Actions */}
      <div className="mt-auto flex w-full gap-2 flex-col sm:flex-row">
        <button
          onClick={handleDownload}
          className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-slate-700 active:bg-slate-800 sm:px-4 sm:text-sm"
          aria-label={`Download ${document.name}`}
        >
          Download
        </button>

        <Link
          href={""} // Use actual URL from document
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-medium text-slate-600 transition hover:bg-slate-100 sm:px-4 sm:text-sm"
          aria-label={`Open ${document.name} in new tab`}
        >
          Open
        </Link>
      </div>
    </div>
  );
}