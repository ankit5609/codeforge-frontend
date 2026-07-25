// Browser-side code formatting using Prettier standalone.
// Plugins are loaded lazily so they are only bundled when formatting is used.
const parserFor = (filePath) => {
    const ext = filePath.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "ts":
        case "tsx":
            return "typescript";
        case "js":
        case "jsx":
        case "mjs":
        case "cjs":
            return "babel";
        case "json":
            return "json";
        case "css":
        case "scss":
        case "less":
            return "css";
        case "html":
        case "svg":
            return "html";
        case "md":
        case "markdown":
            return "markdown";
        default:
            return null;
    }
};
export const isFormattable = (filePath) => !!filePath && parserFor(filePath) !== null;
export async function formatCode(content, filePath) {
    const parser = parserFor(filePath);
    if (!parser)
        return content;
    const [prettier, babel, estree, typescript, postcss, html, markdown] = await Promise.all([
        import("prettier/standalone"),
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree"),
        import("prettier/plugins/typescript"),
        import("prettier/plugins/postcss"),
        import("prettier/plugins/html"),
        import("prettier/plugins/markdown"),
    ]);
    return prettier.format(content, {
        parser,
        plugins: [
            babel.default,
            estree.default,
            typescript.default,
            postcss.default,
            html.default,
            markdown.default,
        ],
        semi: true,
        singleQuote: false,
        printWidth: 100,
        tabWidth: 2,
    });
}
