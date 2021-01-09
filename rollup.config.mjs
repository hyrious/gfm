import { terser } from "rollup-plugin-terser";

export default [
    {
        input: "src/index.mjs",
        external: ["https"],
        output: {
            file: "dist/index.js",
            format: "cjs",
            sourcemap: true,
            plugins: [terser()],
        },
    },
    {
        input: "src/index.browser.mjs",
        output: {
            file: "dist/index.browser.js",
            format: "iife",
            name: 'GFM',
            sourcemap: true,
            plugins: [terser()],
        },
    },
];
