"use client";

import { AlertTriangle } from "lucide-react";
import { title } from "process";

interface PageProps {
    title: string;
    onKeepEditing: () => void;
    onDiscard: () => void;
}

export default function CancelConfirmDialog({
    title,
    onKeepEditing,
    onDiscard,
}: PageProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                    {title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-500">
                    As informações que preencheu não foram guardadas e serão perdidas.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onKeepEditing}
                        className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Continuar a editar
                    </button>
                    <button
                        type="button"
                        onClick={onDiscard}
                        className="cursor-pointer rounded-lg bg-rose-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
                    >
                        Descartar
                    </button>
                </div>
            </div>
        </div>
    );
}