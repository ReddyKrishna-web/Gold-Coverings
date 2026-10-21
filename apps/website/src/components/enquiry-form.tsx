"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { CATEGORIES, whatsappHref } from "@uma/brand";

type FormState = "idle" | "submitting" | "success" | "error";

export function EnquiryForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("submitting");
    setError("");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          interest: data.get("interest"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
          company: data.get("company"),
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not send your enquiry.");
      form.reset();
      setState("success");
    } catch (submitError) {
      setState("error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not send your enquiry. Please call or WhatsApp us instead."
      );
    }
  }

  if (state === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-full flex-col items-start justify-center border border-[rgba(212,175,55,0.4)] bg-[#fffdf7] p-8"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold-300)] text-[var(--ink)]">
          <Check size={20} aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-display text-2xl text-[var(--ink)]">Thank you — we have it.</h3>
        <p className="mt-2 max-w-sm text-sm font-light leading-relaxed text-[rgba(14,11,7,0.66)]">
          The store will call you back during opening hours. If it is urgent, message us on
          WhatsApp and we will reply as soon as we can.
        </p>
        <a
          href={whatsappHref("Hello Uma Fashions, I just sent an enquiry through the website.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline-ink mt-6"
        >
          Chat on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div>
          <label htmlFor="enquiry-name" className="field-label">
            Your name *
          </label>
          <input
            id="enquiry-name"
            name="name"
            required
            autoComplete="name"
            minLength={2}
            maxLength={80}
            className="field"
            placeholder="e.g. Sravani"
          />
        </div>
        <div>
          <label htmlFor="enquiry-phone" className="field-label">
            Phone / WhatsApp *
          </label>
          <input
            id="enquiry-phone"
            name="phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            pattern="[0-9+\s()-]{7,16}"
            className="field"
            placeholder="+91 …"
          />
        </div>
      </div>

      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div>
          <label htmlFor="enquiry-email" className="field-label">
            Email (optional)
          </label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            className="field"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="enquiry-interest" className="field-label">
            I&rsquo;m looking for
          </label>
          <select id="enquiry-interest" name="interest" className="field" defaultValue="">
            <option value="">Not sure yet</option>
            {CATEGORIES.map((category) => (
              <option key={category.slug} value={category.name}>
                {category.name}
              </option>
            ))}
            <option value="Bridal consultation">Bridal consultation</option>
            <option value="Custom order">Custom order</option>
            <option value="Something else">Something else</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="enquiry-message" className="field-label">
          How can we help? *
        </label>
        <textarea
          id="enquiry-message"
          name="message"
          required
          rows={4}
          minLength={10}
          maxLength={1200}
          className="field resize-none"
          placeholder="Occasion, date, size, colour preference — anything that helps us help you."
        />
      </div>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="enquiry-company">Company</label>
        <input id="enquiry-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 text-xs font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 h-4 w-4 accent-[var(--gold-700)]"
        />
        <span>
          I agree to be contacted about this enquiry. My details are handled as described in the{" "}
          <a href="/policies/privacy" className="underline decoration-[var(--gold-500)] underline-offset-2">
            privacy policy
          </a>
          .
        </span>
      </label>

      {state === "error" ? (
        <p role="alert" className="text-sm text-[var(--error)]">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={state === "submitting"} className="btn-gold w-full sm:w-auto">
        {state === "submitting" ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden="true" /> Sending
          </>
        ) : (
          <>
            Send enquiry <Send size={14} aria-hidden="true" />
          </>
        )}
      </button>
      <p className="text-[0.68rem] leading-relaxed text-[rgba(14,11,7,0.45)]">
        We usually reply during store hours. No spam, ever — just an answer to your question.
      </p>
    </form>
  );
}
