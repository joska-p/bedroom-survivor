import { defineShellElement } from "./shell";
import { initTheme } from "./theme";

/**
 * Shared bootstrap for pages that use the standard shell and theme toggle.
 * Pages with custom theme controls keep their own wiring.
 */
export function initPage(): void {
  defineShellElement();
  initTheme();
}
