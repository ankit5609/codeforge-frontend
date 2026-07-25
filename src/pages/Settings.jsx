import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, animate, useReducedMotion } from "framer-motion";
import { ArrowLeft, CreditCard, LogOut, Loader2, ShieldCheck, Sparkles, Check, Zap, Settings as SettingsIcon, Sparkle, FolderGit2, HardDrive, Rocket, MessageSquare, AlertTriangle, } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { api, getUserInfo, removeAuthToken, removeUserInfo } from "@/lib/api";
import { deriveTokenUsage, deriveProjectUsage } from "@/lib/usage";
import { PRICING_PLANS, describeSubscription } from "@/lib/plans";
const TONE_COLOR = {
    ember: { fg: "var(--lp-ember)", bg: "rgba(255,90,46,0.12)" },
    brass: { fg: "var(--lp-brass)", bg: "rgba(232,184,75,0.12)" },
    teal: { fg: "var(--lp-teal)", bg: "rgba(69,196,184,0.12)" },
    neutral: { fg: "var(--lp-ink-faint)", bg: "var(--lp-bg-raised-2)" },
};
const PLAN_TONE = { primary: "ember", amber: "brass", muted: "neutral" };
const PLAN_DOT = { primary: "var(--lp-ember)", amber: "var(--lp-brass)", muted: "var(--lp-ink-faint)" };
// ============================================================================
// Small visual helpers (same devices used on the Dashboard, for consistency)
// ============================================================================
function AnimatedNumber({ value, formatter }) {
    const [display, setDisplay] = useState(value);
    const prevValue = useRef(value);
    const shouldReduceMotion = useReducedMotion();
    useEffect(() => {
        const controls = animate(prevValue.current, value, {
            duration: shouldReduceMotion ? 0 : 0.7, ease: [0.16, 0.8, 0.3, 1], onUpdate: (v) => setDisplay(v),
        });
        prevValue.current = value;
        return () => controls.stop();
    }, [value, shouldReduceMotion]);
    return <>{formatter ? formatter(Math.round(display)) : Math.round(display).toLocaleString()}</>;
}
function ProgressRing({ pct, size = 44, stroke = 4, color, unlimited }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = unlimited ? 0 : c - (Math.min(100, Math.max(0, pct)) / 100) * c;
    return (<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--lp-border)" strokeWidth={stroke}/>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.16,.8,.3,1)" }}/>
        </svg>);
}
function fadeUp(delay = 0) {
    return { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: [0.16, 0.8, 0.3, 1], delay } };
}
// ============================================================================
// MetricCard — real (ring + count-up) or a clearly-labeled "coming soon" tile
// ============================================================================
function MetricCard({ icon: Icon, label, tone, value, meta, pct, unlimited, caption, comingSoon }) {
    const c = TONE_COLOR[tone];
    return (<motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }} className="rounded-[16px] p-4 flex flex-col gap-3" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)", opacity: comingSoon ? 0.72 : 1 }}>
            <div className="flex items-center justify-between">
                {typeof pct === "number" ? (<div className="relative shrink-0" style={{ width: 38, height: 38 }}>
                        <ProgressRing pct={pct} size={38} stroke={3.5} color={c.fg} unlimited={unlimited}/>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon className="w-[15px] h-[15px]" style={{ color: c.fg }}/>
                        </div>
                    </div>) : (<div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: c.bg, color: c.fg }}>
                        <Icon className="w-[17px] h-[17px]" strokeWidth={1.75}/>
                    </div>)}
                {comingSoon && (<span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "var(--lp-bg-raised-2)", color: "var(--lp-ink-faint)" }}>
                        Soon
                    </span>)}
            </div>
            <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] mb-1" style={{ color: "var(--lp-ink-faint)" }}>{label}</div>
                {comingSoon ? (<div className="text-[15px] font-semibold" style={{ color: "var(--lp-ink-faint)" }}>—</div>) : (<div className="flex items-baseline gap-1.5">
                        <span className="text-[20px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>{value}</span>
                        {meta && <span className="text-[12px]" style={{ color: "var(--lp-ink-faint)" }}>{meta}</span>}
                    </div>)}
            </div>
            {caption && <p className="text-[11.5px] leading-snug" style={{ color: "var(--lp-ink-faint)" }}>{caption}</p>}
        </motion.div>);
}
// ============================================================================
// PlanDialog — same PRICING_PLANS fields/handler as the original file
// ============================================================================
function PlanDialog({ open, onOpenChange, checkoutPlanId, onChoosePlan }) {
    return (<Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="landing-scope sm:max-w-2xl rounded-[18px] p-6" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                <DialogHeader>
                    <DialogTitle className="text-[24px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>Choose your plan</DialogTitle>
                    <DialogDescription style={{ color: "var(--lp-ink-faint)" }}>Upgrade to unlock more projects, AI usage and faster builds.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                    {PRICING_PLANS.map((tier) => {
            const isLoading = checkoutPlanId === tier.id;
            return (<div key={tier.id} className="relative rounded-[16px] p-6 flex flex-col" style={{ background: "var(--lp-bg-raised-2)", border: tier.isPopular ? "1px solid var(--lp-ember)" : "1px solid var(--lp-border)", boxShadow: tier.isPopular ? "0 20px 50px -24px var(--lp-ember-glow)" : "none" }}>
                                {tier.isPopular && <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: "var(--lp-ember)", color: "#160800" }}><Zap className="w-3 h-3"/> Popular</span>}
                                <h3 className="text-[17px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>{tier.name}</h3>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-[30px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>{tier.price}</span>
                                    <span className="text-[13px]" style={{ color: "var(--lp-ink-faint)" }}>/{tier.period}</span>
                                </div>
                                <p className="mt-2 text-[13.5px]" style={{ color: "var(--lp-ink-dim)" }}>{tier.description}</p>
                                <ul className="mt-5 space-y-2.5 flex-1">
                                    {tier.features.map((feature) => (<li key={feature} className="flex items-start gap-2 text-[13.5px]" style={{ color: "var(--lp-ink-dim)" }}><Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--lp-teal)" }}/> {feature}</li>))}
                                </ul>
                                <button onClick={() => onChoosePlan(tier.id)} disabled={checkoutPlanId !== null} className={tier.isPopular ? "lp-btn lp-btn-solid mt-6 !w-full" : "lp-btn lp-btn-ghost mt-6 !w-full"}>
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>} Choose {tier.name}
                                </button>
                            </div>);
        })}
                </div>
            </DialogContent>
        </Dialog>);
}
// ============================================================================
// Settings — the page. State/handlers below are unchanged from the original
// (one clearly-marked addition: an independent projects-count fetch).
// ============================================================================
export default function Settings() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const user = getUserInfo();
    // ---- UNCHANGED STATE ----
    const [sub, setSub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [portalLoading, setPortalLoading] = useState(false);
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [checkoutPlanId, setCheckoutPlanId] = useState(null);
    // ---- NEW: independent, read-only project count for the Usage section ----
    const [projectCount, setProjectCount] = useState(null);
    const load = () => {
        setLoading(true);
        setError(false);
        api.getCurrentSubscription().then(setSub).catch(() => setError(true)).finally(() => setLoading(false));
    };
    useEffect(() => {
        load(); // unchanged
        api.getProjects().then((data) => setProjectCount(data.length)).catch(() => setProjectCount(null)); // new, independent, read-only
    }, []);
    // ---- UNCHANGED HANDLERS (copied verbatim) ----
    const signOut = () => {
        removeAuthToken();
        removeUserInfo();
        navigate("/login");
    };
    const display = describeSubscription(sub);
    const handleBilling = async () => {
        if (!display.isActive) {
            setIsPlanDialogOpen(true);
            return;
        }
        setPortalLoading(true);
        try {
            const { portalUrl } = await api.createPortalSession();
            if (!portalUrl)
                throw new Error("No billing portal URL was returned.");
            window.location.href = portalUrl;
        }
        catch {
            toast({ variant: "destructive", title: "Couldn't open billing portal", description: "We couldn't reach the billing portal. Showing your plan options instead." });
            setPortalLoading(false);
            setIsPlanDialogOpen(true);
        }
    };
    const handleStartCheckout = async (planId) => {
        setCheckoutPlanId(planId);
        try {
            const { checkoutUrl } = await api.createCheckoutSession(planId);
            window.location.href = checkoutUrl;
        }
        catch {
            toast({ variant: "destructive", title: "Couldn't start checkout", description: "Please try again in a moment." });
            setCheckoutPlanId(null);
        }
    };
    const initials = (user?.name || user?.username || "U").slice(0, 2).toUpperCase();
    const tokenUsage = deriveTokenUsage(sub);
    const projectUsage = projectCount !== null ? deriveProjectUsage(sub, projectCount) : null;
    const billingLabel = display.isActive ? "Manage billing" : "View plans";
    const planTone = PLAN_TONE[display.tone];
    return (<div className="landing-scope min-h-screen w-full" style={{ background: "var(--lp-bg)" }}>
            <div aria-hidden className="fixed inset-0 pointer-events-none z-0" style={{
            background: "radial-gradient(45% 35% at 15% 0%, rgba(255,90,46,0.07) 0%, transparent 60%), radial-gradient(35% 30% at 100% 10%, rgba(69,196,184,0.05) 0%, transparent 60%)",
        }}/>

            {/* Top navigation */}
            <header className="sticky top-0 z-30 backdrop-blur-md" style={{ borderBottom: "1px solid var(--lp-border-soft)", background: "rgba(10,13,18,0.82)" }}>
                <div className="max-w-[1080px] mx-auto flex items-center gap-3 px-5 sm:px-8 h-16">
                    <button onClick={() => navigate("/projects")} aria-label="Back to projects" className="w-9 h-9 flex items-center justify-center rounded-full transition-colors shrink-0" style={{ color: "var(--lp-ink-dim)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lp-bg-raised)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <ArrowLeft className="h-4 w-4"/>
                    </button>
                    <div className="flex items-center gap-1.5 font-mono text-[12.5px]" style={{ color: "var(--lp-ink-faint)" }}>
                        <Link to="/projects" className="hover:underline">Projects</Link>
                        <span>/</span>
                        <span style={{ color: "var(--lp-ink-dim)" }}>Settings</span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-[1080px] mx-auto px-5 sm:px-8 py-9 space-y-7">
                {/* Settings header */}
                <motion.div {...fadeUp(0)} className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: "rgba(255,90,46,0.12)", color: "var(--lp-ember)" }}>
                        <SettingsIcon className="w-5 h-5"/>
                    </div>
                    <div>
                        <h1 className="text-[26px] font-bold leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>Settings</h1>
                        <p className="text-[13.5px]" style={{ color: "var(--lp-ink-faint)" }}>Manage your account, workspace and subscription.</p>
                    </div>
                </motion.div>

                {/* Profile overview */}
                <motion.section {...fadeUp(0.05)}>
                    <span className="lp-eyebrow !text-[11px] !mb-2.5">{"// Profile"}</span>
                    <div className="rounded-[18px] p-5 sm:p-6 flex flex-wrap items-center gap-5" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                        <Avatar className="h-16 w-16 shrink-0">
                            <AvatarFallback style={{ background: "rgba(255,90,46,0.15)", color: "var(--lp-ember)" }} className="text-[20px] font-semibold">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="text-[19px] font-bold truncate" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>{user?.name || "Your account"}</p>
                            <p className="text-[13.5px] truncate mt-0.5" style={{ color: "var(--lp-ink-faint)" }}>{user?.username}</p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold px-3 py-1.5 rounded-full border shrink-0" style={{ color: TONE_COLOR[planTone].fg, borderColor: "var(--lp-border)", background: "var(--lp-bg-raised-2)" }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: PLAN_DOT[display.tone] }}/>
                            {display.name}
                        </span>
                    </div>
                </motion.section>

                {/* Workspace & Subscription */}
                <motion.section {...fadeUp(0.1)}>
                    <span className="lp-eyebrow !text-[11px] !mb-2.5">{"// Workspace &amp; subscription"}</span>

                    {loading ? (<div className="rounded-[18px] p-6 space-y-3" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                            <Skeleton className="h-5 w-40" style={{ background: "var(--lp-bg-raised-2)" }}/>
                            <Skeleton className="h-4 w-56" style={{ background: "var(--lp-bg-raised-2)" }}/>
                            <Skeleton className="h-9 w-full max-w-xs" style={{ background: "var(--lp-bg-raised-2)" }}/>
                        </div>) : error ? (<div className="rounded-[18px] p-8 flex flex-col items-center text-center gap-3" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,90,46,0.10)", color: "var(--lp-ember)" }}>
                                <ShieldCheck className="w-6 h-6"/>
                            </div>
                            <div>
                                <h3 className="text-[16px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>Couldn't load your plan</h3>
                                <p className="text-[13.5px] mt-1" style={{ color: "var(--lp-ink-faint)" }}>There was a problem reaching the billing service.</p>
                            </div>
                            <button onClick={load} className="lp-btn lp-btn-ghost !mt-1">Retry</button>
                        </div>) : (<div className="rounded-[18px] p-5 sm:p-6" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-[19px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>{display.name}</p>
                                    <p className="flex flex-wrap items-center gap-2 text-[13px] mt-1.5" style={{ color: "var(--lp-ink-faint)" }}>
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: PLAN_DOT[display.tone] }}/>
                                            {display.statusLabel}
                                        </span>
                                        {display.isActive && sub?.currentPeriodEnd && <span>· renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>}
                                    </p>
                                </div>
                                {display.price && <span className="text-[14px] font-mono" style={{ color: "var(--lp-ink-faint)" }}>{display.price}</span>}
                            </div>

                            {sub?.message && (<div className="flex items-start gap-3 mt-4 rounded-[14px] p-4" style={{ border: "1px solid rgba(232,184,75,0.3)", background: "rgba(232,184,75,0.07)" }}>
                                    <AlertTriangle className="w-[18px] h-[18px] shrink-0 mt-0.5" style={{ color: "var(--lp-brass)" }}/>
                                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>{sub.message}</p>
                                </div>)}

                            <div className="flex flex-wrap gap-3 mt-5 pt-5" style={{ borderTop: "1px solid var(--lp-border-soft)" }}>
                                <button onClick={handleBilling} disabled={portalLoading} className="lp-btn lp-btn-solid">
                                    {portalLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : display.isActive ? <CreditCard className="w-4 h-4"/> : <Sparkles className="w-4 h-4"/>}
                                    {billingLabel}
                                </button>
                                <button onClick={() => navigate("/projects")} className="lp-btn lp-btn-ghost">Back to projects</button>
                            </div>
                        </div>)}
                </motion.section>

                {/* Usage */}
                <motion.section {...fadeUp(0.15)}>
                    <span className="lp-eyebrow !text-[11px] !mb-2.5">{"// Usage"}</span>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <MetricCard icon={Sparkle} label="AI tokens" tone="ember" value={tokenUsage.unlimited ? "Unlimited" : <AnimatedNumber value={tokenUsage.pct} formatter={(n) => `${n}%`}/>} pct={tokenUsage.unlimited ? 100 : tokenUsage.pct} unlimited={tokenUsage.unlimited} caption={tokenUsage.unlimited ? "Your plan includes unlimited AI." : "Resets each billing cycle."}/>
                        <MetricCard icon={FolderGit2} label="Projects" tone="brass" value={projectUsage ? <AnimatedNumber value={projectUsage.used}/> : "—"} meta={projectUsage && projectUsage.limit > 0 ? `/ ${projectUsage.limit}` : undefined} pct={projectUsage && projectUsage.limit > 0 ? projectUsage.pct : undefined} caption="Active projects in your workspace."/>
                        <MetricCard icon={HardDrive} label="Storage" tone="neutral" comingSoon caption="Not tracked yet."/>
                        <MetricCard icon={Rocket} label="Deployments" tone="neutral" comingSoon caption="Not tracked yet."/>
                        <MetricCard icon={MessageSquare} label="Messages" tone="neutral" comingSoon caption="Not tracked yet."/>
                    </div>
                </motion.section>

                {/* Danger zone — subtle, not aggressive */}
                <motion.section {...fadeUp(0.2)}>
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] mb-2.5 inline-block" style={{ color: "var(--lp-ember)" }}>{"// Danger zone"}</span>
                    <div className="rounded-[18px] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                        <div>
                            <p className="text-[14.5px] font-semibold" style={{ color: "var(--lp-ink)" }}>Sign out of this device</p>
                            <p className="text-[13px] mt-0.5" style={{ color: "var(--lp-ink-faint)" }}>You'll need to log back in to access your workspace.</p>
                        </div>
                        <button onClick={signOut} className="lp-btn lp-btn-ghost !border-[rgba(255,90,46,0.3)]" style={{ color: "var(--lp-ember)" }}>
                            <LogOut className="w-4 h-4"/> Sign out
                        </button>
                    </div>
                </motion.section>
            </main>

            <PlanDialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen} checkoutPlanId={checkoutPlanId} onChoosePlan={handleStartCheckout}/>
        </div>);
}
