import Link from "next/link";
import Image from "next/image";
import { DocumentType } from "../types";
import { FaFile, FaFilePdf, FaFileWord } from "react-icons/fa";
import { IoIosDocument } from "react-icons/io";

export default function DocumentCard({
    document,
}: {
    document: DocumentType;
}) {
    const getDocumentLogo = (name: string) => {
        const fileName = name.toLowerCase();

        if (fileName.endsWith(".pdf")) return <FaFilePdf className="h-10 w-10 text-slate-600 transition-transform duration-300 group-hover:scale-110" />
            ;
        if (fileName.endsWith(".docx")) return <FaFileWord className="h-10 w-10 text-slate-600 transition-transform duration-300 group-hover:scale-110" />;

        return <IoIosDocument className="h-10 w-10 text-slate-600 transition-transform duration-300 group-hover:scale-110" />;
    };

    return (
        <div className="group relative flex h-[270px] w-[300px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
            {/* Background Accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-500 to-yellow-600" />

            {/* Icon */}
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-slate-100">
                {getDocumentLogo(document.name)}

            </div>

            {/* Document Name */}
            <h3 className="line-clamp-2 min-h-[3.5rem] text-sm font-semibold text-slate-800">
                {document.name}
            </h3>

            {/* Actions */}
            <div className="mt-auto flex gap-3">
                <Link
                    href={document.name}
                    download
                    className="flex-1 rounded-lg bg-slate-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-700"
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