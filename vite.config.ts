import vitePlugin_react from "@vitejs/plugin-react";
import type { Plugin_2 } from "vite";
import { defineConfig } from "vite";

const isTsFileRegex = /^(?!.*\/node_modules\/).*\.ts(?:x|)(?:[?#].*)?$/;
const isWgslFileRegex = /^(?!.*\/node_modules\/).*\.wgsl(?:[?#].*)?$/;

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: ".cache/vite",

  plugins: [
    vitePlugin_wgsl(),

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

function vitePlugin_wgsl(): Plugin_2 {
  return {
    name: "vite-plugin-wgsl",
    enforce: "pre",

    transform(code: string, id: string) {
      if (isWgslFileRegex.test(id)) {
        return `export default ${JSON.stringify(code)}`;
      }
      return null;
    },
  };
}
