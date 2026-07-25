import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PROJECT_TEMPLATES } from "@/lib/templates";
export function CreateProjectDialog({ open, onOpenChange, projectName, onProjectNameChange, onCreate, isCreating, }) {
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="landing-scope !w-[min(360px,calc(100vw-32px))] !max-w-none !h-auto !min-h-0 !max-h-[calc(100vh-96px)] !p-4 !gap-0 !rounded-[12px] overflow-hidden" style={{
            background: "var(--lp-bg-raised)",
            border: "1px solid var(--lp-border)",
            display: "flex",
            flexDirection: "column",
        }}>
        <DialogHeader className="!space-y-0.5 text-left">
          <DialogTitle className="text-[15px] font-bold leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>
            Create a new project
          </DialogTitle>
          <DialogDescription className="text-[11.5px] leading-snug" style={{ color: "var(--lp-ink-faint)" }}>
            Give your project a name. You can change it later.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-9 space-y-2.5">
          <div>
            <label className="font-mono text-[9.5px] uppercase tracking-[0.1em]" style={{ color: "var(--lp-ink-faint)" }}>
              Project name
            </label>
            <input placeholder="My awesome project" value={projectName} onChange={(e) => onProjectNameChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onCreate()} autoFocus className="lp-input mt-1" style={{ padding: "7px 10px", fontSize: "12.5px" }}/>
          </div>

          <div>
            <label className="font-mono text-[9.5px] uppercase tracking-[0.1em]" style={{ color: "var(--lp-ink-faint)" }}>
              Start from a template
            </label>
              <div className="mt-1 grid grid-cols-3 gap-1.5">
              {PROJECT_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (<button key={tpl.id} type="button" onClick={() => {
                    if (tpl.id !== "blank" && !projectName.trim())
                        onProjectNameChange(tpl.name);
                }} className="group text-left rounded-[8px] px-2 py-1.5 transition-all hover:-translate-y-0.5" style={{ border: "1px solid var(--lp-border)", background: "var(--lp-bg-raised-2)" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--lp-ember)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--lp-border)")}>
                    <Icon className="w-3 h-3" style={{ color: "var(--lp-ember)" }}/>
                    <p className="mt-0.5 text-[10.5px] font-semibold leading-tight" style={{ color: "var(--lp-ink)" }}>{tpl.name}</p>
                  </button>);
        })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={() => onOpenChange(false)} className="lp-btn lp-btn-ghost" style={{ padding: "0 12px", fontSize: "12px", borderRadius: "8px", height: "32px", minHeight: "32px", lineHeight: "32px" }}>
            Cancel
          </button>
          <button onClick={onCreate} disabled={isCreating || !projectName.trim()} className="lp-btn lp-btn-solid" style={{ padding: "0 12px", fontSize: "12px", borderRadius: "8px", height: "32px", minHeight: "32px", lineHeight: "32px" }}>
            {isCreating && <Loader2 className="w-3 h-3 animate-spin"/>}
            Create project
          </button>
        </div>
      </DialogContent>
    </Dialog>);
}
