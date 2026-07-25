import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, animate, useReducedMotion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, ArrowUpDown, Bell, Check, ChevronsUpDown, CreditCard, Download, Edit, FolderGit2, GitBranch, Import, LayoutGrid, LayoutTemplate, List, Loader2, LogOut, MoreVertical, Plus, Search, Settings as SettingsIcon, SlidersHorizontal, Sparkles, Trash, Users, X, Zap, Menu, Infinity as InfinityIcon, } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { api, removeAuthToken, removeUserInfo, getUserInfo } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PRICING_PLANS, describeSubscription } from "@/lib/plans";
import { deriveTokenUsage, deriveProjectUsage } from "@/lib/usage";
import { PROJECT_TEMPLATES } from "@/lib/templates";
import { generateGradient, cn } from "@/lib/utils";
const SORT_LABEL = { newest: "Newest first", oldest: "Oldest first", name: "Name A–Z" };
const FILTER_LABEL = { all: "All roles", OWNER: "Owner", EDITOR: "Editor", VIEWER: "Viewer" };
const TONE_COLOR = {
    ember: { fg: "var(--lp-ember)", bg: "rgba(255,90,46,0.12)" },
    brass: { fg: "var(--lp-brass)", bg: "rgba(232,184,75,0.12)" },
    teal: { fg: "var(--lp-teal)", bg: "rgba(69,196,184,0.12)" },
    neutral: { fg: "var(--lp-ink-dim)", bg: "var(--lp-bg-raised-2)" },
};
const PLAN_TONE = { primary: "ember", amber: "brass", muted: "neutral" };
const PLAN_DOT = { primary: "var(--lp-ember)", amber: "var(--lp-brass)", muted: "var(--lp-ink-faint)" };
const ROLE_STYLE = {
    OWNER: { bg: "rgba(255,90,46,0.10)", fg: "var(--lp-ember)", border: "rgba(255,90,46,0.22)" },
    EDITOR: { bg: "rgba(232,184,75,0.10)", fg: "var(--lp-brass)", border: "rgba(232,184,75,0.22)" },
    VIEWER: { bg: "var(--lp-bg-raised-2)", fg: "var(--lp-ink-faint)", border: "var(--lp-border)" },
};
// Plan tiers come from the shared hardcoded pricing source (no public "list
// plans" endpoint). planId maps to the backend Stripe configuration.
// --- UNCHANGED from the original implementation ---
const PLAN_TIERS = PRICING_PLANS.map((p) => ({
    planId: p.id, name: p.name, price: p.price, period: `/${p.period}`,
    tagline: p.description, recommended: !!p.isPopular, features: p.features,
}));
function getInitials(name) {
    if (!name)
        return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}
// ============================================================================
// SMALL VISUAL HELPERS
// ============================================================================
function AnimatedNumber({ value, formatter, className }) {
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
    const text = formatter ? formatter(Math.round(display)) : Math.round(display).toLocaleString();
    return <span className={className}>{text}</span>;
}
/** Circular progress ring — the one genuinely new visual device in this pass,
 *  replacing the old linear meter bars for a denser, sidebar-friendly stat. */
