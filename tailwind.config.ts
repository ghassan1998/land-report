import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { navy: "#0D3B66", brand: "#1D4E89", ink: "#16222f", mist: "#eef4fa" },
      fontFamily: { sans: ["Cairo", "Tajawal", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
