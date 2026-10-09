"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Clock,
  Download,
  FileText,
  Loader2,
} from "lucide-react";

import { createClient } from "@/app/lib/supabase/client";
import type { Database } from "@/app/lib/supabase/models";

type Document =
  Database["public"]["Tables"]["documents"]["Row"];

interface DocumentCardProps {
  document: Document;
}

function formatDate(value: string | null) {
  if (!value) return "Data desconhecida";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data desconhecida";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getFileExtension(name: string) {
  const extension = name.split(".").pop();

  return extension && extension !== name
    ? extension.toUpperCase()
    : "FICHEIRO";
}

export default function DocumentCard({
  document,
}: DocumentCardProps) {
  const [opening, setOpening] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getSignedUrl(download = false) {
    const supabase = createClient();

    const { data, error: storageError } = await supabase.storage
      .from("documents")
      .createSignedUrl(
        document.file_path,
        60,
        download
          ? { download: document.name }
          : undefined,
      );

    if (storageError || !data?.signedUrl) {
      throw new Error(
        storageError?.message ??
          "Não foi possível aceder ao documento.",
      );
    }

    return data.signedUrl;
  }

  async function handleOpen() {
    setError(null);
    setOpening(true);

    try {
      const url = await getSignedUrl();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Não foi possível abrir o documento.");
    } finally {
      setOpening(false);
    }
  }

  async function handleDownload() {
    setError(null);
    setDownloading(true);

    try {
      const url = await getSignedUrl(true);
      window.location.assign(url);
    } catch {
      setError("Não foi possível descarregar o documento.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <article className="group flex min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:border-[#BD9655]/60 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#002950]/5 text-[#002950]">
          <FileText size={22} aria-hidden="true" />
        </div>

        <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-gray-600">
          {getFileExtension(document.name)}
        </span>
      </div>

      <h3
        className="mt-4 truncate text-sm font-semibold text-gray-900"
        title={document.name}
      >
        {document.name}
      </h3>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
        <Clock size={13} aria-hidden="true" />
        <span>Actualizado em {formatDate(document.updated_at)}</span>
      </div>

      <p className="mt-1 text-xs text-gray-500">
        Versão {document.version ?? 1}
      </p>

      {error && (
        <p role="alert" className="mt-3 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={handleOpen}
          disabled={opening || downloading}
          className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#002950] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#003968] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {opening ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ArrowUpRight size={14} />
          )}
          Abrir
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={opening || downloading}
          aria-label={`Descarregar ${document.name}`}
          title="Descarregar documento"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Download size={15} />
          )}
        </button>
      </div>
    </article>
  );
}
