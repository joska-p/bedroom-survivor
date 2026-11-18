---
name: pg_lab
description: A personal laboratory of generative-art experiments built with native DOM and OKLCH color.
colors:
  warm-paper: "oklch(0.956 0.055 96.155 / 0.5)"
  charcoal-veil: "oklch(0.277 0 0 / 0.5)"
  lab-ink: "oklch(0.277 0 0)"
  paper-ink: "oklch(0.956 0.055 96.155)"
  muted-ink: "oklch(0.482 0.018 61.042)"
  muted-chalk: "oklch(0.69 0.035 76.307)"
  hairline-warm: "oklch(0.825 0.051 85.116)"
  hairline-cool: "oklch(0.411 0.012 51.866)"
  teal-signal: "oklch(0.693 0.042 169.768)"
  dusk-blue: "oklch(0.471 0.082 215.806)"
  solder-green: "oklch(0.765 0.158 110.835)"
  solder-deep: "oklch(0.546 0.112 106.464)"
  beacon-amber: "oklch(0.832 0.159 82.987)"
  beacon-deep: "oklch(0.618 0.128 70.674)"
  ember-red: "oklch(0.66 0.218 30.392)"
  ember-deep: "oklch(0.437 0.179 28.26)"
  spectral-purple: "oklch(0.705 0.098 2.189)"
  spectral-purple-deep: "oklch(0.489 0.124 344.276)"
  circuit-aqua: "oklch(0.756 0.108 137.676)"
  circuit-aqua-deep: "oklch(0.534 0.082 155.401)"
  copper-orange: "oklch(0.731 0.182 51.693)"
  copper-orange-deep: "oklch(0.513 0.162 39.297)"
  canvas-well: "oklch(0.241 0.005 219.672)"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  "0": "0px"
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
components:
  button-shared:
    backgroundColor: "transparent"
    textColor: "{colors.lab-ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  button-shared-hover:
    backgroundColor: "{colors.hairline-warm}"
    textColor: "{colors.lab-ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.warm-paper}"
    rounded: "{rounded.md}"
    padding: "16px"
  badge:
    backgroundColor: "transparent"
    textColor: "{colors.lab-ink}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  input-select:
    backgroundColor: "{colors.warm-paper}"
    textColor: "{colors.lab-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  status-ok:
    backgroundColor: "oklch(0.765 0.158 110.835 / 0.12)"
    textColor: "{colors.solder-green}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  status-error:
    backgroundColor: "oklch(0.66 0.218 30.392 / 0.12)"
    textColor: "{colors.ember-red}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  status-pending:
    backgroundColor: "oklch(0.832 0.159 82.987 / 0.12)"
    textColor: "{colors.beacon-amber}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  canvas-viewport:
    backgroundColor: "{colors.canvas-well}"
    rounded: "{rounded.md}"
    height: "280px"
---

# Design System: pg_lab

## Overview

**Creative North Star: "The Spectral Notebook"**

pg_lab looks like a working notebook left open on an instrument bench: warm paper grounds, charcoal ink, hairline rules, and a small set of OKLCH signal colors that behave like labels on dials. The canvas is the loudest thing on screen; the interface around it stays precise, playful, and deliberately unspectacular. The voice is instrumented — readouts, status lines and short labels — rather than marketing copy. The rejected reference is the generic SaaS dashboard: no metric grids, no product-marketing chrome, no invented brand mythology.

Density is low to moderate. An experiment is a stage plus a 320px control panel; an index is a short list of quietly bordered cards. Everything is native HTML in light DOM: no framework, no shadow DOM, no component runtime. Motion is short (120–320ms) and only ever clarifies state.

Depth is layered, not lifted. Translucent surfaces sit over a five-radial aurora wash and are separated by 1px hairlines. The chosen direction of soft, layered cards is expressed through this translucent stacking, modest radii and tonal separation; the incumbent system has no ambient drop-shadow token, and none should be invented to fake softness.

**Key Characteristics:**

- Native controls, not design-system imitations.
- OKLCH as the only color language, with bright and faded pairs per theme.
- Stage-first hierarchy: the generated image dominates, the panel recedes.
- Hairline borders and 4–6px radii; surfaces are flat at rest.
- French interface copy, English code, docs and identifiers.

## Colors

The palette is a warm neutral ground carrying low-chroma teal and blue instrumentation, with saturated accents reserved for state and for the radial wash behind light pages.

### Primary

- **Teal Signal / Dusk Blue** (`oklch(0.693 0.042 169.768)` / `oklch(0.471 0.082 215.806)`): the primary accent on active navigation headings, links, focus rings, checkbox accents and the loading spinner. Teal Signal is the light-theme value; Dusk Blue is its faded dark-theme counterpart.

