/*
 * Randomart experiment: one static shell, one WebGL2 canvas, one compiled program at a time.
 * Controls only swap the program and update text/values; the markup is never rebuilt.
 */

import { COLOR_SPACES, getColorSpace, isColorSpaceId } from '../../lib/randomart/colors';
import type { ColorSpaceId } from '../../lib/randomart/colors';
import { compile } from '../../lib/randomart/emit';
import type { Compiled } from '../../lib/randomart/emit';
import { generate } from '../../lib/randomart/generate';
import {
    drawGrammar,
    getGrammarPreset,
    GRAMMAR_PRESETS,
    isOnlyNonTerminal,
    isOnlyTerminal,
    MAX_WEIGHT,
    maxFeasibleMinDepth,
    minimumNodes,
    presetOf,
    weightOf,
} from '../../lib/randomart/grammar';
import type { Grammar, GrammarPresetId } from '../../lib/randomart/grammar';
import {
    withMaxDepth,
    withMaxNodes,
    withMinDepth,
    withShareDepth,
    withWeight,
} from '../../lib/randomart/grammarEdits';
import { groupOf, isTerminal, OP_NAMES } from '../../lib/randomart/ops';
import type { OpName } from '../../lib/randomart/ops';
import { createRng } from '../../lib/randomart/rng';
import { createSeed, MAX_SEED_LENGTH, parseSeed } from '../../lib/randomart/seed';
import type { Seed } from '../../lib/randomart/seed';
import { formatFormula, isMonoExpression } from '../../lib/randomart/tree';
import type { Expression } from '../../lib/randomart/tree';
import { GpuSurface, ShaderError } from '../../lib/surface/gpu';
import type { Program } from '../../lib/surface/gpu';
import { createSelect, createSlider, createTextInput, createToggle } from '../../ui/controls';
import { initPage } from '../../ui/page';
import { exportPng } from './exportPng';
import type { ActiveEffects, PostProcessEffectId } from './postProcessing';
import { POST_PROCESS_EFFECTS } from './postProcessing';
import { PostProcessPipeline } from './renderPipeline';

const DEFAULT_PRESET = getGrammarPreset('default');
const CUSTOM_PRESET_ID = 'custom';
const MAX_MIN_DEPTH = 8;
const MAX_MAX_DEPTH = 10;
const MAX_NODES = 100;
const COPY_FEEDBACK_MS = 1500;

const WEIGHT_GROUPS = ['terminal', 'arithmetic', 'trigonometry', 'logic', 'transform'] as const;
const WEIGHT_GROUP_LABELS: Record<(typeof WEIGHT_GROUPS)[number], string> = {
    terminal: 'terminaux',
    arithmetic: 'arithmétique',
    trigonometry: 'trigonométrie',
    logic: 'logique',
    transform: 'déformation',
};

const PRESET_DESCRIPTIONS: Record<GrammarPresetId, string> = {
    default: 'Équilibre neutre : tous les opérateurs à poids modéré.',
    monochrome: 'Formes en niveaux de gris : canaux verrouillés, arithmétique seulement.',
    prism: 'Polychromie vive : canaux indépendants, ondes sinusoïdales.',
    warped: 'Distorsions fluides : coordonnées repliées et déformées.',
    graphic: 'Aplats marqués : arêtes dures issues des comparaisons.',
};

interface ArtworkDraft {
    readonly seed: Seed;
    readonly grammar: Grammar;
    readonly space: ColorSpaceId;
}

interface Artwork {
    readonly expression: Expression;
    readonly shader: Compiled;
}

