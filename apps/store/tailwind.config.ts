import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          100: "var(--gold-100)",
          300: "var(--gold-300)",
          500: "var(--gold-500)",
          700: "var(--gold-700)",
          900: "var(--gold-900)",
        },
        ink: "var(--ink)",
        charcoal: "var(--charcoal)",
        ivory: "var(--ivory)",
        blush: "var(--blush)",
        maroon: "var(--maroon)",
        success: "var(--success)",
        error: "var(--error)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        accent: "var(--font-accent)",
      },
      letterSpacing: {
        luxe: "0.22em",
      },
      screens: {
        xs: "420px",
      },
    },
  },
  plugins: [],
};

export default config;
