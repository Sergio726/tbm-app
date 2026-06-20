import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Paleta base TBM ──────────────────────────────────────
        tbm: {
          // Fondos (dark mode)
          bg:        "#0A1628", // fondo global (navy profundo)
          surface:   "#0F1B2D", // superficie de cards
          elevated:  "#162238", // hover / elementos elevados
          border:    "#1E3050", // bordes sutiles

          // Acento primario — Electric Blue
          blue: {
            DEFAULT: "#2563EB",
            light:   "#3B82F6",
            dark:    "#1D4ED8",
            muted:   "#1E3A8A",
          },

          // Semáforo TBM
          green:  "#10B981", // ≥100% de meta
          yellow: "#F59E0B", // 85-99% de meta
          red:    "#EF4444", // <85% de meta

          // Texto
          text: {
            primary:   "#F8FAFC", // texto principal (casi blanco)
            secondary: "#94A3B8", // texto secundario
            muted:     "#64748B", // placeholder / hint
          },

          // Estados DISC
          luz:    "#10B981", // verde (estado Luz)
          sombra: "#64748B", // gris (estado Sombra)
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.25s ease-out",
      },
      boxShadow: {
        "tbm-card": "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5)",
        "tbm-glow": "0 0 20px rgba(37, 99, 235, 0.15)",
      },
      backgroundImage: {
        "tbm-gradient": "linear-gradient(135deg, #0A1628 0%, #0F1B2D 100%)",
        "blue-gradient": "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
