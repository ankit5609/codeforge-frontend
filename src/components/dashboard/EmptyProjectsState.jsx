import { motion } from "framer-motion";
import { Plus } from "lucide-react";
function EmptyIllustration() {
    return (<svg width="132" height="132" viewBox="0 0 132 132" fill="none" aria-hidden>
      <defs>
        <linearGradient id="emptyGradA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF5A2E"/>
          <stop offset="100%" stopColor="#E8B84B"/>
        </linearGradient>
        <radialGradient id="emptyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,90,46,0.20)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>
      <circle cx="66" cy="66" r="64" fill="url(#emptyGlow)"/>
      <rect x="20" y="44" width="70" height="54" rx="12" transform="rotate(-6 20 44)" stroke="var(--lp-border)" strokeWidth="2" fill="var(--lp-bg-raised-2)"/>
      <rect x="40" y="36" width="70" height="54" rx="12" stroke="url(#emptyGradA)" strokeWidth="2" fill="var(--lp-bg-raised)"/>
      <circle cx="75" cy="63" r="11" fill="var(--lp-bg)" stroke="url(#emptyGradA)" strokeWidth="2"/>
      <path d="M75 58v10M70 63h10" stroke="var(--lp-ember)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="102" cy="40" r="3" fill="var(--lp-teal)"/>
      <circle cx="30" cy="30" r="2.5" fill="var(--lp-brass)"/>
    </svg>);
}
export function EmptyProjectsState({ isSearching, onCreateProject }) {
    return (<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 0.8, 0.3, 1] }} className="text-center py-16 px-8 rounded-[20px] max-w-lg mx-auto" style={{ border: "1px dashed var(--lp-border)", background: "var(--lp-bg-raised)" }}>
      <div className="flex justify-center mb-5">
        <EmptyIllustration />
      </div>
      <h3 className="text-[19px] font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>
        {isSearching ? "No matching projects" : "No projects yet"}
      </h3>
      <p className="text-[14px] mb-6" style={{ color: "var(--lp-ink-faint)" }}>
        {isSearching ? "Try a different search term." : "Create your first project to get started."}
      </p>
      {!isSearching && (<button onClick={onCreateProject} className="lp-btn lp-btn-solid mx-auto">
          <Plus className="w-4 h-4"/> Create project
        </button>)}
    </motion.div>);
}
