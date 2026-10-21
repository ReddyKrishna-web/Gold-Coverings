type OrnamentProps = {
  className?: string;
  tone?: "gold" | "muted";
};

/** A small hand-drawn style filigree divider. Purely decorative. */
export function Ornament({ className = "", tone = "gold" }: OrnamentProps) {
  const stroke = tone === "gold" ? "var(--gold-500)" : "rgba(122, 90, 18, 0.35)";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 18"
      className={`h-4 w-44 ${className}`}
      fill="none"
    >
      <path d="M0 9h54" stroke={stroke} strokeWidth="1" opacity="0.6" />
      <path d="M126 9h54" stroke={stroke} strokeWidth="1" opacity="0.6" />
      <path
        d="M90 2c4.5 3 7.5 4.5 12 4.5-4.5 0-7.5 1.5-12 4.5-4.5-3-7.5-4.5-12-4.5 4.5 0 7.5-1.5 12-4.5Z"
        stroke={stroke}
        strokeWidth="1"
      />
      <circle cx="70" cy="9" r="1.6" fill={stroke} />
      <circle cx="110" cy="9" r="1.6" fill={stroke} />
      <path d="M84 9h-10M96 9h10" stroke={stroke} strokeWidth="1" opacity="0.7" />
    </svg>
  );
}
