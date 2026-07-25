import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * Sticky, translucent nav for the landing page. Presentation-only:
 * links jump to in-page anchors and to the existing /login route.
 */
const LandingNav = () => {
  const links = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#why", label: "Why CodeForge" },
    { href: "#stack", label: "Stack" },
    { href: "#infrastructure", label: "Infrastructure" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 0.8, 0.3, 1] }}
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        background: "rgba(10, 13, 18, 0.72)",
        borderBottom: "1px solid var(--lp-border)",
      }}
    >
      <div className="lp-container flex items-center justify-between h-[68px]">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-[17px] tracking-tight"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif", color: "var(--lp-ink)" }}
        >
          <img
            src="/logo.png"
            alt="CodeForge"
            width="26"
            height="26"
            className="w-[26px] h-[26px] object-contain rounded-md"
          />
          CodeForge
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] transition-colors"
              style={{ color: "var(--lp-ink-dim)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lp-ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lp-ink-dim)")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link to="/login" className="lp-btn lp-btn-ghost text-[14px] py-2.5 px-4 hidden sm:inline-flex">
            Log in
          </Link>
          <a href="#pricing" className="lp-btn lp-btn-solid text-[14px] py-2.5 px-4">
            Get started
          </a>
        </div>
      </div>
    </motion.header>
  );
};

export default LandingNav;
