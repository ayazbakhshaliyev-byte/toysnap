/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#ece0cc",
        paper: "#f8f4ea",
        ink: "#23211b",
        "ink-soft": "#4a4438",
        dim: "#8b8168",
        gold: "#a9853f",
        forest: "#1f3d34",
        rose: "#dcc1b6",
        "rose-ink": "#4a352e",
        blush: "#b5726c",
        noir: "#14110c",
        "noir-deep": "#0e0c08",
        sheet: "#f5efe2",
        // Легаси-палитра — используется ТОЛЬКО в кабинете организатора (/admin/...),
        // который сознательно оставлен в старом виде и не участвует в редизайне.
        slate: "#334155",
        "dusty-rose": "#d4a5a5",
        sage: "#9caf88",
        champagne: "#f2e6d9",
        "warm-beige": "#efe2d0",
        "old-gold": "#c9a96e",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "serif"],
        script: ["'Pinyon Script'", "cursive"],
        sans: ["'Helvetica Neue'", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0, 0, 0, 0.06)",
        "soft-hover": "0 12px 40px rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "heart-pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "heart-pop": "heart-pop 0.4s ease-out",
        "sheet-up": "sheet-up 0.28s cubic-bezier(.2,.8,.2,1)",
      },
    },
  },
  plugins: [],
};
