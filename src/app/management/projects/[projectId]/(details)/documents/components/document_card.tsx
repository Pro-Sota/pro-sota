import Link from "next/link";
import Image from "next/image";
import { DocumentType } from "../types";

export default function DocumentCard({
    document,
}: {
    document: DocumentType;
}) {
    const getDocumentLogo = (name: string) => {
        const fileName = name.toLowerCase();

        if (fileName.endsWith(".pdf")) return "/images/logos/pdf.jpg";
        if (fileName.endsWith(".docx")) return "/images/logos/word.jpg";

        return "/images/logos/document.png";
    };

    return (
        <div className="group relative overflow-hidden mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
            {/* Background Accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />

            {/* Icon */}
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
                <Image
                    src={getDocumentLogo(document.name)}
                    alt={document.name}
                    width={60}
                    height={60}
                    className="object-contain"
                    quality={100}
                />
            </div>

            {/* Document Name */}
            <h3 className="line-clamp-2 min-h-[3.5rem] text-sm font-semibold text-slate-800">
                {document.name}
            </h3>

            {/* Actions */}
            <div className=" flex gap-3">
                <Link
                    href={document.name}
                    download
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    Download
                </Link>

                <Link
                    href={document.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                    Open
                </Link>
            </div>
        </div>
    );
}