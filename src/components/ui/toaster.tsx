import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

const variantIcon = {
  default: Info,
  success: CheckCircle2,
  destructive: AlertTriangle,
} as const;

const iconColor = {
  default: "text-secondary",
  success: "text-primary",
  destructive: "text-destructive",
} as const;

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const key = (variant ?? "default") as keyof typeof variantIcon;
        const Icon = variantIcon[key] ?? Info;
        return (
          <Toast key={id} variant={variant} {...props}>
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04] ${iconColor[key] ?? iconColor.default}`}
              aria-hidden="true"
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div className="grid gap-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
