
"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export type LightboxProject = {
  id: string;
  name: string;
  year: string;
  location: string;
  images: string[];
};

interface LightboxProps {
  project: LightboxProject;
  onClose: () => void;
}

export default function Lightbox({
  project,
  onClose,
}: LightboxProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [imageError, setImageError] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Important: handle null before accessing project properties.
  if (!project) return null;

  const images = Array.isArray(project.images)
    ? project.images.filter(
        (image) =>
          typeof image === "string" &&
          image.trim().length > 0
      )
    : [];

  const currentImage = images[activeImage];

  const hasMultipleImages = images.length > 1;

  const projectMeta = [
    project.location,
    project.year,
  ]
    .filter(Boolean)
    .join(" · ");

  function previousImage() {
    if (!hasMultipleImages) return;

    setActiveImage((current) =>
      current === 0
        ? images.length - 1
        : current - 1
    );

    setImageError(false);
  }

  function nextImage() {
    if (!hasMultipleImages) return;

    setActiveImage((current) =>
      current === images.length - 1
        ? 0
        : current + 1
    );

    setImageError(false);
  }

  function selectImage(index: number) {
    setActiveImage(index);
    setImageError(false);
  }

  useEffect(() => {
    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowLeft" && hasMultipleImages) {
        event.preventDefault();
        previousImage();
        return;
      }

      if (event.key === "ArrowRight" && hasMultipleImages) {
        event.preventDefault();
        nextImage();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements =
          document.querySelectorAll<HTMLElement>(
            '[role="dialog"] button:not(:disabled), [role="dialog"] [href], [role="dialog"] [tabindex]:not([tabindex="-1"])'
          );

        const firstElement = focusableElements[0];
        const lastElement =
          focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) {
          event.preventDefault();
          return;
        }

        if (
          event.shiftKey &&
          document.activeElement === firstElement
        ) {
          event.preventDefault();
          lastElement.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === lastElement
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = previousOverflow;

      previousActiveElement?.focus();
    };
  }, [onClose, hasMultipleImages, images.length]);

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/95 p-4
        backdrop-blur-md
        md:p-8
      "
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        aria-describedby="lightbox-meta"
        className="
          relative flex h-full w-full
          flex-col items-center justify-center
          text-white
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* CLOSE BUTTON */}

        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar galeria"
          className="
            absolute right-1 top-1 z-30
            flex h-11 w-11 items-center justify-center
            rounded-full border border-white/20
            text-white transition-colors
            hover:bg-white hover:text-black
            focus-visible:outline
            focus-visible:outline-2
            focus-visible:outline-[#BD9655]
            md:right-2 md:top-2
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* PROJECT INFORMATION */}

        <div className="
          absolute left-1 top-2 z-20
          max-w-[75%]
          md:left-2 md:top-2
        ">
          <p className="
            text-[10px] uppercase
            tracking-[0.3em] text-[#BD9655]
          ">
            PRO SOTA · PORTFÓLIO
          </p>

          <h2
            id="lightbox-title"
            className="
              mt-2 max-w-[220px]
              text-lg font-light text-white
              md:max-w-none md:text-2xl
            "
          >
            {project.name}
          </h2>

          <p
            id="lightbox-meta"
            className="mt-1 text-xs text-white/45"
          >
            {projectMeta}
          </p>
        </div>

        {/* IMAGE AREA */}

        <div className="
          relative flex h-full w-full
          max-w-6xl flex-col
          items-center justify-center
          pb-20 pt-24
          md:pb-20 md:pt-20
        ">
          {currentImage && !imageError ? (
            <div className="
              relative flex min-h-0 w-full
              flex-1 items-center justify-center
            ">
              <Image
                key={currentImage}
                src={currentImage}
                alt={`${project.name} - Imagem ${activeImage + 1}`}
                fill
                sizes="100vw"
                onError={() => setImageError(true)}
                className="object-contain"
              />
            </div>
          ) : (
            <div className="
              flex flex-1 items-center justify-center
              text-center
            ">
              <p className="
                text-xs tracking-[0.2em]
                text-white/40
              ">
                {images.length === 0
                  ? "SEM IMAGENS DISPONÍVEIS"
                  : "NÃO FOI POSSÍVEL CARREGAR A IMAGEM"}
              </p>
            </div>
          )}

          {/* IMAGE NAVIGATION */}

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={previousImage}
                aria-label="Imagem anterior"
                className="
                  absolute left-0 top-1/2 z-20
                  flex h-11 w-11
                  -translate-y-1/2 items-center justify-center
                  rounded-full border border-white/20
                  bg-black/40 text-white
                  transition-colors
                  hover:bg-white hover:text-black
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-[#BD9655]
                  md:left-3 md:h-14 md:w-14
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 md:h-6 md:w-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={nextImage}
                aria-label="Imagem seguinte"
                className="
                  absolute right-0 top-1/2 z-20
                  flex h-11 w-11
                  -translate-y-1/2 items-center justify-center
                  rounded-full border border-white/20
                  bg-black/40 text-white
                  transition-colors
                  hover:bg-white hover:text-black
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-[#BD9655]
                  md:right-3 md:h-14 md:w-14
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 md:h-6 md:w-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* BOTTOM BAR */}

        <div className="
          absolute bottom-1 left-1 right-1
          flex items-center justify-between
          border-t border-white/10 pt-4
          md:bottom-2 md:left-2 md:right-2
        ">
          <p
            className="
              text-[10px] uppercase
              tracking-[0.2em] text-white/40
            "
            aria-live="polite"
            aria-atomic="true"
          >
            {images.length > 0
              ? `${String(activeImage + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`
              : "PRO SOTA"}
          </p>

          {/* IMAGE INDICATORS */}

          <div className="flex items-center gap-2">
            {images.map((_, index) => (
              <button
                key={`${project.id}-image-${index}`}
                type="button"
                onClick={() => selectImage(index)}
                aria-label={`Ver imagem ${index + 1}`}
                aria-current={
                  activeImage === index
                    ? "true"
                    : undefined
                }
                className={`
                  h-1 transition-all duration-300
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-[#BD9655]
                  ${
                    activeImage === index
                      ? "w-8 bg-[#BD9655]"
                      : "w-3 bg-white/25 hover:bg-white/60"
                  }
                `}
              />
            ))}
          </div>

          <p className="
            hidden text-[10px] uppercase
            tracking-[0.15em] text-white/30
            md:block
          ">
            ESC · FECHAR
          </p>
        </div>
      </section>
    </div>
  );
}
