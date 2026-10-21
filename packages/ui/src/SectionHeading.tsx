import type { ReactNode } from "react";
import { Ornament } from "./Ornament";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  ornament?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  ornament = true,
  className = "",
}: SectionHeadingProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={`${align === "center" ? "mx-auto text-center" : "text-left"} max-w-2xl ${className}`}
    >
      {eyebrow ? (
        <p className={`eyebrow ${isDark ? "text-[var(--gold-300)]" : ""}`}>{eyebrow}</p>
      ) : null}
      <h2
        className={`display-lg mt-4 ${isDark ? "text-[var(--ivory)]" : "text-[var(--ink)]"}`}
      >
        {title}
      </h2>
      {ornament ? <Ornament className={align === "center" ? "mx-auto mt-6" : "mt-6"} /> : null}
      {description ? (
        <p
          className={`body-lg mt-5 ${isDark ? "text-[rgba(255,249,236,0.72)]" : "text-[rgba(14,11,7,0.66)]"}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
