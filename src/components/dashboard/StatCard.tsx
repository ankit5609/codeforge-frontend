import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small imperative count-up used only by StatCard. Animates from its previous
 * value to `value` using framer-motion's animate() — purely cosmetic, no
 * effect on the underlying numbers (which are computed exactly as before via
 * deriveTokenUsage / deriveProjectUsage in ProjectsDashboard.tsx).
 */
function AnimatedNumber({
  value,
  formatter,
  className,
}: {
  value: number;
  formatter?: (n: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: shouldReduceMotion ? 0 : 0.7,
      ease: [0.16, 0.8, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value, shouldReduceMotion]);

  const text = formatter ? formatter(Math.round(display)) : Math.round(display).toLocaleString();
  return <span className={className}>{text}</span>;
}

export type StatTone = "ember" | "brass" | "teal" | "neutral";

const TONE_STYLES: Record<StatTone, { bg: string; fg: string; bar: string }> = {
  ember: { bg: "rgba(255,90,46,0.12)", fg: "var(--lp-ember)", bar: "var(--lp-ember)" },
  brass: { bg: "rgba(232,184,75,0.12)", fg: "var(--lp-brass)", bar: "var(--lp-brass)" },
  teal: { bg: "rgba(69,196,184,0.12)", fg: "var(--lp-teal)", bar: "var(--lp-teal)" },
  neutral: { bg: "var(--lp-bg-raised-2)", fg: "var(--lp-ink-dim)", bar: "var(--lp-ink-dim)" },
};

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  /** Numeric value to animate (used when no custom `value` node is given). */
  numericValue?: number;
  /** Formatter applied to the animated numeric value, e.g. (n) => `${n}%`. */
  formatter?: (n: number) => string;
  /** Use instead of numericValue when the value isn't a plain animatable number (e.g. a plan name). */
  value?: ReactNode;
  /** Small trailing text next to the value, e.g. "/ 10" or a status label. */
  meta?: ReactNode;
  /** 0–100 — renders a thin progress bar when provided. */
  progressPct?: number;
  caption?: string;
  tone?: StatTone;
  /** Replaces the value entirely with a pill, e.g. "Unlimited". */
  badge?: ReactNode;
  action?: ReactNode;
}

export function StatCard({
  icon: Icon,
  label,
  numericValue,
  formatter,
  value,
  meta,
  progressPct,
  caption,
  tone = "neutral",
  badge,
  action,
}: StatCardProps) {
  const t = TONE_STYLES[tone];

  return (
    <div
      className="relative rounded-[16px] p-5 flex flex-col gap-3 transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--lp-bg-raised)",
        border: "1px solid var(--lp-border)",
        boxShadow: "0 20px 44px -28px rgba(0,0,0,0.65)",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ background: t.bg, color: t.fg }}
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </div>
        {action}
      </div>

      <div>
        <div
          className="font-mono text-[11px] uppercase tracking-[0.08em] mb-1.5"
          style={{ color: "var(--lp-ink-faint)" }}
        >
          {label}
        </div>

        {badge ? (
          <div>{badge}</div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-[26px] font-bold tracking-tight"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}
            >
              {value !== undefined ? value : (
                <AnimatedNumber value={numericValue ?? 0} formatter={formatter} />
              )}
            </span>
            {meta && (
              <span className="text-[13px]" style={{ color: "var(--lp-ink-faint)" }}>
                {meta}
              </span>
            )}
          </div>
        )}
      </div>

      {typeof progressPct === "number" && (
        <div className="h-[5px] rounded-full overflow-hidden" style={{ background: "var(--lp-bg-raised-2)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${Math.max(2, Math.min(100, progressPct))}%`, background: t.bar, ease: "var(--lp-ease)" } as React.CSSProperties}
          />
        </div>
      )}

      {caption && (
        <p className="text-[12.5px] leading-snug" style={{ color: "var(--lp-ink-faint)" }}>
          {caption}
        </p>
      )}
    </div>
  );
}
