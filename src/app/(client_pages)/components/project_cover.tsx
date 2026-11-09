
"use client";

import Image from "next/image";
import { useState } from "react";

interface ProjectCoverProps {
  src?: string | null;
  alt: string;
  priority?: boolean;
}

export default function ProjectCover({
  src,
  alt,
  priority = false,
}: ProjectCoverProps) {
  const [hasError, setHasError] = useState(false);

  const validSrc = typeof src === "string" ? src.trim() : "";
  const showImage = validSrc.length > 0 && !hasError;

  return (
    <div
      className="
        group relative
        aspect-[4/5]
        w-full
        overflow-hidden
        bg-[#222]
      "
    >
      {showImage ? (
        <Image
          src={validSrc}
          alt={alt || "Projecto PRO SOTA"}
          fill
          priority={priority}
          sizes="
            (min-width: 1536px) 22vw,
            (min-width: 1024px) 23vw,
            (min-width: 640px) 45vw,
            100vw
          "
          onError={() => {
            console.error("Project image failed to load:", validSrc);
            setHasError(true);
          }}
          className="
            object-cover
            transition-transform duration-500 ease-out
            group-hover:scale-[1.025]
            group-focus-visible:scale-[1.025]
            motion-reduce:transition-none
          "
        />
      ) : (
        <div className="
          absolute inset-0
          flex items-center justify-center
          bg-gradient-to-br from-[#333] to-[#151515]
        ">
          <span className="text-xs tracking-[0.2em] text-white/30">
            PRO SOTA
          </span>
        </div>
      )}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          bg-black/0
          transition-colors duration-300
          group-hover:bg-black/[0.04]
        "
      />
    </div>
  );
}
