import { motion } from "framer-motion";
const SectionHeader = ({ eyebrow, title, subtitle, center }) => (<motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: [0.16, 0.8, 0.3, 1] }} className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
    <span className="lp-eyebrow">{eyebrow}</span>
    <h2 className="mt-3 text-[clamp(30px,3.6vw,44px)] leading-[1.08]" style={{ letterSpacing: "-0.02em" }}>
      {title}
    </h2>
    {subtitle && (<p className="mt-3 text-[17px] leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>
        {subtitle}
      </p>)}
  </motion.div>);
export default SectionHeader;
