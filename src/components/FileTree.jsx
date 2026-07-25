import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { StateView } from "@/components/StateView";
import { FileTypeIcon } from "@/components/FileTypeIcon";
function FileTreeItem({ node, depth, selectedPath, onSelectFile }) {
    const [isExpanded, setIsExpanded] = useState(depth < 2);
    const isDirectory = node.type === "directory";
    const isSelected = selectedPath === node.path;
    const handleClick = () => {
        if (isDirectory) {
            setIsExpanded(!isExpanded);
        }
        else {
            onSelectFile(node.path);
        }
    };
    return (<div>
      <div role="button" tabIndex={0} aria-expanded={isDirectory ? isExpanded : undefined} aria-label={node.name} className="flex items-center gap-2 px-2 py-1.5 mx-1 rounded-lg cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2" style={{
            paddingLeft: `${depth * 12 + 8}px`,
            background: isSelected ? "var(--lp-bg-raised-2)" : "transparent",
            color: isSelected ? "var(--lp-ink)" : "var(--lp-ink-faint)",
        }} onMouseEnter={(e) => { if (!isSelected)
        e.currentTarget.style.background = "var(--lp-bg-raised-2)"; }} onMouseLeave={(e) => { if (!isSelected)
        e.currentTarget.style.background = "transparent"; }} onClick={handleClick} onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
            }
        }}>
        {isDirectory ? (isExpanded ? (<ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--lp-ink-faint)" }}/>) : (<ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--lp-ink-faint)" }}/>)) : (<span className="w-4"/>)}
        {isDirectory ? (isExpanded ? (<FolderOpen className="w-4 h-4 shrink-0" style={{ color: "var(--lp-brass)" }}/>) : (<Folder className="w-4 h-4 shrink-0" style={{ color: "var(--lp-brass)" }}/>)) : (<FileTypeIcon name={node.name}/>)}
        <span className="truncate text-sm">{node.name}</span>
      </div>

      {isDirectory && isExpanded && node.children && (<div>
          {node.children.map((child) => (<FileTreeItem key={child.path} node={child} depth={depth + 1} selectedPath={selectedPath} onSelectFile={onSelectFile}/>))}
        </div>)}
    </div>);
}
export function FileTree({ files, selectedPath, onSelectFile, isLoading }) {
    if (isLoading) {
        return (<div className="p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="flex items-center gap-2 animate-pulse">
            <div className="w-4 h-4 rounded" style={{ background: "var(--lp-bg-raised-2)" }}/>
            <div className="h-4 rounded flex-1" style={{ width: `${50 + i * 10}%`, background: "var(--lp-bg-raised-2)" }}/>
          </div>))}
      </div>);
    }
    if (files.length === 0) {
        return (<StateView icon={FolderOpen} title="No files yet" description="Files appear here once the assistant generates them." compact/>);
    }
    return (<div className="py-2">
      {files.map((node) => (<FileTreeItem key={node.path} node={node} depth={0} selectedPath={selectedPath} onSelectFile={onSelectFile}/>))}
    </div>);
}
