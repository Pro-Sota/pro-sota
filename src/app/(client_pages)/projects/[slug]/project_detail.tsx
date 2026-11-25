"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  MapPin,
  X,
} from "lucide-react";

import type { PortfolioProject } from "@/services/portfolio";
import { getStorageImageUrl } from "@/app/lib/supabase/storage";

interface ProjectDetailClientProps {
  project: PortfolioProject;
}

const SWIPE_THRESHOLD = 50;

export default function ProjectDetailClient({
  project,
}: ProjectDetailClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(
    () => new Set()
  );

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);

  const images = [
    project.cover_image_path,
    ...(project.gallery_image_paths ?? []),
  ]
    .filter((image): image is string => Boolean(image))
    .filter((image, index, array) => array.indexOf(image) === index)
    .map((path, index) => ({
      path,
      src: getStorageImageUrl(path),
      index,
      alt:
        index === 0 && project.cover_image_alt
          ? project.cover_image_alt
          : `${project.title} — imagem ${index + 1}`,
    }));

  const imageCount = images.length;
  const currentImage = images[activeImage];
  const hasImages = imageCount > 0;
  const currentImageFailed = failedImages.has(activeImage);

  const projectLocation =
    project.location ||
    project.location_name ||
    project.municipality;

  const projectYear = project.year;

  // The eyebrow above the title shows the category (or the specialty as a
  // fallback). The metadata block only repeats the specialty when it differs.
  const eyebrow = project.category || project.project_type;
  const showSpecialty =
    Boolean(project.project_type) && project.project_type !== eyebrow;

  const services = project.services ?? [];

  const descriptionParagraphs = (project.description ?? "")
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

  function step(delta: number) {
    if (!imageCount) return;

    setActiveImage((current) => (current + delta + imageCount) % imageCount);
  }

  function selectImage(index: number) {
    if (!imageCount) return;

    setActiveImage((index + imageCount) % imageCount);
  }

  function nextImage() {
    step(1);
  }

  function previousImage() {
    step(-1);
  }

  // Arrow keys while focus is inside the inline gallery.
  // (Escape and arrows inside the lightbox are handled by the effect below.)
  function handleGalleryKeyDown(
    event: ReactKeyboardEvent<HTMLDivElement>
  ) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextImage();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousImage();
    }
  }

  function markImageAsFailed(index: number) {
    setFailedImages((previous) => {
      const next = new Set(previous);
      next.add(index);
      return next;
    });
  }

  // Swipe support (main image and lightbox)
  function handleTouchStart(event: ReactTouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: ReactTouchEvent<HTMLElement>) {
    if (touchStartX.current === null || imageCount < 2) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    step(delta < 0 ? 1 : -1);
  }

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };

  // Lightbox: keyboard (Escape / arrows), scroll lock and focus management.
  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (imageCount < 2) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveImage((current) => (current + 1) % imageCount);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveImage((current) => (current - 1 + imageCount) % imageCount);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    const expandButton = expandButtonRef.current;

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      expandButton?.focus();
    };
  }, [lightboxOpen, imageCount]);

  // Keep the active thumbnail visible. Scrolls only the thumbnail strip
  // (not the page), so the viewport never jumps.
  useEffect(() => {
    const container = thumbsRef.current;
    const thumb = thumbRefs.current[activeImage];

    if (!container || !thumb) return;

    const left =
      thumb.offsetLeft - container.clientWidth / 2 + thumb.clientWidth / 2;

    container.scrollTo({ left, behavior: "smooth" });
  }, [activeImage]);

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#1F1E1B]">
      {/* PROJECT HEADER */}
      <section className="mx-auto max-w-[1500px] px-5 pb-10 pt-32 sm:px-8 md:px-12 lg:pb-14">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#1F1E1B]/15 pb-6">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B6A2F]">
              PRO SOTA · PORTFÓLIO
            </p>

            <nav
              aria-label="Navegação estrutural"
              className="flex flex-wrap items-center gap-2 text-xs text-[#5F5B54]"
            >
              <Link
                href="/projects"
                className="transition-colors hover:text-[#8B6A2F]"
              >
                Projectos
              </Link>

              <span aria-hidden="true">/</span>

              <span
                aria-current="page"
                className="max-w-[220px] truncate text-[#1F1E1B]"
              >
                {project.title}
              </span>
            </nav>
          </div>

          <Link
            href="/projects"
            className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-[#8B6A2F] sm:inline-flex"
          >
            <ArrowLeft size={14} />
            Portfólio
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div>
            {eyebrow && (
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B6A2F]">
                {eyebrow}
              </p>
            )}

            <h1 className="max-w-5xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-7xl">
              {project.title}
              <span className="text-[#BD9655]">.</span>
            </h1>
         
          </div>

          {/* PROJECT METADATA */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-[#1F1E1B]/15 pt-6 lg:border-t-0 lg:pt-0">
            {projectLocation && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-[#8B6A2F]">
                  <MapPin size={13} strokeWidth={1.7} />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                    Localização
                  </span>
                </div>

                <p className="text-sm text-[#5F5B54]">
                  {projectLocation}
                </p>
              </div>
            )}

            {projectYear && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B6A2F]">
                  Ano
                </p>

                <p className="text-sm text-[#5F5B54]">
                  {String(projectYear)}
                </p>
              </div>
            )}

            {project.category && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B6A2F]">
                  Categoria
                </p>

                <p className="text-sm text-[#5F5B54]">
                  {project.category}
                </p>
              </div>
            )}

            {showSpecialty && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B6A2F]">
                  Especialidade
                </p>

                <p className="text-sm text-[#5F5B54]">
                  {project.project_type}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PROJECT GALLERY */}
      {hasImages && (
        <section
          aria-label="Galeria de imagens do projecto"
          className="mx-auto max-w-[1500px] px-5 sm:px-8 md:px-12"
        >
          <div
            className="relative"
            onKeyDown={handleGalleryKeyDown}
          >
            {/* MAIN IMAGE */}
            <div
              className="group relative aspect-[16/9] touch-pan-y overflow-hidden bg-[#EEECE6] sm:aspect-[16/8.5] lg:aspect-[16/7.5]"
              {...swipeHandlers}
            >
              {currentImage?.src && !currentImageFailed ? (
                <Image
                  key={currentImage.src}
                  src={currentImage.src}
                  alt={currentImage.alt}
                  fill
                  sizes="(min-width: 1500px) 1500px, 100vw"
                  priority={activeImage === 0}
                  decoding="async"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.015]"
                  onError={() => markImageAsFailed(activeImage)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B6A2F]">
                      PRO SOTA
                    </p>

                    <p className="mt-2 text-xs text-[#5F5B54]">
                      Imagem indisponível
                    </p>
                  </div>
                </div>
              )}

              {/* IMAGE COUNTER */}
              <div
                aria-live="polite"
                className="absolute bottom-5 left-5 bg-[#1F1E1B]/75 px-4 py-2 text-[10px] font-semibold tracking-[0.14em] text-white backdrop-blur-sm"
              >
                {String(activeImage + 1).padStart(2, "0")}
                <span className="mx-2 text-white/50">/</span>
                {String(imageCount).padStart(2, "0")}
              </div>

              {/* FULLSCREEN */}
              {currentImage?.src && !currentImageFailed && (
                <button
                  ref={expandButtonRef}
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Ampliar imagem"
                  className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center bg-[#1F1E1B]/65 text-white backdrop-blur-sm transition-colors hover:bg-[#8B6A2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <Expand size={16} />
                </button>
              )}

              {/* GALLERY NAVIGATION */}
              {imageCount > 1 && (
                <div className="absolute bottom-5 right-5 flex gap-2">
                  <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Imagem anterior"
                    className="flex h-10 w-10 items-center justify-center bg-[#1F1E1B]/65 text-white backdrop-blur-sm transition-colors hover:bg-[#8B6A2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <ArrowLeft size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Imagem seguinte"
                    className="flex h-10 w-10 items-center justify-center bg-[#1F1E1B]/65 text-white backdrop-blur-sm transition-colors hover:bg-[#8B6A2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
            </div>

            {/* THUMBNAILS */}
            {imageCount > 1 && (
              <div
                ref={thumbsRef}
                className="relative mt-4 flex gap-3 overflow-x-auto pb-3"
                aria-label="Seleccionar imagem"
              >
                {images.map((image, index) => (
                  <button
                    key={`${image.path}-${index}`}
                    ref={(element) => {
                      thumbRefs.current[index] = element;
                    }}
                    type="button"
                    onClick={() => selectImage(index)}
                    aria-label={`Ver imagem ${index + 1}`}
                    aria-pressed={activeImage === index}
                    className={`relative h-20 w-28 flex-none overflow-hidden border-2 transition-all duration-200 sm:h-24 sm:w-36 ${
                      activeImage === index
                        ? "border-[#BD9655] opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {image.src && !failedImages.has(index) ? (
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="144px"
                        loading="lazy"
                        decoding="async"
                        onError={() => markImageAsFailed(index)}
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-[#EEECE6] text-[9px] uppercase tracking-wider text-[#8B6A2F]">
                        Imagem {index + 1}
                      </span>
                    )}

                    {activeImage === index && (
                      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#BD9655]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* PROJECT INFORMATION */}
      <section className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 md:px-12 lg:grid-cols-[0.45fr_1.55fr] lg:gap-16 lg:py-24">
        {/* SECTION INTRODUCTION */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B6A2F]">
            PRO SOTA
          </p>

          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
            Sobre o projecto
            <span className="text-[#BD9655]">.</span>
          </h2>

          <p className="mt-5 max-w-xs text-sm leading-7 text-[#6F6B64]">
            Conheça os detalhes, a abordagem e os serviços envolvidos neste
            projecto.
          </p>
        </div>

        {/* PROJECT DESCRIPTION */}
        <div className="min-w-0">
          {descriptionParagraphs.length > 0 && (
            <div className="max-w-3xl space-y-6 text-[15px] leading-[1.9] tracking-[0.005em] text-[#555149] sm:text-base sm:leading-[2] lg:text-[16px]">
              {descriptionParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="whitespace-normal break-normal [hyphens:none]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* SERVICES */}
          {services.length > 0 && (
            <div className="mt-12 border-t border-[#1F1E1B]/15 pt-8">
              <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B6A2F]">
                Serviços envolvidos
              </p>

              <div className="flex flex-wrap gap-2.5">
                {services.map((service) => (
                  <span
                    key={service}
                    className="border border-[#1F1E1B]/15 px-4 py-3 text-xs text-[#5F5B54] transition-colors duration-200 hover:border-[#8B6A2F] hover:text-[#8B6A2F]"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PROJECT FOOTER */}
      <section className="border-t border-[#1F1E1B]/15">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center md:px-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B6A2F]">
              PRO SOTA 
            </p>

            <p className="mt-2 text-xl font-semibold tracking-tight">
              Damos forma às ideias.
              <span className="text-[#8B6A2F]"> Construímos o futuro.</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex w-fit items-center gap-3 border border-[#1F1E1B]/20 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all hover:border-[#8B6A2F] hover:bg-[#8B6A2F] hover:text-white"
            >
              <ArrowLeft size={14} />
              Voltar ao portfólio
            </Link>

            {/* Adjust the href to your real contact route */}
            <Link
              href="/contact"
              className="inline-flex w-fit items-center gap-3 border border-[#8B6A2F] bg-[#8B6A2F] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:border-[#1F1E1B] hover:bg-[#1F1E1B]"
            >
              Peça um projecto semelhante
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* FULLSCREEN LIGHTBOX */}
      {lightboxOpen && currentImage?.src && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada da galeria"
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#11110F]/95 p-4 backdrop-blur-sm sm:p-8"
        >
          {/* CLOSE */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fechar galeria"
            className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center text-white transition-colors hover:text-[#BD9655] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <X size={26} />
          </button>

          {/* LIGHTBOX IMAGE */}
          <div
            className="relative flex h-full w-full max-w-[1400px] touch-pan-y items-center justify-center"
            onClick={(event) => event.stopPropagation()}
            {...swipeHandlers}
          >
            {!currentImageFailed ? (
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                sizes="100vw"
                decoding="async"
                className="object-cover"
                onError={() => markImageAsFailed(activeImage)}
              />
            ) : (
              <p className="text-sm text-white">Imagem indisponível</p>
            )}

            {imageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  aria-label="Imagem anterior"
                  className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/10 text-white transition-colors hover:bg-[#8B6A2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:left-3"
                >
                  <ArrowLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Imagem seguinte"
                  className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/10 text-white transition-colors hover:bg-[#8B6A2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-3"
                >
                  <ArrowRight size={20} />
                </button>
              </>
            )}

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] tracking-[0.15em] text-white/70">
              {String(activeImage + 1).padStart(2, "0")}
              <span className="mx-2 text-white/30">/</span>
              {String(imageCount).padStart(2, "0")}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}