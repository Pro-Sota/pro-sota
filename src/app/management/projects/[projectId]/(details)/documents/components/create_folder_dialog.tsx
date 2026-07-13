"use client";

import { useState, useRef, useEffect } from "react";
import { X, FolderPlus } from "lucide-react";

export default function CreateFolderDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const dialogRef = useRef(null);
    const nameInputRef = useRef(null);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") handleClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open]);

    // Focus the name field when the dialog opens
    useEffect(() => {
        if (open) {
            const t = setTimeout(() => nameInputRef.current?.focus(), 0);
            return () => clearTimeout(t);
        }
    }, [open]);

    function handleClose() {
        setOpen(false);
        setName("");
        setDescription("");
        setError("");
    }

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) handleClose();
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) {
            setError("Folder name is required.");
            nameInputRef.current?.focus();
            return;
        }

        // Replace with your own create-folder logic (API call, server action, etc.)
        console.log("Creating folder:", { name: name.trim(), description: description.trim() });

        handleClose();
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}

                className="flex items-center gap-2 rounded bg-slate-500 px-3 py-1 text-sm text-white hover:bg-slate-600 cursor-pointer transition"
            >
                <FolderPlus className="h-4 w-4" />
                Criar pasta
            </button>


            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]"
                    onMouseDown={handleOverlayClick}
                    role="presentation"
                >
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-folder-title"
                        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <h2 id="create-folder-title" className="text-base font-semibold text-gray-900">
                                Create Folder
                            </h2>
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Close dialog"
                                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="folderName" className="text-sm font-medium text-gray-700">
                                    Folder Name
                                </label>
                                <input
                                    id="folderName"
                                    ref={nameInputRef}
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (error) setError("");
                                    }}
                                    placeholder="e.g. Marketing Assets"
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                />
                                {error && <p className="text-xs text-red-600">{error}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="folderDescription" className="text-sm font-medium text-gray-700">
                                    Folder Description
                                </label>
                                <input
                                    id="folderDescription"
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional"
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                />
                            </div>

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                                >
                                    Create Folder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
