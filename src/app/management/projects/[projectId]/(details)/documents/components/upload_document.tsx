"use client";

import { FilePlus } from "lucide-react";


export default function UploadDocument() {

    return (
        <button
            aria-label={`Upload folder button`}

            className="flex items-center gap-2 rounded bg-slate-500 px-3 py-2 text-sm text-white hover:bg-slate-600 cursor-pointer transition"
        >
            <FilePlus className="h-4 w-4" />
            Carregar documento
        </button>)


}