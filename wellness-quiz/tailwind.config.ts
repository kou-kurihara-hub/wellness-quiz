import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#4CAF50",
          "green-light": "#81C784",
          "green-dark": "#388E3C",
          orange: "#FF9800",
          "orange-light": "#FFB74D",
          "orange-dark": "#F57C00",
          yellow: "#FFC107",
          cream: "#FFFDE7",
        },
      },
      fontFamily: {
        sans: ["Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", "sans-serif"],
      },
      animation: {
        "bounce-in": "bounceIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pop": "pop 0.3s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "pulse-once": "pulse 0.6s ease-in-out",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
