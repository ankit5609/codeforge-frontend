import { Loader2, CheckCircle2, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeployState = "idle" | "building" | "ready" | "error";

const config: Record<DeployState, { label: string; fg: string; bg: string; border: string; icon: typeof Circle; spin?: boolean }> = {
  idle: { label: "Idle", fg: "var(--lp-ink-faint)", bg: "var(--lp-bg-raised-2)", border: "var(--lp-border)", icon: Circle },
  building: { label: "Building", fg: "var(--lp-brass)", bg: "rgba(232,184,75,0.12)", border: "rgba(232,184,75,0.3)", icon: Loader2, spin: true },
  ready: { label: "Ready", fg: "var(--lp-teal)", bg: "rgba(69,196,184,0.12)", border: "rgba(69,196,184,0.3)", icon: CheckCircle2 },
  error: { label: "Error", fg: "var(--lp-ember)", bg: "rgba(255,90,46,0.12)", border: "rgba(255,90,46,0.3)", icon: AlertTriangle },
};

export function DeployStatus({
  state,
  className,
  pulse = false,
}: {
  state: DeployState;
  className?: string;
  /** True while the chat's live-verification event is active — briefly glows the badge so header and chat visibly agree. */
  pulse?: boolean;
}) {
  const { label, fg, bg, border, icon: Icon, spin } = config[state];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-shadow duration-300", className)}
      style={{ color: fg, background: bg, borderColor: border, boxShadow: pulse ? `0 0 0 3px ${bg}` : "none" }}
      aria-live="polite"
    >
      <Icon className={cn("h-3.5 w-3.5", spin && "animate-spin")} />
      {label}
    </span>
  );
}
