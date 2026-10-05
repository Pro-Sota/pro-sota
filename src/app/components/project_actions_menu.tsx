
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Archive,
  FileText,
  FolderOpen,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Users,
} from "lucide-react";

import { projectRoutes } from "./project_helpers";

interface ProjectActionsMenuProps {
  projectId: string | number;
  projectTitle: string;
  /** "overlay" sits on top of an image, "plain" sits on a white row. */
  variant?: "overlay" | "plain";
  /** When omitted, the "Arquivar projecto" item is hidden. */
  onArchive?: (projectId: string | number) => void;
}

const itemClass =
  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none";

export default function ProjectActionsMenu({
  projectId,
  projectTitle,
  variant = "plain",
  onArchive,
}: ProjectActionsMenuProps) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const routes = projectRoutes(projectId);

  const getItems = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
        [],
    );

  /* Focus the first item on open */
  useEffect(() => {
    if (open) getItems()[0]?.focus();
  }, [open]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const close = (returnFocus = false) => {
    setOpen(false);

    if (returnFocus) triggerRef.current?.focus();
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    const items = getItems();
    const index = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        items[(index + 1) % items.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        items[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        close();
        break;
    }
  };

  const triggerStyle =
    variant === "overlay"
      ? "border border-gray-200 bg-white/90 text-gray-600 shadow-sm hover:bg-white hover:text-gray-900"
      : "text-slate-400 hover:bg-slate-50 hover:text-slate-700";

  return (
    <div
      ref={containerRef}
      className="relative"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Mais opções para ${projectTitle}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] sm:opacity-0 sm:group-hover:opacity-100 sm:aria-expanded:opacity-100 ${triggerStyle}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Acções do projecto ${projectTitle}`}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
        >
          <Link
            role="menuitem"
            href={routes.open}
            onClick={() => close()}
            className={itemClass}
          >
            <FolderOpen className="h-4 w-4 text-gray-400" />
            Abrir projecto
          </Link>

          <Link
            role="menuitem"
            href={routes.tasks}
            onClick={() => close()}
            className={itemClass}
          >
            <ListChecks className="h-4 w-4 text-gray-400" />
            Ver tarefas
          </Link>

          <Link
            role="menuitem"
            href={routes.documents}
            onClick={() => close()}
            className={itemClass}
          >
            <FileText className="h-4 w-4 text-gray-400" />
            Ver documentos
          </Link>

          <Link
            role="menuitem"
            href={routes.team}
            onClick={() => close()}
            className={itemClass}
          >
            <Users className="h-4 w-4 text-gray-400" />
            Ver equipa
          </Link>

          <Link
            role="menuitem"
            href={routes.edit}
            onClick={() => close()}
            className={itemClass}
          >
            <Pencil className="h-4 w-4 text-gray-400" />
            Editar projecto
          </Link>

          {onArchive && (
            <>
              <div className="my-1 h-px bg-gray-100" role="separator" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  onArchive(projectId);
                }}
                className={itemClass}
              >
                <Archive className="h-4 w-4 text-gray-400" />
                Arquivar projecto
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}