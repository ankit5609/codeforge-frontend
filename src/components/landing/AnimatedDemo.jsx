import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
const PROMPT = "Add a pricing table with 3 tiers and a monthly / yearly toggle";
const CODE_LINES = [
    { text: <><span style={{ color: "#FF5A2E" }}>export function</span> PricingTable() {"{"}</> },
    { text: <>{"  "}<span style={{ color: "#FF5A2E" }}>const</span> [yearly, setYearly] = useState(<span style={{ color: "#45C4B8" }}>false</span>)</> },
    { text: <>{"  "}<span style={{ color: "#FF5A2E" }}>return</span> (</> },
    { text: <>{"    "}&lt;<span style={{ color: "#E8B84B" }}>div</span> <span style={{ color: "#45C4B8" }}>className</span>=<span style={{ color: "#8B93A4" }}>"grid grid-cols-3 gap-6"</span>&gt;</> },
    { text: <>{"      "}&lt;<span style={{ color: "#E8B84B" }}>Tier</span> <span style={{ color: "#45C4B8" }}>plan</span>=<span style={{ color: "#8B93A4" }}>{"{pro}"}</span> <span style={{ color: "#45C4B8" }}>highlighted</span> /&gt;</> },
    { text: <>{"    "}&lt;/<span style={{ color: "#E8B84B" }}>div</span>&gt;</> },
    { text: <>{"  "})</> },
    { text: <>{"}"}</> },
];
// A single loop duration; all phase timings are absolute offsets into it.
const LOOP_MS = 11000;
function useLoopClock(paused) {
    const [t, setT] = useState(0);
    useEffect(() => {
        if (paused)
            return;
        const start = performance.now();
        let raf = 0;
        const tick = (now) => {
            setT((now - start) % LOOP_MS);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [paused]);
    return t;
}
const AnimatedDemo = () => {
    const reduced = useReducedMotion();
    const t = useLoopClock(!!reduced);
    const phase = useMemo(() => {
        if (reduced)
            return "live";
        if (t < 400)
            return "idle";
        if (t < 2200)
            return "prompt";
        if (t < 3200)
            return "thinking";
        if (t < 4200)
            return "reading";
        if (t < 8200)
            return "editing";
        if (t < 9000)
            return "rebuilding";
        return "live";
    }, [t, reduced]);
    // Typed prompt: only reveal characters during the "prompt" window.
    const promptProgress = useMemo(() => {
        if (reduced)
            return 1;
        if (t < 400)
            return 0;
        if (t < 2200)
            return Math.min(1, (t - 400) / 1600);
        return 1;
    }, [t, reduced]);
    const promptText = PROMPT.slice(0, Math.floor(promptProgress * PROMPT.length));
    // Progressive code reveal during editing (4200 → 8200).
    const codeShown = useMemo(() => {
        if (reduced)
            return CODE_LINES.length;
        if (t < 4200)
            return 0;
        if (t >= 8200)
            return CODE_LINES.length;
        const p = (t - 4200) / 4000;
        return Math.min(CODE_LINES.length, Math.ceil(p * CODE_LINES.length));
    }, [t, reduced]);
    const showThinking = phase === "thinking" || phase === "reading" || phase === "editing" || phase === "rebuilding" || phase === "live";
    const showReading = phase === "reading" || phase === "editing" || phase === "rebuilding" || phase === "live";
    const showEditing = phase === "editing" || phase === "rebuilding" || phase === "live";
    const showRebuild = phase === "rebuilding" || phase === "live";
    const showLive = phase === "live";
    return (<div className="relative w-full">
      {/* Ambient ember glow behind the window */}
      <div aria-hidden className="absolute -inset-8 rounded-[32px] blur-3xl opacity-70 pointer-events-none" style={{
            background: "radial-gradient(45% 55% at 30% 40%, rgba(255,90,46,0.18) 0%, transparent 70%), radial-gradient(45% 55% at 80% 80%, rgba(69,196,184,0.14) 0%, transparent 70%)",
        }}/>

      <div className="relative rounded-2xl overflow-hidden" style={{
            background: "linear-gradient(180deg, #12161D 0%, #0E1218 100%)",
            border: "1px solid var(--lp-border)",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,90,46,0.05)",
        }}>
        {/* titlebar */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--lp-border)", background: "rgba(10,13,18,0.6)" }}>
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: "#3a4150" }}/>
            <span className="w-3 h-3 rounded-full" style={{ background: "#3a4150" }}/>
            <span className="w-3 h-3 rounded-full" style={{ background: "#3a4150" }}/>
          </div>
          <span className="text-[12px] font-mono" style={{ color: "var(--lp-ink-faint)", fontFamily: "JetBrains Mono, monospace" }}>
            atlas-checkout / src/components/PricingTable.tsx
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="lp-live-dot"/>
            <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--lp-teal)", fontFamily: "JetBrains Mono, monospace" }}>
              sandbox live
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] h-[460px]">
          {/* LEFT: chat & agent stream — fixed height so header/content don't jitter */}
          <div className="p-5 flex flex-col gap-3 h-full overflow-hidden" style={{ borderRight: "1px solid var(--lp-border)" }}>

            {/* User bubble */}
            <motion.div key={`prompt-${Math.floor(t / LOOP_MS)}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: promptProgress > 0 ? 1 : 0, y: 0 }} className="self-end max-w-[85%]">
              <div className="rounded-xl px-4 py-3" style={{
            background: "var(--lp-ember)",
            color: "#160800",
        }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">You</div>
                <div className="text-[13.5px] leading-snug font-medium">
                  {promptText}
                  {promptProgress < 1 && <span className="lp-caret" style={{ background: "#160800" }}/>}
                </div>
              </div>
            </motion.div>

            {/* Agent event chips */}
            <div className="flex flex-col gap-2 mt-1">
              <AnimatePresence>
                {showThinking && (<EventChip key="think" tone="brass" label="Thought for 2s" icon="⏳"/>)}
                {showReading && (<EventChip key="read" tone="teal" label="Reading src/components/PricingTable.tsx" icon="📖"/>)}
                {showEditing && (<EventChip key="edit" tone="ember" label="Editing PricingTable.tsx" icon="✎" pulse={phase === "editing"}/>)}
                {showRebuild && (<EventChip key="build" tone="brass" label="Rebuilding preview" icon="⚡" pulse={phase === "rebuilding"}/>)}
              </AnimatePresence>
            </div>

            {/* Final assistant line */}
            <AnimatePresence>
              {showLive && (<motion.div key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-auto pt-3 text-[13px]" style={{ color: "var(--lp-ink-dim)" }}>
                  <span style={{ color: "var(--lp-teal)", fontWeight: 700 }}>✓</span> Done — added a toggle and highlighted the middle tier.
                </motion.div>)}
            </AnimatePresence>
          </div>

          {/* RIGHT: code + preview */}
          <div className="flex flex-col h-full">
            {/* code panel */}
            <div className="flex-1 flex flex-col min-h-0" style={{ background: "#0B0E14" }}>
              <div className="px-4 py-2 text-[11px] font-mono uppercase tracking-wider" style={{
            color: "var(--lp-ink-faint)",
            borderBottom: "1px solid var(--lp-border)",
            fontFamily: "JetBrains Mono, monospace",
        }}>
                PricingTable.tsx
              </div>
              <div className="p-4 flex-1 font-mono text-[12.5px] leading-[1.7] overflow-hidden" style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--lp-ink)" }}>
                {CODE_LINES.slice(0, codeShown).map((line, i) => (<motion.div key={`${Math.floor(t / LOOP_MS)}-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="flex gap-3">
                    <span style={{ color: "var(--lp-ink-faint)", minWidth: 18, textAlign: "right" }}>{i + 1}</span>
                    <span>{line.text}</span>
                  </motion.div>))}
              </div>
            </div>

            {/* live preview appears only after rebuild starts */}
            <AnimatePresence>
              {showRebuild && (<motion.div key="live-preview" initial={{ opacity: 0, y: 12, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: 12, height: 0 }} transition={{ duration: 0.35, ease: [0.16, 0.8, 0.3, 1] }} className="overflow-hidden" style={{
                borderTop: "1px solid var(--lp-border)",
                background: "linear-gradient(180deg, #0F1319 0%, #0A0D12 100%)",
            }}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="lp-live-dot"/>
                      <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--lp-ink-dim)", fontFamily: "JetBrains Mono, monospace" }}>
                        Live Preview
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <PreviewTier name="Basic" price="₹0"/>
                      <PreviewTier name="Pro" price="₹1,499" active/>
                      <PreviewTier name="Team" price="₹4,999"/>
                    </div>
                  </div>
                </motion.div>)}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>);
};
const EventChip = ({ label, icon, tone, pulse, }) => {
    const color = tone === "ember" ? "var(--lp-ember)" : tone === "teal" ? "var(--lp-teal)" : "var(--lp-brass)";
    return (<motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-[12px] font-medium" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--lp-border)",
            color: "var(--lp-ink)",
        }}>
      <span style={{ color }}>{icon}</span>
      {label}
      {pulse && (<motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: color }}/>)}
    </motion.div>);
};
const PreviewTier = ({ name, price, active }) => (<div className="rounded-lg p-3 text-center" style={{
        background: active ? "rgba(255,90,46,0.10)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? "rgba(255,90,46,0.45)" : "var(--lp-border)"}`,
    }}>
    <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: active ? "var(--lp-ember)" : "var(--lp-ink-dim)", fontFamily: "JetBrains Mono, monospace" }}>
      {name}
    </div>
    <div className="text-[15px] font-bold" style={{ color: "var(--lp-ink)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
      {price}
    </div>
  </div>);
export default AnimatedDemo;
