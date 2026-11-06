
"use client";

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

  const validSrc =
    typeof src === "string" ? src.trim() : "";

  const showImage = validSrc.length > 0 && !hasError;

  return (
    <div className="
      group
      relative
      aspect-[4/3]
      w-full
      overflow-hidden
      bg-[#222]
    ">
      {showImage ? (
        <img
          src={validSrc}
          alt={alt || "Projecto PRO SOTA"}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => {
            console.error(
              "Project image failed to load:",
              validSrc
            );
            setHasError(true);
          }}
          className="
            absolute inset-0
            h-full w-full
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
