import forms from "@tailwindcss/forms";
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        ocean: "#0f766e",
        skyglass: "#ecfeff"
      },
      boxShadow: {
        soft: "0 24px 80px -40px rgb(15 23 42 / 0.45)"
      }
    }
  },
  plugins: [forms]
};

export default config;
