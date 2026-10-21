"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not subscribe right now.");
      setState("done");
      setMessage(payload.message ?? "You are on the list.");
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not subscribe right now.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm" noValidate>
      <label htmlFor="newsletter-email" className="field-label text-[var(--gold-300)]">
        New arrivals, quietly delivered
      </label>
      <div className="flex border-b border-[rgba(212,175,55,0.45)]">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full bg-transparent py-3 text-sm text-[var(--ivory)] placeholder:text-[rgba(255,249,236,0.35)] focus:outline-none"
          aria-describedby="newsletter-status"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="px-3 text-[var(--gold-300)] transition-transform hover:translate-x-1 disabled:opacity-50"
          aria-label="Subscribe to the newsletter"
        >
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-4 text-xs ${
          state === "error" ? "text-[#f0a9a3]" : "text-[rgba(255,249,236,0.6)]"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
