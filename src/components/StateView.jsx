import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
/**
 * Reusable empty / error / informational state.
 * Used across the workspace (files, chat, members, preview) to keep
 * empty and error surfaces visually consistent.
 */
export function StateView({ icon: Icon, title, description, action, secondaryAction, variant = "default", className, compact = false, children, }) {
    return (<div className={cn("flex flex-col items-center justify-center text-center", compact ? "p-6 gap-3" : "h-full p-8 gap-4", className)} role={variant === "destructive" ? "alert" : "status"}>
      <div className={cn("flex items-center justify-center rounded-2xl", compact ? "w-12 h-12" : "w-16 h-16", variant === "destructive"
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary")}>
        <Icon className={compact ? "w-6 h-6" : "w-8 h-8"} aria-hidden="true"/>
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className={cn("font-display font-semibold text-foreground", compact ? "text-base" : "text-xl")}>
          {title}
        </h3>
        {description && (<p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>)}
      </div>

      {children}

      {(action || secondaryAction) && (<div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {action && (<Button size="sm" variant={action.variant ?? (variant === "destructive" ? "default" : "default")} onClick={action.onClick} className="rounded-full px-4">
              {action.label}
            </Button>)}
          {secondaryAction && (<Button size="sm" variant={secondaryAction.variant ?? "outline"} onClick={secondaryAction.onClick} className="rounded-full px-4">
              {secondaryAction.label}
            </Button>)}
        </div>)}
    </div>);
}
