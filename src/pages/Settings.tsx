import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, LogOut, Loader2, User as UserIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UsageMeter } from "@/components/UsageMeter";
import { StateView } from "@/components/StateView";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { api, getUserInfo, removeAuthToken, removeUserInfo } from "@/lib/api";
import { deriveTokenUsage } from "@/lib/usage";
import { getPlanById } from "@/lib/plans";
import type { SubscriptionResponse } from "@/lib/types";

const STATUS_META: Record<string, { label: string; dot: string }> = {
  ACTIVE: { label: "Active", dot: "bg-primary" },
  TRIALING: { label: "Trialing", dot: "bg-primary" },
  PAST_DUE: { label: "Past due", dot: "bg-amber-500" },
  INCOMPLETE: { label: "Incomplete", dot: "bg-amber-500" },
  DEMO_LOCKED: { label: "Demo locked", dot: "bg-amber-500" },
  NONE: { label: "No plan", dot: "bg-muted-foreground" },
};

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getUserInfo();
  const [sub, setSub] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

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

  const manageBilling = async () => {
    setPortalLoading(true);
    try {
      const { portalUrl } = await api.createPortalSession();
      window.location.href = portalUrl;
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't open billing portal",
        description: "Please try again in a moment, or manage your plan from the dashboard.",
      });
      setPortalLoading(false);
    }
  };

  const initials = (user?.name || user?.username || "U").slice(0, 2).toUpperCase();
  const status = sub ? STATUS_META[sub.status] ?? STATUS_META.NONE : STATUS_META.NONE;
  const plan = getPlanById(sub?.plan?.id ?? null);
  const tokenUsage = deriveTokenUsage(sub);

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
                  <p className="text-lg font-medium text-foreground">
                    {plan?.name || sub?.plan?.name || "Free / no active plan"}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                    {status.label}
                    {sub?.currentPeriodEnd && (
                      <span>· renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
                {plan && <span className="text-sm text-muted-foreground">{plan.price}/{plan.period}</span>}
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
                <Button onClick={manageBilling} disabled={portalLoading}>
                  {portalLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Manage billing
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
    </div>
  );
}
