import { motion } from "framer-motion";
import SectionHeader from "./SectionHeader";
import { Code2, Eye, GitBranch, Keyboard, Sparkles, Gauge } from "lucide-react";
const FEATURES = [
    {
        icon: Sparkles,
        tone: "ember",
        title: "An AI that shows its work",
        body: "Every response streams thoughts, tool calls, and file edits — not just a final answer. You always know what changed and why.",
    },
    {
        icon: Eye,
        tone: "teal",
        title: "Live preview, always current",
        body: "Each project gets its own cloud sandbox running a real dev server. Edit a file and the preview redeploys on its own.",
    },
    {
        icon: Code2,
        tone: "brass",
        title: "A real editor, real files",
        body: "Inspect every file the AI touches in a full editor, follow the diff, and see exactly what changed, line by line.",
    },
    {
        icon: GitBranch,
        tone: "teal",
        title: "Roles that actually hold",
        body: "Invite teammates as Owner, Editor, or Viewer. Permissions are enforced on the server, not just hidden in the UI.",
    },
    {
        icon: Keyboard,
        tone: "brass",
        title: "Keyboard-first navigation",
        body: "A command palette for jumping between files and actions without reaching for the mouse.",
    },
    {
        icon: Gauge,
        tone: "ember",
        title: "Usage you can see coming",
        body: "Track AI usage against your plan's daily limit in real time, with a warning before you hit it — never a surprise cutoff.",
    },
];
const toneColor = (t) => t === "ember" ? "var(--lp-ember)" : t === "teal" ? "var(--lp-teal)" : "var(--lp-brass)";
const FeaturesSection = () => (<section id="workspace" className="lp-section">
    <div className="lp-container">
      <SectionHeader eyebrow="// The workspace" title={<>Everything a build needs.<br />Nothing it doesn't.</>} subtitle="Six things you'll actually use, not a feature list padded for the pricing table."/>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURES.map((f, i) => {
        const Icon = f.icon;
        const c = toneColor(f.tone);
        return (<motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: (i % 3) * 0.08 }} whileHover={{ y: -4 }} className="group relative rounded-2xl p-7 overflow-hidden" style={{
                background: "var(--lp-bg-raised)",
                border: "1px solid var(--lp-border)",
                transition: "border-color .25s",
            }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${c}66`)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--lp-border)")}>
              <div aria-hidden className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle, ${c}22 0%, transparent 70%)` }}/>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: `${c}18`, color: c }}>
                <Icon className="w-5 h-5" strokeWidth={1.75}/>
              </div>
              <h3 className="text-[18px] mb-2">{f.title}</h3>
              <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>
                {f.body}
              </p>
            </motion.div>);
    })}
      </div>
    </div>
  </section>);
export default FeaturesSection;