### Secondary

- **Solder Green / Solder Deep** (`oklch(0.765 0.158 110.835)` / `oklch(0.546 0.112 106.464)`): success and validation, used as a 12% tint behind success pills.
- **Beacon Amber / Beacon Deep** (`oklch(0.832 0.159 82.987)` / `oklch(0.618 0.128 70.674)`): warning and pending states, also a 12% tint.

### Tertiary

- **Ember Red / Ember Deep** (`oklch(0.66 0.218 30.392)` / `oklch(0.437 0.179 28.26)`): errors, alerts and destructive actions; also the first radial of the aurora wash.
- **Spectral Purple** (`oklch(0.705 0.098 2.189)`), **Circuit Aqua** (`oklch(0.756 0.108 137.676)`), **Copper Orange** (`oklch(0.731 0.182 51.693)`): atmospheric wash colors and selection; each has a faded dark counterpart (`oklch(0.489 0.124 344.276)`, `oklch(0.534 0.082 155.401)`, `oklch(0.513 0.162 39.297)`). They are never UI text colors.

### Neutral

- **Warm Paper / Charcoal Veil** (`oklch(0.956 0.055 96.155 / 0.5)` / `oklch(0.277 0 0 / 0.5)`): the 50%-alpha surface used by panels, cards and the stage over the page wash.
- **Lab Ink / Paper Ink** (`oklch(0.277 0 0)` / `oklch(0.956 0.055 96.155)`): primary text and titles, inverted per theme.
- **Muted Ink / Muted Chalk** (`oklch(0.482 0.018 61.042)` / `oklch(0.69 0.035 76.307)`): secondary text, hints and labels, verified at 5.75:1 light and 5.30:1 dark against their surface.
- **Hairline Warm / Hairline Cool** (`oklch(0.825 0.051 85.116)` / `oklch(0.411 0.012 51.866)`): borders and dividers only.
- **Canvas Well** (`oklch(0.241 0.005 219.672)`): the darkest plane, reserved for canvas viewports.

### Named Rules

**The Border-Only Neutral Rule.** `--pg-color-neutral` never carries text. Secondary text always uses `--pg-text-muted`, the AA-verified token.

**The Theme-Pair Rule.** Every semantic color has a bright light value and a faded dark value. Never reuse a bright value under `[data-theme="dark"]`.

**The Accent-as-Signal Rule.** Teal Signal / Dusk Blue marks navigation, focus and state. It never becomes a large surface fill.

## Typography

**Display Font:** system-ui (with -apple-system, BlinkMacSystemFont, "Segoe UI" and sans-serif fallbacks)
**Body Font:** the same system-ui stack
**Label/Mono Font:** "SFMono-Regular" (with Consolas, "Liberation Mono" and monospace fallbacks)

**Character:** Deliberately unbranded and readable, with no webfont to load. The system sans carries all prose and controls; the system mono carries numbers, statuses and metadata, giving the interface its instrument-readout feel.

### Hierarchy

- **Display** (600, 2.25rem, 1.5): the single `h1` in each `.pg-intro`.
- **Headline** (600, 1.25rem, 1.5): index section headings in Teal Signal / Dusk Blue.
- **Title** (600, 0.875rem, 1.5): `.pg-section h3` and `h4` group labels.
- **Body** (400, 1rem, 1.5): default copy, capped at 62ch by `--pg-layout-text-max-width`.
- **Label** (400, 0.75rem mono, 1.5): badges and compact metadata; status lines use the same mono face at 0.875rem.

### Named Rules

**The Mono-for-Numbers Rule.** Values, statuses, badges, stats and code are mono. Prose and interactive controls stay sans.

## Layout

Two families share the same tokens. Light pages (`pg-home`, Art Canvas index) center a 72rem column with 32px/24px padding, arrange cards in an auto-fit grid of at least 12rem with 12px gaps, and collapse to one column at 720px.

Experiment pages use `.pg-shell`: a full-viewport flex row (`100dvh`, 8px padding, 12px gap; 16px padding from 1024px) with a scrollable stage and a 320px panel. The panel is resizable between 160px and 600px through `--panel-width`, capped at 70% of the shell. In portrait orientation the shell stacks, the panel spans the full width and is capped at 50% height with a vertical resize handle.

Rhythm follows a 4px-based scale (4, 8, 12, 16, 24, 32, 48, 64px). Text stops at 62ch, canvas viewports start at 280px, and code blocks scroll after 14rem. Breakpoints are 720px (narrow) and 1024px (wide), mirrored numerically in media queries because custom properties cannot be used in `@media` conditions.

### Named Rules

