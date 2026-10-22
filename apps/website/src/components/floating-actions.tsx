"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { whatsappHref } from "@uma/brand";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-7 sm:right-6">
      {showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="flex h-10 w-10 items-center justify-center border border-[rgba(122,90,18,0.4)] bg-[var(--ivory)] text-[var(--gold-900)] shadow-sm transition-colors hover:bg-[var(--gold-300)]"
        >
          <ArrowUp size={16} aria-hidden="true" />
        </button>
      ) : null}
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Krishna Jewellers on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--gold-300)] shadow-[0_12px_30px_-12px_rgba(14,11,7,0.8)] transition-transform hover:scale-105"
      >
        <MessageCircle size={20} aria-hidden="true" />
      </a>
    </div>
  );
}
