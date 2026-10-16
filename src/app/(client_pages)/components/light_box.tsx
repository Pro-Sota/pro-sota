
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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

export default function Lightbox({
  project,
  onClose,
}: LightboxProps) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const images = project?.images ?? [];

  const step = useCallback(
    (direction: number) => {
      if (images.length < 2) return;

      setIndex(
        (current) =>
          (current + direction + images.length) % images.length,
      );
    },
    [images.length],
  );

  useEffect(() => {
    setIndex(0);
    touchX.current = null;
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [project, onClose, step]);

  if (!project) return null;

  const currentImage = images[index];

  return (
    <div className="lightbox is-open">
      <div
        className="lightbox__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="lightbox__box"
        role="dialog"
        aria-modal="true"
        aria-label={`Galeria do projecto ${project.name}`}
      >
        <button
          type="button"
          className="lightbox__close"
          aria-label="Fechar galeria"
          onClick={onClose}
        >
          &times;
        </button>

        <div
          className="lightbox__stage"
          onTouchStart={(event) => {
            touchX.current =
              event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchX.current === null) return;

            const endX = event.changedTouches[0]?.clientX;

            if (endX === undefined) {
              touchX.current = null;
              return;
            }

            const distance = endX - touchX.current;

            if (Math.abs(distance) > 40) {
              step(distance > 0 ? -1 : 1);
            }

            touchX.current = null;
          }}
        >
          {images.length > 1 && (
            <button
              type="button"
              className="lightbox__nav lightbox__nav--prev"
              aria-label="Imagem anterior"
              onClick={() => step(-1)}
            >
              ←
            </button>
          )}

          {currentImage && (
            <Image
              className="lightbox__img"
              src={currentImage}
              alt={`${project.name} — foto ${index + 1}`}
              width={1600}
              height={1000}
              sizes="(max-width: 768px) 100vw, 90vw"
              priority
              unoptimized
            />
          )}

          {images.length > 1 && (
            <button
              type="button"
              className="lightbox__nav lightbox__nav--next"
              aria-label="Imagem seguinte"
              onClick={() => step(1)}
            >
              →
            </button>
          )}
        </div>

        <div className="lightbox__info">
          <div className="lightbox__head">
            <em className="lightbox__cat">
              {project.category} · {project.year}
              {project.location
                ? ` · ${project.location}`
                : ""}
            </em>

            <span className="lightbox__count">
              {images.length ? index + 1 : 0} / {images.length}
            </span>
          </div>

          <h3 className="lightbox__title">
            {project.name}
          </h3>

          {(project.description || project.summary) && (
            <p className="lightbox__desc">
              {project.description || project.summary}
            </p>
          )}

          {images.length > 1 && (
            <div className="lightbox__thumbs">
              {images.map((src, imageIndex) => (
                <button
                  key={`${src}-${imageIndex}`}
                  type="button"
                  className={
                    "lightbox__thumb" +
                    (imageIndex === index ? " is-active" : "")
                  }
                  aria-label={`Ver imagem ${imageIndex + 1}`}
                  aria-current={
                    imageIndex === index ? "true" : undefined
                  }
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
