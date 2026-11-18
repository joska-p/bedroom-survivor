# Randomart experiment

A React-free randomart playground built on the static shell and the shared `lib/` foundations. The
control panel mirrors the former React version, but every control is a native HTML element styled by
the shared `pg-*` design system.

## Pipeline

`(grammar, seed, color space)` → `generate()` → `compile(expression, { space })` →
`GpuSurface.tryCreateProgram()` → `draw()` on `onFrame()`.

The canvas is created once in `index.html`. Controls only swap the compiled `Program`, update
targeted DOM properties (`textContent`, `value`, `hidden`, `classList`, `dataset`) and schedule a
coalesced refresh. The generated expression and GLSL source are shown in place. When a
post-processing effect is active, `PostProcessPipeline` renders the base program into an offscreen
target pair and applies the enabled effects in registry order before the final pass.

## Controls

In panel order:

- **Actions** — Lecture/Pause and Reset (disabled for static shaders), Nouvelle graine, Exporter PNG.
- **Grammaire** — preset select (adopting a preset also selects its suggested color space), Grammaire
  aléatoire. A `Personnalisé` entry appears once a weight or structure slider is edited.
- **Couleur** — one native select built from `COLOR_SPACES`.
- **Post-traitement** — native checkboxes for grain, smooth min and smooth max.
- **Graine** — free text validated with `parseSeed` on `change`; invalid values revert to the last
  valid seed.
- **Poids des opérateurs** — one native range per operator, grouped by family. The minimum stays at
  1 for the last enabled terminal or non-terminal.
- **Structure** — native ranges for min depth, max depth, max nodes and channel sharing. Transitions
  in `lib/randomart/grammarEdits.ts` keep neighboring values feasible.
- **Expression** — read-only formula for one field or three channels, plus source size and animation
  status.
- **Shader GLSL** — native `<details>` with a read-only textarea and a copy-to-clipboard button.
- **Erreurs** — action and shader errors are also reported in the panel, next to the stage overlay.

While paused, a change still triggers a single frame so the result stays visible without resuming the
loop. PNG export re-renders the base shader offscreen at 2048px, capped by the GPU viewport limits;
post-processing effects are not applied to the export.

## Failures

- No WebGL2: a readable message is shown in the stage and the panel; formula and stats remain
  available.
- `ShaderError` (compile or link) and any generation/compilation error: the loop is stopped, the old
  program is released, and the message is shown in the stage and the panel. Fixing a control rebuilds
  the artwork.
- A failing post-processing shader disables the chain for the session and falls back to the base
  program.
- Export and clipboard failures are reported in the panel without changing the artwork.

`GpuSurface.destroy()`, the post-processing pipeline and pending timers are released on `pagehide`.

## Non-goals

- No framework or component runtime in the page.
- No grammar text editor: weights and structure stay numeric native controls.
- No offscreen batch rendering besides the one-shot PNG export.
