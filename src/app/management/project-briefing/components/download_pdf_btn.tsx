"use client";

import { useState } from "react";

import { Download, Loader2 } from "lucide-react";
import { PdfData } from "../components/briefing_pdf";


export default function DownloadPdfButton({
    data,
    fileName,
    className,
}: {
    data: PdfData;
    fileName: string;
    className?: string;
}) {
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);

    async function handleClick() {
        setBusy(true);
        setFailed(false);

        try {
            // Loaded on demand so the PDF library never weighs on the page itself.
            const [{ pdf }, { BriefingPdf }] = await Promise.all([
                import("@react-pdf/renderer"),
                import("../components/briefing_pdf"),
            ]);

            const blob = await pdf(<BriefingPdf data={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = fileName;
            link.click();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
            setFailed(true);
        } finally {
            setBusy(false);
        }
    }

    return (
        <span className="inline-flex items-center gap-3">
            {failed && (
                <span role="alert" className="text-sm text-red-700">
                    Não foi possível gerar o PDF.
                </span>
            )}

            <button
                type="button"
                onClick={handleClick}
                disabled={busy}
                className={className}
            >
                {busy ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden />
                ) : (
                    <Download size={14} aria-hidden />
                )}
                {busy ? "A gerar PDF..." : "Descarregar PDF"}
            </button>
        </span>
    );
}