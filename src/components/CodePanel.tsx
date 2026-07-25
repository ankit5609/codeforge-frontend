import { useState, useEffect, useCallback } from "react";
import { FileTree } from "./FileTree";
import { CodeEditor } from "./CodeEditor";
import { FileTabs } from "./FileTabs";
import { DiffViewer } from "./DiffViewer";
import { Wand2, GitCompare, Loader2 } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { api, FileNode, OPEN_TABS_KEY, ACTIVE_TAB_KEY } from "@/lib/api";
import { formatCode, isFormattable } from "@/lib/formatter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CodePanelProps {
  projectId: string;
  updatedFiles: Map<string, string>;
  /** Increment to force the file tree to reload (e.g. after a chat stream completes). */
  refreshKey?: number;
}

// Helper to find a file by path in the tree
function findFileInTree(files: FileNode[], targetPath: string): boolean {
  for (const node of files) {
    if (node.path === targetPath) return true;
    if (node.children && findFileInTree(node.children, targetPath)) return true;
  }
  return false;
}

// Storage key helpers
const getTabsKey = (projectId: string) => `${OPEN_TABS_KEY}_${projectId}`;
const getActiveTabKey = (projectId: string) => `${ACTIVE_TAB_KEY}_${projectId}`;

export function CodePanel({ projectId, updatedFiles, refreshKey = 0 }: CodePanelProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [baseline, setBaseline] = useState<string>("");

  // Load tabs from localStorage
  useEffect(() => {
    const savedTabs = localStorage.getItem(getTabsKey(projectId));
    const savedActiveTab = localStorage.getItem(getActiveTabKey(projectId));

    if (savedTabs) {
      try {
        const tabs = JSON.parse(savedTabs);
        if (Array.isArray(tabs) && tabs.length > 0) {
          setOpenTabs(tabs);
          setActiveTab(savedActiveTab || tabs[0]);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved tabs:", e);
      }
    }
  }, [projectId]);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    if (openTabs.length > 0) {
      localStorage.setItem(getTabsKey(projectId), JSON.stringify(openTabs));
    } else {
      localStorage.removeItem(getTabsKey(projectId));
    }
  }, [openTabs, projectId]);

  // Save active tab to localStorage
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem(getActiveTabKey(projectId), activeTab);
    } else {
      localStorage.removeItem(getActiveTabKey(projectId));
    }
  }, [activeTab, projectId]);

  // Load file tree (re-runs when refreshKey changes, e.g. after a stream completes)
  useEffect(() => {
    let cancelled = false;
    const loadFiles = async () => {
      setIsLoadingTree(true);
      try {
        const fileTree = await api.getFiles(projectId);
        if (cancelled) return;
        setFiles(fileTree);

        // If no tabs are open, default to pages/Index.tsx
        if (openTabs.length === 0) {
          const defaultPaths = ["src/pages/Index.tsx", "pages/Index.tsx"];
          for (const defaultPath of defaultPaths) {
            if (findFileInTree(fileTree, defaultPath)) {
              setOpenTabs([defaultPath]);
              setActiveTab(defaultPath);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Failed to load files:", error);
      } finally {
        if (!cancelled) setIsLoadingTree(false);
      }
    };

    loadFiles();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, refreshKey]);

  // Load file content when active tab changes
  useEffect(() => {
    setShowDiff(false);
    if (!activeTab) {
      setFileContent("");
      return;
    }

    // Check if we have an updated version from streaming
    if (updatedFiles.has(activeTab)) {
      setFileContent(updatedFiles.get(activeTab)!);
      return;
    }

    const loadContent = async () => {
      setIsLoadingFile(true);
      try {
        const content = await api.getFileContent(projectId, activeTab);
        setFileContent(content);
      } catch (error) {
        console.error("Failed to load file:", error);
        setFileContent("// Error loading file");
      } finally {
        setIsLoadingFile(false);
      }
    };

    loadContent();
  }, [projectId, activeTab, updatedFiles]);

  // Update content when streaming updates arrive for active file
  useEffect(() => {
    if (activeTab && updatedFiles.has(activeTab)) {
      setFileContent(updatedFiles.get(activeTab)!);
    }
  }, [activeTab, updatedFiles]);

  const handleSelectFile = useCallback((path: string) => {
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setActiveTab(path);
  }, []);

  const handleCloseTab = useCallback((path: string) => {
    setOpenTabs((prev) => {
      const newTabs = prev.filter((t) => t !== path);
      if (activeTab === path) {
        const closingIndex = prev.indexOf(path);
        const newActiveIndex = Math.min(closingIndex, newTabs.length - 1);
        setActiveTab(newTabs[newActiveIndex] || null);
      }
      return newTabs;
    });
  }, [activeTab]);

  const handleSelectTab = useCallback((path: string) => {
    setActiveTab(path);
  }, []);

  const handleFormat = useCallback(async () => {
    if (!activeTab || !isFormattable(activeTab)) return;
    setIsFormatting(true);
    try {
      const formatted = await formatCode(fileContent, activeTab);
      setFileContent(formatted);
      toast({ title: "Formatted", description: `${activeTab.split("/").pop()} was tidied up.` });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Couldn't format",
        description: "The file may contain a syntax error.",
      });
    } finally {
      setIsFormatting(false);
    }
  }, [activeTab, fileContent, toast]);

  // The file was edited by the assistant this session → diff is available.
  const isEdited = !!activeTab && updatedFiles.has(activeTab);

  const handleToggleDiff = useCallback(async () => {
    if (!activeTab) return;
    if (!showDiff) {
      try {
        const saved = await api.getFileContent(projectId, activeTab);
        setBaseline(saved);
      } catch {
        setBaseline("");
      }
    }
    setShowDiff((v) => !v);
  }, [activeTab, projectId, showDiff]);

  return (
    <div className="flex h-full flex-col">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* File Tree */}
        <ResizablePanel defaultSize={22} minSize={14} maxSize={40}>
          <div className="h-full overflow-y-auto" style={{ borderRight: "1px solid var(--lp-border-soft)", background: "var(--lp-bg-raised)" }}>
            <div className="h-10 flex items-center px-4" style={{ borderBottom: "1px solid var(--lp-border-soft)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--lp-ink)" }}>Files</span>
            </div>
            <FileTree
              files={files}
              selectedPath={activeTab}
              onSelectFile={handleSelectFile}
              isLoading={isLoadingTree}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-px transition-colors" style={{ background: "var(--lp-border)" }} />

        {/* Code Editor with Tabs */}
        <ResizablePanel defaultSize={78} minSize={50}>
          <div className="flex h-full min-w-0 flex-col">
            {/* Tabs + toolbar */}
            <div className="flex items-center justify-between" style={{ borderBottom: "1px solid var(--lp-border-soft)", background: "var(--lp-bg-raised)" }}>
              <div className="min-w-0 flex-1">
                <FileTabs
                  openTabs={openTabs}
                  activeTab={activeTab}
                  onSelectTab={handleSelectTab}
                  onCloseTab={handleCloseTab}
                />
              </div>
              <div className="flex shrink-0 items-center gap-1 px-2">
                {isEdited && (
                  <button
                    onClick={handleToggleDiff}
                    className={cn("h-7 px-2 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors")}
                    style={{ color: showDiff ? "var(--lp-ember)" : "var(--lp-ink-faint)" }}
                  >
                    <GitCompare className="h-3.5 w-3.5" />
                    {showDiff ? "Code" : "Diff"}
                  </button>
                )}
                <button
                  onClick={handleFormat}
                  disabled={!activeTab || !isFormattable(activeTab) || isFormatting || showDiff}
                  className="h-7 px-2 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                  style={{ color: "var(--lp-ink-faint)" }}
                >
                  {isFormatting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  Format
                </button>
              </div>
            </div>

            {/* Editor / Diff */}
            <div className="flex-1 overflow-hidden">
              {showDiff ? (
                <DiffViewer oldValue={baseline} newValue={fileContent} />
              ) : (
                <CodeEditor content={fileContent} filePath={activeTab} isLoading={isLoadingFile} />
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
