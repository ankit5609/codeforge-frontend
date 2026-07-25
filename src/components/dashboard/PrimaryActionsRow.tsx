import { Plus, LayoutTemplate, Import } from "lucide-react";

export interface PrimaryActionsRowProps {
  onNewProject: () => void;
  /** Opens the same create-project dialog, which already contains the template picker. */
  onTemplates: () => void;
  /** No import endpoint exists yet — this only surfaces a "coming soon" toast. */
  onImportClick: () => void;
}

export function PrimaryActionsRow({ onNewProject, onTemplates, onImportClick }: PrimaryActionsRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={onNewProject} className="lp-btn lp-btn-solid">
        <Plus className="w-4 h-4" /> New project
      </button>

      <button onClick={onTemplates} className="lp-btn lp-btn-ghost">
        <LayoutTemplate className="w-4 h-4" /> Templates
      </button>

      <button
        onClick={onImportClick}
        className="lp-btn lp-btn-ghost relative"
        style={{ color: "var(--lp-ink-faint)" }}
      >
        <Import className="w-4 h-4" /> Import project
        <span
          className="font-mono text-[9.5px] uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: "var(--lp-bg-raised-2)", color: "var(--lp-ink-faint)" }}
        >
          soon
        </span>
      </button>
    </div>
  );
}
