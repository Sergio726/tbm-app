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
        // ── Alias semánticos (theme-aware) → tokens de globals.css ──
        // Para componentes nuevos: bg-surface, text-fg-muted, border-border…
        bg:               "rgb(var(--c-bg) / <alpha-value>)",
        surface:          "rgb(var(--c-surface) / <alpha-value>)",
        elevated:         "rgb(var(--c-elevated) / <alpha-value>)",
        border:           "rgb(var(--c-border) / <alpha-value>)",
        "border-strong":  "rgb(var(--c-border-strong) / <alpha-value>)",
        fg:               "rgb(var(--c-fg) / <alpha-value>)",
        "fg-muted":       "rgb(var(--c-fg-muted) / <alpha-value>)",
        "fg-subtle":      "rgb(var(--c-fg-subtle) / <alpha-value>)",
        "fg-faint":       "rgb(var(--c-fg-faint) / <alpha-value>)",
        accent:           "rgb(var(--c-accent) / <alpha-value>)",
        "accent-hover":   "rgb(var(--c-accent-hover) / <alpha-value>)",
        "accent-text":    "rgb(var(--c-accent-text) / <alpha-value>)",
        "accent-fg":      "rgb(var(--c-on-accent) / <alpha-value>)",
        ring:             "rgb(var(--c-ring) / <alpha-value>)",
        success:          "rgb(var(--c-success) / <alpha-value>)",
        warn:             "rgb(var(--c-warn) / <alpha-value>)",
        danger:           "rgb(var(--c-danger) / <alpha-value>)",

        // ── Paleta TBM (compat) — re-apuntada a los mismos tokens ──
        tbm: {
          bg:        "rgb(var(--c-bg) / <alpha-value>)",
          surface:   "rgb(var(--c-surface) / <alpha-value>)",
          elevated:  "rgb(var(--c-elevated) / <alpha-value>)",
          border:    "rgb(var(--c-border) / <alpha-value>)",

          blue: {
            DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",
            light:   "rgb(var(--c-accent-text) / <alpha-value>)",
            dark:    "rgb(var(--c-accent-hover) / <alpha-value>)",
            muted:   "rgb(var(--c-accent) / 0.22)",
          },

          green:  "rgb(var(--c-success) / <alpha-value>)",
          yellow: "rgb(var(--c-warn) / <alpha-value>)",
          red:    "rgb(var(--c-danger) / <alpha-value>)",

          text: {
            primary:   "rgb(var(--c-fg) / <alpha-value>)",
            secondary: "rgb(var(--c-fg-muted) / <alpha-value>)",
            muted:     "rgb(var(--c-fg-subtle) / <alpha-value>)",
          },

          luz:    "rgb(var(--c-success) / <alpha-value>)",
          sombra: "rgb(var(--c-fg-faint) / <alpha-value>)",
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
