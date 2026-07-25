import { Check, Loader2, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export function PlanDialog({ open, onOpenChange, tiers, checkoutPlanId, onChoosePlan }) {
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="landing-scope sm:max-w-2xl rounded-[18px] p-6" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
        <DialogHeader>
          <DialogTitle className="text-[24px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>
            Choose your plan
          </DialogTitle>
          <DialogDescription style={{ color: "var(--lp-ink-faint)" }}>
            Upgrade to unlock more projects, AI usage and faster builds.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {tiers.map((tier) => {
            const isLoading = checkoutPlanId === tier.planId;
            return (<div key={tier.planId} className="relative rounded-[16px] p-6 flex flex-col" style={{
                    background: "var(--lp-bg-raised-2)",
                    border: tier.recommended ? "1px solid var(--lp-ember)" : "1px solid var(--lp-border)",
                    boxShadow: tier.recommended ? "0 20px 50px -24px var(--lp-ember-glow)" : "none",
                }}>
                {tier.recommended && (<span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: "var(--lp-ember)", color: "#160800" }}>
                    <Zap className="w-3 h-3"/> Popular
                  </span>)}
                <h3 className="text-[17px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>
                  {tier.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[30px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>
                    {tier.price}
                  </span>
                  <span className="text-[13px]" style={{ color: "var(--lp-ink-faint)" }}>{tier.period}</span>
                </div>
                <p className="mt-2 text-[13.5px]" style={{ color: "var(--lp-ink-dim)" }}>{tier.tagline}</p>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {tier.features.map((feature) => (<li key={feature} className="flex items-start gap-2 text-[13.5px]" style={{ color: "var(--lp-ink-dim)" }}>
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--lp-teal)" }}/>
                      {feature}
                    </li>))}
                </ul>
                <button onClick={() => onChoosePlan(tier.planId)} disabled={checkoutPlanId !== null} className={tier.recommended ? "lp-btn lp-btn-solid mt-6 !w-full" : "lp-btn lp-btn-ghost mt-6 !w-full"}>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                  Choose {tier.name}
                </button>
              </div>);
        })}
        </div>
      </DialogContent>
    </Dialog>);
}
