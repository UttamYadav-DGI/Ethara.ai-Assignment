/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      boxShadow: {
        glass: "0 20px 60px rgba(15, 23, 42, .08)",
        card: "0 1px 2px rgba(15, 23, 42, .06), 0 16px 36px rgba(15, 23, 42, .08)"
      },
      keyframes: {
        shimmer: { "0%": { left: "-100%" }, "100%": { left: "100%" } }
      },
      animation: { shimmer: "shimmer 1.5s infinite" }
    }
  },
  plugins: []
};
