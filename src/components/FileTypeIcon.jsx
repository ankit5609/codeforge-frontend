/**
 * VS Code–style file type icons (Material/Seti inspired), rendered as inline
 * SVGs with brand colours. Purely presentational — maps a filename to a small
 * 16×16 glyph so the file tree reads like an editor.
 */
const wrap = (children) => (<svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {children}
  </svg>);
const TsIcon = () => wrap(<>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#3178c6"/>
      <text x="8" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fontFamily="ui-monospace, monospace" fill="#fff">TS</text>
    </>);
const TsConfigIcon = () => wrap(<>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#3178c6"/>
      <text x="7" y="11.5" textAnchor="middle" fontSize="6.2" fontWeight="700" fontFamily="ui-monospace, monospace" fill="#fff">TS</text>
      <circle cx="12.5" cy="11.5" r="2.4" fill="#9bbbdc"/>
      <circle cx="12.5" cy="11.5" r="0.9" fill="#3178c6"/>
    </>);
const JsIcon = () => wrap(<>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#f7df1e"/>
      <text x="8" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fontFamily="ui-monospace, monospace" fill="#1a1a1a">JS</text>
    </>);
const ReactIcon = ({ color = "#61dafb" }) => wrap(<g stroke={color} strokeWidth="0.8" fill="none">
      <circle cx="8" cy="8" r="1.4" fill={color} stroke="none"/>
      <ellipse cx="8" cy="8" rx="6.2" ry="2.4"/>
      <ellipse cx="8" cy="8" rx="6.2" ry="2.4" transform="rotate(60 8 8)"/>
      <ellipse cx="8" cy="8" rx="6.2" ry="2.4" transform="rotate(120 8 8)"/>
    </g>);
const JsonIcon = () => wrap(<>
      <path d="M6 3c-1.6 0-2 .8-2 2v1.2c0 .9-.3 1.3-1 1.3v1c.7 0 1 .4 1 1.3V12c0 1.2.4 2 2 2" stroke="#f5c518" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M10 3c1.6 0 2 .8 2 2v1.2c0 .9.3 1.3 1 1.3v1c-.7 0-1 .4-1 1.3V12c0 1.2-.4 2-2 2" stroke="#f5c518" strokeWidth="1.1" strokeLinecap="round"/>
    </>);
const CssIcon = () => wrap(<>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#264de4"/>
      <text x="8" y="11" textAnchor="middle" fontSize="6.5" fontWeight="700" fontFamily="ui-monospace, monospace" fill="#fff">#</text>
    </>);
const HtmlIcon = () => wrap(<>
      <path d="M2 2l1 11 5 1.5L13 13l1-11z" fill="#e44d26"/>
      <path d="M8 3.2v10.6l4-1.1.8-9.5z" fill="#f16529"/>
      <path d="M4.4 5.4h7.2l-.2 1.6H6.1l.1 1.4h5l-.4 4-2.8.8-2.8-.8-.18-2h1.4l.09 1 1.5.4 1.5-.4.16-1.6H4.9z" fill="#fff"/>
    </>);
const MarkdownIcon = () => wrap(<>
      <rect x="0.8" y="3" width="14.4" height="10" rx="1.6" fill="none" stroke="#42a5f5" strokeWidth="1.1"/>
      <path d="M3 11V5l2 2 2-2v6M9.5 5v4M9.5 9l-1.3-1.3M9.5 9l1.3-1.3" stroke="#42a5f5" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </>);
const ImageIcon = () => wrap(<>
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.6" fill="#26a69a"/>
      <circle cx="5.2" cy="6" r="1.2" fill="#fff"/>
      <path d="M2.5 12l3.2-3.4 2.1 2.2 2.4-2.8 3.3 4z" fill="#fff"/>
    </>);
const GitIcon = () => wrap(<>
      <path d="M14.7 7.3L8.7 1.3a1 1 0 00-1.4 0L6 2.6l1.6 1.6a1.2 1.2 0 011.5 1.5l1.5 1.5a1.2 1.2 0 11-.7.7L8.5 6.5v3.6a1.2 1.2 0 11-1 0V6.5a1.2 1.2 0 01-.65-1.6L5.3 3.3 1.3 7.3a1 1 0 000 1.4l6 6a1 1 0 001.4 0l6-6a1 1 0 000-1.4z" fill="#f05133"/>
    </>);
