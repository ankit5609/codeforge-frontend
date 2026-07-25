import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";
/**
 * Horizontal workflow visual: Prompt → Thinking → Editing → Preview.
 * A single "active" node advances on a 2.2s cadence to convey the loop.
 */
const STEPS = [
    {
        key: "prompt",
        tag: "01",
        label: "User Prompt",
        detail: "Describe the change in plain English.",
        color: "var(--lp-ember)",
        icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16v10H9l-4 4v-4H4z"/>
      </svg>),
    },
    {
        key: "thinking",
        tag: "02",
        label: "AI Thinking",
        detail: "The agent plans, reads files, and picks tools.",
        color: "var(--lp-brass)",
        icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 2"/>
      </svg>),
    },
    {
        key: "editing",
        tag: "03",
        label: "Editing Files",
        detail: "Real diffs stream into your repo in the cloud sandbox.",
        color: "var(--lp-ember)",
        icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
      </svg>),
    },
    {
        key: "preview",
        tag: "04",
        label: "Preview Refresh",
        detail: "The live sandbox rebuilds and re-renders in seconds.",
        color: "var(--lp-teal)",
        icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-3-6.7"/>
        <path d="M21 4v5h-5"/>
      </svg>),
    },
];
const WorkflowSection = () => {
    const reduced = useReducedMotion();
    const [active, setActive] = useState(0);
    useEffect(() => {
        if (reduced)
            return;
        const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 2200);
        return () => clearInterval(id);
    }, [reduced]);
    return (<section id="how-it-works" className="lp-section relative">
      <div className="lp-container">
        <SectionHeader center eyebrow="// The loop" title={<>From a sentence to a running app.</>} subtitle="Every turn cycles through the same four beats — and you see each one happen."/>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-2 relative">
          {/* connector line */}
          <div aria-hidden className="hidden md:block absolute left-0 right-0 top-[42px] h-px" style={{ background: "var(--lp-border)" }}/>
          <motion.div aria-hidden className="hidden md:block absolute top-[42px] h-px" style={{ background: "linear-gradient(90deg, var(--lp-ember), var(--lp-teal))" }} initial={false} animate={{
            left: "0%",
            width: `${((active + 1) / STEPS.length) * 100}%`,
        }} transition={{ duration: 0.9, ease: [0.16, 0.8, 0.3, 1] }}/>

          {STEPS.map((s, i) => {
            const isActive = i === active;
            return (<motion.div key={s.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.08 }} className="relative rounded-2xl p-6" style={{
                    background: "var(--lp-bg-raised)",
                    border: `1px solid ${isActive ? s.color : "var(--lp-border)"}`,
                    boxShadow: isActive
                        ? `0 20px 40px -20px ${s.color === "var(--lp-ember)" ? "rgba(255,90,46,0.35)" : s.color === "var(--lp-teal)" ? "rgba(69,196,184,0.3)" : "rgba(232,184,75,0.3)"}`
                        : "none",
                    transition: "border-color .4s, box-shadow .4s",
                }}>
                <div className="flex items-start justify-between mb-4">
                  <motion.div animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ duration: 0.7 }} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{
                    background: isActive ? `${s.color}` : "rgba(255,255,255,0.04)",
                    color: isActive ? "#0A0D12" : "var(--lp-ink-dim)",
                }}>
                    <div className="w-5 h-5">{s.icon}</div>
                  </motion.div>
                  <span className="text-[11px] font-mono" style={{ color: "var(--lp-ink-faint)", fontFamily: "JetBrains Mono, monospace" }}>
                    {s.tag}
                  </span>
                </div>
                <h3 className="text-[19px] mb-1.5">{s.label}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>
                  {s.detail}
                </p>
              </motion.div>);
        })}
        </div>
      </div>
    </section>);
};
export default WorkflowSection;
