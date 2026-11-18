# Project structure

This repository is a small multi-page site: one HTML entry per experiment, shared
DOM helpers in `ui/`, and pure engines in `lib/`.

## Layout

```text
src/
  index.html                  home page
  index.css                   home-only styles
  experiments/
    <slug>/
      index.html              page entry
      main.ts                 shell: DOM, events, lifecycle
      core/                   pure logic, no DOM
      worker.ts               optional worker entry
      styles.css              page-local styles only
      README.md               intent and constraints
    art-canvas/
      index.html              light index page
      page.ts                 shared bootstrap for the workshops
      <slug>/index.html       workshop page entry
  templates/
    page/                     scaffold copied for each new experiment
  ui/
    controls.ts               native control builders
    shell.ts                  pg-shell custom element
    theme.ts                  light/dark theme
    page.ts                   shared page bootstrap
    styles/
      base.css                tokens + reset + controls
      page.css                base + shell
  lib/
    randomart/                pure engines
    surface/
    pixel-core/
    worker-pool/
```

## Dependency direction

```text
experiments/  ->  ui/  +  lib/
ui/           ->  lib/
lib/           ->  nothing page-specific
```

`lib/` must stay free of DOM, Canvas, WebGL, workers and other ambient
environment. Those belong to `ui/` or to the page shell.

## Page anatomy

1. `index.html` owns the static markup: head, shell, stage content, panel
   mounts, script tag.
2. `main.ts` wires the page: `initPage()`, then controls and lifecycle.
3. `core/` holds deterministic logic and can be tested without a browser.
4. `styles.css` only adds page-specific rules; shared design lives in
   `ui/styles/`.
5. Workers are created by the page shell with
   `new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })`.

## Adding a page

1. Copy `src/templates/page/`.
2. Replace `{{TITLE}}` and `{{LEAD}}`.
3. Add the HTML entry to `PAGE_ENTRIES` in `vite.config.ts`.
4. Add a card to `src/index.html` and, for an Art Canvas workshop, to
   `src/experiments/art-canvas/index.html`.
5. Keep navigation links relative; Vite rewrites asset URLs with `base`, but it
   does not rewrite anchors.

## Assets

Co-locate assets with the code that owns them and resolve them through Vite
(`import.meta.glob(..., { query: "?url" })`), as `radu-machine-learning` does.
Do not add a `public/` + absolute `fetch()` path for a new asset.

## Build

Vite runs with `root: "src"` and `appType: "mpa"`. Every page must be listed in
`PAGE_ENTRIES`; an unlisted HTML file is not built. `vp build` writes the site
to `dist/` under the configured `base`.
