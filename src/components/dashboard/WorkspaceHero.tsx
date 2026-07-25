import { motion } from "framer-motion";

export interface WorkspaceHeroProps {
  name: string;
  planName: string;
  tokenPct: number;
  tokenUnlimited: boolean;
  projectCount: number;
  collaborationLabel: string;
}

export function WorkspaceHero({
  name,
  planName,
  tokenPct,
  tokenUnlimited,
  projectCount,
  collaborationLabel,
}: WorkspaceHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 0.8, 0.3, 1] }}
    >
      <span className="lp-eyebrow">// Workspace</span>
      <h1
        className="mt-3 text-[clamp(28px,3.6vw,40px)] leading-[1.08] font-bold tracking-[-0.02em]"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}
      >
        Welcome back, {name}.
      </h1>
      <p className="mt-2 text-[15.5px]" style={{ color: "var(--lp-ink-dim)" }}>
        Continue building with AI.
      </p>

      <div
        className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2 font-mono text-[12.5px]"
        style={{ color: "var(--lp-ink-faint)" }}
      >
        <span className="lp-live-dot inline-block" />
        <span>{planName}</span>
        <span aria-hidden>·</span>
        <span>{tokenUnlimited ? "unlimited AI usage" : `${tokenPct}% AI usage`}</span>
        <span aria-hidden>·</span>
        <span>{projectCount} active project{projectCount === 1 ? "" : "s"}</span>
        <span aria-hidden>·</span>
        <span>{collaborationLabel}</span>
      </div>
    </motion.div>
  );
}
