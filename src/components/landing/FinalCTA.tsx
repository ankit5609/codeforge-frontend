import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FinalCTA = () => (
  <section className="lp-cta relative overflow-hidden">
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(50% 60% at 50% 50%, rgba(255,90,46,0.10) 0%, transparent 65%)",
      }}
    />
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="lp-container relative text-center"
    >
      <span className="lp-eyebrow">// Ready when you are</span>
      <h2
        className="mt-3 text-[clamp(34px,4.5vw,56px)] leading-[1.05]"
        style={{ letterSpacing: "-0.02em" }}
      >
        Stop scaffolding.<br />
        <span
          style={{
            background: "linear-gradient(120deg, #FF5A2E 0%, #E8B84B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Start describing.
        </span>
      </h2>
      <p
        className="mt-5 text-[17px] max-w-xl mx-auto"
        style={{ color: "var(--lp-ink-dim)" }}
      >
        Pick a plan and have a working sandbox running in the next few minutes.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">

        <a href="#pricing" className="lp-btn lp-btn-solid lp-btn-lg">
          View plans
        </a>
        <Link to="/login" className="lp-btn lp-btn-ghost lp-btn-lg">
          Log in
        </Link>
      </div>
    </motion.div>
  </section>
);

export default FinalCTA;
