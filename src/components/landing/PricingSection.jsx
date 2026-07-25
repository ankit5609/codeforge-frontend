import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/plans";
import SectionHeader from "./SectionHeader";
/**
 * Pricing card grid — data comes from the live PRICING_PLANS source of truth.
 * "Get plan" links route to /login (existing auth flow handles checkout).
 */
const PricingSection = () => (<section id="pricing" className="lp-section">
    <div className="lp-container">
      <SectionHeader center eyebrow="// Pricing" title={<>Two plans. Both get the full workspace.</>} subtitle="No feature-gated tiers and no free plan — every subscription includes the complete AI workspace, live sandboxes included."/>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {PRICING_PLANS.map((plan, i) => {
        const featured = !!plan.isPopular;
        return (<motion.div key={plan.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 0.8, 0.3, 1] }} className="relative rounded-2xl p-8 flex flex-col" style={{
                background: featured
                    ? "linear-gradient(180deg, rgba(255,90,46,0.06) 0%, rgba(18,22,29,0.9) 60%)"
                    : "var(--lp-bg-raised)",
                border: `1px solid ${featured ? "rgba(255,90,46,0.4)" : "var(--lp-border)"}`,
                boxShadow: featured ? "0 30px 60px -30px rgba(255,90,46,0.35)" : "none",
            }}>
              {featured && (<div className="absolute -top-3 left-8 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider" style={{
                    background: "var(--lp-ember)",
                    color: "#160800",
                    fontFamily: "JetBrains Mono, monospace",
                }}>
                  Most popular
                </div>)}

              <div className="text-[12px] font-mono uppercase tracking-wider mb-3" style={{ color: featured ? "var(--lp-ember)" : "var(--lp-brass)", fontFamily: "JetBrains Mono, monospace" }}>
                {plan.description}
              </div>
              <h3 className="text-[28px] mb-4">{plan.name}</h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-[44px] font-bold leading-none" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
                  {plan.price}
                </span>
                <span className="text-[14px]" style={{ color: "var(--lp-ink-dim)" }}>
                  / {plan.period}
                </span>
              </div>

              <ul className="flex flex-col gap-3 mb-8">
                {plan.features.map((f) => (<li key={f} className="flex items-start gap-2.5 text-[14.5px]" style={{ color: "var(--lp-ink)" }}>
                    <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: featured ? "var(--lp-ember)" : "var(--lp-teal)" }} strokeWidth={2.5}/>
                    {f}
                  </li>))}
              </ul>

              <Link to="/login" className={`lp-btn lp-btn-block ${featured ? "lp-btn-solid" : "lp-btn-ghost"}`}>
                Get {plan.name.replace(" Plan", "")}
              </Link>
            </motion.div>);
    })}
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8 text-center text-[14px]" style={{ color: "var(--lp-ink-dim)" }}>
        Billed monthly. Upgrade, downgrade, or cancel anytime from your billing portal.{" "}
        <Link to="/login" style={{ color: "var(--lp-ember)" }} className="hover:underline">
          Already on a plan? Log in →
        </Link>
      </motion.div>
    </div>
  </section>);
export default PricingSection;
