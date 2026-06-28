import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, LogOut, Loader2, User as UserIcon, ShieldCheck, Sparkles, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UsageMeter } from "@/components/UsageMeter";
import { StateView } from "@/components/StateView";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { api, getUserInfo, removeAuthToken, removeUserInfo } from "@/lib/api";
import { deriveTokenUsage } from "@/lib/usage";
import { PRICING_PLANS, describeSubscription } from "@/lib/plans";
import { cn } from "@/lib/utils";
import type { SubscriptionResponse } from "@/lib/types";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getUserInfo();
  const [sub, setSub] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    api
      .getCurrentSubscription()
      .then(setSub)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const signOut = () => {
    removeAuthToken();
    removeUserInfo();
    navigate("/login");
  };

  const display = describeSubscription(sub);

  // Consistent billing behaviour:
  //  - active/paid plan  -> open the Stripe billing portal
  //  - everyone else     -> show the plan selection dialog (no surprise jumps)
  const handleBilling = async () => {
    if (!display.isActive) {
      setIsPlanDialogOpen(true);
      return;
    }
    setPortalLoading(true);
    try {
      const { portalUrl } = await api.createPortalSession();
      if (!portalUrl) throw new Error("No billing portal URL was returned.");
      window.location.href = portalUrl;
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't open billing portal",
        description: "We couldn't reach the billing portal. Showing your plan options instead.",
      });
      setPortalLoading(false);
      setIsPlanDialogOpen(true);
    }
  };

  const handleStartCheckout = async (planId: number) => {
    setCheckoutPlanId(planId);
    try {
      const { checkoutUrl } = await api.createCheckoutSession(planId);
      window.location.href = checkoutUrl;
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't start checkout",
        description: "Please try again in a moment.",
      });
      setCheckoutPlanId(null);
    }
  };

  const initials = (user?.name || user?.username || "U").slice(0, 2).toUpperCase();
  const tokenUsage = deriveTokenUsage(sub);
  const billingLabel = display.isActive ? "Manage billing" : "View plans";

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
          <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-xl font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-5 py-8">
        {/* Profile */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <UserIcon className="h-4 w-4" /> Profile
          </h2>
          <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-card/60 p-5">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/15 text-lg text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-medium text-foreground">{user?.name || "Your account"}</p>
              <p className="truncate text-sm text-muted-foreground">{user?.username}</p>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <ShieldCheck className="h-4 w-4" /> Subscription
          </h2>

          {loading ? (
            <div className="space-y-3 rounded-lg border border-border/60 bg-card/60 p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : error ? (
            <StateView
              icon={ShieldCheck}
              variant="destructive"
              title="Couldn't load your plan"
              description="There was a problem reaching the billing service."
            >
              <Button variant="outline" size="sm" onClick={load}>
                Retry
              </Button>
            </StateView>
          ) : (
            <div className="space-y-5 rounded-lg border border-border/60 bg-card/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-medium text-foreground">{display.name}</p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        display.tone === "primary" ? "bg-primary" : display.tone === "amber" ? "bg-amber-500" : "bg-muted-foreground",
                      )}
                    />
                    {display.statusLabel}
                    {display.isActive && sub?.currentPeriodEnd && (
                      <span>· renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
                {display.price && <span className="text-sm text-muted-foreground">{display.price}</span>}
              </div>

              {sub?.message && (
                <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
                  {sub.message}
                </p>
              )}

              <UsageMeter
                label="AI tokens this cycle"
                usage={tokenUsage}
                unit="tokens"
                caption={tokenUsage.unlimited ? "Your plan includes unlimited AI." : undefined}
              />

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleBilling} disabled={portalLoading}>
                  {portalLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : display.isActive ? (
                    <CreditCard className="mr-2 h-4 w-4" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {billingLabel}
                </Button>
                <Button variant="outline" onClick={() => navigate("/projects")}>
                  Back to projects
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Account actions */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Account</h2>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </section>
      </main>

      {/* Plan selection dialog (shared with the dashboard upgrade flow) */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Choose your plan</DialogTitle>
            <DialogDescription>Upgrade to unlock more projects, AI usage and faster builds.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {PRICING_PLANS.map((tier) => {
              const isLoading = checkoutPlanId === tier.id;
              return (
                <div
                  key={tier.id}
                  className={cn(
                    "relative rounded-2xl border bg-card/80 p-6 flex flex-col",
                    tier.isPopular ? "border-primary/50 ring-1 ring-primary/30 shadow-[var(--shadow-glow)]" : "border-border/70",
                  )}
                >
                  {tier.isPopular && (
                    <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                      <Zap className="w-3 h-3" /> Popular
                    </span>
                  )}
                  <h3 className="font-display text-lg font-semibold text-foreground">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-semibold text-foreground">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">/{tier.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-foreground/90">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleStartCheckout(tier.id)}
                    disabled={checkoutPlanId !== null}
                    className={cn(
                      "mt-6 w-full rounded-full h-11 text-sm font-medium",
                      tier.isPopular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-foreground/90 text-background hover:bg-foreground",
                    )}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Choose {tier.name}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
