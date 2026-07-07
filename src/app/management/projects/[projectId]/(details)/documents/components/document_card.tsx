import Link from "next/link";
import Image from "next/image";
import { DocumentType } from "../types";

export default function DocumentCard({ document }: { document: DocumentType }) {
    const getDocumentLogo = (name: string) => {
        const fileName = name.toLowerCase();

        if (fileName.endsWith(".pdf")) return "/images/logos/pdf.jpg";
        if (fileName.endsWith(".docx")) return "/images/logos/word.jpg";

        return "/images/logos/document.png";
    };

    return (
        <div className="flex flex-col items-center rounded-lg border border-gray-200 p-2 ">
            <div className="flex h-24 w-24 items-center justify-center">
                <Image
                    src={getDocumentLogo(document.name)}
                    alt={document.name}
                    width={100}
                    height={100}
                    className="h-24 w-24 object-contain"
                    quality={100}
                />
            </div>

            <p className="my-2 text-center text-sm break-all text-gray-700">
                {document.name}
            </p>

            <div className="flex w-full justify-between gap-3 border-t border-gray-200 p-2">
                <Link
                    href={document.name}
                    download
                    className="w-full bg-slate-500 rounded-md text-center px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                    Download
                </Link>

                <Link
                    href={document.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md w-full px-4 py-2 text-sm font-medium border border-gray-200 text-gray-500 transition hover:bg-gray-200"
                >
                    Ver documento
                </Link>
            </div>
        </div>
    );
}