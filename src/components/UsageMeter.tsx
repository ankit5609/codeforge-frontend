import { Infinity as InfinityIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { meterTone, formatNumber, type DerivedUsage } from "@/lib/usage";

interface UsageMeterProps {
  label: string;
  usage: DerivedUsage;
  unit?: string;
  caption?: string;
  className?: string;
}

const toneStyles = {
  ok: "[&>div]:bg-primary",
  warning: "[&>div]:bg-amber-500",
  critical: "[&>div]:bg-destructive",
} as const;

export function UsageMeter({ label, usage, unit, caption, className }: UsageMeterProps) {
  const tone = meterTone(usage.pct);
  return (
    <div className={cn("rounded-lg border border-border/60 bg-card/60 p-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {usage.unlimited ? (
          <span className="flex items-center gap-1 text-sm text-primary">
            <InfinityIcon className="h-3.5 w-3.5" /> Unlimited
          </span>
        ) : (
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatNumber(usage.used)}
            <span className="opacity-50"> / {formatNumber(usage.limit)}</span>
            {unit ? ` ${unit}` : ""}
          </span>
        )}
      </div>
      {!usage.unlimited && (
        <Progress value={usage.pct} className={cn("mt-3 h-2", toneStyles[tone])} />
      )}
      {caption && <p className="mt-2 text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}
