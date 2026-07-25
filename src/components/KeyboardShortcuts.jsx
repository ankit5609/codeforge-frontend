import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
const SHORTCUTS = [
    { keys: ["⌘", "K"], label: "Open command palette" },
    { keys: ["?"], label: "Show this help" },
    { keys: ["N"], label: "New project" },
    { keys: ["G", "P"], label: "Go to projects" },
    { keys: ["G", "S"], label: "Go to settings" },
    { keys: ["Esc"], label: "Close dialogs" },
];
function Key({ children }) {
    return (<kbd className="inline-flex min-w-[1.6rem] items-center justify-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground shadow-sm">
      {children}
    </kbd>);
}
export function KeyboardShortcuts() {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const onKey = (e) => {
            const target = e.target;
            const typing = ["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable;
            if (!typing && e.key === "?") {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        const onShow = () => setOpen(true);
        window.addEventListener("keydown", onKey);
        window.addEventListener("open-shortcuts", onShow);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("open-shortcuts", onShow);
        };
    }, []);
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          {SHORTCUTS.map((s) => (<div key={s.label} className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/40">
              <span className="text-sm text-foreground">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k, i) => (<Key key={i}>{k}</Key>))}
              </span>
            </div>))}
        </div>
      </DialogContent>
    </Dialog>);
}
