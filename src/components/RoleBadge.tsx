import { Crown, Pencil, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/permissions";
import type { ProjectRole } from "@/lib/types";

const styles: Record<ProjectRole, string> = {
  OWNER: "bg-primary/15 text-primary border-primary/30",
  EDITOR: "bg-secondary/15 text-secondary border-secondary/30",
  VIEWER: "bg-muted text-muted-foreground border-border",
};

const icons = { OWNER: Crown, EDITOR: Pencil, VIEWER: Eye } as const;

export function RoleBadge({ role, className }: { role: ProjectRole; className?: string }) {
  const Icon = icons[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        styles[role],
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {ROLE_LABEL[role]}
    </span>
  );
}
