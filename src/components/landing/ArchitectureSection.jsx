import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";
/**
 * Animated architecture flow: request pulses travel top→bottom through the
 * layers (Browser → Gateway → Services → Pods) on a repeating cadence.
 */
const ArchitectureSection = () => {
    const reduced = useReducedMotion();
    const [pulse, setPulse] = useState(0);
    useEffect(() => {
        if (reduced)
            return;
        const id = setInterval(() => setPulse((p) => p + 1), 3200);
        return () => clearInterval(id);
    }, [reduced]);
    return (<section id="infrastructure" className="lp-section-lg">
      <div className="lp-container">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.2fr] gap-10 lg:gap-14 items-center">

          <div>
            <SectionHeader eyebrow="// Infrastructure" title={<>Real distributed infrastructure — not a shared playground.</>} subtitle="Every project runs in its own Kubernetes pod. Independent services sit behind a single gateway, built to hold up under real, concurrent use."/>

            <div className="mt-8 flex flex-col gap-4">
              {[
            {
                title: "Isolated by default",
                detail: "One Kubernetes runner pod per project — nothing shared with anyone else's sandbox.",
            },
            {
                title: "Independent services",
                detail: "Account, workspace, and intelligence run as separate services behind one gateway.",
            },
            {
                title: "Self-healing sandboxes",
                detail: "An unreachable preview triggers an automatic restart — no manual intervention needed.",
            },
        ].map((f, i) => (<motion.div key={f.title} initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex gap-4">
                  <span className="mt-2 w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--lp-ember)", boxShadow: "0 0 8px var(--lp-ember-glow)" }}/>
                  <div>
                    <div className="font-bold text-[15px]" style={{ color: "var(--lp-ink)" }}>{f.title}</div>
                    <div className="text-[14px] leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>
                      {f.detail}
                    </div>
                  </div>
                </motion.div>))}
            </div>
          </div>

          {/* diagram */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.16, 0.8, 0.3, 1] }} className="relative rounded-2xl p-8 md:p-10" style={{
            background: "linear-gradient(180deg, rgba(18,22,29,0.9) 0%, rgba(10,13,18,0.9) 100%)",
            border: "1px solid var(--lp-border)",
            boxShadow: "0 30px 60px -30px rgba(0,0,0,0.5)",
        }}>
            <ArchRow>
              <ArchNode label="Browser"/>
            </ArchRow>
            <Connector pulse={pulse} keyId="c1"/>
            <ArchRow>
              <ArchNode label="API Gateway" sub="/api/v1" big/>
            </ArchRow>
            <Connector pulse={pulse} keyId="c2"/>
            <ArchRow>
              <ArchNode label="Account" sub="/account" tone="brass"/>
              <ArchNode label="Workspace" sub="/workspace" tone="teal"/>
              <ArchNode label="Intelligence" sub="/intelligence" tone="ember"/>
            </ArchRow>
            <Connector pulse={pulse} keyId="c3" small/>
            <ArchRow>
              <ArchNode label="Pod #1" mono/>
              <ArchNode label="Pod #2" mono/>
              <ArchNode label="Pod #N" mono/>
            </ArchRow>
          </motion.div>
        </div>
      </div>
    </section>);
};
const ArchRow = ({ children }) => (<div className="flex justify-center gap-3">{children}</div>);
const ArchNode = ({ label, sub, big, mono, tone, }) => {
    const accent = tone === "ember" ? "var(--lp-ember)" : tone === "teal" ? "var(--lp-teal)" : tone === "brass" ? "var(--lp-brass)" : "var(--lp-ink-dim)";
    return (<div className={`rounded-lg px-4 py-3 flex-1 max-w-[220px] text-center ${big ? "py-4" : ""}`} style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${tone ? `${accent}55` : "var(--lp-border)"}`,
        }}>
      <div className={`text-[${big ? 15 : 14}px] font-semibold`} style={{
            color: "var(--lp-ink)",
            fontFamily: mono ? "JetBrains Mono, monospace" : "Manrope, sans-serif",
        }}>
        {label}
      </div>
      {sub && (<div className="text-[11px] mt-0.5" style={{ color: "var(--lp-ink-faint)", fontFamily: "JetBrains Mono, monospace" }}>
          {sub}
        </div>)}
    </div>);
};
const Connector = ({ pulse, keyId, small }) => (<div className={`relative mx-auto my-2 ${small ? "h-6" : "h-8"} w-px`} style={{ background: "var(--lp-border)" }}>
    <motion.div key={`${keyId}-${pulse}`} initial={{ top: "-6px", opacity: 0 }} animate={{ top: "100%", opacity: [0, 1, 1, 0] }} transition={{ duration: 0.9, ease: "easeIn" }} className="absolute -left-[3px] w-[7px] h-[7px] rounded-full" style={{ background: "var(--lp-ember)", boxShadow: "0 0 10px var(--lp-ember-glow)" }}/>
  </div>);
export default ArchitectureSection;
