import path from "node:path";
import type { Options as TsupOptions } from "tsup";
import { build as tsupBuild } from "tsup";

export interface CompileTsOptions {
  folder: string;
  node: boolean;
  browser: boolean;
}

export async function buildTsProject({ folder, node, browser }: CompileTsOptions) {
  // await cleanDistFiles();

  /** @type {import('tsup').Options} */
  const commonTsupOptions = {
    entry: [path.resolve(folder, "index.ts")],
    splitting: false,
    sourcemap: true,
    clean: true,
    config: false,
    treeshake: true,
    target: "es2022",
  } satisfies TsupOptions;

  await tsupBuild({
    ...commonTsupOptions,
    outDir: path.resolve(folder, "dist"),
    cjsInterop: true,
    format: [node && "cjs", browser && "esm"].filter(Boolean) as TsupOptions["format"],
    dts: true,
    skipNodeModulesBundle: true,
    platform: "node",
    esbuildOptions: (options, context) => {
      return {
        ...options,
        dropLabels:
          context.format === "cjs"
            ? ["browser", "BROWSER", "deno", "DENO", "frontend", "FRONTEND"]
            : ["node", "NODE", "nodejs", "NODEJS", "backend", "BACKEND", "deno", "DENO"],
      };
    },
  });
}
