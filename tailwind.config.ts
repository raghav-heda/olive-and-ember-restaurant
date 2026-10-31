import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#FCFAF7",
          100: "#F8F5F0",
          200: "#F1EBE1",
          300: "#E6DCD0",
          400: "#D5C4B0",
        },
        charcoal: {
          700: "#36322F",
          800: "#24211E",
          900: "#181614",
          950: "#0F0E0D",
        },
        olive: {
          50: "#F5F7F2",
          100: "#E8EDE1",
          500: "#5B6E38",
          600: "#4D5D2E",
          700: "#3E4C24",
          800: "#313C1C",
          900: "#252D15",
        },
        terracotta: {
          50: "#FDF6F3",
          100: "#FAECE6",
          400: "#D97354",
          500: "#C25E3E",
          600: "#A84C30",
          700: "#8A3D25",
          800: "#6E301D",
        },
        gold: {
          400: "#D4AF37",
          500: "#C59B27",
          600: "#A8821C",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
