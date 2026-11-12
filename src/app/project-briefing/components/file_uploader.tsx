"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

import {
  ACCEPT,
  ALLOWED_EXTENSIONS,
  ALLOWED_TYPES,
  MAX_FILE_MB,
  MAX_FILE_SIZE,
  MAX_FILES,
  MAX_RAW_MB,
  MAX_RAW_SIZE,
} from "../constants";
import { fileInputCls, focusOutline, hintCls } from "../styles";

const isAllowed = (f: File) =>
  ALLOWED_TYPES.includes(f.type) ||
  (f.type === "" && ALLOWED_EXTENSIONS.test(f.name));

const isHeic = (f: File) =>
  /heic|heif/.test(f.type) || /\.(heic|heif)$/i.test(f.name);

async function compressImage(file: File): Promise<File> {
  const compressible = /^image\/(jpeg|png|webp)$/.test(file.type);
  if (!compressible || isHeic(file) || file.size < 1_000_000) return file;

  try {
    const { default: imageCompression } = await import("browser-image-compression");
    const out = await imageCompression(file, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 2400,
      useWebWorker: true,
    });
    if (out.size >= file.size) return file;
    return new File([out], file.name, {
      type: out.type || file.type,
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}

export function FileUploader({
  files,
  onChange,
  note,
  ariaLabel,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  note: string;
  ariaLabel: string;
}) {
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  async function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = ""; // allows picking the same file again
    if (!picked.length) return;

    setBusy(true);
    const issues: string[] = [];
    const next = [...files];

    for (const original of picked) {
      if (next.length >= MAX_FILES) {
        issues.push(`Máximo de ${MAX_FILES} ficheiros.`);
        break;
      }
      if (!isAllowed(original)) {
        issues.push(`"${original.name}" não é JPG, PNG, WEBP, HEIC ou PDF.`);
        continue;
      }
      if (!original.size) {
        issues.push(`"${original.name}" está vazio.`);
        continue;
      }
      if (original.size > MAX_RAW_SIZE) {
        issues.push(`"${original.name}" excede ${MAX_RAW_MB} MB.`);
        continue;
      }
      if (
        next.some(
          (f) => f.name === original.name && f.lastModified === original.lastModified
        )
      )
        continue;

      const file = await compressImage(original);

      if (file.size > MAX_FILE_SIZE) {
        issues.push(`"${original.name}" excede o limite de ${MAX_FILE_MB} MB.`);
        continue;
      }
      next.push(file);
    }

    setProblem(issues.join(" "));
    onChange(next);
    setBusy(false);
  }

  function removeFile(index: number) {
    setProblem("");
    onChange(files.filter((_, i) => i !== index));
  }

  const full = files.length >= MAX_FILES;

  return (
    <>
      <input
        className={fileInputCls}
        type="file"
        multiple
        accept={ACCEPT}
        onChange={handlePick}
        aria-label={ariaLabel}
        disabled={full || busy}
      />

      <p className={hintCls}>{note}</p>

      <p className="text-xs text-[#8b6a2f]" aria-live="polite">
        {busy
          ? "A preparar ficheiros..."
          : full
            ? "Atingiu o limite de ficheiros. Remova um para adicionar outro."
            : ""}
      </p>

      {problem && (
        <p className="m-0 text-xs leading-normal text-[#8d2f25]" role="alert">
          {problem}
        </p>
      )}

      {files.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-[9px] p-0">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center justify-between gap-3 rounded border border-[#ecebe7] bg-[#fafaf8] px-3 py-2.5 text-xs text-[#505960]"
            >
              <span className="min-w-0 break-all">
                {file.name}
                <small className="ml-1 text-[#8e9395]">
                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </small>
              </span>

              <button
                type="button"
                className={`shrink-0 cursor-pointer border-0 bg-transparent text-[#8b5d27] underline ${focusOutline}`}
                onClick={() => removeFile(index)}
                aria-label={`Remover ${file.name}`}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}