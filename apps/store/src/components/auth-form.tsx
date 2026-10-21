"use client";

import { useState, useTransition } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { loginAction, signupAction } from "@/app/actions/auth";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const isLogin = mode === "login";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (next) formData.set("next", next);
    setError("");

    startTransition(async () => {
      const result = isLogin
        ? await loginAction({}, formData)
        : await signupAction({}, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {!isLogin ? (
        <div>
          <label htmlFor="auth-name" className="field-label">
            Full name
          </label>
          <input
            id="auth-name"
            name="name"
            required
            autoComplete="name"
            minLength={2}
            maxLength={80}
            className="field"
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="auth-email" className="field-label">
          Email
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          placeholder="you@example.com"
        />
      </div>

      {!isLogin ? (
        <div>
          <label htmlFor="auth-phone" className="field-label">
            Phone (optional)
          </label>
          <input
            id="auth-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="field"
            placeholder="+91 …"
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="auth-password" className="field-label">
          Password
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={200}
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="field"
          placeholder="At least 8 characters"
        />
      </div>

      {error ? (
        <p role="alert" className="border border-[rgba(179,38,30,0.3)] bg-[#fdf2f1] px-3 py-2 text-xs text-[var(--error)]">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-gold w-full py-3.5">
        {pending ? (
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
        ) : isLogin ? (
          <LogIn size={15} aria-hidden="true" />
        ) : (
          <UserPlus size={15} aria-hidden="true" />
        )}
        {isLogin ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
