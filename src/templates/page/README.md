# Page template

Copy this folder to `src/experiments/<slug>/` for a top-level experiment, or to
`src/experiments/art-canvas/<slug>/` for an Art Canvas workshop.

## Checklist

1. Replace `{{TITLE}}` and `{{LEAD}}` in `index.html`.
2. Keep the shared `page.css` link and put only page-specific rules in `styles.css`.
3. Add the page to `PAGE_ENTRIES` in `vite.config.ts`.
4. Add a card to `src/index.html` (and to the Art Canvas index for a workshop).
5. Use `initPage()` for the standard shell and theme toggle. Pages with a custom
   theme control keep their own wiring, like `oeis-signal`.
6. Fill control mounts with `ui/controls.ts` instead of rebuilding markup.
7. Check keyboard access, ARIA labels and `prefers-reduced-motion`.

## Paths

For a top-level experiment, the shared imports in `index.html` and `main.ts`
(`../../ui/...`) are correct. For an Art Canvas workshop, add one level:
`../../../ui/...`.
