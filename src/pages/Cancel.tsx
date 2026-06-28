import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-6 py-16 animate-fade-in">
      {/* Ambient background */}
      <div className="absolute inset-0 dev-grid pointer-events-none opacity-70" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[760px] h-[760px] bg-secondary/[0.07] rounded-full blur-[170px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur-md p-9 sm:p-11 text-center shadow-[0_30px_60px_-24px_hsl(156_50%_2%/0.7)]">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <span className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground/80 mb-3 inline-block">
            Checkout canceled
          </span>
          <h1 className="font-display text-3xl font-semibold text-foreground leading-tight mb-3">
            No charge was made
          </h1>
          <p className="text-muted-foreground text-sm mb-7">
            You exited before completing checkout, so your card wasn't charged. You can pick a
            plan again whenever you're ready.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/projects")}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 text-sm font-medium shadow-[var(--shadow-glow)]"
            >
              <RotateCcw className="w-4 h-4" /> Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/projects")}
              className="w-full gap-2 rounded-full h-11 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
