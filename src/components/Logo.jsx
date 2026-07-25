import { cn } from "@/lib/utils";
/**
 * CodeForge brand mark — a self-contained gradient "terminal prompt" glyph.
 * No outer box needed; it reads as a polished logo on its own.
 */
export function LogoMark({ className }) {
    return (<svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cf-logo-grad" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5eead4"/>
          <stop offset="0.55" stopColor="#34d399"/>
          <stop offset="1" stopColor="#059669"/>
        </linearGradient>
      </defs>
      {/* Free-standing terminal-prompt glyph — no solid box, reads as a logo on its own */}
      <path d="M8 8.5L16 16L8 23.5" stroke="url(#cf-logo-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.5 23.5H25" stroke="url(#cf-logo-grad)" strokeWidth="3" strokeLinecap="round"/>
    </svg>);
}
export function Logo({ className, markClassName, textClassName, showText = true, variant = "title", }) {
    return (<span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("w-8 h-8 drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)]", markClassName)}/>
      {showText &&
            (variant === "mono" ? (<span className={cn("font-mono text-sm font-bold tracking-tight text-slate-200", textClassName)}>
            code<span className="text-primary">forge</span>
          </span>) : (<span className={cn("font-display text-lg font-semibold tracking-tight text-foreground", textClassName)}>
            CodeForge
          </span>))}
    </span>);
}
