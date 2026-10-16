
"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LoaderCircle,
  Minus,
  Plus,
  RotateCw,
} from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerProps {
  fileUrl: string;
  fileName?: string;
}

export default function PdfViewer({
  fileUrl,
  fileName = "Documento.pdf",
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPageNumber(1);
    setNumPages(0);
    setLoading(true);
    setError(null);
    setScale(1);
    setRotation(0);
  }, [fileUrl]);

  function handleLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  }

  function handleLoadError() {
    setLoading(false);
    setError(
      "Não foi possível abrir o PDF. Verifique o acesso ao documento e tente novamente.",
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#002950]/5 text-[#002950]">
            <RotateCw size={17} />
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">
              {numPages > 0
                ? `${pageNumber} de ${numPages} páginas`
                : "Visualizador PDF"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setScale((value) => Math.max(0.5, value - 0.1))}
            disabled={scale <= 0.5}
            aria-label="Diminuir zoom"
            className="rounded-md p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
          >
            <Minus size={17} />
          </button>

          <span className="min-w-[48px] text-center text-xs font-medium text-gray-600">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setScale((value) => Math.min(2, value + 0.1))}
            disabled={scale >= 2}
            aria-label="Aumentar zoom"
            className="rounded-md p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
          >
            <Plus size={17} />
          </button>

          <button
            type="button"
            onClick={() => setRotation((value) => (value + 90) % 360)}
            aria-label="Rodar documento"
            className="rounded-md p-2 text-gray-600 hover:bg-gray-200"
          >
            <RotateCw size={17} />
          </button>

          <a
            href={fileUrl}
            download={fileName}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir ou descarregar PDF"
            className="rounded-md p-2 text-gray-600 hover:bg-gray-200"
          >
            <Download size={17} />
          </a>
        </div>
      </div>

      {/* PDF pages */}
      <div className="max-h-[75vh] min-h-[320px] overflow-auto bg-gray-100 p-3 sm:p-6">
        {loading && !error && (
          <div className="flex min-h-[300px] items-center justify-center gap-2 text-sm text-gray-500">
            <LoaderCircle size={20} className="animate-spin" />
            A carregar documento...
          </div>
        )}

        {error ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
            <p className="max-w-md text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoading(true);
                setPageNumber(1);
              }}
              className="rounded-lg bg-[#002950] px-4 py-2 text-sm font-medium text-white hover:bg-[#003b70]"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={null}
            error={null}
            className="flex flex-col items-center gap-4"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer
              renderAnnotationLayer
              className="max-w-full overflow-hidden shadow-md"
              loading={
                <div className="flex h-64 items-center justify-center text-sm text-gray-500">
                  A carregar página...
                </div>
              }
            />
          </Document>
        )}
      </div>

      {/* Pagination */}
      {numPages > 1 && !error && (
        <div className="flex items-center justify-center gap-4 border-t border-gray-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            aria-label="Página anterior"
            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm tabular-nums text-gray-600">
            Página {pageNumber} de {numPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setPageNumber((page) => Math.min(numPages, page + 1))
            }
            disabled={pageNumber >= numPages}
            aria-label="Página seguinte"
            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
