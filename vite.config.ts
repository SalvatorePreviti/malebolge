import vitePlugin_react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const isTsFileRegex = /^(?!.*\/node_modules\/).*\.ts(?:x|)(?:[?#].*)?$/;

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: ".cache/vite",

  plugins: [
    vitePlugin_react({
      jsxRuntime: "automatic",
      include: [/\.jsx?$/, /\.tsx?$/],
      babel: (id) => {
        if (isTsFileRegex.test(id)) {
          return {
            plugins: ["@emotion"],
          };
        }
        return null;
      },
    }),
  ],
  clearScreen: false,
});
