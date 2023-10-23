import { buildTsProject } from "./lib/build-ts-project";

export const buildAll = async () => {
  console.time("build");
  await Promise.all([
    buildTsProject({
      folder: "packages/core",
      node: true,
      browser: true,
    }),
    buildTsProject({
      folder: "packages/async",
      node: true,
      browser: true,
    }),
    buildTsProject({
      folder: "packages/data-structures",
      node: true,
      browser: true,
    }),
  ]);
  console.timeEnd("build");
};

buildAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
