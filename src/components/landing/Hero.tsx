import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AnimatedDemo from "./AnimatedDemo";

const Hero = () => (
  <section className="lp-hero relative overflow-hidden">
    {/* ambient glows */}
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(60% 40% at 15% 10%, rgba(255,90,46,0.10) 0%, transparent 60%), radial-gradient(50% 40% at 90% 20%, rgba(69,196,184,0.08) 0%, transparent 60%)",
      }}
    />
    <div className="lp-container relative">
      <div className="grid grid-cols-1 lg:grid-cols-[1.22fr_1fr] gap-10 lg:gap-14 items-center">
        {/* COPY */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lp-eyebrow"
          >
            // AI-native cloud IDE
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05, ease: [0.16, 0.8, 0.3, 1] }}
            className="mt-4 text-[clamp(38px,5.6vw,68px)] leading-[1.02]"
            style={{ letterSpacing: "-0.025em" }}
          >
            Build software at the{" "}
            <span
              style={{
                background:
                  "linear-gradient(120deg, #FF5A2E 0%, #FF8A5E 45%, #E8B84B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              speed of thought.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 text-[17px] md:text-[18px] leading-relaxed max-w-[560px]"
            style={{ color: "var(--lp-ink-dim)" }}
          >
            CodeForge pairs you with an AI engineer that edits real files inside a live
            Kubernetes sandbox — you describe the change, watch it happen, and see the
            preview reload in seconds. No local setup. No scaffolding. No waiting.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <a href="#pricing" className="lp-btn lp-btn-solid lp-btn-lg">
              Start building →
            </a>
            <Link to="/login" className="lp-btn lp-btn-ghost lp-btn-lg">
              Log in
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px]"
            style={{ color: "var(--lp-ink-faint)", fontFamily: "JetBrains Mono, monospace" }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="lp-live-dot" /> live cloud sandbox from day one
            </span>
            <span>·</span>
            <span>isolated k8s pods</span>
            <span>·</span>
            <span>real files, real diffs</span>
          </motion.div>
        </div>

        {/* DEMO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 0.8, 0.3, 1] }}
        >
          <AnimatedDemo />
        </motion.div>
      </div>
    </div>
  </section>
);

export default Hero;
