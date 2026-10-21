type StarsProps = {
  rating: number;
  className?: string;
  size?: number;
};

export function Stars({ rating, className = "", size = 14 }: StarsProps) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={`${rounded} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={index < rounded ? "var(--gold-500)" : "rgba(212,175,55,0.22)"}
          aria-hidden="true"
        >
          <path d="M10 1.6l2.47 5.26 5.53.67-4.1 3.87 1.09 5.62L10 14.3l-4.99 2.72 1.09-5.62-4.1-3.87 5.53-.67L10 1.6Z" />
        </svg>
      ))}
    </span>
  );
}
