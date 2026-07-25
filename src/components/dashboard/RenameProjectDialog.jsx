import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export function RenameProjectDialog({ open, onOpenChange, renameName, onRenameNameChange, onSubmit, originalName, }) {
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="landing-scope sm:max-w-md rounded-[18px] p-6" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
        <DialogHeader>
          <DialogTitle className="text-[20px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>
            Rename project
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <input value={renameName} onChange={(e) => onRenameNameChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSubmit()} className="lp-input" style={{ paddingLeft: "14px" }} autoFocus/>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="lp-btn lp-btn-ghost">
            Cancel
          </button>
          <button onClick={onSubmit} disabled={!renameName.trim() || renameName === originalName} className="lp-btn lp-btn-solid">
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
