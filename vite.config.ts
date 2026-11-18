import { defineConfig } from 'vite-plus';

// Keep this list in sync with the pages linked from the site (home and Art Canvas index).
const PAGE_ENTRIES = [
    'index.html',
    'experiments/automa/index.html',
    'experiments/fracture/index.html',
    'experiments/mosaic-maker/index.html',
    'experiments/notebook/index.html',
    'experiments/oeis-signal/index.html',
    'experiments/palette/index.html',
    'experiments/pixel-manipulator/index.html',
    'experiments/pixel/index.html',
    'experiments/radu-machine-learning/index.html',
    'experiments/randomart/index.html',
    'experiments/sequencer/index.html',
    'experiments/art-canvas/index.html',
    'experiments/art-canvas/atlas/index.html',
    'experiments/art-canvas/draw/index.html',
    'experiments/art-canvas/folded-space/index.html',
    'experiments/art-canvas/manual/index.html',
    'experiments/art-canvas/seed/index.html',
    'experiments/art-canvas/spirale/index.html',
];

export default defineConfig({
    root: 'src',
    // Production sub-path (GitHub Pages project site). Change it if the repo is renamed.
    base: '/bedroom-survivor/',
    appType: 'mpa',
    publicDir: '../public',
    cacheDir: '../node_modules/.vite',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rolldownOptions: {
            input: PAGE_ENTRIES,
        },
    },
    staged: {
        '*': 'vp check --fix',
    },
    test: { isolate: false },
    fmt: { tabWidth: 4, singleQuote: true, sortImports: true, jsdoc: true },
    lint: {
        ignorePatterns: ['.agents/**'],
        jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
        rules: {
            // Repo / tooling
            // ─────────────────────────────────────────────

            'vite-plus/prefer-vite-plus-imports': 'error',

            // ─────────────────────────────────────────────
            // General correctness
            // ─────────────────────────────────────────────

            'oxc/branches-sharing-code': 'error',
            'no-use-before-define': ['error', { functions: true, classes: true, variables: true }],

            // ─────────────────────────────────────────────
            // Modules / architecture
            // ─────────────────────────────────────────────

            // `import/no-relative-parent-imports` is intentionally not enabled: the
            // codebase uses `../` imports freely within a package. See
            // codex/docs/conventions for the import conventions.

            'import/no-cycle': 'error',
            'import/no-default-export': 'error',
            'import/no-duplicates': 'error',
            'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
            'import/export': 'error',

            // ─────────────────────────────────────────────
            // Style — syntax / idioms
            // ─────────────────────────────────────────────

            // Require explicit block scope.
            'eslint/curly': 'error',

            // Prefer concise object property syntax.
            'eslint/object-shorthand': 'error',

            // One binding declaration per statement.
            'eslint/one-var': ['error', 'never'],

            // Prefer lexical callbacks.
            'eslint/prefer-arrow-callback': 'error',

            // Prefer immutable bindings.
            'eslint/prefer-const': 'error',

            // Prefer modern numeric syntax.
            'eslint/prefer-exponentiation-operator': 'error',
            'eslint/prefer-numeric-literals': 'error',

            // Prefer modern object APIs / syntax.
            'eslint/prefer-object-has-own': 'error',
            'eslint/prefer-object-spread': 'error',

            // Prefer template literals for interpolation.
            'eslint/prefer-template': 'error',

            // Prefer modern, compact syntax.
            'unicorn/prefer-bigint-literals': 'error',
            'unicorn/prefer-spread': 'error',
            'unicorn/prefer-optional-catch-binding': 'error',

            // Keep expressions shallow.
            'unicorn/no-nested-ternary': 'error',

            // Explicit and scoped switch cases.
            'unicorn/switch-case-braces': 'error',

            // Explicit join semantics.
            'unicorn/require-array-join-separator': 'error',

            // Explicit Error construction.
            'unicorn/throw-new-error': 'error',

            // ─────────────────────────────────────────────
            // Style — platform idioms
            // ─────────────────────────────────────────────

            'unicorn/prefer-classlist-toggle': 'error',
            'unicorn/prefer-dom-node-dataset': 'error',
            'unicorn/prefer-dom-node-text-content': 'error',
            'unicorn/prefer-keyboard-event-key': 'error',
            'unicorn/prefer-negative-index': 'error',

            // ─────────────────────────────────────────────
            // Style — cleanup
            // ─────────────────────────────────────────────

            'unicorn/empty-brace-spaces': 'error',

            // ─────────────────────────────────────────────
            // TypeScript — consistency
            // ─────────────────────────────────────────────

            'typescript/adjacent-overload-signatures': 'error',

            'typescript/consistent-type-assertions': [
                'warn',
                {
                    assertionStyle: 'as',
                },
            ],

            'typescript/consistent-type-definitions': 'error',

            'typescript/consistent-type-exports': 'error',

            'typescript/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],

            'typescript/consistent-indexed-object-style': ['error', 'record'],

            'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],

            // Prefer function types for callable type declarations.
            'typescript/prefer-function-type': 'error',

            // Prefer the canonical const assertion syntax.
            'typescript/prefer-as-const': 'error',

            'typescript/no-non-null-assertion': 'error',

            // To help fix those error, read codex/docs/noUncheckedIndexedAccess.md.
            'typescript/no-unsafe-type-assertion': 'error',

            // ─────────────────────────────────────────────
            // TypeScript — safety / unnecessary complexity
            // ─────────────────────────────────────────────

            'oxc/no-const-enum': 'error',
            'typescript/no-explicit-any': 'error',
            'typescript/no-require-imports': 'error',
            'typescript/no-import-type-side-effects': 'error',

            'typescript/no-inferrable-types': 'error',

            'typescript/no-unnecessary-template-expression': 'error',
            'typescript/no-unnecessary-type-arguments': 'error',
            'typescript/no-unnecessary-type-assertion': 'error',
            'typescript/no-non-null-asserted-nullish-coalescing': 'error',

            // ─────────────────────────────────────────────
            // TypeScript — explicitness
            // ─────────────────────────────────────────────

            'typescript/dot-notation': 'error',
            'typescript/switch-exhaustiveness-check': 'error',
        },
        overrides: [
            {
                // Tests need assertion.
                files: ['**/*.test.ts'],
                rules: {
                    'typescript/no-unsafe-type-assertion': 'off',
                },
            },
        ],
        options: { typeAware: true, typeCheck: true },
    },
});
