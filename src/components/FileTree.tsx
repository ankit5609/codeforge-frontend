import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { FileNode } from "@/lib/api";
import { cn } from "@/lib/utils";
import { StateView } from "@/components/StateView";
import { FileTypeIcon } from "@/components/FileTypeIcon";

interface FileTreeProps {
  files: FileNode[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  isLoading?: boolean;
}

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

function FileTreeItem({ node, depth, selectedPath, onSelectFile }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  
  const isDirectory = node.type === "directory";
  const isSelected = selectedPath === node.path;


  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isDirectory ? isExpanded : undefined}
        aria-label={node.name}
        className={cn(
          "file-tree-item focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          isSelected && "active"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {isDirectory ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-4" />
        )}
        {isDirectory ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 shrink-0 text-secondary/80" />
          ) : (
            <Folder className="w-4 h-4 shrink-0 text-secondary/80" />
          )
        ) : (
          <FileTypeIcon name={node.name} />
        )}
        <span className="truncate text-sm">{node.name}</span>
      </div>
      
      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, selectedPath, onSelectFile, isLoading }: FileTreeProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2 animate-pulse">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded flex-1" style={{ width: `${50 + i * 10}%` }} />
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <StateView
        icon={FolderOpen}
        title="No files yet"
        description="Files appear here once the assistant generates them."
        compact
      />
    );
  }

  return (
    <div className="py-2">
      {files.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}
