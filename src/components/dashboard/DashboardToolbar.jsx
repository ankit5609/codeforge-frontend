import { Search, ArrowUpDown, SlidersHorizontal, LayoutGrid, List, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const SORT_LABEL = { newest: "Newest first", oldest: "Oldest first", name: "Name A–Z" };
const FILTER_LABEL = { all: "All roles", OWNER: "Owner", EDITOR: "Editor", VIEWER: "Viewer" };
const menuBtn = "flex items-center gap-2 h-11 px-4 rounded-[10px] font-medium text-[14px] transition-colors";
const menuContentClass = "landing-scope min-w-[176px] rounded-[12px] p-1.5 z-50";
export function DashboardToolbar({ searchQuery, onSearchChange, sortBy, onSortChange, roleFilter, onRoleFilterChange, viewMode, onViewModeChange, }) {
    return (<div className="flex flex-col sm:flex-row gap-3">
      {/* Search — same searchQuery state/handler as before, restyled only */}
      <div className="relative flex-1 max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors" style={{ color: "var(--lp-ink-faint)" }}/>
        <input placeholder="Search projects..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="lp-input !pl-11" style={{ height: "44px", borderRadius: "10px" }}/>
      </div>

      <div className="flex items-center gap-2">
        {/* Sort — new, client-side only, layered after the existing search filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={menuBtn} style={{ border: "1px solid var(--lp-border)", color: "var(--lp-ink-dim)", background: "var(--lp-bg-raised)" }}>
              <ArrowUpDown className="w-4 h-4"/>
              <span className="hidden md:inline">{SORT_LABEL[sortBy]}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={menuContentClass} style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
            {Object.keys(SORT_LABEL).map((opt) => (<DropdownMenuItem key={opt} onClick={() => onSortChange(opt)} className="cursor-pointer rounded-[8px] text-[13.5px] flex items-center justify-between" style={{ color: "var(--lp-ink)" }}>
                {SORT_LABEL[opt]}
                {sortBy === opt && <Check className="w-3.5 h-3.5" style={{ color: "var(--lp-ember)" }}/>}
              </DropdownMenuItem>))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter by role — new, client-side only */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={menuBtn} style={{ border: "1px solid var(--lp-border)", color: "var(--lp-ink-dim)", background: "var(--lp-bg-raised)" }}>
              <SlidersHorizontal className="w-4 h-4"/>
              <span className="hidden md:inline">{FILTER_LABEL[roleFilter]}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={menuContentClass} style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
            {Object.keys(FILTER_LABEL).map((opt) => (<DropdownMenuItem key={opt} onClick={() => onRoleFilterChange(opt)} className="cursor-pointer rounded-[8px] text-[13.5px] flex items-center justify-between" style={{ color: "var(--lp-ink)" }}>
                {FILTER_LABEL[opt]}
                {roleFilter === opt && <Check className="w-3.5 h-3.5" style={{ color: "var(--lp-ember)" }}/>}
              </DropdownMenuItem>))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View toggle — new, purely presentational (same data, different layout) */}
        <div className="flex items-center rounded-[10px] p-1 gap-1" style={{ border: "1px solid var(--lp-border)", background: "var(--lp-bg-raised)" }}>
          <button aria-label="Grid view" onClick={() => onViewModeChange("grid")} className="w-9 h-9 rounded-[7px] flex items-center justify-center transition-colors" style={{
            background: viewMode === "grid" ? "var(--lp-bg-raised-2)" : "transparent",
            color: viewMode === "grid" ? "var(--lp-ink)" : "var(--lp-ink-faint)",
        }}>
            <LayoutGrid className="w-4 h-4"/>
          </button>
          <button aria-label="List view" onClick={() => onViewModeChange("list")} className="w-9 h-9 rounded-[7px] flex items-center justify-center transition-colors" style={{
            background: viewMode === "list" ? "var(--lp-bg-raised-2)" : "transparent",
            color: viewMode === "list" ? "var(--lp-ink)" : "var(--lp-ink-faint)",
        }}>
            <List className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>);
}
