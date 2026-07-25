import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { GitBranch, MoreVertical, Edit, Download, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generateGradient, cn } from "@/lib/utils";
const getInitials = (name) => {
    if (!name)
        return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};
const ROLE_STYLE = {
    OWNER: { bg: "rgba(255,90,46,0.10)", fg: "var(--lp-ember)", border: "rgba(255,90,46,0.22)" },
    EDITOR: { bg: "rgba(232,184,75,0.10)", fg: "var(--lp-brass)", border: "rgba(232,184,75,0.22)" },
    VIEWER: { bg: "var(--lp-bg-raised-2)", fg: "var(--lp-ink-faint)", border: "var(--lp-border)" },
};
export function ProjectCard({ project, variant = "grid", onOpen, onRename, onDownload, onDelete }) {
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
        <DropdownMenuItem onClick={onRename} className="cursor-pointer rounded-[8px] text-[13.5px]" style={{ color: "var(--lp-ink)" }}>
          <Edit className="w-3.5 h-3.5 mr-2"/> Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownload} className="cursor-pointer rounded-[8px] text-[13.5px]" style={{ color: "var(--lp-ink)" }}>
          <Download className="w-3.5 h-3.5 mr-2"/> Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="cursor-pointer rounded-[8px] text-[13.5px]" style={{ color: "var(--lp-ember)" }}>
          <Trash className="w-3.5 h-3.5 mr-2"/> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);
    const roleBadge = project.role && (<span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-[3px] rounded-full border" style={{ background: roleStyle?.bg, color: roleStyle?.fg, borderColor: roleStyle?.border }}>
      {project.role}
    </span>);
    if (variant === "list") {
        return (<motion.div layout whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: [0.16, 0.8, 0.3, 1] }} onClick={onOpen} className="group cursor-pointer rounded-[14px] p-4 flex items-center gap-4" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
        {avatar}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold truncate" style={{ color: "var(--lp-ink)" }}>
              {project.name}
            </h3>
            {roleBadge}
          </div>
          {project.description ? (<p className="text-[13px] truncate mt-0.5" style={{ color: "var(--lp-ink-faint)" }}>
              {project.description}
            </p>) : (<span className="flex items-center gap-1 text-[12px] mt-0.5" style={{ color: "var(--lp-ink-faint)" }}>
              <GitBranch className="w-3 h-3"/> main
            </span>)}
        </div>
        <span className="text-[12.5px] font-mono shrink-0 hidden sm:block" style={{ color: "var(--lp-ink-faint)" }}>
          {created}
        </span>
        {quickActions}
      </motion.div>);
    }
    return (<motion.div layout whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: [0.16, 0.8, 0.3, 1] }} onClick={onOpen} className="group cursor-pointer rounded-[18px] overflow-hidden flex flex-col p-5" style={{
            background: "linear-gradient(180deg, var(--lp-bg-raised) 0%, #0F131A 100%)",
            border: "1px solid var(--lp-border)",
            boxShadow: "0 4px 0 0 rgba(0,0,0,0)",
        }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 28px 54px -26px rgba(0,0,0,0.7)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 0 0 rgba(0,0,0,0)")}>
      <div className="flex items-start gap-3">
        {avatar}
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-[15.5px] font-semibold truncate transition-colors" style={{ color: "var(--lp-ink)" }}>
            {project.name}
          </h3>
          <span className="flex items-center gap-1 text-[12px] mt-1" style={{ color: "var(--lp-ink-faint)" }}>
            <GitBranch className="w-3 h-3"/> main
          </span>
        </div>
        {quickActions}
      </div>

      <p className={cn("text-[13px] leading-relaxed mt-3.5 line-clamp-2 flex-1", !project.description && "italic opacity-60")} style={{ color: "var(--lp-ink-dim)" }}>
        {project.description || "No description yet."}
      </p>

      <div className="flex items-center justify-between mt-4 pt-3.5" style={{ borderTop: "1px solid var(--lp-border-soft)" }}>
        {roleBadge || <span />}
        <span className="text-[11.5px] font-mono" style={{ color: "var(--lp-ink-faint)" }}>
          {created}
        </span>
      </div>
    </motion.div>);
}