function ProgressRing({ pct, size = 40, stroke = 3.5, color, unlimited }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const clamped = Math.min(100, Math.max(0, pct));
    const offset = unlimited ? 0 : c - (clamped / 100) * c;
    return (<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--lp-border)" strokeWidth={stroke}/>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.16,.8,.3,1)" }}/>
        </svg>);
}
function EmptyIllustration() {
    return (<svg width="120" height="120" viewBox="0 0 132 132" fill="none" aria-hidden>
            <defs>
                <linearGradient id="emptyGradA" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF5A2E"/><stop offset="100%" stopColor="#E8B84B"/>
                </linearGradient>
                <radialGradient id="emptyGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255,90,46,0.20)"/><stop offset="100%" stopColor="transparent"/>
                </radialGradient>
            </defs>
            <circle cx="66" cy="66" r="64" fill="url(#emptyGlow)"/>
            <rect x="20" y="44" width="70" height="54" rx="12" transform="rotate(-6 20 44)" stroke="var(--lp-border)" strokeWidth="2" fill="var(--lp-bg-raised-2)"/>
            <rect x="40" y="36" width="70" height="54" rx="12" stroke="url(#emptyGradA)" strokeWidth="2" fill="var(--lp-bg-raised)"/>
            <circle cx="75" cy="63" r="11" fill="var(--lp-bg)" stroke="url(#emptyGradA)" strokeWidth="2"/>
            <path d="M75 58v10M70 63h10" stroke="var(--lp-ember)" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="102" cy="40" r="3" fill="var(--lp-teal)"/>
            <circle cx="30" cy="30" r="2.5" fill="var(--lp-brass)"/>
        </svg>);
}
// ============================================================================
// SIDEBAR — brand, greeting, compact ring-stats, primary actions, account
// ============================================================================
function SidebarStat({ icon: Icon, label, value, meta, pct, unlimited, tone }) {
    const c = TONE_COLOR[tone];
    return (<div className="flex items-center gap-3">
            {typeof pct === "number" ? (<div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                    <ProgressRing pct={pct} color={c.fg} unlimited={unlimited}/>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {unlimited ? <InfinityIcon className="w-4 h-4" style={{ color: c.fg }}/> : <Icon className="w-[15px] h-[15px]" style={{ color: c.fg }}/>}
                    </div>
                </div>) : (<div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: c.bg, color: c.fg }}>
                    <Icon className="w-[17px] h-[17px]"/>
                </div>)}
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-[13.5px] font-semibold truncate" style={{ color: "var(--lp-ink)" }}>{value}</span>
                    {meta && <span className="text-[11px] truncate" style={{ color: "var(--lp-ink-faint)" }}>{meta}</span>}
                </div>
                <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: "var(--lp-ink-faint)" }}>{label}</div>
            </div>
        </div>);
}
function Sidebar({ firstName, planDisplay, tokenUsage, projectUsage, ownedCount, sharedCount, userName, userEmail, showUpgrade, isDemoLocked, isSubscribed, isPortalLoading, onNewProject, onTemplates, onImportClick, onUpgradeClick, onManageBilling, onSettings, onLogout, mobileOpen, onCloseMobile, }) {
    const initial = userName ? userName.charAt(0).toUpperCase() : "U";
    const collabValue = sharedCount === 0 ? "Solo" : `${ownedCount} + ${sharedCount}`;
    const collabMeta = sharedCount === 0 ? "workspace" : "own / shared";
    return (<>
            {mobileOpen && <div onClick={onCloseMobile} className="fixed inset-0 bg-black/60 z-40 lg:hidden"/>}
            <aside className={cn("fixed inset-y-0 left-0 z-50 w-[272px] flex flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")} style={{ background: "var(--lp-bg-raised)", borderRight: "1px solid var(--lp-border)" }}>
                <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
                    <div className="flex items-center justify-between mb-7">
                        <Link to="/projects" className="flex items-center gap-2.5 font-bold text-[15.5px]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>
                            <img src="/logo.png" alt="CodeForge" width={24} height={24} className="w-6 h-6 object-contain rounded-md"/>
                            CodeForge
                        </Link>
                        <button onClick={onCloseMobile} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md" style={{ color: "var(--lp-ink-faint)" }}>
                            <X className="w-[18px] h-[18px]"/>
                        </button>
                    </div>

                    <span className="lp-eyebrow !mb-2 !text-[11px]">{"// Workspace"}</span>
                    <h1 className="text-[21px] leading-tight font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>
                        Welcome back, {firstName}.
                    </h1>
                    <p className="text-[12.5px] mt-1.5 mb-6" style={{ color: "var(--lp-ink-faint)" }}>Continue building with AI.</p>

                    <div className="space-y-4 pb-6 mb-6" style={{ borderBottom: "1px solid var(--lp-border-soft)" }}>
                        <SidebarStat icon={FolderGit2} label="Projects" tone="ember" value={<AnimatedNumber value={projectUsage.used}/>} meta={projectUsage.limit > 0 ? `/ ${projectUsage.limit}` : undefined} pct={projectUsage.limit > 0 ? projectUsage.pct : undefined}/>
                        <SidebarStat icon={Sparkles} label="AI usage" tone="brass" unlimited={tokenUsage.unlimited} value={tokenUsage.unlimited ? "Unlimited" : <AnimatedNumber value={tokenUsage.pct} formatter={(n) => `${n}%`}/>} pct={tokenUsage.unlimited ? 100 : tokenUsage.pct}/>
                        <SidebarStat icon={CreditCard} label="Current plan" tone={PLAN_TONE[planDisplay.tone]} value={planDisplay.name} meta={planDisplay.statusLabel}/>
                        <SidebarStat icon={Users} label="Collaboration" tone="teal" value={collabValue} meta={collabMeta}/>
                    </div>

                    <div className="space-y-2">
                        <button onClick={onNewProject} className="lp-btn lp-btn-solid !w-full !justify-start">
                            <Plus className="w-4 h-4"/> New project
                        </button>
                        <button onClick={onTemplates} className="lp-btn lp-btn-ghost !w-full !justify-start">
                            <LayoutTemplate className="w-4 h-4"/> Templates
                        </button>
                        <button onClick={onImportClick} className="lp-btn lp-btn-ghost !w-full !justify-start" style={{ color: "var(--lp-ink-faint)" }}>
                            <Import className="w-4 h-4"/> Import project
                            <span className="ml-auto font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "var(--lp-bg-raised-2)", color: "var(--lp-ink-faint)" }}>soon</span>
                        </button>
                    </div>
                </div>

                {/* Account footer — pinned, not part of the scroll area above */}
                <div className="shrink-0 p-3" style={{ borderTop: "1px solid var(--lp-border-soft)" }}>
                    {(showUpgrade || isDemoLocked) && (<button onClick={onUpgradeClick} className="lp-btn lp-btn-solid !w-full !mb-2 !text-[13px]">
                            <Sparkles className="w-4 h-4"/> {isDemoLocked ? "View plans" : "Upgrade"}
                        </button>)}
                    {isSubscribed && (<button onClick={onManageBilling} disabled={isPortalLoading} className="lp-btn lp-btn-ghost !w-full !mb-2 !text-[13px]">
                            {isPortalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <CreditCard className="w-3.5 h-3.5"/>} Manage billing
                        </button>)}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2.5 w-full p-2 rounded-[10px] transition-colors" onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lp-bg-raised-2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarFallback style={{ background: "rgba(255,90,46,0.15)", color: "var(--lp-ember)" }} className="text-[12.5px] font-semibold">{initial}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1 text-left">
                                    <p className="text-[13px] font-semibold truncate" style={{ color: "var(--lp-ink)" }}>{userName || "Account"}</p>
                                    <p className="text-[11px] truncate" style={{ color: "var(--lp-ink-faint)" }}>{userEmail || ""}</p>
                                </div>
                                <ChevronsUpDown className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--lp-ink-faint)" }}/>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="top" className="landing-scope w-60 p-1.5 rounded-[12px] z-50" style={{ background: "var(--lp-bg-raised-2)", border: "1px solid var(--lp-border)" }}>
                            <DropdownMenuItem onClick={onSettings} className="cursor-pointer rounded-[8px] py-2 text-[13.5px]" style={{ color: "var(--lp-ink)" }}>
                                <SettingsIcon className="w-4 h-4 mr-2"/> Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onLogout} className="cursor-pointer rounded-[8px] py-2 text-[13.5px]" style={{ color: "var(--lp-ember)" }}>
                                <LogOut className="w-4 h-4 mr-2"/> Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>
        </>);
}
// ============================================================================
// Mobile top bar — only the hamburger + brand + notification bell live here
// ============================================================================
function MobileTopBar({ onOpenSidebar, onNotificationsClick }) {
    return (<div className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 backdrop-blur-md" style={{ borderBottom: "1px solid var(--lp-border-soft)", background: "rgba(10,13,18,0.85)" }}>
            <button onClick={onOpenSidebar} className="w-9 h-9 flex items-center justify-center rounded-md" style={{ color: "var(--lp-ink)" }}>
                <Menu className="w-5 h-5"/>
            </button>
            <span className="font-bold text-[14.5px]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>CodeForge</span>
            <button onClick={onNotificationsClick} className="w-9 h-9 flex items-center justify-center rounded-md" style={{ color: "var(--lp-ink-faint)" }}>
                <Bell className="w-[18px] h-[18px]"/>
            </button>
        </div>);
}
// ============================================================================
// Toolbar — search (unchanged logic) + sort/filter/view-toggle
// ============================================================================
const menuBtn = "flex items-center gap-2 h-10 px-3.5 rounded-[10px] font-medium text-[13.5px] transition-colors";
const menuContentClass = "landing-scope min-w-[176px] rounded-[12px] p-1.5 z-50";
function DashboardToolbar({ searchQuery, onSearchChange, sortBy, onSortChange, roleFilter, onRoleFilterChange, viewMode, onViewModeChange }) {
    return (<div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--lp-ink-faint)" }}/>
                <input placeholder="Search projects..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="lp-input !pl-10" style={{ height: "40px", borderRadius: "10px" }}/>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={menuBtn} style={{ border: "1px solid var(--lp-border)", color: "var(--lp-ink-dim)", background: "var(--lp-bg-raised)" }}>
                            <ArrowUpDown className="w-3.5 h-3.5"/> <span className="hidden md:inline">{SORT_LABEL[sortBy]}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={menuContentClass} style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                        {Object.keys(SORT_LABEL).map((opt) => (<DropdownMenuItem key={opt} onClick={() => onSortChange(opt)} className="cursor-pointer rounded-[8px] text-[13.5px] flex items-center justify-between" style={{ color: "var(--lp-ink)" }}>
                                {SORT_LABEL[opt]} {sortBy === opt && <Check className="w-3.5 h-3.5" style={{ color: "var(--lp-ember)" }}/>}
                            </DropdownMenuItem>))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={menuBtn} style={{ border: "1px solid var(--lp-border)", color: "var(--lp-ink-dim)", background: "var(--lp-bg-raised)" }}>
                            <SlidersHorizontal className="w-3.5 h-3.5"/> <span className="hidden md:inline">{FILTER_LABEL[roleFilter]}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={menuContentClass} style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                        {Object.keys(FILTER_LABEL).map((opt) => (<DropdownMenuItem key={opt} onClick={() => onRoleFilterChange(opt)} className="cursor-pointer rounded-[8px] text-[13.5px] flex items-center justify-between" style={{ color: "var(--lp-ink)" }}>
                                {FILTER_LABEL[opt]} {roleFilter === opt && <Check className="w-3.5 h-3.5" style={{ color: "var(--lp-ember)" }}/>}
                            </DropdownMenuItem>))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center rounded-[10px] p-1 gap-1" style={{ border: "1px solid var(--lp-border)", background: "var(--lp-bg-raised)" }}>
                    <button aria-label="Grid view" onClick={() => onViewModeChange("grid")} className="w-8 h-8 rounded-[7px] flex items-center justify-center transition-colors" style={{ background: viewMode === "grid" ? "var(--lp-bg-raised-2)" : "transparent", color: viewMode === "grid" ? "var(--lp-ink)" : "var(--lp-ink-faint)" }}>
                        <LayoutGrid className="w-[15px] h-[15px]"/>
                    </button>
                    <button aria-label="List view" onClick={() => onViewModeChange("list")} className="w-8 h-8 rounded-[7px] flex items-center justify-center transition-colors" style={{ background: viewMode === "list" ? "var(--lp-bg-raised-2)" : "transparent", color: viewMode === "list" ? "var(--lp-ink)" : "var(--lp-ink-faint)" }}>
                        <List className="w-[15px] h-[15px]"/>
                    </button>
                </div>
            </div>
        </div>);
}
// ============================================================================
// SubscriptionBanner — same condition as before
// ============================================================================
function SubscriptionBanner({ message, onUpgrade }) {
    return (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 0.8, 0.3, 1] }} className="flex items-start gap-4 rounded-[16px] p-5" style={{ border: "1px solid rgba(232,184,75,0.3)", background: "rgba(232,184,75,0.07)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(232,184,75,0.15)", border: "1px solid rgba(232,184,75,0.25)" }}>
                <AlertTriangle className="w-5 h-5" style={{ color: "var(--lp-brass)" }}/>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-semibold mb-0.5" style={{ color: "var(--lp-ink)" }}>Demo mode — limited access</p>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>
                    {message || "Your workspace is running in demo mode. Upgrade to unlock full access."}
                </p>
            </div>
            <button onClick={onUpgrade} className="lp-btn lp-btn-solid shrink-0 !py-2.5 !px-4 !text-[13.5px]"><Sparkles className="w-4 h-4"/> Upgrade</button>
        </motion.div>);
}
// ============================================================================
// ProjectCard — grid & list variants (same as before)
// ============================================================================
function ProjectCard({ project, variant = "grid", onOpen, onRename, onDownload, onDelete }) {
    const roleStyle = project.role ? ROLE_STYLE[project.role] : null;
    const created = (() => {
        try {
            return `${formatDistanceToNow(new Date(project.createdAt))} ago`;
        }
        catch {
            return new Date(project.createdAt).toLocaleDateString();
        }
    })();
    const avatar = (<div className="rounded-[14px] flex items-center justify-center shrink-0 overflow-hidden border border-white/10 shadow-md" style={{ width: variant === "grid" ? 48 : 44, height: variant === "grid" ? 48 : 44 }}>
            {project.thumbnailUrl ? (<img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center" style={generateGradient(project.name)}>
                    <span className="text-sm font-bold tracking-wide text-white drop-shadow">{getInitials(project.name)}</span>
                </div>)}
        </div>);
    const quickActions = (<DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="h-8 w-8 rounded-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--lp-ink-faint)" }} aria-label="Project actions">
                    <MoreVertical className="w-4 h-4"/>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="landing-scope min-w-[160px] rounded-[12px] p-1.5 z-50" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                <DropdownMenuItem onClick={onRename} className="cursor-pointer rounded-[8px] text-[13.5px]" style={{ color: "var(--lp-ink)" }}><Edit className="w-3.5 h-3.5 mr-2"/> Rename</DropdownMenuItem>
                <DropdownMenuItem onClick={onDownload} className="cursor-pointer rounded-[8px] text-[13.5px]" style={{ color: "var(--lp-ink)" }}><Download className="w-3.5 h-3.5 mr-2"/> Download</DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="cursor-pointer rounded-[8px] text-[13.5px]" style={{ color: "var(--lp-ember)" }}><Trash className="w-3.5 h-3.5 mr-2"/> Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>);
    const roleBadge = project.role && (<span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-[3px] rounded-full border" style={{ background: roleStyle?.bg, color: roleStyle?.fg, borderColor: roleStyle?.border }}>{project.role}</span>);
    if (variant === "list") {
        return (<motion.div layout whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: [0.16, 0.8, 0.3, 1] }} onClick={onOpen} className="group cursor-pointer rounded-[14px] p-4 flex items-center gap-4" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                {avatar}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-semibold truncate" style={{ color: "var(--lp-ink)" }}>{project.name}</h3>
                        {roleBadge}
                    </div>
                    {project.description ? (<p className="text-[13px] truncate mt-0.5" style={{ color: "var(--lp-ink-faint)" }}>{project.description}</p>) : (<span className="flex items-center gap-1 text-[12px] mt-0.5" style={{ color: "var(--lp-ink-faint)" }}><GitBranch className="w-3 h-3"/> main</span>)}
                </div>
                <span className="text-[12.5px] font-mono shrink-0 hidden sm:block" style={{ color: "var(--lp-ink-faint)" }}>{created}</span>
                {quickActions}
            </motion.div>);
    }
    return (<motion.div layout whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: [0.16, 0.8, 0.3, 1] }} onClick={onOpen} className="group cursor-pointer rounded-[18px] overflow-hidden flex flex-col p-5" style={{ background: "linear-gradient(180deg, var(--lp-bg-raised) 0%, #0F131A 100%)", border: "1px solid var(--lp-border)", boxShadow: "0 4px 0 0 rgba(0,0,0,0)" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 28px 54px -26px rgba(0,0,0,0.7)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 0 0 rgba(0,0,0,0)")}>
            <div className="flex items-start gap-3">
                {avatar}
                <div className="min-w-0 flex-1 pt-0.5">
                    <h3 className="text-[15.5px] font-semibold truncate" style={{ color: "var(--lp-ink)" }}>{project.name}</h3>
                    <span className="flex items-center gap-1 text-[12px] mt-1" style={{ color: "var(--lp-ink-faint)" }}><GitBranch className="w-3 h-3"/> main</span>
                </div>
                {quickActions}
            </div>
            <p className={cn("text-[13px] leading-relaxed mt-3.5 line-clamp-2 flex-1", !project.description && "italic opacity-60")} style={{ color: "var(--lp-ink-dim)" }}>
                {project.description || "No description yet."}
            </p>
            <div className="flex items-center justify-between mt-4 pt-3.5" style={{ borderTop: "1px solid var(--lp-border-soft)" }}>
                {roleBadge || <span />}
                <span className="text-[11.5px] font-mono" style={{ color: "var(--lp-ink-faint)" }}>{created}</span>
            </div>
        </motion.div>);
}
function ProjectCardSkeleton() {
    return (<div className="rounded-[18px] p-5 flex flex-col" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
            <div className="flex items-start gap-3">
                <Skeleton className="w-12 h-12 rounded-[14px]" style={{ background: "var(--lp-bg-raised-2)" }}/>
                <div className="flex-1 pt-1 space-y-2">
                    <Skeleton className="h-4 w-2/3 rounded" style={{ background: "var(--lp-bg-raised-2)" }}/>
                    <Skeleton className="h-3 w-1/3 rounded" style={{ background: "var(--lp-bg-raised-2)" }}/>
                </div>
            </div>
            <Skeleton className="h-3 w-full rounded mt-4" style={{ background: "var(--lp-bg-raised-2)" }}/>
            <Skeleton className="h-3 w-4/5 rounded mt-2" style={{ background: "var(--lp-bg-raised-2)" }}/>
            <div className="flex items-center justify-between mt-4 pt-3.5" style={{ borderTop: "1px solid var(--lp-border-soft)" }}>
                <Skeleton className="h-4 w-14 rounded-full" style={{ background: "var(--lp-bg-raised-2)" }}/>
                <Skeleton className="h-3 w-16 rounded" style={{ background: "var(--lp-bg-raised-2)" }}/>
            </div>
        </div>);
}
function ProjectGridSkeleton({ count = 6 }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{Array.from({ length: count }).map((_, i) => <ProjectCardSkeleton key={i}/>)}</div>;
}
function EmptyProjectsState({ isSearching, onCreateProject }) {
    return (<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 0.8, 0.3, 1] }} className="text-center py-16 px-8 rounded-[20px] max-w-lg mx-auto" style={{ border: "1px dashed var(--lp-border)", background: "var(--lp-bg-raised)" }}>
            <div className="flex justify-center mb-5"><EmptyIllustration /></div>
            <h3 className="text-[19px] font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>{isSearching ? "No matching projects" : "No projects yet"}</h3>
            <p className="text-[14px] mb-6" style={{ color: "var(--lp-ink-faint)" }}>{isSearching ? "Try a different search term." : "Create your first project to get started."}</p>
            {!isSearching && <button onClick={onCreateProject} className="lp-btn lp-btn-solid mx-auto"><Plus className="w-4 h-4"/> Create project</button>}
        </motion.div>);
}
// ============================================================================
// Dialogs — Create / Rename / Plan (identical props/state/handlers as before)
// ============================================================================
function CreateProjectDialog({ open, onOpenChange, projectName, onProjectNameChange, onCreate, isCreating }) {
    return (<Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="landing-scope !w-[min(360px,calc(100vw-32px))] !max-w-none !h-auto !min-h-0 !max-h-[calc(100vh-80px)] !gap-0 !rounded-[12px] !p-4 overflow-hidden" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)", display: "flex", flexDirection: "column" }}>
                <DialogHeader className="!space-y-0.5 text-left">
                    <DialogTitle className="text-[15px] font-bold leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>Create a new project</DialogTitle>
                    <DialogDescription className="text-[11.5px] leading-snug" style={{ color: "var(--lp-ink-faint)" }}>Give your project a name. You can change it later.</DialogDescription>
                </DialogHeader>
                <div className="mt-9 space-y-2.5">
                    <div>
                        <label className="font-mono text-[9.5px] uppercase tracking-[0.1em]" style={{ color: "var(--lp-ink-faint)" }}>Project name</label>
                        <input placeholder="My awesome project" value={projectName} onChange={(e) => onProjectNameChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onCreate()} autoFocus className="lp-input mt-1" style={{ padding: "7px 10px", fontSize: "12.5px" }}/>
                    </div>
                    <div>
                        <label className="font-mono text-[9.5px] uppercase tracking-[0.1em]" style={{ color: "var(--lp-ink-faint)" }}>Start from a template</label>
                        <div className="mt-1 grid grid-cols-3 gap-1.5">
                            {PROJECT_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (<button key={tpl.id} type="button" onClick={() => { if (tpl.id !== "blank" && !projectName.trim())
                onProjectNameChange(tpl.name); }} className="group text-left rounded-[8px] px-2 py-1.5 transition-all hover:-translate-y-0.5" style={{ border: "1px solid var(--lp-border)", background: "var(--lp-bg-raised-2)" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--lp-ember)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--lp-border)")}>
                                        <Icon className="w-3 h-3" style={{ color: "var(--lp-ember)" }}/>
                                        <p className="mt-0.5 text-[10.5px] font-semibold leading-tight" style={{ color: "var(--lp-ink)" }}>{tpl.name}</p>
                                    </button>);
        })}
                        </div>
                    </div>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button onClick={() => onOpenChange(false)} className="lp-btn lp-btn-ghost" style={{ padding: "0 12px", fontSize: "12px", borderRadius: "8px", height: "32px", minHeight: "32px", lineHeight: "32px" }}>Cancel</button>
                    <button onClick={onCreate} disabled={isCreating || !projectName.trim()} className="lp-btn lp-btn-solid" style={{ padding: "0 12px", fontSize: "12px", borderRadius: "8px", height: "32px", minHeight: "32px", lineHeight: "32px" }}>{isCreating && <Loader2 className="w-3 h-3 animate-spin"/>} Create project</button>
                </div>
            </DialogContent>
        </Dialog>);
}
function RenameProjectDialog({ open, onOpenChange, renameName, onRenameNameChange, onSubmit, originalName }) {
    return (<Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="landing-scope sm:max-w-md rounded-[18px] p-6" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                <DialogHeader><DialogTitle className="text-[20px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>Rename project</DialogTitle></DialogHeader>
                <div className="py-2"><input value={renameName} onChange={(e) => onRenameNameChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSubmit()} className="lp-input" style={{ paddingLeft: "14px" }} autoFocus/></div>
                <DialogFooter>
                    <button onClick={() => onOpenChange(false)} className="lp-btn lp-btn-ghost">Cancel</button>
                    <button onClick={onSubmit} disabled={!renameName.trim() || renameName === originalName} className="lp-btn lp-btn-solid">Save changes</button>
                </DialogFooter>
            </DialogContent>
        </Dialog>);
}
function PlanDialog({ open, onOpenChange, tiers, checkoutPlanId, onChoosePlan }) {
    return (<Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="landing-scope sm:max-w-2xl rounded-[18px] p-6" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                <DialogHeader>
                    <DialogTitle className="text-[24px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>Choose your plan</DialogTitle>
                    <DialogDescription style={{ color: "var(--lp-ink-faint)" }}>Upgrade to unlock more projects, AI usage and faster builds.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                    {tiers.map((tier) => {
            const isLoading = checkoutPlanId === tier.planId;
            return (<div key={tier.planId} className="relative rounded-[16px] p-6 flex flex-col" style={{ background: "var(--lp-bg-raised-2)", border: tier.recommended ? "1px solid var(--lp-ember)" : "1px solid var(--lp-border)", boxShadow: tier.recommended ? "0 20px 50px -24px var(--lp-ember-glow)" : "none" }}>
                                {tier.recommended && <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: "var(--lp-ember)", color: "#160800" }}><Zap className="w-3 h-3"/> Popular</span>}
                                <h3 className="text-[17px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>{tier.name}</h3>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-[30px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>{tier.price}</span>
                                    <span className="text-[13px]" style={{ color: "var(--lp-ink-faint)" }}>{tier.period}</span>
                                </div>
                                <p className="mt-2 text-[13.5px]" style={{ color: "var(--lp-ink-dim)" }}>{tier.tagline}</p>
                                <ul className="mt-5 space-y-2.5 flex-1">
                                    {tier.features.map((feature) => (<li key={feature} className="flex items-start gap-2 text-[13.5px]" style={{ color: "var(--lp-ink-dim)" }}><Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--lp-teal)" }}/> {feature}</li>))}
                                </ul>
                                <button onClick={() => onChoosePlan(tier.planId)} disabled={checkoutPlanId !== null} className={tier.recommended ? "lp-btn lp-btn-solid mt-6 !w-full" : "lp-btn lp-btn-ghost mt-6 !w-full"}>
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>} Choose {tier.name}
                                </button>
                            </div>);
        })}
                </div>
            </DialogContent>
        </Dialog>);
}
// ============================================================================
// ProjectsDashboard — the page. State/handlers below are unchanged from the
// original file. Only the shell composition (return statement) is new.
// ============================================================================
export function ProjectsDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    // ---- UNCHANGED STATE ----
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [projectToRename, setProjectToRename] = useState(null);
    const [renameName, setRenameName] = useState("");
    const [subscription, setSubscription] = useState(null);
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [checkoutPlanId, setCheckoutPlanId] = useState(null);
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    // ---- NEW: presentation-only state ----
    const [sortBy, setSortBy] = useState("newest");
    const [roleFilter, setRoleFilter] = useState("all");
    const [viewMode, setViewMode] = useState("grid");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    useEffect(() => { fetchProjects(); fetchSubscription(); }, []);
    // ---- UNCHANGED HANDLERS (copied verbatim) ----
    const fetchSubscription = async () => {
        try {
            const data = await api.getCurrentSubscription();
            setSubscription(data);
        }
        catch (error) {
            console.error("Failed to fetch subscription:", error);
        }
    };
    const handleStartCheckout = async (planId) => {
        setCheckoutPlanId(planId);
        try {
            const { checkoutUrl } = await api.createCheckoutSession(planId);
            window.location.href = checkoutUrl;
        }
        catch (error) {
            console.error("Failed to start checkout:", error);
            toast({ title: "Error", description: "Could not start checkout. Please try again.", variant: "destructive" });
            setCheckoutPlanId(null);
        }
    };
    const handleManageBilling = async () => {
        const active = subscription?.status === "ACTIVE" || subscription?.status === "TRIALING" || subscription?.status === "PAST_DUE";
        if (!active) {
            setIsPlanDialogOpen(true);
            return;
        }
        setIsPortalLoading(true);
        try {
            const { portalUrl } = await api.createPortalSession();
            if (!portalUrl)
                throw new Error("No billing portal URL was returned.");
            window.location.href = portalUrl;
        }
        catch (error) {
            console.error("Failed to open billing portal:", error);
            toast({ title: "Billing portal unavailable", description: "We couldn't reach the billing portal right now. Showing your plan options instead.", variant: "destructive" });
            setIsPlanDialogOpen(true);
            setIsPortalLoading(false);
        }
    };
    const fetchProjects = async () => {
        try {
            const data = await api.getProjects();
            setProjects(data);
        }
        catch (error) {
            console.error("Failed to fetch projects:", error);
            toast({ title: "Error", description: "Failed to load projects. Please try again.", variant: "destructive" });
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateProject = async () => {
        if (!newProjectName.trim())
            return;
        setIsCreating(true);
        try {
            const newProject = await api.createProject(newProjectName);
            setProjects([newProject, ...projects]);
            setNewProjectName("");
            setIsDialogOpen(false);
            toast({ title: "Success", description: "Project created successfully" });
        }
        catch (error) {
            console.error("Failed to create project:", error);
            toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
        }
        finally {
            setIsCreating(false);
        }
    };
    const handleDeleteProject = async (e, projectId) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project? This action cannot be undone."))
            return;
        try {
            await api.deleteProject(projectId.toString());
            setProjects(projects.filter(p => p.id !== projectId));
            toast({ title: "Success", description: "Project deleted successfully" });
        }
        catch (error) {
            console.error("Failed to delete:", error);
            toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
        }
    };
    const handleDownloadProject = async (e, projectId) => {
        e.stopPropagation();
        try {
            const blob = await api.downloadProjectZip(projectId.toString());
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project-${projectId}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: "Success", description: "Download started" });
        }
        catch (error) {
            console.error("Failed to download:", error);
            toast({ title: "Error", description: "Failed to download project", variant: "destructive" });
        }
    };
    const handleRenameClick = (e, project) => {
        e.stopPropagation();
        setProjectToRename(project);
        setRenameName(project.name);
        setIsRenameDialogOpen(true);
    };
    const handleRenameSubmit = async () => {
        if (!projectToRename || !renameName.trim())
            return;
        try {
            await api.updateProject(projectToRename.id.toString(), renameName);
            setProjects(projects.map(p => p.id === projectToRename.id ? { ...p, name: renameName } : p));
            setIsRenameDialogOpen(false);
            setProjectToRename(null);
            toast({ title: "Success", description: "Project renamed successfully" });
        }
        catch (error) {
            console.error("Failed to rename:", error);
            toast({ title: "Error", description: "Failed to rename project", variant: "destructive" });
        }
    };
    const handleLogout = () => { removeAuthToken(); removeUserInfo(); navigate("/login"); };
    const filteredProjects = projects.filter((project) => {
        const query = (searchQuery || "").toLowerCase().trim();
        if (!query)
            return true;
        const terms = query.split(/\s+/);
        const name = (project.name || "").toLowerCase();
        return terms.every((term) => name.includes(term));
    });
    const user = getUserInfo();
    const status = subscription?.status;
    const isDemoLocked = status === "DEMO_LOCKED";
    const isSubscribed = status === "ACTIVE" || status === "TRIALING" || status === "PAST_DUE";
    const showUpgrade = status === "NONE" || status === "INCOMPLETE";
    const planDisplay = describeSubscription(subscription);
    // ---- NEW: purely derived, read-only ----
    const tokenUsage = deriveTokenUsage(subscription);
    const projectUsage = deriveProjectUsage(subscription, projects.length);
    const ownedCount = projects.filter((p) => !p.role || p.role === "OWNER").length;
    const sharedCount = projects.length - ownedCount;
    const firstName = (user?.name || "there").split(" ")[0];
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortBy === "name")
            return a.name.localeCompare(b.name);
        const at = new Date(a.createdAt).getTime();
        const bt = new Date(b.createdAt).getTime();
        return sortBy === "newest" ? bt - at : at - bt;
    });
    const visibleProjects = roleFilter === "all" ? sortedProjects : sortedProjects.filter((p) => p.role === roleFilter);
    const handleTemplatesClick = () => setIsDialogOpen(true);
    const handleImportClick = () => toast({ title: "Coming soon", description: "Project import isn't available yet." });
    const handleNotificationsClick = () => toast({ title: "No new notifications", description: "You're all caught up." });
    return (<div className="landing-scope min-h-screen w-full flex" style={{ background: "var(--lp-bg)" }}>
            <div aria-hidden className="fixed inset-0 pointer-events-none z-0" style={{
            background: "radial-gradient(45% 35% at 100% 0%, rgba(255,90,46,0.06) 0%, transparent 60%), radial-gradient(35% 30% at 100% 100%, rgba(69,196,184,0.05) 0%, transparent 60%)",
        }}/>

            <Sidebar firstName={firstName} planDisplay={planDisplay} tokenUsage={tokenUsage} projectUsage={projectUsage} ownedCount={ownedCount} sharedCount={sharedCount} userName={user?.name} userEmail={user?.username} showUpgrade={showUpgrade} isDemoLocked={isDemoLocked} isSubscribed={isSubscribed} isPortalLoading={isPortalLoading} onNewProject={() => setIsDialogOpen(true)} onTemplates={handleTemplatesClick} onImportClick={handleImportClick} onUpgradeClick={() => setIsPlanDialogOpen(true)} onManageBilling={handleManageBilling} onSettings={() => navigate("/settings")} onLogout={handleLogout} mobileOpen={isMobileSidebarOpen} onCloseMobile={() => setIsMobileSidebarOpen(false)}/>

            <div className="relative z-10 flex-1 min-w-0 flex flex-col">
                <MobileTopBar onOpenSidebar={() => setIsMobileSidebarOpen(true)} onNotificationsClick={handleNotificationsClick}/>

                <main className="flex-1 w-full px-5 sm:px-8 xl:px-10 py-7 xl:py-9 flex flex-col gap-6 max-w-[1400px]">
                    {isDemoLocked && <SubscriptionBanner message={subscription?.message} onUpgrade={() => setIsPlanDialogOpen(true)}/>}

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-[20px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>Projects</h2>
                            <p className="text-[13px] mt-0.5" style={{ color: "var(--lp-ink-faint)" }}>
                                {projects.length} project{projects.length === 1 ? "" : "s"} in your workspace
                            </p>
                        </div>
                        <button onClick={handleNotificationsClick} className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full transition-colors" style={{ color: "var(--lp-ink-faint)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lp-bg-raised)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                            <Bell className="w-[18px] h-[18px]"/>
                        </button>
                    </div>

                    <DashboardToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} sortBy={sortBy} onSortChange={setSortBy} roleFilter={roleFilter} onRoleFilterChange={setRoleFilter} viewMode={viewMode} onViewModeChange={setViewMode}/>

                    {loading ? (<ProjectGridSkeleton />) : visibleProjects.length === 0 ? (<EmptyProjectsState isSearching={!!searchQuery} onCreateProject={() => setIsDialogOpen(true)}/>) : (<motion.div layout className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" : "flex flex-col gap-3"}>
                            <AnimatePresence initial={false}>
                                {visibleProjects.map((project) => (<ProjectCard key={project.id} project={project} variant={viewMode} onOpen={() => navigate(`/projects/${project.id}`)} onRename={(e) => handleRenameClick(e, project)} onDownload={(e) => handleDownloadProject(e, project.id)} onDelete={(e) => handleDeleteProject(e, project.id)}/>))}
                            </AnimatePresence>
                        </motion.div>)}
                </main>
            </div>

            <CreateProjectDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} projectName={newProjectName} onProjectNameChange={setNewProjectName} onCreate={handleCreateProject} isCreating={isCreating}/>
            <RenameProjectDialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen} renameName={renameName} onRenameNameChange={setRenameName} onSubmit={handleRenameSubmit} originalName={projectToRename?.name}/>
            <PlanDialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen} tiers={PLAN_TIERS} checkoutPlanId={checkoutPlanId} onChoosePlan={handleStartCheckout}/>
        </div>);
}
