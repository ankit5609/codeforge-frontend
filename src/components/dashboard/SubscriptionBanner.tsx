import { motion } from "framer-motion";
import { AlertTriangle, Sparkles } from "lucide-react";

export interface SubscriptionBannerProps {
  message?: string | null;
  onUpgrade: () => void;
}

/** Same isDemoLocked condition as before — only rendered by the parent when subscription.status === "DEMO_LOCKED". */
export function SubscriptionBanner({ message, onUpgrade }: SubscriptionBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 0.8, 0.3, 1] }}
      className="flex items-start gap-4 rounded-[16px] p-5"
      style={{
        border: "1px solid rgba(232,184,75,0.3)",
        background: "rgba(232,184,75,0.07)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgba(232,184,75,0.15)", border: "1px solid rgba(232,184,75,0.25)" }}
      >
        <AlertTriangle className="w-5 h-5" style={{ color: "var(--lp-brass)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-semibold mb-0.5" style={{ color: "var(--lp-ink)" }}>
          Demo mode — limited access
        </p>
        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>
          {message || "Your workspace is running in demo mode. Upgrade to unlock full access."}
        </p>
      </div>
      <button onClick={onUpgrade} className="lp-btn lp-btn-solid shrink-0 !py-2.5 !px-4 !text-[13.5px]">
        <Sparkles className="w-4 h-4" /> Upgrade
      </button>
    </motion.div>
  );
}
