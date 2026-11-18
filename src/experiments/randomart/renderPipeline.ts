import type { GpuSurface, Program, TargetPair } from '../../lib/surface/gpu';
import { POST_PROCESS_EFFECTS } from './postProcessing';
import type { ActiveEffects, PostProcessEffectId } from './postProcessing';

interface PipelineResources {
    readonly pair: TargetPair;
    readonly programs: Map<PostProcessEffectId, Program>;
}

/**
 * Optional post-processing chain for the randomart program. With no active effect the base program
 * is drawn straight to the canvas; otherwise it is rendered into an offscreen pair and each active
 * effect runs in registry order before the final pass.
 *
 * GpuSurface owns and restores the pair and programs; this class only keeps their handles and
 * releases them on destroy.
 */
export class PostProcessPipeline {
    #resources: PipelineResources | null = null;

    render(surface: GpuSurface, program: Program, active: ActiveEffects): void {
        const effects = POST_PROCESS_EFFECTS.filter((effect) => active[effect.id] === true).sort(
            (a, b) => a.order - b.order,
        );
        const finalEffect = effects[effects.length - 1];

        if (!finalEffect) {
            surface.renderProgram(program);
            return;
        }

        const { pair, programs } = this.#resourcesFor(surface);

        if (surface.deviceWidth <= 0 || surface.deviceHeight <= 0) {
            return;
        }

        surface.renderTo(pair.write, program);
        pair.swap();

        for (let index = 0; index < effects.length - 1; index++) {
            const effect = effects[index];
            if (!effect) {
                continue;
            }

            const effectProgram = this.#programFor(
                surface,
                programs,
                effect.id,
                effect.fragmentShader,
            );
            surface.renderTo(pair.write, effectProgram, {
                u_source: pair.read.texture,
                u_resolution: [surface.deviceWidth, surface.deviceHeight],
            });
            pair.swap();
        }

        const finalProgram = this.#programFor(
            surface,
            programs,
            finalEffect.id,
            finalEffect.fragmentShader,
        );
        surface.renderProgram(finalProgram, {
            u_source: pair.read.texture,
            u_resolution: [surface.deviceWidth, surface.deviceHeight],
        });
    }

    destroy(): void {
        const resources = this.#resources;
        if (!resources) {
            return;
        }

        for (const program of resources.programs.values()) {
            program.destroy();
        }
        resources.pair.destroy();
        this.#resources = null;
    }

    #resourcesFor(surface: GpuSurface): PipelineResources {
        let resources = this.#resources;

        if (!resources) {
            resources = {
                pair: surface.createTargetPair(surface.deviceWidth, surface.deviceHeight, {
                    filter: 'linear',
                }),
                programs: new Map(),
            };
            this.#resources = resources;
        } else if (
            resources.pair.width !== surface.deviceWidth ||
            resources.pair.height !== surface.deviceHeight
        ) {
            resources.pair.resize(surface.deviceWidth, surface.deviceHeight);
        }

        return resources;
    }

    #programFor(
        surface: GpuSurface,
        programs: Map<PostProcessEffectId, Program>,
        id: PostProcessEffectId,
        source: string,
    ): Program {
        let program = programs.get(id);

        if (!program) {
            program = surface.createProgram(source);
            programs.set(id, program);
        }

        return program;
    }
}
