"use client";

import { FileText } from "lucide-react";

interface EmptyFolderProps {
  title?: string;
  description?: string;
}

export default function EmptyFolder({
  title = "A pasta está vazia",
  description = "Carregue um documento ou crie uma subpasta para começar.",
}: EmptyFolderProps) {
  return (
    <div className="flex min-h-[260px] w-full flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
        <FileText className="h-7 w-7 text-gray-400" strokeWidth={1.5} />
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-900">{title}</p>

      <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}