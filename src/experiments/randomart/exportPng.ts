import type { Seed } from '../../lib/randomart/seed';
import { Program } from '../../lib/surface/gpu';

/** Side of the exported square image, in pixels (capped by the GPU's viewport limits). */
export const EXPORT_SIZE = 2048;

export interface OffscreenRenderOptions {
    /** Complete Shadertoy fragment shader produced by randomart's compiler. */
    readonly fragmentShader: string;
    /** Value of `iTime`, in seconds. */
    readonly time: number;
    /** Requested side of the square output, in pixels. */
    readonly size: number;
}

/** Largest usable square side: the request, capped by every viewport limit, at least 1. */
export function clampExportSize(requested: number, limits: ArrayLike<number>): number {
    let side = requested;

    for (let index = 0; index < limits.length; index++) {
        const limit = limits[index];

        if (limit !== undefined && limit < side) {
            side = limit;
        }
    }

    return Math.max(1, Math.floor(side));
}

/** Seed text is arbitrary, so keep it filename-safe while preserving a readable identity. */
export function filenameSeed(seed: Seed): string {
    return seed.replaceAll(/[^a-z0-9_-]+/gi, '-').replaceAll(/^-+|-+$/g, '') || 'seed';
}

/** Render the shader once and encode the result as a PNG. Failures are thrown. */
export async function renderToBlob(options: OffscreenRenderOptions): Promise<Blob> {
    const canvas = new OffscreenCanvas(1, 1);
    // `preserveDrawingBuffer` is safe here: this context lives for one frame.
    const gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        preserveDrawingBuffer: true,
    });
    if (gl === null) {
        throw new Error(
            'Export PNG impossible : WebGL2 n’est pas disponible sur un OffscreenCanvas',
        );
    }

    let program: Program | undefined;
    try {
        const limitsParam = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
        const limits: ArrayLike<number> =
            limitsParam instanceof Int32Array || limitsParam instanceof Float32Array
                ? limitsParam
                : [1, 1];
        const side = clampExportSize(options.size, limits);
        canvas.width = side;
        canvas.height = side;
        if (gl.drawingBufferWidth !== side || gl.drawingBufferHeight !== side) {
            throw new Error(`Export PNG impossible : le GPU refuse un tampon de ${side}px`);
        }

        program = new Program(gl, options.fragmentShader);
        program.setUniforms({
            iResolution: [side, side, 1],
            iTime: options.time,
        });
        program.render(side, side);

        // `return await` is required: the context must stay alive until the blob exists.
        return await canvas.convertToBlob({ type: 'image/png' });
    } finally {
        program?.destroy();
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
}

export interface ExportPngOptions {
    readonly fragmentShader: string;
    /** Value of `iTime` in seconds; irrelevant for a static shader. */
    readonly time: number;
    readonly seed: Seed;
}

/** Render the artwork offscreen at `EXPORT_SIZE` and download it. Failures are thrown. */
export async function exportPng({ fragmentShader, time, seed }: ExportPngOptions): Promise<void> {
    const blob = await renderToBlob({ fragmentShader, time, size: EXPORT_SIZE });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `randomart-${filenameSeed(seed)}.png`;
    anchor.click();
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}