**The Stage-First Rule.** The stage takes all remaining space. The panel is a fixed 320px default and never grows into the stage.

## Elevation & Depth

Soft layered cards, no lifted shadows at rest. Depth comes from five radial gradients on `body` (Ember 50%, Copper 45%, Spectral 40%, Teal 40%, Beacon 35%, each fading to transparent), the 50%-alpha surfaces on top of them, and 1px hairlines. The canvas well is the darkest plane. There is no `backdrop-filter` and no blur anywhere in the shared layer; the only `box-shadow` in the codebase is a 3px focus/selection ring in mosaic-maker.

### Shadow Vocabulary

- **Focus/selection halo** (`box-shadow: 0 0 0 3px var(--pg-color-neutral)`): local to mosaic-maker selection, never an ambient lift.

### Named Rules

**The Flat-By-Default Rule.** Cards and panels are flat at rest. Softness comes from translucent layering and modest radii, not from drop shadows.

**The Halo-Only Shadow Rule.** A shadow may only be a focus or selection ring. If a new surface needs separation, use a hairline or a surface tint first.

## Shapes

The form language is orthogonal and quiet. Controls use 4px radii, containers and canvas viewports use 6px, and a few experiment-local panels (pixel-manipulator) use 8px. Status pills, badges, the resize handle and the spinner use fully rounded 9999px ends. Borders are consistently 1px hairlines; canvas viewports clip their content with `overflow: hidden` and their 6px radius.

### Named Rules

**The Quiet-Corner Rule.** Default to 4px on controls and 6px on containers. Reserve 8px for experiment-local panels and 9999px for pills and circular controls.

## Components

### Buttons

- **Shape:** 4px radius (`--pg-radius-sm`), 1px `currentColor` border, 44px minimum height.
- **Primary:** transparent background, inherited text color, `0 12px` padding on light pages.
- **Hover / Focus:** hover fills with `--pg-color-neutral`; `:focus-visible` adds a 2px `--pg-color-aurora` outline at 2px offset.
- **Disabled:** 0.5 opacity with `not-allowed` cursor.
- **Placement:** `.pg-shell__content button` inside panels, `.pg-button` on light pages and stage content.

### Chips / Badges

- **Style:** transparent fill, 1px `currentColor` border, 9999px radius, mono 0.75rem text, `4px 8px` padding.
- **State:** purely informational; no selected variant in the shared layer.

### Cards / Containers

- **Corner Style:** 6px radius (`--pg-radius-md`).
- **Background:** 50%-alpha surface, over the radial wash.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** 1px `--pg-color-neutral`.
- **Internal Padding:** 16px with a 12px flex gap.

### Inputs / Fields

- **Style:** 4px radius, 1px `currentColor` border, surface background, `8px 12px` padding; checkboxes are 18px with `--pg-color-aurora` accent.
- **Focus:** 2px `currentColor` outline at 2px offset; links and buttons use the aurora outline instead.
- **Error / Disabled:** no shared input error variant; disabled buttons use 0.5 opacity.

### Navigation

- **Style:** grouped sections with a 1px top separator; section headings in Teal Signal / Dusk Blue with a Tier badge.
- **Cards:** links inherit color and remove the underline; hover shifts the border to the accent and adds an 8% accent tint over 120ms.
- **Motion:** reduced-motion users get no transition.

### Canvas Viewport & Status Pills (signature)

- **Viewport:** 280px minimum height, dark canvas well, 1px neutral border, 6px radius, clipped content; errors dim the canvas to 0.2 opacity and reveal a centered mono overlay.
- **Pills:** 9999px radius, mono 0.75rem, 12% tint and 1px border in Solder (ok), Ember (error) or Beacon (pending).

## Do's and Don'ts

### Do:

- **Do** use `--pg-*` tokens in experiment stylesheets; palette data colors such as swatches are the only exception.
- **Do** keep the 44px touch target on buttons and the 2px aurora focus outline on interactive elements.
- **Do** use `--pg-text-muted` for secondary text, verified at 5.75:1 light and 5.30:1 dark.
- **Do** keep interface copy in French and code, docs and identifiers in English.
- **Do** build tints with `color-mix(in oklab, ...)` so they follow the active theme.

### Don't:

- **Don't** hard-code hex or rgb colors, spacing or sizes in experiment `styles.css`.
- **Don't** use `--pg-color-neutral` for text; it is a border token.
- **Don't** add ambient drop shadows or backdrop blur; layered translucency and hairlines provide depth.
- **Don't** introduce a framework, shadow DOM or component runtime into an experiment page.
- **Don't** import webfonts; the system sans and system mono stacks are the specified pairing.
- **Don't** use custom properties inside `@media` conditions; mirror 720px and 1024px numerically.
