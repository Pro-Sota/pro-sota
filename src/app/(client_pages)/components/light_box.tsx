"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export type LightboxProject = {
  id: string | number;
  name: string;
  images?: string[];
  category: string;
  year: string | number;
  location?: string | null;
  description?: string | null;
  summary?: string | null;
};

type LightboxProps = {
  project: LightboxProject | null;
  onClose: () => void;
};

/* ------------------------------------------------------------------ */
/* Strings (kept in one place so they are easy to translate later)     */
/* ------------------------------------------------------------------ */
const t = {
  close: "Fechar galeria",
  prev: "Imagem anterior",
  next: "Imagem seguinte",
  noImages: "Sem imagens",
  loading: "A carregar…",
  loadError: "Não foi possível carregar a imagem.",
  viewImage: (n: number) => `Ver imagem ${n}`,
  photoAlt: (name: string, n: number) => `${name} — foto ${n}`,
  position: (n: number, total: number) => `Imagem ${n} de ${total}`,
};

const SR_ONLY: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SWIPE_THRESHOLD = 40;

/* ------------------------------------------------------------------ */
/* Public component: handles mounting/unmounting and the portal.       */
/* Keying the inner component by project id remounts it on project     */
/* change, so index/touch state reset without any sync effect.         */
/* ------------------------------------------------------------------ */
export default function Lightbox({ project, onClose }: LightboxProps) {
  if (!project || typeof document === "undefined") return null;

  return createPortal(
    <LightboxInner key={project.id} project={project} onClose={onClose} />,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Inner component                                                     */
/* ------------------------------------------------------------------ */
function LightboxInner({
  project,
  onClose,
}: {
  project: LightboxProject;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrcs, setFailedSrcs] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Always call the latest onClose without re-subscribing listeners.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const images = project.images ?? [];
  const total = images.length;
  const currentImage = images[index];

  const step = useCallback(
    (direction: number) => {
      if (total < 2) return;
      setIndex((current) => (current + direction + total) % total);
    },
    [total],
  );

  const goTo = useCallback(
    (target: number) => {
      if (total < 1) return;
      setIndex(Math.min(Math.max(target, 0), total - 1));
    },
    [total],
  );

  /* Scroll lock + keyboard + focus trap + focus restore ------------- */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    (closeRef.current ?? dialogRef.current)?.focus();

    function handleKey(event: KeyboardEvent) {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onCloseRef.current();
          break;
        case "ArrowLeft":
          event.preventDefault();
          step(-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          step(1);
          break;
        case "Home":
          event.preventDefault();
          goTo(0);
          break;
        case "End":
          event.preventDefault();
          goTo(Number.MAX_SAFE_INTEGER);
          break;
        case "Tab": {
          const dialog = dialogRef.current;
          if (!dialog) return;

          const focusables = Array.from(
            dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
          );

          if (focusables.length === 0) {
            event.preventDefault();
            dialog.focus();
            return;
          }

          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const active = document.activeElement;
          const outside = !active || !dialog.contains(active);

          if (event.shiftKey) {
            if (outside || active === first || active === dialog) {
              event.preventDefault();
              last.focus();
            }
          } else if (outside || active === last) {
            event.preventDefault();
            first.focus();
          }
          break;
        }
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [step, goTo]);

  /* Preload neighbouring images ------------------------------------- */
  useEffect(() => {
    if (total < 2) return;

    const neighbours = [
      images[(index + 1) % total],
      images[(index - 1 + total) % total],
    ];

    neighbours.forEach((src) => {
      if (!src) return;
      const preload = new window.Image();
      preload.src = src;
    });
  }, [index, images, total]);

  /* Keep the active thumbnail in view -------------------------------- */
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    thumbRefs.current[index]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [index]);

  /* Touch / swipe ---------------------------------------------------- */
  function handleTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;

    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    // Only treat as a swipe when horizontal movement clearly dominates.
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      step(dx > 0 ? -1 : 1);
    }
  }

  /* Image status ----------------------------------------------------- */
  const hasFailed = currentImage ? failedSrcs.has(currentImage) : false;
  const isLoading =
    Boolean(currentImage) && !hasFailed && loadedSrc !== currentImage;

  const details = project.description || project.summary;

  return (
    <div className="lightbox is-open">
      <div
        className="lightbox__backdrop"
        onClick={() => onCloseRef.current()}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        className="lightbox__box"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button
          ref={closeRef}
          type="button"
          className="lightbox__close"
          aria-label={t.close}
          onClick={() => onCloseRef.current()}
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <div
          className="lightbox__stage"
          style={{ touchAction: "pan-y" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {total > 1 && (
            <button
              type="button"
              className="lightbox__nav lightbox__nav--prev"
              aria-label={t.prev}
              onClick={() => step(-1)}
            >
              <span aria-hidden="true">←</span>
            </button>
          )}

          {total === 0 && <p className="lightbox__empty">{t.noImages}</p>}

          {currentImage && !hasFailed && (
            <Image
              key={currentImage}
              className="lightbox__img"
              src={currentImage}
              alt={t.photoAlt(project.name, index + 1)}
              width={1600}
              height={1000}
              sizes="(max-width: 768px) 100vw, 90vw"
              style={{
                objectFit: "contain",
                opacity: isLoading ? 0 : 1,
                transition: "opacity 150ms ease",
              }}
              onLoad={() => setLoadedSrc(currentImage)}
              onError={() =>
                setFailedSrcs((prev) => new Set(prev).add(currentImage))
              }
              unoptimized
            />
          )}

          {isLoading && (
            <p className="lightbox__status" role="status">
              {t.loading}
            </p>
          )}

          {hasFailed && (
            <p className="lightbox__status lightbox__status--error" role="alert">
              {t.loadError}
            </p>
          )}

          {total > 1 && (
            <button
              type="button"
              className="lightbox__nav lightbox__nav--next"
              aria-label={t.next}
              onClick={() => step(1)}
            >
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>

        <div className="lightbox__info">
          <div className="lightbox__head">
            <em className="lightbox__cat">
              {project.category} · {project.year}
              {project.location ? ` · ${project.location}` : ""}
            </em>

            <span className="lightbox__count" aria-hidden="true">
              {total ? index + 1 : 0} / {total}
            </span>
          </div>

          {/* Announces image changes to screen readers */}
          <span style={SR_ONLY} aria-live="polite" aria-atomic="true">
            {total ? t.position(index + 1, total) : ""}
          </span>

          <h3 id={titleId} className="lightbox__title">
            {project.name}
          </h3>

          {details && <p className="lightbox__desc">{details}</p>}

          {total > 1 && (
            <div className="lightbox__thumbs">
              {images.map((src, imageIndex) => (
                <button
                  key={`${src}-${imageIndex}`}
                  ref={(node) => {
                    thumbRefs.current[imageIndex] = node;
                  }}
                  type="button"
                  className={
                    "lightbox__thumb" +
                    (imageIndex === index ? " is-active" : "")
                  }
                  aria-label={t.viewImage(imageIndex + 1)}
                  aria-current={imageIndex === index ? "true" : undefined}
                  onClick={() => setIndex(imageIndex)}
                >
                  <Image
                    src={src}
                    alt=""
                    width={120}
                    height={80}
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}