const EnvIcon = () => wrap(<>
      <circle cx="8" cy="8" r="2.4" fill="none" stroke="#9e9e9e" strokeWidth="1.2"/>
      <g stroke="#9e9e9e" strokeWidth="1.2" strokeLinecap="round">
        <path d="M8 1.6v2M8 12.4v2M1.6 8h2M12.4 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M12.5 3.5l-1.4 1.4M4.9 11.1l-1.4 1.4"/>
      </g>
    </>);
const DockerIcon = () => wrap(<>
      <g fill="#2496ed">
        <rect x="2" y="7" width="2" height="2"/><rect x="4.3" y="7" width="2" height="2"/><rect x="6.6" y="7" width="2" height="2"/>
        <rect x="4.3" y="4.8" width="2" height="2"/><rect x="6.6" y="4.8" width="2" height="2"/><rect x="8.9" y="7" width="2" height="2"/>
      </g>
      <path d="M14 7.2c-.5-.4-1.6-.5-2.2-.2-.1-.7-.5-1.2-1-1.6l-.3-.2-.2.3c-.3.5-.4 1.2-.1 1.7-.4.2-.9.2-1.3.2H1.5c-.2 1.4.2 3 1.3 4 .9.8 2.3 1.2 3.9 1.2 3.5 0 6-1.6 7.2-4.5.6 0 1.4 0 1.8-.9l.1-.2-.2-.1c-.4-.2-1-.2-1.6 0z" fill="#2496ed"/>
    </>);
const EslintIcon = () => wrap(<>
      <path d="M8 1.5l5.6 3.25v6.5L8 14.5 2.4 11.25v-6.5z" fill="none" stroke="#4b32c3" strokeWidth="1"/>
      <path d="M8 4.2l3.2 1.85v3.9L8 11.8 4.8 9.95v-3.9z" fill="#8080f2"/>
      <circle cx="8" cy="8" r="1.3" fill="#4b32c3"/>
    </>);
const TailwindIcon = () => wrap(<path d="M8 4.3c-1.6 0-2.6.8-3 2.4.6-.8 1.3-1.1 2.1-.9.46.11.78.44 1.14.8C8.94 7.2 9.6 7.9 11 7.9c1.6 0 2.6-.8 3-2.4-.6.8-1.3 1.1-2.1.9-.46-.11-.78-.44-1.14-.8C10.06 5 9.4 4.3 8 4.3zM5 7.9c-1.6 0-2.6.8-3 2.4.6-.8 1.3-1.1 2.1-.9.46.11.78.44 1.14.8C5.94 10.8 6.6 11.5 8 11.5c1.6 0 2.6-.8 3-2.4-.6.8-1.3 1.1-2.1.9-.46-.11-.78-.44-1.14-.8C7.06 8.6 6.4 7.9 5 7.9z" fill="#38bdf8"/>);
const ViteIcon = () => wrap(<>
      <path d="M14.5 3.1L8.3 14.6c-.13.24-.47.24-.6 0L1.5 3.1c-.14-.26.08-.56.37-.5l6.13 1.1c.04 0 .08 0 .12 0l6-1.1c.3-.06.5.24.38.5z" fill="#41d1ff"/>
      <path d="M11.1 1.2L6.6 2.1c-.07.01-.13.08-.14.16l-.28 4.7c-.01.11.1.2.2.16l1.25-.29c.12-.03.22.08.2.2l-.37 1.82c-.02.12.1.23.22.18l.77-.23c.12-.04.24.07.22.19l-.6 2.9c-.03.17.2.26.29.11l.06-.1 3.7-7.4c.06-.13-.05-.27-.18-.24l-1.29.25c-.12.02-.22-.09-.18-.2l.84-2.9c.03-.12-.07-.23-.2-.2z" fill="#ffd62e"/>
    </>);
const VitestIcon = () => wrap(<>
      <path d="M14.5 3.1L8.3 14.6c-.13.24-.47.24-.6 0L1.5 3.1c-.14-.26.08-.56.37-.5l6.13 1.1c.04 0 .08 0 .12 0l6-1.1c.3-.06.5.24.38.5z" fill="#fcc72b"/>
      <path d="M9.9 5.5l-3.3 4.6 1.4-3.4-1.9.5z" fill="#729b1b"/>
    </>);
