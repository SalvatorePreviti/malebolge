import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: ".cache/vite",

  plugins: [
    react({
      jsxRuntime: "automatic",
      include: [/\.jsx?$/, /\.tsx?$/],
    }),
  ],
  clearScreen: false,
});
