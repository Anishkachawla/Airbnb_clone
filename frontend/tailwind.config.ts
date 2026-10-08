import type { Config } from "tailwindcss";

const withVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    // Full list (not `extend`) so media queries are emitted in ascending order. Adds Airbnb's grid
    // breakpoints (xs, m2, l2, 3xl) between Tailwind's defaults; 2xl is moved up to Airbnb's 1640px.
    screens: {
      xs: "550px", sm: "640px", md: "768px", m2: "950px", lg: "1024px", l2: "1128px",
      xl: "1280px", "2xl": "1640px", "3xl": "1880px",
    },
    extend: {
      colors: {
        rausch: "#FF385C",
        "rausch-dark": "#E00B41",
        ink: withVar("--ink"),
        muted: withVar("--muted"),
        line: withVar("--line"),
        surface: withVar("--surface"),
        soft: withVar("--soft"),
        hover: withVar("--hover"),
      },
      boxShadow: {
        card: "0 6px 16px rgba(0,0,0,0.12)",
        pill: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
        float: "0 6px 20px rgba(0,0,0,0.2)",
        search: "0 3px 12px 0 rgba(0,0,0,0.1)",
      },
      fontSize: { "2xs": ["11px", "14px"] },
      maxWidth: { page: "1760px", detail: "1120px" },
      keyframes: {
        "slide-up": { from: { transform: "translateY(100%)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "toast-in": { from: { transform: "translateY(16px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
      },
      animation: {
        "slide-up": "slide-up 280ms cubic-bezier(0.2,0,0,1)",
        "fade-in": "fade-in 200ms ease-out",
        "toast-in": "toast-in 240ms cubic-bezier(0.2,0,0,1)",
        shimmer: "shimmer 1.3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
