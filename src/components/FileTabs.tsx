import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTabsProps {
  openTabs: string[];
  activeTab: string | null;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
}

// Helper to get filename from path
const getFileName = (path: string) => path.split('/').pop() || path;

// Get file dot color based on extension
const getFileDotColor = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'ts':
      return 'var(--lp-ember)';
    case 'jsx':
    case 'js':
      return 'var(--lp-brass)';
    case 'css':
      return 'var(--lp-teal)';
    case 'json':
      return 'var(--lp-ink-dim)';
    default:
      return 'var(--lp-ink-faint)';
  }
};

export function FileTabs({ openTabs, activeTab, onSelectTab, onCloseTab }: FileTabsProps) {
  if (openTabs.length === 0) return null;

  return (
    <div className="flex items-center overflow-x-auto" style={{ borderBottom: "1px solid var(--lp-border-soft)" }}>
      {openTabs.map((path) => {
        const isActive = activeTab === path;
        return (
          <div
            key={path}
            className="group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors min-w-0"
            style={{
              borderRight: "1px solid var(--lp-border-soft)",
              background: isActive ? "var(--lp-bg)" : "transparent",
              color: isActive ? "var(--lp-ink)" : "var(--lp-ink-faint)",
            }}
            onClick={() => onSelectTab(path)}
          >
            <span className="shrink-0 w-2 h-2 rounded-full" style={{ background: getFileDotColor(path) }} />
            <span className="truncate max-w-[120px]">{getFileName(path)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(path);
              }}
              className={cn("shrink-0 p-0.5 rounded transition-opacity", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
              style={{ color: "var(--lp-ink-faint)" }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
