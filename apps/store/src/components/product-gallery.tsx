"use client";

import Image from "next/image";
import { useState } from "react";
import { ZoomIn } from "lucide-react";

type GalleryImage = { id: string; url: string; alt: string };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center border border-[rgba(122,90,18,0.15)] bg-[var(--blush)] text-xs uppercase tracking-[0.2em] text-[rgba(14,11,7,0.4)]">
        Photograph coming soon
      </div>
    );
  }

  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden border border-[rgba(122,90,18,0.15)] bg-[var(--blush)]">
        <button
          type="button"
          onClick={() => setZoomed((value) => !value)}
          className="absolute inset-0 z-10 cursor-zoom-in"
          aria-label={zoomed ? "Zoom out" : "Zoom in"}
        >
          <span className="sr-only">{zoomed ? "Zoom out of" : "Zoom into"} product image</span>
        </button>
        <Image
          src={current.url}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={`object-cover transition-transform duration-700 ${zoomed ? "scale-150" : "scale-100"}`}
        />
        <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 border border-[rgba(255,249,236,0.5)] bg-[rgba(14,11,7,0.4)] px-2 py-1 text-[0.5rem] uppercase tracking-[0.14em] text-[var(--ivory)]">
          <ZoomIn size={11} aria-hidden="true" /> {zoomed ? "Click to reset" : "Zoom"}
        </span>
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2.5" role="tablist" aria-label={`${name} images`}>
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => {
                setActive(index);
                setZoomed(false);
              }}
              className={`relative aspect-square w-16 overflow-hidden border transition-colors sm:w-20 ${
                index === active
                  ? "border-[var(--gold-700)]"
                  : "border-[rgba(122,90,18,0.16)] hover:border-[rgba(122,90,18,0.4)]"
              }`}
              aria-label={`View image ${index + 1} of ${images.length}`}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
