import { defineConfig, Plugin } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
// TODO remove line below
declare function reactRefresh(): Plugin;
import { minify } from "html-minifier";

const replaceMap = new Map([
    ["react.production.min.js", "react.development.js"],
    ["react-dom.production.min.js", "react-dom.development.js"],
]);

const editHtmlPlugin: Plugin = {
    name: "edit-html",
    transformIndexHtml: {
        transform(html) {
            for (const [k, v] of replaceMap) {
                html = html.replace(k, v);
            }
            return html;
        },
    },
};

const minifyHtmlPlugin: Plugin = {
    name: "minify-html",
    transformIndexHtml: {
        transform(html) {
            return minify(html, {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                removeTagWhitespace: true,
            });
        },
    },
};

export default defineConfig(({ mode }) => {
    return {
        build: {
            base: ".",
            outDir: "docs",
            sourcemap: true,
        },
        plugins: [
            reactRefresh(),
            mode === "development" && editHtmlPlugin,
            mode === "production" && minifyHtmlPlugin,
        ].filter(Boolean),
    };
});
