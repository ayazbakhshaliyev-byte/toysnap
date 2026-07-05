/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FDF8F5",
        "dusty-rose": "#D4A5A5",
        sage: "#B5C1B4",
        champagne: "#F2E6D9",
        slate: "#3A3A3A",
        "warm-beige": "#E8DDD0",
        "old-gold": "#C9A96E",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        "serif-light": ["'Cormorant Garamond'", "serif"],
        sans: ["'Inter'", "sans-serif"],
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
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "heart-pop": "heart-pop 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
