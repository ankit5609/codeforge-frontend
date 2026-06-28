import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, getUserInfo } from "@/lib/api";
import { SubscriptionResponse } from "@/lib/types";
import { getPlanById } from "@/lib/plans";

// Webhook polling configuration. Stripe redirects the user here a fraction of a
// second before the webhook reaches the backend and updates Postgres, so we poll
// the subscription endpoint a few times before giving up.
const MAX_ATTEMPTS = 5;
const INITIAL_DELAY = 2500;
const RETRY_DELAY = 2000;

const isConfirmed = (sub: SubscriptionResponse | null) =>
  !!sub &&
  (sub.status === "ACTIVE" ||
    sub.status === "TRIALING" ||
    sub.status === "DEMO_LOCKED");

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(1);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const cancelled = useRef(false);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Poll until the subscription is confirmed or we exhaust our attempts.
  const poll = async () => {
    cancelled.current = false;
    setLoading(true);
    setSubscription(null);

    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      if (cancelled.current) return;
      setAttempt(i);
      await sleep(i === 1 ? INITIAL_DELAY : RETRY_DELAY);
      if (cancelled.current) return;

      try {
        const data = await api.getCurrentSubscription();
        if (cancelled.current) return;
        if (isConfirmed(data)) {
          setSubscription(data);
          setLoading(false);
          return;
        }
        // Keep the latest payload so the final card can reflect real status.
        setSubscription(data);
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      }
    }

    if (!cancelled.current) setLoading(false);
  };

  useEffect(() => {
    poll();
    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmed = isConfirmed(subscription);
  const isDemoLocked = subscription?.status === "DEMO_LOCKED";

  const plan = getPlanById(subscription?.plan?.id);
  const planName = subscription?.plan?.name ?? plan?.name ?? "your plan";
  const billing = plan
    ? `${plan.price} / ${plan.period}`
    : subscription?.plan?.price
      ? subscription.plan.price
      : null;

  const accountName = getUserInfo()?.name ?? null;

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-6 py-16 animate-fade-in">
      {/* Ambient background */}
      <div className="absolute inset-0 dev-grid pointer-events-none opacity-70" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[760px] h-[760px] bg-primary/[0.10] rounded-full blur-[170px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur-md p-9 sm:p-11 text-center shadow-[0_30px_60px_-24px_hsl(156_50%_2%/0.7)]">
          {loading ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
                Confirming your payment
              </h1>
              <p className="text-muted-foreground text-sm">
                Hang tight while we finalize your subscription. This only takes a few seconds.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                  <span
                    key={i}
                    className={cnDot(i < attempt)}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/70 mt-3">
                Attempt {attempt} of {MAX_ATTEMPTS}
              </p>
            </>
          ) : confirmed ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.18em] uppercase text-primary/80 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Payment confirmed
              </span>
              <h1 className="font-display text-3xl font-semibold text-foreground leading-tight mb-2">
                You're on the {planName}
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                Thanks for upgrading — your subscription is ready to go.
              </p>

              {/* Detail rows */}
              <dl className="text-left rounded-2xl border border-border/60 bg-background/40 divide-y divide-border/50 overflow-hidden mb-6">
                <Row label="Plan" value={planName} />
                {billing && <Row label="Billing" value={billing} />}
                <Row
                  label="Status"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={
                          "w-2 h-2 rounded-full " +
                          (isDemoLocked ? "bg-amber-400" : "bg-primary")
                        }
                      />
                      {isDemoLocked ? "Demo Locked" : "Active"}
                    </span>
                  }
                />
                {periodEnd && <Row label="Renews" value={periodEnd} />}
                {accountName && <Row label="Account" value={accountName} />}
              </dl>

              {isDemoLocked && subscription?.message && (
                <p className="text-[12px] text-amber-300/80 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2 mb-6 text-left">
                  {subscription.message}
                </p>
              )}

              <Button
                onClick={() => navigate("/projects")}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 text-sm font-medium shadow-[var(--shadow-glow)]"
              >
                Go to your projects <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-foreground mb-3">
                Still processing
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                Your payment went through, but the subscription is taking a moment to activate.
                You can refresh the status or head back to your dashboard.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => poll()}
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/projects")}
                  className="w-full rounded-full h-11 text-sm"
                >
                  Back to dashboard
                </Button>
              </div>
            </>
          )}

          {sessionId && (
            <p className="text-[11px] text-muted-foreground/60 mt-6 font-mono truncate">
              Session: {sessionId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function cnDot(active: boolean) {
  return (
    "w-2 h-2 rounded-full transition-colors " +
    (active ? "bg-primary" : "bg-border")
  );
}
