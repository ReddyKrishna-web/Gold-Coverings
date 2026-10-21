"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/lib/content";

export function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (direction: 1 | -1) => {
      setActive((current) => {
        if (current === null) return current;
        return (current + direction + images.length) % images.length;
      });
    },
    [images.length]
  );

  useEffect(() => {
    if (active === null) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, step]);

  const current = active !== null ? images[active] : null;

  return (
    <>
      <div className="columns-2 gap-3 sm:gap-4 md:columns-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActive(index)}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden bg-[var(--blush)] sm:mb-4"
            aria-label={`Open image: ${image.caption ?? image.alt}`}
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
            </div>
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(14,11,7,0.6)] via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            {image.caption ? (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3 text-left text-[0.6rem] uppercase tracking-[0.2em] text-[var(--ivory)] opacity-0 transition-opacity group-hover:opacity-100">
                {image.caption}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? current.alt}
          className="fixed inset-0 z-[80] flex flex-col bg-[rgba(14,11,7,0.96)] backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <p className="font-accent text-[0.6rem] uppercase tracking-[0.28em] text-[var(--gold-300)]">
              {current.caption ?? "Lookbook"} · {String((active ?? 0) + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="flex h-10 w-10 items-center justify-center border border-[rgba(212,175,55,0.4)] text-[var(--ivory)] transition-colors hover:bg-[rgba(212,175,55,0.15)]"
              aria-label="Close image viewer"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-16">
            <div className="relative h-full max-h-[78vh] w-full max-w-4xl">
              <Image
                src={current.url}
                alt={current.alt}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(212,175,55,0.4)] bg-[rgba(14,11,7,0.7)] text-[var(--gold-100)] hover:bg-[rgba(212,175,55,0.2)] sm:left-5"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(212,175,55,0.4)] bg-[rgba(14,11,7,0.7)] text-[var(--gold-100)] hover:bg-[rgba(212,175,55,0.2)] sm:right-5"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
