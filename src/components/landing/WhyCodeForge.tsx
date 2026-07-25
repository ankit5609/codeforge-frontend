import { motion } from "framer-motion";
import SectionHeader from "./SectionHeader";

const ROWS: Array<{ label: string; traditional: string; codeforge: string }> = [
  { label: "Environment setup", traditional: "Install Node, npm, deps, run dev server", codeforge: "Zero setup — cloud sandbox in seconds" },
  { label: "Scaffolding", traditional: "Boilerplate for every new component", codeforge: "Describe the feature, get the files" },
  { label: "Feedback loop", traditional: "Edit → save → refresh → repeat", codeforge: "Preview redeploys on its own" },
  { label: "Collaboration", traditional: "Git branches, merge conflicts", codeforge: "Roles enforced server-side, shared preview" },
  { label: "AI assistance", traditional: "Copy-paste from chatbots", codeforge: "Agent that edits real files with visible diffs" },
  { label: "Debugging visibility", traditional: "Guess what the AI did", codeforge: "Streaming thoughts, tool calls, and diffs" },
];

const WhyCodeForge = () => (
  <section id="why" className="lp-section">
    <div className="lp-container">
      <SectionHeader
        eyebrow="// Traditional vs CodeForge"
        title={<>The old way was designed<br />before AI could actually write code.</>}
        subtitle="Every part of a modern build changes when the tooling is agent-first."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mt-12 rounded-2xl overflow-hidden"
        style={{
          background: "var(--lp-bg-raised)",
          border: "1px solid var(--lp-border)",
        }}
      >
        {/* header row */}
        <div
          className="grid grid-cols-[1fr_1fr_1.15fr] items-center px-6 py-4 text-[12px] font-mono uppercase tracking-wider"
          style={{
            borderBottom: "1px solid var(--lp-border)",
            color: "var(--lp-ink-faint)",
            fontFamily: "JetBrains Mono, monospace",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div />
          <div>Traditional stack</div>
          <div style={{ color: "var(--lp-ember)" }}>CodeForge</div>
        </div>

        {ROWS.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="grid grid-cols-[1fr_1fr_1.15fr] items-center px-6 py-5 gap-4"
            style={{
              borderBottom: i === ROWS.length - 1 ? "none" : "1px solid var(--lp-border)",
            }}
          >
            <div className="text-[14.5px] font-semibold" style={{ color: "var(--lp-ink)" }}>
              {r.label}
            </div>
            <div className="text-[14px] flex items-start gap-2" style={{ color: "var(--lp-ink-dim)" }}>
              <span className="mt-0.5" style={{ color: "var(--lp-ink-faint)" }}>✕</span>
              {r.traditional}
            </div>
            <div className="text-[14px] flex items-start gap-2" style={{ color: "var(--lp-ink)" }}>
              <span className="mt-0.5" style={{ color: "var(--lp-teal)", fontWeight: 700 }}>✓</span>
              {r.codeforge}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default WhyCodeForge;
