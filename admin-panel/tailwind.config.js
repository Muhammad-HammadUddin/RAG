/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          950: "#0B1220",
          900: "#0F172A",
          800: "#141E33",
          700: "#1C2A45",
          600: "#28395C",
        },
        signal: {
          DEFAULT: "#28E0B9",
          dim: "#1BA98C",
          soft: "rgba(40,224,185,0.12)",
        },
        amber: {
          DEFAULT: "#F5A524",
          soft: "rgba(245,165,36,0.14)",
        },
        rose: {
          DEFAULT: "#F5495E",
          soft: "rgba(245,73,94,0.13)",
        },
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -8px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