const NpmIcon = () => wrap(<>
      <rect x="1" y="4.5" width="14" height="7" fill="#cb3837"/>
      <path d="M2.4 5.9h11.2v4.2H8v.9H5.6v-.9H2.4z M3.6 7v2.2h1.2V7.7h.7v1.5h1.2V7H3.6z M7.3 7v2.2h1.2V7.7h.7v1.5h.6V7.7h.7v1.5h1.2V7z" fill="#fff"/>
    </>);
const SvgIcon = () => wrap(<>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#ffb13b"/>
      <text x="8" y="10.6" textAnchor="middle" fontSize="4.6" fontWeight="700" fontFamily="ui-monospace, monospace" fill="#fff">SVG</text>
    </>);
const YamlIcon = () => wrap(<>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#cb171e"/>
      <text x="8" y="10.6" textAnchor="middle" fontSize="4.4" fontWeight="700" fontFamily="ui-monospace, monospace" fill="#fff">YML</text>
    </>);
const PostcssIcon = () => wrap(<>
      <circle cx="8" cy="8" r="6.3" fill="#dd3a0a"/>
      <text x="8" y="10.4" textAnchor="middle" fontSize="6" fontWeight="700" fontFamily="ui-monospace, monospace" fill="#fff">P</text>
    </>);
const FileGenericIcon = ({ color = "#90a4ae" }) => wrap(<path d="M3.5 1.5h6L13 5v9a1 1 0 01-1 1H3.5a1 1 0 01-1-1V2.5a1 1 0 011-1z M9.3 1.8V5h3.2" fill="none" stroke={color} strokeWidth="1.1" strokeLinejoin="round"/>);
const LockIcon = () => wrap(<>
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" fill="#8d6e63"/>
      <path d="M5.5 7V5.2a2.5 2.5 0 015 0V7" fill="none" stroke="#8d6e63" strokeWidth="1.2"/>
      <circle cx="8" cy="10" r="1" fill="#fff"/>
    </>);
/** Resolve a filename to its themed icon element. */
export function FileTypeIcon({ name }) {
    const lower = name.toLowerCase();
    // Special, full-name matches first.
    if (lower === "package.json" || lower === "package-lock.json")
        return <NpmIcon />;
    if (lower === "bun.lockb" || lower.endsWith(".lock") || lower === "yarn.lock" || lower === "pnpm-lock.yaml")
        return <LockIcon />;
    if (lower === "dockerfile" || lower.startsWith("dockerfile"))
        return <DockerIcon />;
    if (lower.startsWith(".gitignore") || lower === ".gitattributes" || lower === ".git")
        return <GitIcon />;
    if (lower.startsWith(".env"))
        return <EnvIcon />;
    if (lower.includes("tailwind.config"))
        return <TailwindIcon />;
    if (lower.includes("postcss.config"))
        return <PostcssIcon />;
    if (lower.includes("eslint"))
        return <EslintIcon />;
    if (lower.includes("vitest.config"))
        return <VitestIcon />;
    if (lower.includes("vite.config") || lower === "vite-env.d.ts")
        return <ViteIcon />;
    if (lower.startsWith("tsconfig"))
        return <TsConfigIcon />;
    const ext = lower.split(".").pop();
    switch (ext) {
        case "tsx":
            return <ReactIcon color="#3178c6"/>;
        case "jsx":
            return <ReactIcon color="#61dafb"/>;
        case "ts":
            return <TsIcon />;
        case "js":
        case "cjs":
        case "mjs":
            return <JsIcon />;
        case "json":
            return <JsonIcon />;
        case "css":
        case "scss":
        case "sass":
        case "less":
            return <CssIcon />;
        case "html":
        case "htm":
            return <HtmlIcon />;
        case "md":
        case "mdx":
            return <MarkdownIcon />;
        case "svg":
            return <SvgIcon />;
        case "png":
        case "jpg":
        case "jpeg":
        case "gif":
        case "webp":
        case "ico":
        case "avif":
            return <ImageIcon />;
        case "yml":
        case "yaml":
            return <YamlIcon />;
        default:
            return <FileGenericIcon />;
    }
}
