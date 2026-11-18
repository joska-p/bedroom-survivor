# Design system — pg_lab

This folder holds the shared CSS layer for all pages. `main.css` is the single entry:
it imports tokens, reset, controls, shell layout and the light-page family.

Experiment pages link the shared entry, then their own `styles.css`:

```html
<link rel="stylesheet" href="../../ui/styles/main.css" />
<link rel="stylesheet" href="./styles.css" />
```

## Tokens (`--pg-*`)

All tokens live in `tokens.css` and are overridden per theme via `[data-theme='dark']` on `<html>`.

| Category | Token                                              | Role                                       |
| -------- | -------------------------------------------------- | ------------------------------------------ |
| Surface  | `--pg-surface-background`                          | Page, panel and stage background           |
| Surface  | `--pg-surface-foreground`                          | Primary text, titles                       |
| Text     | `--pg-color-neutral`                               | Fine borders only (not body text)          |
| Text     | `--pg-text-muted`                                  | Secondary text, hints, labels              |
| Accent   | `--pg-color-aurora`                                | Primary buttons, active links, focus rings |
| Accent   | `--pg-color-solder`                                | Success / validation                       |
| Accent   | `--pg-color-amber`                                 | Warning / loading                          |
| Accent   | `--pg-color-error`                                 | Errors, deletion, alerts                   |
| Border   | `--pg-border-hairline` (1px)                       | Component borders                          |
| Radius   | `--pg-radius-sm` / `--pg-radius-md`                | Rounded corners                            |
| Space    | `--pg-space-0` … `--pg-space-16`                   | Margins and padding                        |
| Touch    | `--pg-layout-control-touch-target` (44px)          | Min height of buttons / inputs             |
| Font     | `--pg-font-sans`                                   | Interface text                             |
| Font     | `--pg-font-mono`                                   | Code, stats, metadata                      |
| Motion   | `--pg-motion-duration-fast/normal/slow`            | Transition durations                       |
| Motion   | `--pg-motion-easing-out/in-out/linear`             | Easing curves                              |
| Layout   | `--pg-layout-text-max-width` (62ch)                | Max width for readable text                |
| Layout   | `--pg-layout-panel-width` (320px)                  | Default panel width                        |
| Layout   | `--pg-layout-canvas-viewport-min-height` (280px)   | Min height of shared canvas viewport       |
| Layout   | `--pg-layout-code-max-height` (14rem)              | Scroll cap for `<pre>` / code blocks       |
| Layout   | `--pg-layout-page-max-width` (72rem)               | Light index page width                     |
| Layout   | `--pg-layout-card-min-width` (12rem)               | Light index card grid minimum              |
| Focus    | `--pg-focus-ring-width` / `--pg-focus-ring-offset` | Focus and selection outline geometry       |
| Shadow   | `--pg-shadow-halo`                                 | Selection ring; no ambient drop shadows    |

`--pg-text-muted` is the semantic token for secondary text. It is defined per theme and was
verified with WCAG 2.1 contrast against `--pg-surface-background`:

| Theme | Value         | Contrast | Result           |
| ----- | ------------- | -------- | ---------------- |
| Light | `--pg-dark3`  | 5.75:1   | AA (normal text) |
| Dark  | `--pg-light4` | 5.30:1   | AA (normal text) |

Use it instead of `--pg-color-neutral` for any text; the neutral token is reserved for borders.

**Rule**: never use hard-coded colors, spacing or sizes in experiment `styles.css`. Use only `--pg-*` tokens. Palette data colors (e.g. mosaic tile swatches) are the exception — they are data, not UI tokens.

## Shared components (`controls.css`)