function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Randomart markup is incomplete: ${selector}`);
    }

    return element;
}

function isGrammarPresetId(value: string): value is GrammarPresetId {
    return GRAMMAR_PRESETS.some((preset) => preset.id === value);
}

function randomSeed(): Seed {
    const bytes = new Uint8Array(8);

    crypto.getRandomValues(bytes);

    return createSeed(Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''));
}

function describeError(error: unknown): string {
    if (error instanceof ShaderError) {
        return `Compilation du shader (${error.stage}) : ${error.log.trim() || error.message}`;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

// --- DOM ------------------------------------------------------------------

const viewport = required<HTMLElement>('.pg-canvas-viewport');
const canvas = required<HTMLCanvasElement>('[data-canvas]');
const errorBox = required<HTMLElement>('[data-error]');
const loading = required<HTMLElement>('[data-loading]');
const status = required<HTMLElement>('[data-status]');
const stats = required<HTMLElement>('[data-stats]');
const shaderCode = required<HTMLTextAreaElement>('[data-shader-code]');
const copyButton = required<HTMLButtonElement>('[data-copy-shader]');
const panelErrorSection = required<HTMLElement>('[data-panel-error-section]');
const panelError = required<HTMLElement>('[data-panel-error]');
const weightsHost = required<HTMLElement>('[data-weights]');
const grammarMount = required<HTMLElement>('[data-control="grammar"]');
const seedMount = required<HTMLElement>('[data-control="seed"]');
const spaceMount = required<HTMLElement>('[data-control="space"]');
const newSeedButton = required<HTMLButtonElement>('[data-new-seed]');
const randomGrammarButton = required<HTMLButtonElement>('[data-random-grammar]');
const exportButton = required<HTMLButtonElement>('[data-export-png]');
const regenerateButton = required<HTMLButtonElement>('[data-regenerate]');
const playButton = required<HTMLButtonElement>('[data-play-toggle]');
const resetButton = required<HTMLButtonElement>('[data-play-reset]');

const inspector = {
    mono: required<HTMLElement>('[data-inspector="mono"]'),
    r: required<HTMLElement>('[data-inspector="r"]'),
    g: required<HTMLElement>('[data-inspector="g"]'),
    b: required<HTMLElement>('[data-inspector="b"]'),
};
const inspectorLabels = {
    mono: required<HTMLElement>('[data-inspector-label="mono"]'),
    r: required<HTMLElement>('[data-inspector-label="r"]'),
    g: required<HTMLElement>('[data-inspector-label="g"]'),
    b: required<HTMLElement>('[data-inspector-label="b"]'),
};
const formulas = {
    mono: required<HTMLElement>('[data-formula="mono"]'),
    r: required<HTMLElement>('[data-formula="r"]'),
    g: required<HTMLElement>('[data-formula="g"]'),
    b: required<HTMLElement>('[data-formula="b"]'),
};

// --- State ----------------------------------------------------------------

let draft: ArtworkDraft = {
    seed: createSeed('42'),
    grammar: DEFAULT_PRESET.grammar,
    space: DEFAULT_PRESET.space,
};
let artwork: Artwork | null = null;

const activeEffects: ActiveEffects = {};
for (const effect of POST_PROCESS_EFFECTS) {
    activeEffects[effect.id] = effect.defaultActive;
}

let surface: GpuSurface | null = null;
let program: Program | null = null;
const pipeline = new PostProcessPipeline();
let playing = false;
let unsubscribeFrame: (() => void) | null = null;
let renderScheduled = false;
let exporting = false;
let pipelineFailed = false;
let copyFeedbackTimer = 0;
let firstFrame = 0;
let secondFrame = 0;

// --- Native controls -------------------------------------------------------

const grammarOptions = [
    ...GRAMMAR_PRESETS.map((preset) => ({ value: preset.id, label: preset.label })),
    { value: CUSTOM_PRESET_ID, label: 'Personnalisé' },
];
const grammarSelect = createSelect(grammarMount, grammarOptions, DEFAULT_PRESET.id);
const seedInput = createTextInput(seedMount, draft.seed);
const spaceSelect = createSelect(
    spaceMount,
    COLOR_SPACES.map((space) => ({ value: space.id, label: space.label })),
    draft.space,
);
seedInput.maxLength = MAX_SEED_LENGTH;

const effectToggles = new Map<PostProcessEffectId, HTMLInputElement>();
for (const effect of POST_PROCESS_EFFECTS) {
    const mount = required<HTMLElement>(`[data-control="effect-${effect.id}"]`);
    effectToggles.set(effect.id, createToggle(mount, activeEffects[effect.id] === true));
}

const weightSliders = new Map<OpName, HTMLInputElement>();
const weightOutputs = new Map<OpName, HTMLOutputElement>();
for (const family of WEIGHT_GROUPS) {
    const names = OP_NAMES.filter((name) => groupOf(name) === family);
    if (names.length === 0) {
        continue;
    }

    const group = document.createElement('div');
    group.className = 'pg-randomart__group';

    const title = document.createElement('p');
    title.className = 'pg-randomart__group-title';
    title.textContent = WEIGHT_GROUP_LABELS[family];
    group.append(title);

    for (const name of names) {
        const label = document.createElement('label');
        label.className = 'pg-control pg-control--inline';

        const nameLabel = document.createElement('span');
        nameLabel.textContent = name;

        const mount = document.createElement('span');
        const slider = createSlider(mount, {
            min: 0,
            max: MAX_WEIGHT,
            step: 1,
            value: weightOf(draft.grammar, name),
        });
        const output = document.createElement('output');
        output.textContent = slider.value;

        label.append(nameLabel, mount, output);
        group.append(label);
        weightSliders.set(name, slider);
        weightOutputs.set(name, output);
    }

    weightsHost.append(group);
}

const structure = {
    minDepth: {
        slider: createSlider(required<HTMLElement>('[data-control="min-depth"]'), {
            min: 1,
            max: MAX_MIN_DEPTH,
            step: 1,
            value: draft.grammar.minDepth,
        }),
        output: required<HTMLOutputElement>('[data-value="min-depth"]'),
    },
    maxDepth: {
        slider: createSlider(required<HTMLElement>('[data-control="max-depth"]'), {
            min: 1,
            max: MAX_MAX_DEPTH,
            step: 1,
            value: draft.grammar.maxDepth,
        }),
        output: required<HTMLOutputElement>('[data-value="max-depth"]'),
    },
    maxNodes: {
        slider: createSlider(required<HTMLElement>('[data-control="max-nodes"]'), {
            min: minimumNodes(draft.grammar),
            max: MAX_NODES,
            step: 1,
            value: draft.grammar.maxNodes,
        }),
        output: required<HTMLOutputElement>('[data-value="max-nodes"]'),
    },
    shareDepth: {
        slider: createSlider(required<HTMLElement>('[data-control="share-depth"]'), {
            min: 0,
            max: draft.grammar.maxDepth,
            step: 1,
            value: draft.grammar.shareDepth,
        }),
        output: required<HTMLOutputElement>('[data-value="share-depth"]'),
    },
};

// --- Control feedback -----------------------------------------------------

function updateActionButtons(): void {
    const busy = renderScheduled || exporting;
    exportButton.disabled = busy;
    exportButton.textContent = exporting ? 'Export en cours…' : 'Exporter PNG';
    newSeedButton.disabled = busy;
    randomGrammarButton.disabled = busy;
    regenerateButton.disabled = busy;
}

function updatePlaybackControls(): void {
    const canAnimate = surface !== null && program !== null && artwork?.shader.animated === true;
    playButton.disabled = !canAnimate;
    resetButton.disabled = !canAnimate;
    playButton.textContent = playing ? 'Pause' : 'Lecture';
    playButton.dataset.playing = String(playing);
}

function reportActionError(message: string): void {
    panelError.textContent = message;
    panelErrorSection.hidden = false;
    status.textContent = message;
}

function reportError(message: string): void {
    errorBox.textContent = message;
    errorBox.hidden = false;
    canvas.classList.add('pg-canvas--error');
    panelError.textContent = message;
    panelErrorSection.hidden = false;
    status.textContent = message;
}

function clearError(): void {
    errorBox.textContent = '';
    errorBox.hidden = true;
    canvas.classList.remove('pg-canvas--error');
    panelError.textContent = '';
    panelErrorSection.hidden = true;
}

function syncStructureOutputs(): void {
    for (const control of Object.values(structure)) {
        control.output.textContent = control.slider.value;
    }
}

function syncControls(): void {
    const { grammar, seed, space } = draft;
    const presetId = presetOf(grammar);

    grammarSelect.value = presetId ?? CUSTOM_PRESET_ID;
    grammarSelect.title =
        presetId === undefined ? 'Grammaire personnalisée' : PRESET_DESCRIPTIONS[presetId];
    seedInput.value = seed;
    spaceSelect.value = space;

    for (const [name, slider] of weightSliders) {
        const mustStayOn = isTerminal(name)
            ? isOnlyTerminal(grammar, name)
            : isOnlyNonTerminal(grammar, name);
        slider.min = mustStayOn ? '1' : '0';
        slider.value = String(weightOf(grammar, name));

        const output = weightOutputs.get(name);
        if (output) {
            output.textContent = slider.value;
        }
    }

    const minDepthLimit = Math.max(maxFeasibleMinDepth(grammar, MAX_MIN_DEPTH), grammar.minDepth);
    structure.minDepth.slider.max = String(minDepthLimit);
    structure.minDepth.slider.value = String(grammar.minDepth);
    structure.maxDepth.slider.value = String(grammar.maxDepth);
    structure.maxNodes.slider.min = String(minimumNodes(grammar));
    structure.maxNodes.slider.value = String(grammar.maxNodes);
    structure.shareDepth.slider.max = String(grammar.maxDepth);
    structure.shareDepth.slider.value = String(grammar.shareDepth);
    syncStructureOutputs();
}

// --- Render ----------------------------------------------------------------

function stopProgram(): void {
    program?.destroy();
    program = null;
}

function draw(frameSurface: GpuSurface): void {
    const current = program;
    if (!current) {
        return;
    }

    if (pipelineFailed) {
        frameSurface.renderProgram(current);
        return;
    }

    try {
        pipeline.render(frameSurface, current, activeEffects);
    } catch (error) {
        pipelineFailed = true;
        reportError(`Post-traitement indisponible : ${describeError(error)}`);
        frameSurface.renderProgram(current);
    }
}

function publish(next: Artwork): void {
    const { expression, shader } = next;
    const spaceLabel = getColorSpace(draft.space).label;
    const mono = isMonoExpression(expression);

    inspector.mono.hidden = !mono;
    inspector.r.hidden = mono;
    inspector.g.hidden = mono;
    inspector.b.hidden = mono;

    inspectorLabels.mono.textContent = `Champ (${spaceLabel})`;
    inspectorLabels.r.textContent = `Canal r (${spaceLabel})`;
    inspectorLabels.g.textContent = `Canal g (${spaceLabel})`;
    inspectorLabels.b.textContent = `Canal b (${spaceLabel})`;

    formulas.mono.textContent = formatFormula(expression.r, 4);
    formulas.r.textContent = formatFormula(expression.r, 4);
    formulas.g.textContent = formatFormula(expression.g, 4);
    formulas.b.textContent = formatFormula(expression.b, 4);

    shaderCode.value = shader.source;
    stats.textContent = `Taille : ${shader.stats.sourceLength} caractères · Animé : ${shader.animated ? 'oui' : 'non'}`;
}

function setPlaying(next: boolean): void {
    if (playing === next) {
        return;
    }

    playing = next;
    const activeSurface = surface;

    if (playing && activeSurface !== null) {
        activeSurface.clock.play();
        unsubscribeFrame = activeSurface.onFrame((frameSurface) => {
            draw(frameSurface);
        });
        status.textContent = 'Lecture en cours.';
    } else {
        activeSurface?.clock.pause();
        unsubscribeFrame?.();
        unsubscribeFrame = null;
        status.textContent = 'Lecture en pause.';
    }

    updatePlaybackControls();
}

function fail(error: unknown): void {
    setPlaying(false);
    stopProgram();
    reportError(describeError(error));
    updatePlaybackControls();
}

/** Draws one frame while paused so a control change is visible without resuming the loop. */
function renderOnce(): void {
    const activeSurface = surface;
    if (!activeSurface || !program) {
        return;
    }

    let done = false;
    let stop: (() => void) | null = null;

    // FrameLoop ticks synchronously on subscribe: the callback can run before onFrame returns.
    stop = activeSurface.onFrame((frameSurface) => {
        done = true;
        stop?.();
        stop = null;
        draw(frameSurface);
    });
    if (done) {
        stop?.();
    }
}

function refresh(): void {
    let next: Artwork;
    try {
        const expression = generate(draft.grammar, draft.seed);
        next = { expression, shader: compile(expression, { space: draft.space }) };
    } catch (error) {
        fail(error);
        return;
    }

    artwork = next;
    publish(next);
    updatePlaybackControls();

    const activeSurface = surface;
    if (activeSurface === null) {
        setPlaying(false);
        status.textContent = 'Rendu indisponible (WebGL2).';
        return;
    }

    clearError();

    let result;
    try {
        result = activeSurface.tryCreateProgram(next.shader.source);
    } catch (error) {
        fail(error);
        return;
    }

    if (!result.ok) {
        fail(result.error);
        return;
    }

    stopProgram();
    program = result.program;
    pipelineFailed = false;
    status.textContent = 'Rendu prêt.';
    updatePlaybackControls();

    if (!playing) {
        renderOnce();
    } else {
        draw(activeSurface);
    }
}

function setLoading(active: boolean): void {
    loading.hidden = !active;
    viewport.setAttribute('aria-busy', String(active));
    updateActionButtons();
}

function setExporting(active: boolean): void {
    exporting = active;
    updateActionButtons();
}

/** Compilation is synchronous: yield two frames so the loading state is painted before the work. */
function scheduleRefresh(): void {
    if (renderScheduled) {
        return;
    }

    renderScheduled = true;
    setLoading(true);
    status.textContent = 'Compilation du shader…';

    firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
            firstFrame = 0;
            secondFrame = 0;

            try {
                refresh();
            } finally {
                renderScheduled = false;
                setLoading(false);
            }
        });
    });
}

function editGrammar(change: (grammar: Grammar) => Grammar): void {
    try {
        draft = { ...draft, grammar: change(draft.grammar) };
        clearError();
        syncControls();
        scheduleRefresh();
    } catch (error) {
        reportActionError(describeError(error));
        syncControls();
    }
}

// --- Events ----------------------------------------------------------------

grammarSelect.addEventListener('change', () => {
    const value = grammarSelect.value;

    if (!isGrammarPresetId(value)) {
        syncControls();
        return;
    }

    const preset = getGrammarPreset(value);

    draft = { ...draft, grammar: preset.grammar, space: preset.space };
    clearError();
    syncControls();
    scheduleRefresh();
});

spaceSelect.addEventListener('change', () => {
    const value = spaceSelect.value;
    if (!isColorSpaceId(value)) {
        syncControls();
        return;
    }

    draft = { ...draft, space: value };
    clearError();
    scheduleRefresh();
});

seedInput.addEventListener('change', () => {
    const parsed = parseSeed(seedInput.value);

    if (parsed === null) {
        reportActionError(`Graine invalide : 1 à ${MAX_SEED_LENGTH} caractères.`);
        seedInput.value = draft.seed;
        return;
    }

    draft = { ...draft, seed: parsed };
    seedInput.value = parsed;
    clearError();
    scheduleRefresh();
});

newSeedButton.addEventListener('click', () => {
    draft = { ...draft, seed: randomSeed() };
    seedInput.value = draft.seed;
    clearError();
    scheduleRefresh();
});

randomGrammarButton.addEventListener('click', () => {
    try {
        draft = { ...draft, grammar: drawGrammar(createRng(randomSeed())) };
        clearError();
        syncControls();
        scheduleRefresh();
    } catch (error) {
        reportActionError(describeError(error));
        syncControls();
    }
});

regenerateButton.addEventListener('click', () => {
    clearError();
    scheduleRefresh();
});

exportButton.addEventListener('click', async () => {
    const current = artwork;
    const activeSurface = surface;
    if (!current || !activeSurface) {
        return;
    }

    setExporting(true);
    try {
        await exportPng({
            fragmentShader: current.shader.source,
            time: current.shader.animated ? activeSurface.time : 0,
            seed: draft.seed,
        });
    } catch (error) {
        reportActionError(`Export PNG impossible : ${describeError(error)}`);
    } finally {
        setExporting(false);
    }
});

playButton.addEventListener('click', () => {
    setPlaying(!playing);
});

resetButton.addEventListener('click', () => {
    const activeSurface = surface;
    if (!activeSurface) {
        return;
    }

    activeSurface.clock.reset();
    renderOnce();
    status.textContent = playing ? 'Lecture en cours.' : 'Horloge réinitialisée.';
});

for (const [id, toggle] of effectToggles) {
    toggle.addEventListener('change', () => {
        activeEffects[id] = toggle.checked;
        pipelineFailed = false;
        renderOnce();
    });
}

for (const [name, slider] of weightSliders) {
    slider.addEventListener('input', () => {
        const weight = Number(slider.value);
        editGrammar((grammar) => withWeight(grammar, name, weight));
    });
}

structure.minDepth.slider.addEventListener('input', () => {
    editGrammar((grammar) => withMinDepth(grammar, Number(structure.minDepth.slider.value)));
});

structure.maxDepth.slider.addEventListener('input', () => {
    editGrammar((grammar) => withMaxDepth(grammar, Number(structure.maxDepth.slider.value)));
});

structure.maxNodes.slider.addEventListener('input', () => {
    editGrammar((grammar) => withMaxNodes(grammar, Number(structure.maxNodes.slider.value)));
});

structure.shareDepth.slider.addEventListener('input', () => {
    editGrammar((grammar) => withShareDepth(grammar, Number(structure.shareDepth.slider.value)));
});

copyButton.addEventListener('click', async () => {
    const source = artwork?.shader.source;
    if (!source) {
        return;
    }

    try {
        await navigator.clipboard.writeText(source);
        copyButton.textContent = 'Copié';
    } catch {
        copyButton.textContent = 'Copie impossible';
    }

    if (copyFeedbackTimer !== 0) {
        window.clearTimeout(copyFeedbackTimer);
    }
    copyFeedbackTimer = window.setTimeout(() => {
        copyButton.textContent = 'Copier pour Shadertoy';
        copyFeedbackTimer = 0;
    }, COPY_FEEDBACK_MS);
});

// --- Lifecycle -------------------------------------------------------------

try {
    surface = new GpuSurface(canvas);
    surface.clock.pause();
} catch {
    reportError('WebGL2 n’est pas disponible dans ce navigateur. Le rendu est désactivé.');
    status.textContent = 'Rendu indisponible.';
}

window.addEventListener(
    'pagehide',
    () => {
        if (firstFrame !== 0) {
            cancelAnimationFrame(firstFrame);
        }
        if (secondFrame !== 0) {
            cancelAnimationFrame(secondFrame);
        }
        if (copyFeedbackTimer !== 0) {
            window.clearTimeout(copyFeedbackTimer);
        }

        setPlaying(false);
        stopProgram();
        pipeline.destroy();

        const activeSurface = surface;
        activeSurface?.destroy();
        surface = null;
    },
    { once: true },
);

initPage();
syncControls();
updateActionButtons();
updatePlaybackControls();
scheduleRefresh();
