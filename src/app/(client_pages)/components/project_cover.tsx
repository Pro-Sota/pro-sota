
"use client";

import Image from "next/image";
import { useState } from "react";

interface ProjectCoverProps {
  src?: string;
  alt: string;
  priority?: boolean;
}

export default function ProjectCover({
  src,
  alt,
  priority = false,
}: ProjectCoverProps) {
  const [hasError, setHasError] = useState(false);

  const validSrc =
    typeof src === "string" ? src.trim() : "";

  const showImage = validSrc.length > 0 && !hasError;

  return (
    <div className="group relative aspect-[4/5] overflow-hidden bg-[#222]">
      {showImage ? (
        <Image
          src={validSrc}
          alt={alt}
          fill
          preload={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
          onError={() => setHasError(true)}
          className="
            object-cover
            transition-transform duration-700 ease-out
            group-hover:scale-[1.03]
            group-focus-visible:scale-[1.03]
            motion-reduce:transition-none
          "
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#333] to-[#151515]">
          <span className="text-xs tracking-[0.2em] text-white/30">
            PRO SOTA
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.04]" />
    </div>
  );
}
