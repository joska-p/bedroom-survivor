# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is the author of the lab, working alone in a personal creative-coding workspace. They open a page to try an idea, tune controls, inspect the rendered result and come back to it later. No other audience (students, public visitors, clients) was confirmed.

## Product Purpose

`pg_lab` is a playground of generative-art experiments: color generation, Canvas 2D, WebGL2 shaders, fractals, numeric sequences, cellular automata, pixel processing and a small sketch-classification demo. Success is creative exploration — the author can open an experiment, play with its parameters, see the result immediately and iterate. The durable goal is exploration; publishing a migration archive, teaching a curriculum and maintaining a public showcase were not confirmed as product goals.

## Positioning

Each experiment is an autonomous static page backed by a DOM-free engine and a shared native-DOM UI kit. The lab grows one page at a time without a framework, a state manager or cross-page dependencies. The former React packages are history, not a runtime requirement.

## Operating Context

- Static multi-page site: Vite+ MPA with `src/` as root, built into `dist/` and deployed to GitHub Pages under `/bedroom-survivor/`.
- The home page groups experiments by tier (A, B, C) and lists Art Canvas workshops; the Art Canvas has its own index page.
- An experiment page owns `index.html`, `main.ts`, page-local `styles.css`, often a DOM-free `core/` and a README recording intent, constraints and non-goals.
- Interaction uses native controls (sliders, selects, buttons, text inputs), a light/dark theme toggle, canvas stages with play/pause, status lines and error regions.
- Working loop: `vp dev`, `vp check --fix`, `vp build`. Architecture and conventions are documented in `codex/docs/` and `AGENTS.md`.

## Capabilities and Constraints

- Web only. Pages are independent; dependency direction is `experiments/ → ui/ + lib/`, `ui/ → lib/`, and `lib/` stays free of DOM, Canvas, WebGL and worker globals.
- No UI framework or state manager: native DOM, native controls, module-level state and explicit teardown on `pagehide`.
- Interface copy is French; code, documentation and identifiers are English.
- Shared styling comes from `--pg-*` tokens and components in `src/ui/styles/`; experiment-local CSS adds page-specific rules only and does not hard-code colors, spacing or sizes (palette data colors are the exception).
- Accessibility is AA-level: documented WCAG 2.1 AA contrast for `--pg-text-muted` (5.75:1 light, 5.30:1 dark), 44px minimum touch targets, visible focus, ARIA on controls and `prefers-reduced-motion` support.
- Themes are `light` and `dark`, switched through `data-theme` on `<html>`.
- New pages must be registered in `PAGE_ENTRIES` in `vite.config.ts` and linked from the relevant index page.

## Brand Commitments

- Name `pg_lab` (site title and home page heading); repository `joska-p/bedroom-survivor`, GitHub Pages base path `/bedroom-survivor/`.
- French interface voice, technical writing in English.
- The shared design system and the no-framework constraint are explicit, user-confirmed commitments.

## Evidence on Hand

- Working experiments and their READMEs under `src/experiments/`: `palette`, `notebook`, `mosaic-maker`, `randomart`, six Art Canvas workshops, `automa`, `fracture`, `oeis-signal`, `radu-machine-learning`, `pixel-manipulator`, `sequencer` and `pixel`.
- The design-system contract and contrast table in `src/ui/styles/README.md`.
- 320 labelled SVG sketches in `src/experiments/radu-machine-learning/assets/radu-img/`.
- Golden and property tests for the randomart engine in `src/lib/randomart/`.
- Architecture, dev-environment and convention docs in `codex/docs/` and `AGENTS.md`.
- No testimonials, customers, benchmarks, pricing, license or third-party proof exist; future work must not fabricate them.

## Product Principles

1. Exploration first: optimize for trying ideas and seeing results, not for shipping a product to others.
2. One page, one engine: keep experiments autonomous, with pure logic separated from DOM glue.
3. Stay dependency-light: native DOM and module state before any framework or store.
4. Reuse one shared foundation: tokens, controls and shell are extended rather than rebuilt per page.
5. Treat accessibility as a baseline: AA contrast, keyboard access, touch targets and reduced motion are not optional.

## Accessibility & Inclusion

WCAG 2.1 AA contrast is the documented standard for secondary text in both themes. Controls use 44px touch targets, visible focus rings and ARIA labels/roles where needed, with motion disabled under `prefers-reduced-motion`. No product-specific user need beyond the author's own usage was reported.
