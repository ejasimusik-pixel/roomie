/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Manrope", "system-ui", "sans-serif"],
      },
      colors: {
        // ROOMIE brand palette (from official logo + moodboard)
        magenta: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#E040A0", // primary
          600: "#c91d8b",
          700: "#a01270",
          800: "#7a0e57",
          900: "#580a3f",
        },
        violet: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#b58df1",
          500: "#7C52AA", // secondary
          600: "#65408d",
          700: "#4e3270",
          800: "#3a2554",
          900: "#2D1B3D", // text primary deep
        },
        sky: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#4285F4", // user requested blue
          500: "#0096CC", // tertiary
          600: "#0077a3",
          700: "#015b7c",
        },
        cream: {
          50: "#FDFBFF",
          100: "#F8F4FF",
          200: "#F0E9FA",
        },
      },
      backgroundImage: {
        "roomie-gradient":
          "linear-gradient(135deg, #4285F4 0%, #7C52AA 50%, #E040A0 100%)",
        "roomie-soft":
          "linear-gradient(135deg, #E0EAFF 0%, #F0E9FA 50%, #FCE7F3 100%)",
        "roomie-text":
          "linear-gradient(135deg, #4285F4 0%, #7C52AA 55%, #E040A0 100%)",
        "glass-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%)",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(124, 82, 170, 0.15)",
        glow: "0 8px 40px -12px rgba(224, 64, 160, 0.25)",
        glass:
          "0 8px 32px 0 rgba(124, 82, 170, 0.12), inset 0 1px 0 0 rgba(255,255,255,0.6)",
        pill: "0 4px 16px -4px rgba(224, 64, 160, 0.4)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
