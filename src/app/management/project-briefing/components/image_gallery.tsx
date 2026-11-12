
"use client";

import { useCallback, useEffect, useState } from "react";
import {
    X,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    Download,
} from "lucide-react";

type GalleryImage = {
    id: string;
    name: string;
    url: string;
};

type Props = {
    images: GalleryImage[];
};

export default function BriefingImageGallery({ images }: Props) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const close = useCallback(() => setActiveIndex(null), []);

    const previous = useCallback(() => {
        setActiveIndex((current) =>
            current === null
                ? null
                : (current - 1 + images.length) % images.length
        );
    }, [images.length]);

    const next = useCallback(() => {
        setActiveIndex((current) =>
            current === null
                ? null
                : (current + 1) % images.length
        );
    }, [images.length]);

    useEffect(() => {
        if (activeIndex === null) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") close();
            if (event.key === "ArrowLeft") previous();
            if (event.key === "ArrowRight") next();
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeIndex, close, previous, next]);

    const activeImage =
        activeIndex === null ? null : images[activeIndex];

    return (
        <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image, index) => (
                    <button
                        key={image.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Ver imagem ${image.name}`}
                        className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655]"
                    >
                        <img
                            src={image.url}
                            alt={image.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        <span className="absolute inset-0 flex items-center justify-center bg-[#002950]/0 transition group-hover:bg-[#002950]/35">
                            <ZoomIn
                                size={25}
                                className="text-white opacity-0 transition group-hover:opacity-100"
                            />
                        </span>

                        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6 text-xs font-medium text-white">
                            {image.name}
                        </span>
                    </button>
                ))}
            </div>

            {activeImage && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Visualização de imagem"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
                    onClick={close}
                >
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Fechar imagem"
                        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    >
                        <X size={23} />
                    </button>

                    <div
                        className="relative flex h-full w-full max-w-7xl flex-col items-center justify-center"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <img
                            src={activeImage.url}
                            alt={activeImage.name}
                            className="max-h-[calc(100%-65px)] max-w-full rounded-lg object-contain"
                        />

                        <div className="mt-4 flex w-full items-center justify-between gap-4 text-white">
                            <p className="min-w-0 truncate text-sm font-medium">
                                {activeImage.name}
                            </p>

                            <div className="flex shrink-0 items-center gap-3">
                                <span className="text-xs text-white/65">
                                    {activeIndex! + 1} / {images.length}
                                </span>

                                <a
                                    href={activeImage.url}
                                    download={activeImage.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Descarregar imagem"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20"
                                >
                                    <Download size={17} />
                                </a>
                            </div>
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={previous}
                                    aria-label="Imagem anterior"
                                    className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 sm:-left-5"
                                >
                                    <ChevronLeft size={25} />
                                </button>

                                <button
                                    type="button"
                                    onClick={next}
                                    aria-label="Imagem seguinte"
                                    className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 sm:-right-5"
                                >
                                    <ChevronRight size={25} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
