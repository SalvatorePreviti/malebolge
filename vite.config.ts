import { defineConfig } from "vite";
import vitePlugin_react from "@vitejs/plugin-react";
import vitePlugin_linaria from "@linaria/vite";

const isDevelopment = process.env.NODE_ENV === "development";

const customVitePlugin_linaria = () => {
  const plugin = vitePlugin_linaria({
    sourceMap: isDevelopment || undefined,
    classNameSlug: isDevelopment ? "[title]_[hash]" : undefined,
    variableNameSlug: isDevelopment ? "[componentName]-[valueSlug]-[index]" : undefined,
    babelOptions: {
      presets: ["@babel/preset-typescript", "@babel/preset-react"],
    },
  });

  const pluginTransform = plugin.transform!;

  const excludedExtensions = new Set([".css", ".js", ".mjs", ".cjs"]);

  const transform: typeof plugin.transform = async function (code, id, options) {
    // Remove everything after ? and #
    id = id.replace(/\?.*$/, "");

    const extension = id.slice(id.lastIndexOf("."));
    if (excludedExtensions.has(extension)) {
      return null;
    }

    if (id === "/@react-refresh") {
      return null;
    }

    if (id.includes("/node_modules/") || id.startsWith("node_modules/")) {
      return null;
    }

    const result = await (pluginTransform as Function).call(this, code, id, options);
    return result;
  };

  return {
    ...plugin,
    transform,
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: ".cache/vite",

  plugins: [
    vitePlugin_react({
      jsxRuntime: "automatic",
      include: [/\.jsx?$/, /\.tsx?$/],
    }),
    customVitePlugin_linaria(),
  ],
  clearScreen: false,
});
