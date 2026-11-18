import { defineConfig } from "vite-plus";

// Keep this list in sync with the pages linked from the site (home and Art Canvas index).
const PAGE_ENTRIES = [
  "index.html",
  "experiments/automa/index.html",
  "experiments/fracture/index.html",
  "experiments/mosaic-maker/index.html",
  "experiments/notebook/index.html",
  "experiments/oeis-signal/index.html",
  "experiments/palette/index.html",
  "experiments/pixel-manipulator/index.html",
  "experiments/pixel/index.html",
  "experiments/radu-machine-learning/index.html",
  "experiments/randomart/index.html",
  "experiments/sequencer/index.html",
  "experiments/art-canvas/index.html",
  "experiments/art-canvas/atlas/index.html",
  "experiments/art-canvas/draw/index.html",
  "experiments/art-canvas/folded-space/index.html",
  "experiments/art-canvas/manual/index.html",
  "experiments/art-canvas/seed/index.html",
  "experiments/art-canvas/spirale/index.html",
];

export default defineConfig({
  root: "src",
  // Production sub-path (GitHub Pages project site). Change it if the repo is renamed.
  base: "/bedroom-survivor/",
  appType: "mpa",
  publicDir: "../public",
  cacheDir: "../node_modules/.vite",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: PAGE_ENTRIES,
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
