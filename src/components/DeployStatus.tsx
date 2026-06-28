import { Loader2, CheckCircle2, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeployState = "idle" | "building" | "ready" | "error";

const config: Record<DeployState, { label: string; className: string; icon: typeof Circle; spin?: boolean }> = {
  idle: { label: "Idle", className: "bg-muted text-muted-foreground border-border", icon: Circle },
  building: {
    label: "Building",
    className: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    icon: Loader2,
    spin: true,
  },
  ready: {
    label: "Ready",
    className: "bg-primary/15 text-primary border-primary/30",
    icon: CheckCircle2,
  },
  error: {
    label: "Error",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    icon: AlertTriangle,
  },
};

export function DeployStatus({ state, className }: { state: DeployState; className?: string }) {
  const { label, className: tone, icon: Icon, spin } = config[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone,
        className,
      )}
      aria-live="polite"
    >
      <Icon className={cn("h-3.5 w-3.5", spin && "animate-spin")} />
      {label}
    </span>
  );
}
