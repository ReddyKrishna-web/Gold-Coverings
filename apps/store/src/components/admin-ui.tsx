import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="font-accent text-[0.6rem] uppercase tracking-[0.22em] text-[var(--gold-700)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-3xl text-[var(--ink)] sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm font-light text-[rgba(14,11,7,0.55)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

export function AdminStat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const body = (
    <div className="admin-card p-4 transition-colors hover:border-[rgba(122,90,18,0.35)]">
      <p className="text-[0.58rem] uppercase tracking-[0.14em] text-[rgba(14,11,7,0.45)]">{label}</p>
      <p className="mt-1.5 font-display text-2xl text-[var(--ink)]">{value}</p>
      {hint ? <p className="mt-1 text-[0.62rem] text-[rgba(14,11,7,0.45)]">{hint}</p> : null}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

export function AdminEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="admin-card p-8 text-center">
      <p className="font-display text-xl text-[var(--ink)]">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs font-light leading-relaxed text-[rgba(14,11,7,0.55)]">
        {body}
      </p>
    </div>
  );
}

export function AdminNotice({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`mt-4 border px-3 py-2 text-xs ${
        tone === "success"
          ? "border-[rgba(46,125,50,0.3)] bg-[#eef7ee] text-[var(--success)]"
          : "border-[rgba(179,38,30,0.3)] bg-[#fdf2f1] text-[var(--error)]"
      }`}
    >
      {children}
    </p>
  );
}
