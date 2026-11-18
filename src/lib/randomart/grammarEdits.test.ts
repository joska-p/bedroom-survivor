import { describe, expect, it } from 'vite-plus/test';

import { createGrammar, MAX_WEIGHT, minimumNodes } from './grammar';
import {
    withMaxDepth,
    withMaxNodes,
    withMinDepth,
    withShareDepth,
    withWeight,
} from './grammarEdits';

function makeGrammar(overrides: Partial<Parameters<typeof createGrammar>[0]> = {}) {
    return createGrammar({
        weights: { add: 1, x: 1 },
        minDepth: 1,
        maxDepth: 5,
        maxNodes: 25,
        shareDepth: 1,
        ...overrides,
    });
}

describe('grammar edits', () => {
    it('clamps weights and drops zero-weight operators', () => {
        const grammar = makeGrammar({ weights: { add: 1, mul: 1, x: 1 } });

        expect(withWeight(grammar, 'add', 99).weights.add).toBe(MAX_WEIGHT);
        expect(withWeight(grammar, 'add', 0).weights.add).toBeUndefined();
    });

    it('rejects disabling the last terminal', () => {
        expect(() => withWeight(makeGrammar(), 'x', 0)).toThrow(/terminal/);
    });

    it('raises maxDepth when minDepth needs it', () => {
        const next = withMinDepth(makeGrammar({ maxDepth: 3, shareDepth: 3 }), 4);

        expect(next.minDepth).toBe(4);
        expect(next.maxDepth).toBe(4);
        expect(next.shareDepth).toBe(3);
    });

    it('lowers minDepth and shareDepth when maxDepth shrinks', () => {
        const next = withMaxDepth(makeGrammar({ minDepth: 4, maxDepth: 6, shareDepth: 4 }), 2);

        expect(next.minDepth).toBe(2);
        expect(next.maxDepth).toBe(2);
        expect(next.shareDepth).toBe(2);
    });

    it('keeps maxNodes at or above the minimum feasible size', () => {
        const grammar = makeGrammar({ minDepth: 3, maxNodes: 7 });

        expect(withMaxNodes(grammar, 3).maxNodes).toBe(minimumNodes(grammar));
    });

    it('caps shareDepth at maxDepth', () => {
        expect(withShareDepth(makeGrammar(), 99).shareDepth).toBe(5);
    });
});
