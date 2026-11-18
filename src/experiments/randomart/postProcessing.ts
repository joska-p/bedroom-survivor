import { GLSL_FUNCTIONS, glslFloat } from '../../lib/randomart/glsl';

const GRAIN_FRAGMENT_SHADER = /* glsl */ `
#version 300 es
precision highp float;

in vec2 vUv;
out vec4 o_color;

uniform sampler2D u_source;
uniform vec2 u_resolution;

// Deterministic hash based on screen pixel coordinates.
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {
    vec4 src = texture(u_source, vUv);
    vec2 pixel = vUv * u_resolution;
    float noise = (hash(pixel) - 0.5) * 0.10;
    o_color = vec4(clamp(src.rgb + noise, 0.0, 1.0), src.a);
}
`.trim();

/** Radius of the soft luminance clip, in display-referred [0, 1] units. */
const SMOOTH_RADIUS = 0.15;

/** Luminance the clip eases toward: highlights above it for min, shadows below it for max. */
const CLIP_LEVEL = 0.5;

/**
 * Soft luminance clip built on the core smooth min/max helpers, so the rendered effect and the
 * operator registry cannot drift apart. The clipped luminance becomes a gain on the source color:
 * writing it back as `vec3(clipped)` would replace the artwork with a grayscale mask.
 */
function createSoftClipFragmentShader(operator: 'ra_smin' | 'ra_smax'): string {
    return /* glsl */ `
#version 300 es
precision highp float;

in vec2 vUv;
out vec4 o_color;

uniform sampler2D u_source;

${GLSL_FUNCTIONS[operator]}

void main() {
    vec4 src = texture(u_source, vUv);
    float lum = dot(src.rgb, vec3(0.2126, 0.7152, 0.0722));
    float clipped = ${operator}(lum, ${glslFloat(CLIP_LEVEL)}, ${glslFloat(SMOOTH_RADIUS)});
    float gain = clipped / max(lum, 1e-4);
    o_color = vec4(clamp(src.rgb * gain, 0.0, 1.0), src.a);
}
`.trim();
}

interface PostProcessEffect {
    readonly id: string;
    readonly label: string;
    /** Pass order: lower values run first. */
    readonly order: number;
    readonly fragmentShader: string;
    readonly defaultActive: boolean;
}

export const POST_PROCESS_EFFECTS = [
    {
        id: 'grain',
        label: 'Grain',
        order: 10,
        fragmentShader: GRAIN_FRAGMENT_SHADER,
        defaultActive: false,
    },
    {
        id: 'smin',
        label: 'Minimum lissé',
        order: 20,
        fragmentShader: createSoftClipFragmentShader('ra_smin'),
        defaultActive: false,
    },
    {
        id: 'smax',
        label: 'Maximum lissé',
        order: 30,
        fragmentShader: createSoftClipFragmentShader('ra_smax'),
        defaultActive: false,
    },
] as const satisfies readonly PostProcessEffect[];

export type PostProcessEffectDefinition = (typeof POST_PROCESS_EFFECTS)[number];
export type PostProcessEffectId = PostProcessEffectDefinition['id'];
export type ActiveEffects = Partial<Record<PostProcessEffectId, boolean>>;
