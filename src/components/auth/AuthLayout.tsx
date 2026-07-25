import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

/**
 * Shared two-column authentication shell.
 * - Left: brand hero (eyebrow, headline, description, status badges).
 * - Right: authentication card (children).
 * On desktop it fits within the viewport height (no scroll).
 * Tablet/mobile: single column, hero above form.
 */
export interface AuthLayoutProps {
  eyebrow: string;
  heading: ReactNode; // supports gradient span
  description: string;
  badges?: string[];
  aside?: ReactNode; // optional extra content under badges (e.g. step tracker)
  children: ReactNode; // right column content (the card)
}

const BrandMark = () => (
  <Link
    to="/"
    className="flex items-center gap-2.5 font-bold text-[17px] tracking-tight"
    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}
    aria-label="CodeForge home"
  >
    <img
      src="/logo.png"
      alt="CodeForge"
      width={26}
      height={26}
      className="w-[26px] h-[26px] object-contain rounded-md"
    />
    CodeForge
  </Link>
);

export function AuthLayout({ eyebrow, heading, description, badges, aside, children }: AuthLayoutProps) {
  return (
    <div className="landing-scope min-h-screen lg:h-screen w-full flex flex-col relative overflow-hidden">
      {/* ambient background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(237,239,243,0.035) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(60% 40% at 10% 15%, rgba(255,90,46,0.10) 0%, transparent 60%), radial-gradient(50% 40% at 95% 25%, rgba(69,196,184,0.08) 0%, transparent 60%)",
        }}
      />

      {/* top bar with single brand identity */}
      <header className="relative z-10 flex items-center px-6 sm:px-10 pt-6 lg:pt-7 shrink-0">
        <BrandMark />
      </header>

      {/* main two-column grid */}
      <main className="relative z-10 flex-1 min-h-0 w-full">
        <div className="mx-auto h-full max-w-[1280px] px-6 sm:px-10 py-8 lg:py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-14 items-center">
          {/* Left: hero */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 0.8, 0.3, 1] }}
            className="max-w-[540px]"
          >
            <div
              className="font-mono text-[12px] uppercase tracking-[0.08em] mb-4"
              style={{ color: "var(--lp-brass)" }}
            >
              {eyebrow}
            </div>

            <h1
              className="text-[clamp(30px,3.6vw,44px)] leading-[1.05] font-bold tracking-[-0.02em] mb-4"
              style={{ fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif" }}
            >
              {heading}
            </h1>

            <p className="text-[15px] leading-[1.6] mb-5" style={{ color: "var(--lp-ink-dim)" }}>
              {description}
            </p>

            {badges && badges.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[12px]"
                style={{ color: "var(--lp-ink-faint)" }}
              >
                <span className="lp-live-dot inline-block w-1.5 h-1.5 rounded-full" />
                {badges.map((b, i) => (
                  <span key={b} className="flex items-center gap-2">
                    <span>{b}</span>
                    {i < badges.length - 1 && <span aria-hidden>·</span>}
                  </span>
                ))}
              </div>
            )}

            {aside && <div className="mt-6">{aside}</div>}
          </motion.section>

          {/* Right: form card */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 0.8, 0.3, 1] }}
            className="w-full max-w-[460px] lg:justify-self-end"
          >
            {children}
          </motion.section>
        </div>
      </main>

      <footer
        className="relative z-10 text-center pb-4 lg:pb-5 px-6 font-mono text-[11.5px] shrink-0"
        style={{ color: "var(--lp-ink-faint)" }}
      >
        Built with real files, on real infrastructure.
      </footer>
    </div>
  );
}

/**
 * Consistent card container for auth forms (used inside AuthLayout).
 */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative rounded-[18px] p-6 sm:p-8 overflow-hidden"
      style={{
        background: "var(--lp-bg-raised)",
        border: "1px solid var(--lp-border)",
        boxShadow: "0 40px 90px -44px rgba(0,0,0,0.7)",
      }}
    >
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(120deg, #FF5A2E 0%, #FF8A5E 45%, #E8B84B 100%)" }}
      />
      {children}
    </div>
  );
}