| Class                                             | Role                                                         |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `.pg-intro` / `.pg-intro h1` / `.pg-lead`         | Experiment header block                                      |
| `.pg-status` / `.pg-status--spaced`               | Mono status line, optional top spacing                       |
| `.pg-hint` / `.pg-back-link`                      | Muted small copy and workshop back links                     |
| `.pg-shell__content button` / `.pg-button`        | Panel and standalone buttons (touch target, hover, disabled) |
| `.pg-button--link` / `.pg-button--sm`             | Link-styled and compact button modifiers                     |
| `.pg-row` / `.pg-row--lg` / `.pg-actions`         | Horizontal clusters and wrapped action groups                |
| `.pg-stack` / `.pg-stack--md` / `.pg-stack--lg`   | Vertical stacks at 8/12/16px                                 |
| `.pg-grid--2` / `.pg-auto-grid`                   | Two-column and auto-fit grids                                |
| `.pg-control` / `.pg-control--inline`             | Label + native control row                                   |
| `.pg-control--stacked`                            | Full-width text input / textarea (long values)               |
| `.pg-control select/range/textarea/text/checkbox` | Styled native inputs                                         |
| `.pg-control output`                              | Mono readout for slider values                               |
| `[hidden]`                                        | Forces `display: none` over local `display: flex`            |
| `.pg-card`                                        | Container: border, radius, padding, surface background       |
| `.pg-section` / `.pg-panel-title`                 | Grouped controls; compact heading without separator margin   |
| `.pg-badge`                                       | Small rounded label, mono text                               |
| `.pg-code` / `.pg-code--wrap`                     | Scrollable code block with optional wrapping                 |
| `.pg-color-swatch` / `.pg-color-input`            | Native color input and swatch sizing                         |
| `.pg-empty` / `--fill` / `--dashed`               | Empty state variants                                         |
| `.pg-error`                                       | Error state: error border + muted error background           |
| `.pg-loading`                                     | Loading indicator (respects `prefers-reduced-motion`)        |
| `.pg-status-ok / -error / -pending`               | Status pills                                                 |
| `.pg-canvas-viewport` / `.pg-canvas`              | Shared canvas viewport (2D / WebGL)                          |
| `.pg-canvas--error` / `.pg-canvas__error`         | Canvas error overlay                                         |

`.pg-button` is the standalone form of the panel button style: both selectors share the same
rules, so existing panel buttons are unchanged. Use `.pg-button` for a button placed in a stage
or on a light page (homepage, art-canvas index), where `.pg-shell__content` is not an ancestor.

`[hidden]` uses `!important` because experiment-local rules such as `display: flex` on
`.pg-section` variants would otherwise override the user-agent `[hidden]` rule. This also covers
`.pg-section[hidden]` and any other hidden control group.

**Rule**: shared classes take precedence over experiment-local styles. Extend rather than duplicate.

## Light pages (`light-pages.css`)

Home and the Art Canvas summary use the `.pg-index` family: `.pg-index--scroll`,
`.pg-index__header`, `.pg-index__actions`, `.pg-index__nav`, `.pg-index__description` and
`.pg-index__grid`. Neither page keeps a local stylesheet. The 720px collapse lives in the shared
file, with the numeric breakpoint mirroring `--pg-breakpoint-narrow-max`.

## Stage and layout primitives (`shell.css`, `controls.css`)

`.pg-stage` is the default stage content stack (16px gap); `.pg-stage--compact` is the 12px variant.
Use `.pg-row`, `.pg-actions`, `.pg-stack` and `.pg-grid--2` for repeated control layout instead of
re-declaring `display: flex` or `display: grid` in an experiment stylesheet.

## Canvas viewport, code blocks and shader errors

`.pg-canvas-viewport` and `.pg-canvas` take their minimum height from
`--pg-layout-canvas-viewport-min-height` (280px): a page adopting the shared viewport does not need
a local height rule. Their borders, and the one on `.pg-canvas__error`, use `--pg-border-hairline`.

`--pg-layout-code-max-height` (14rem) caps the shared `.pg-code` primitive used by Notebook,
Pixel Docs and Randomart. Add `.pg-code--wrap` when a block should wrap instead of scroll
horizontally.

When shader compilation fails, or WebGL2 is unavailable, add `.pg-canvas--error` to the canvas and
reveal the `.pg-canvas__error.pg-error` overlay (`role="alert"`). Remove both on the next successful
render, so the dimmed canvas and the error message never disagree.

## Interaction & accessibility

- All buttons use `type="button"`.
- `:focus-visible` is styled in `reset.css`: `button`, `a`, `summary`, `[role='button']` and
  `[tabindex]` use a `--pg-color-aurora` outline; `input`, `select` and `textarea` keep their
  existing `currentColor` outline.
- `:disabled` buttons are styled in `controls.css` (opacity 0.5, `cursor: not-allowed`).
- `reset.css` disables all animations and transitions under `prefers-reduced-motion`; experiments
  do not repeat the media query locally.
- Controls carry ARIA attributes (`aria-label`, `aria-pressed`, `role="group"`, `role="radiogroup"`) where needed.
- No Shadow DOM. Light DOM only.

## Shell handle and portrait layout (`shell.css`)

The resize handle offsets are tokenized with `--pg-layout-control-touch-target` instead of hard-coded
`0.5rem`: `left: calc(-0.15 * …)` in landscape and `top: calc(-0.15 * …)` in portrait. In portrait,
`.pg-shell__panel` gets `max-width: 100%` so the stacked panel can use the full width. The panel no
longer has its own `overflow-y: auto`: scrolling belongs to `.pg-shell__content`.

## Theme

`ui/theme.ts` toggles `data-theme` on `<html>` (`light` / `dark`). CSS `color-scheme` and `--pg-*` overrides handle the rest without JS.
