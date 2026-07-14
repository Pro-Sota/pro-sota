import Link from "next/link";
import { DocumentType } from "../types";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { IoIosDocument } from "react-icons/io";

export default function DocumentCard({
    document,
}: {
    document: DocumentType;
}) {
    const getDocumentLogo = (name: string) => {
        const fileName = name.toLowerCase();

        if (fileName.endsWith(".pdf")) {
            return (
                <FaFilePdf className="h-10 w-10 text-slate-600 transition-transform duration-300 group-hover:scale-110" />
            );
        }

        if (fileName.endsWith(".docx")) {
            return (
                <FaFileWord className="h-10 w-10 text-slate-600 transition-transform duration-300 group-hover:scale-110" />
            );
        }
        return (
            <IoIosDocument className="h-10 w-10 text-slate-600 transition-transform duration-300 group-hover:scale-110" />
        );
    };

    return (
        <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">            {/* Background Accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-500 to-yellow-600" />

            {/* Icon */}
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-slate-100">
                {getDocumentLogo(document.name)}
            </div>

            <div className="mx-2">
                <h3 className=" text-sm font-semibold text-slate-800">
                    {document.name}
                </h3>
            </div>

            {/* Actions */}
            <div className="mt-auto flex w-full flex-col gap-2 sm:flex-row">
                <Link
                    href={document.name}
                    download
                    className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-slate-700 sm:px-4 sm:text-sm"
                >
                    Download
                </Link>

                <Link
                    href={document.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-medium text-slate-600 transition hover:bg-slate-100 sm:px-4 sm:text-sm"
                >
                    Open
                </Link>
            </div>
        </div>
    );
}