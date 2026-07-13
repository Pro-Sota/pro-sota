"use client";

import { FileText } from "lucide-react";

export default function EmptyFolder() {
  return (
    <div className="flex flex-1 h-full w-full flex-col items-center justify-center py-10 mt-4 text-center">
      <FileText className="h-8 w-8 text-gray-300" />
      <p className="mt-3 text-sm font-medium text-gray-900">
        A pasta está vazia
      </p>
    </div>
  );
}