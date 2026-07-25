import { Link } from "react-router-dom";
import { Bell, CreditCard, Loader2, LogOut, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
const PLAN_DOT = {
    primary: "var(--lp-ember)",
    amber: "var(--lp-brass)",
    muted: "var(--lp-ink-faint)",
};
export function DashboardTopBar({ userName, userEmail, planDisplay, showUpgrade, isDemoLocked, isSubscribed, isPortalLoading, onUpgradeClick, onManageBilling, onNotificationsClick, onSettings, onLogout, }) {
    const initial = userName ? userName.charAt(0).toUpperCase() : "U";
    return (<header className="sticky top-0 z-30 backdrop-blur-md" style={{ borderBottom: "1px solid var(--lp-border-soft)", background: "rgba(10,13,18,0.82)" }}>
      <div className="lp-container h-[68px] flex items-center justify-between !px-6 lg:!px-8">
        <Link to="/projects" className="flex items-center gap-2.5 font-bold text-[16px]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>
          <img src="/logo.png" alt="CodeForge" width={26} height={26} className="w-[26px] h-[26px] object-contain rounded-md"/>
          CodeForge
        </Link>

        <div className="flex items-center gap-2">
          {/* Plan badge — always visible, purely informational */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1.5 rounded-full font-mono" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)", color: "var(--lp-ink-dim)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: PLAN_DOT[planDisplay.tone] }}/>
            {planDisplay.name}
          </span>

          {/* Notifications — placeholder only, no backing data yet */}
          <button onClick={onNotificationsClick} aria-label="Notifications" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ color: "var(--lp-ink-faint)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lp-bg-raised)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <Bell className="w-[17px] h-[17px]"/>
          </button>

          {/* Same conditional as before: upgrade/view-plans vs manage-billing vs nothing */}
          {showUpgrade || isDemoLocked ? (<button onClick={onUpgradeClick} className="lp-btn lp-btn-solid !h-9 !px-4 !text-[13.5px]">
              <Sparkles className="w-[15px] h-[15px]"/> {isDemoLocked ? "View plans" : "Upgrade"}
            </button>) : isSubscribed ? (<button onClick={onManageBilling} disabled={isPortalLoading} className="lp-btn lp-btn-ghost !h-9 !px-4 !text-[13.5px]">
              {isPortalLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CreditCard className="w-4 h-4"/>}
              Manage billing
            </button>) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-10 pl-1.5 pr-3 rounded-full transition-colors" style={{}} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lp-bg-raised)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Avatar className="h-7 w-7">
                  <AvatarFallback style={{ background: "rgba(255,90,46,0.15)", color: "var(--lp-ember)" }} className="text-[13px] font-semibold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[13.5px] hidden sm:inline" style={{ color: "var(--lp-ink-dim)" }}>
                  {userName || "Account"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="landing-scope w-72 p-0 overflow-hidden rounded-[14px] z-50" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
              <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid var(--lp-border-soft)", background: "var(--lp-bg-raised-2)" }}>
                <Avatar className="h-11 w-11">
                  <AvatarFallback style={{ background: "rgba(255,90,46,0.15)", color: "var(--lp-ember)" }} className="text-[15px] font-semibold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold truncate" style={{ color: "var(--lp-ink)" }}>{userName || "User"}</p>
                  <p className="text-[12px] truncate mt-0.5" style={{ color: "var(--lp-ink-faint)" }}>{userEmail || ""}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--lp-border-soft)" }}>
                <span className="text-[12px]" style={{ color: "var(--lp-ink-faint)" }}>Plan</span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full border" style={{ color: PLAN_DOT[planDisplay.tone], borderColor: "var(--lp-border)" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: PLAN_DOT[planDisplay.tone] }}/>
                  {planDisplay.name}
                </span>
              </div>
              <div className="p-1.5">
                <DropdownMenuItem onClick={onSettings} className="cursor-pointer rounded-[8px] py-2 text-[13.5px]" style={{ color: "var(--lp-ink)" }}>
                  <SettingsIcon className="w-4 h-4 mr-2"/> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer rounded-[8px] py-2 text-[13.5px]" style={{ color: "var(--lp-ember)" }}>
                  <LogOut className="w-4 h-4 mr-2"/> Sign out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>);
}
