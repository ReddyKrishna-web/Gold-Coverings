import { CATEGORIES } from "@uma/brand";

export function Marquee() {
  const items = CATEGORIES.map((category) => category.shortName);

  return (
    <div
      className="marquee border-y border-[rgba(212,175,55,0.24)] bg-[var(--ink)] py-5"
      aria-label="Collections at Krishna Jewellers"
    >
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-10" aria-hidden={copy === 1}>
            {items.map((item) => (
              <span key={`${copy}-${item}`} className="flex items-center gap-10">
                <span className="font-accent text-[0.65rem] uppercase tracking-[0.32em] text-[var(--gold-300)]">
                  {item}
                </span>
                <span className="text-[0.7rem] text-[var(--gold-500)]" aria-hidden="true">
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
