import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Code, Eye, Loader2, LogOut, MoreVertical, Trash, Download, Edit, MessageSquare, Search, Keyboard, Settings as SettingsIcon } from "lucide-react";
import { DeployStatus, DeployState } from "@/components/DeployStatus";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ChatPanel, ChatMessage } from "@/components/ChatPanel";
import { CodePanel } from "@/components/CodePanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, isAuthenticated, removeAuthToken, getUserInfo, removeUserInfo } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { RuntimeErrorAlert, RuntimeError } from "@/components/RuntimeErrorAlert";
import { generateGradient, cn } from "@/lib/utils";
import { ProjectResponse } from "@/lib/types";
import { ShareDialog } from "@/components/ShareDialog";

type ViewMode = "code" | "preview";
type MobileTab = "chat" | "code" | "preview";

const ROLE_STYLE: Record<string, { bg: string; fg: string; border: string }> = {
  OWNER: { bg: "rgba(255,90,46,0.10)", fg: "var(--lp-ember)", border: "rgba(255,90,46,0.22)" },
  EDITOR: { bg: "rgba(232,184,75,0.10)", fg: "var(--lp-brass)", border: "rgba(232,184,75,0.22)" },
  VIEWER: { bg: "var(--lp-bg-raised-2)", fg: "var(--lp-ink-faint)", border: "var(--lp-border)" },
};

export function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [updatedFiles, setUpdatedFiles] = useState<Map<string, string>>(new Map());
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [runtimeError, setRuntimeError] = useState<RuntimeError | null>(null);
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Live deploy/build status shown in the workspace header.
  const deployState: DeployState = runtimeError
    ? "error"
    : isStreaming
      ? "building"
      : project
        ? "ready"
        : "idle";

  // Rename state
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameName, setRenameName] = useState("");

  // Track edited files for current streaming response
  const currentEditedFilesRef = useRef<string[]>([]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // Load chat history on mount
  useEffect(() => {
    if (!projectId) return;

    // Reset immediately so a previous project's chat/preview never flashes
    // while the new project's data is loading.
    setMessages([]);
    setProject(null);
    setUpdatedFiles(new Map());

    const loadData = async () => {
      setIsLoadingHistory(true);
      try {
        const [history, projectData] = await Promise.all([
          api.getChatHistory(projectId),
          api.getProject(projectId)
        ]);

        const formattedMessages: ChatMessage[] = history.map((msg) => ({
          id: msg.id.toString(),
          role: msg.role === "USER" ? "user" : "assistant",
          content: msg.content,
          createdAt: msg.createdAt,
          events: msg.events,
          imageUrl: msg.imageUrl ?? null,
        }));
        setMessages(formattedMessages);
        setProject(projectData);

        // Silent background deploy trigger to warm up GKE runner pod
        api.deploy(projectId, false)
          .then((res) => {
             const previewUrlKey = `preview-url-${projectId}`;
             localStorage.setItem(previewUrlKey, res.previewUrl);
             console.log("Background preview warm-start successful:", res.previewUrl);
             setRefreshKey((prev) => prev + 1);
          })
          .catch((err) => {
             console.warn("Background preview warm-start failed:", err);
          });

      } catch (error) {
        console.error("Failed to load project data:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive"
        });
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadData();
  }, [projectId, toast]);

  const handleLogout = () => {
    removeAuthToken();
    removeUserInfo();
    navigate("/login");
  };

  const handleSendMessage = useCallback((content: string, image?: File | null) => {
    if (!projectId) return;

    // Reset edited files tracker
    currentEditedFilesRef.current = [];

    // Add user message (with local preview URL for image, if any)
    const localImagePreview = image ? URL.createObjectURL(image) : null;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      imageUrl: localImagePreview,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    // Create placeholder for AI response
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      isStreaming: true,
      editedFiles: [],
    };

    setMessages((prev) => [...prev, aiMessage]);

    const cleanup = api.streamChat(
      projectId,
      content,
      (chunk) => {
        // Append chunk to streaming message (character by character)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: msg.content + chunk, isStreaming: true }
              : msg
          )
        );
      },
      (path, fileContent) => {
        // Update file content
        setUpdatedFiles((prev) => new Map(prev).set(path, fileContent));

        // Track edited file
        if (!currentEditedFilesRef.current.includes(path)) {
          currentEditedFilesRef.current.push(path);
        }

        // Update the message with edited files
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, editedFiles: [...currentEditedFilesRef.current] }
              : msg
          )
        );
      },
      () => {
        // Stream complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, isStreaming: false, editedFiles: [...currentEditedFilesRef.current] }
              : msg
          )
        );
        setIsStreaming(false);
        if (currentEditedFilesRef.current.length > 0) {
          setRefreshKey((prev) => prev + 1);
        }
      },
      (error) => {
        // Handle error
        toast({
          title: "Chat error",
          description: error.message,
          variant: "destructive",
        });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: "Sorry, an error occurred.", isStreaming: false }
              : msg
          )
        );
        setIsStreaming(false);
      },
      image
    );

    return cleanup;
  }, [projectId, toast]);

  // Listen for runtime errors from the preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === 'PreviewError') {
        const error = data.payload;
        console.log("Caught runtime error:", error);
        setRuntimeError({
          message: error.message,
          source: data.subType,
          stack: error.stack,
          filename: error.source,
          lineno: error.lineno,
          colno: error.colno,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleFixError = useCallback((error: RuntimeError) => {
    const prompt = `I encountered a ${error.source || "runtime error"} in my application:
    
Error Message: ${error.message}
${error.filename ? `File: ${error.filename}` : ''}
${error.lineno ? `Line: ${error.lineno}` : ''}

Stack Trace:
${error.stack || "No stack trace available"}

Please analyze this error and fix the code to resolve it.`;

    handleSendMessage(prompt);
    setRuntimeError(null);
  }, [handleSendMessage]);

  const handleDeleteProject = async () => {
    if (!projectId) return;
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

    try {
      await api.deleteProject(projectId);
      navigate("/projects");
      toast({ title: "Success", description: "Project deleted successfully" });
    } catch (error) {
      console.error("Failed to delete:", error);
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    }
  };

  const handleDownloadProject = async () => {
    if (!projectId) return;
    try {
      const blob = await api.downloadProjectZip(projectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Success", description: "Download started" });
    } catch (error) {
      console.error("Failed to download:", error);
      toast({ title: "Error", description: "Failed to download project", variant: "destructive" });
    }
  };

  const openRenameDialog = () => {
    if (project) {
      setRenameName(project.name);
      setIsRenameDialogOpen(true);
    }
  };

  const handleRenameSubmit = async () => {
    if (!projectId || !renameName.trim()) return;

    try {
      const updated = await api.updateProject(projectId, renameName);
      setProject(prev => prev ? { ...prev, name: updated.name } : null);
      setIsRenameDialogOpen(false);
      toast({ title: "Success", description: "Project renamed successfully" });
    } catch (error) {
      console.error("Failed to rename:", error);
      toast({ title: "Error", description: "Failed to rename project", variant: "destructive" });
    }
  };

  // New: workspace-aware command palette (Milestone 5). Listens for the same
  // kind of custom event the codebase already dispatches for
  // open-command-palette / open-shortcuts — no new API, no prop drilling.
  useEffect(() => {
    const onToggleView = () => setViewMode((v) => (v === "code" ? "preview" : "code"));
    window.addEventListener("workspace-toggle-view", onToggleView);
    return () => window.removeEventListener("workspace-toggle-view", onToggleView);
  }, []);

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--lp-bg)", color: "var(--lp-ink-faint)" }}>
        <p>Invalid project ID</p>
      </div>
    );
  }

  return (
    <div className="landing-scope h-dvh flex flex-col overflow-hidden relative" style={{ background: "var(--lp-bg)" }}>
      <a href="#workspace-main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-3 focus:py-1.5 focus:rounded-md focus:text-sm" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)", color: "var(--lp-ink)" }}>Skip to content</a>

      {/* Workspace header */}
      <header className="h-14 shrink-0 backdrop-blur-md flex items-center justify-between px-4 relative z-20" style={{ borderBottom: "1px solid var(--lp-border-soft)", background: "rgba(18,22,29,0.75)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate("/projects")} className="transition-colors text-sm shrink-0" style={{ color: "var(--lp-ink-faint)" }}>
            ← Projects
          </button>
          <span className="w-px h-5 shrink-0" style={{ background: "var(--lp-border)" }} />
          {project ? (
            <>
              <div
                className="w-7 h-7 rounded-lg shadow-sm border border-white/10 shrink-0"
                style={generateGradient(project.name)}
              />
              <span className="font-semibold text-base truncate" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>{project.name}</span>
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--lp-ember)" }} />
              <span className="font-medium text-base" style={{ color: "var(--lp-ink-faint)" }}>Loading…</span>
            </>
          )}
          {project?.role !== 'VIEWER' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Project options" className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors shrink-0" style={{ color: "var(--lp-ink-faint)" }}>
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="landing-scope rounded-[12px] p-1.5 z-50" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
                <DropdownMenuItem onClick={openRenameDialog} className="cursor-pointer rounded-[8px] text-[13.5px]" style={{ color: "var(--lp-ink)" }}>
                  <Edit className="w-4 h-4 mr-2" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadProject} className="cursor-pointer rounded-[8px] text-[13.5px]" style={{ color: "var(--lp-ink)" }}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-[8px] text-[13.5px]" style={{ color: "var(--lp-ember)" }} onClick={handleDeleteProject}>
                  <Trash className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="hidden md:flex items-center">
          {/* View Mode Toggle (desktop) */}
          <div className="flex items-center rounded-full p-1" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
            <button
              onClick={() => setViewMode("preview")}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-all rounded-full"
              style={{
                background: viewMode === "preview" ? "rgba(255,90,46,0.14)" : "transparent",
                color: viewMode === "preview" ? "var(--lp-ember)" : "var(--lp-ink-faint)",
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setViewMode("code")}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-all rounded-full"
              style={{
                background: viewMode === "code" ? "rgba(255,90,46,0.14)" : "transparent",
                color: viewMode === "code" ? "var(--lp-ember)" : "var(--lp-ink-faint)",
              }}
            >
              <Code className="w-3.5 h-3.5" />
              Code
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DeployStatus state={deployState} pulse={deployState === "building"} className="hidden lg:inline-flex" />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            className="hidden md:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors"
            style={{ border: "1px solid var(--lp-border)", background: "var(--lp-bg-raised)", color: "var(--lp-ink-faint)" }}
          >
            <Search className="h-3.5 w-3.5" />
            Search
            <kbd className="rounded px-1 text-[10px]" style={{ border: "1px solid var(--lp-border)", background: "var(--lp-bg)" }}>⌘K</kbd>
          </button>
          <button
            aria-label="Keyboard shortcuts"
            onClick={() => window.dispatchEvent(new Event("open-shortcuts"))}
            className="hidden md:inline-flex h-9 w-9 rounded-full items-center justify-center transition-colors"
            style={{ color: "var(--lp-ink-faint)" }}
          >
            <Keyboard className="h-4 w-4" />
          </button>
          {project?.role && (
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border hidden md:inline"
              style={{ background: ROLE_STYLE[project.role].bg, color: ROLE_STYLE[project.role].fg, borderColor: ROLE_STYLE[project.role].border }}
            >
              {project.role}
            </span>
          )}

          <ShareDialog
            projectId={projectId}
            trigger={
              <button className="lp-btn lp-btn-ghost !h-9 !text-sm !rounded-full !px-4" disabled={project?.role === 'VIEWER'}>
                Share
              </button>
            }
          />
          {project?.role !== 'VIEWER' && (
            <button className="hidden sm:inline-flex lp-btn lp-btn-solid !h-9 !text-sm !rounded-full !px-5">
              Publish
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Account menu" className="h-9 w-9 rounded-full flex items-center justify-center">
                <Avatar className="h-7 w-7">
                  <AvatarFallback style={{ background: "rgba(255,90,46,0.15)", color: "var(--lp-ember)" }} className="text-xs font-semibold">
                    {(getUserInfo()?.name ? getUserInfo()!.name.charAt(0).toUpperCase() : "U")}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="landing-scope w-64 p-0 overflow-hidden rounded-[14px] z-50" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
              <div className="flex items-center gap-3 p-4" style={{ background: "var(--lp-bg-raised-2)", borderBottom: "1px solid var(--lp-border-soft)" }}>
                <Avatar className="h-10 w-10">
                  <AvatarFallback style={{ background: "rgba(255,90,46,0.15)", color: "var(--lp-ember)" }} className="text-sm font-semibold">
                    {(getUserInfo()?.name ? getUserInfo()!.name.charAt(0).toUpperCase() : "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight truncate" style={{ color: "var(--lp-ink)" }}>{getUserInfo()?.name || "User"}</p>
                  <p className="text-xs leading-tight truncate mt-0.5" style={{ color: "var(--lp-ink-faint)" }}>{getUserInfo()?.username || ""}</p>
                </div>
              </div>
              <div className="p-1.5">
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer rounded-[8px] py-2 text-[13.5px]" style={{ color: "var(--lp-ink)" }}>
                  <SettingsIcon className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-[8px] py-2 text-[13.5px]" style={{ color: "var(--lp-ember)" }}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main id="workspace-main" className="flex-1 overflow-hidden relative z-10">
        {isMobile ? (
          /* Mobile: single visible panel with a bottom tab bar */
          <div className="h-full flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              <div className={cn("absolute inset-0", mobileTab !== "chat" && "hidden")} style={{ background: "var(--lp-bg-raised)" }}>
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isStreaming={isStreaming}
                  isLoading={isLoadingHistory}
                  readOnly={project?.role === 'VIEWER'}
                />
              </div>
              <div className={cn("absolute inset-0", mobileTab !== "code" && "hidden")}>
                <CodePanel key={projectId} projectId={projectId} updatedFiles={updatedFiles} refreshKey={refreshKey} />
              </div>
              <div className={cn("absolute inset-0", mobileTab !== "preview" && "hidden")}>
                <PreviewPanel
                  key={`${projectId}-${refreshKey}`}
                  projectId={projectId}
                  runtimeError={runtimeError}
                  onDismiss={() => setRuntimeError(null)}
                  onFix={handleFixError}
                />
              </div>
            </div>
            <nav
              aria-label="Workspace views"
              className="shrink-0 grid grid-cols-3 backdrop-blur-md"
              style={{ borderTop: "1px solid var(--lp-border-soft)", background: "rgba(18,22,29,0.85)" }}
            >
              {([
                { id: "chat", label: "Chat", icon: MessageSquare },
                { id: "code", label: "Code", icon: Code },
                { id: "preview", label: "Preview", icon: Eye },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={mobileTab === id}
                  onClick={() => setMobileTab(id)}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 min-h-12 text-[11px] font-medium transition-colors"
                  style={{ color: mobileTab === id ? "var(--lp-ember)" : "var(--lp-ink-faint)" }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Chat Panel */}
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <div className="h-full" style={{ borderRight: "1px solid var(--lp-border-soft)", background: "var(--lp-bg-raised)" }}>
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isStreaming={isStreaming}
                  isLoading={isLoadingHistory}
                  readOnly={project?.role === 'VIEWER'}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-px transition-colors" style={{ background: "var(--lp-border)" }} />

            {/* Code/Preview Panel */}
            <ResizablePanel defaultSize={65} minSize={50} maxSize={75}>
              <div className="h-full">
                <div className="h-full relative">
                  <div className={cn("h-full absolute inset-0", viewMode !== "code" && "hidden")}>
                    <CodePanel key={projectId} projectId={projectId} updatedFiles={updatedFiles} refreshKey={refreshKey} />
                  </div>
                  <div className={cn("h-full absolute inset-0", viewMode !== "preview" && "hidden")}>
                    <PreviewPanel
                      key={`${projectId}-${refreshKey}`}
                      projectId={projectId}
                      runtimeError={runtimeError}
                      onDismiss={() => setRuntimeError(null)}
                      onFix={handleFixError}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </main>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="landing-scope rounded-[18px] p-6" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>Rename project</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
              className="lp-input"
              style={{ paddingLeft: "14px" }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <button onClick={() => setIsRenameDialogOpen(false)} className="lp-btn lp-btn-ghost">Cancel</button>
            <button onClick={handleRenameSubmit} disabled={!renameName.trim() || renameName === project?.name} className="lp-btn lp-btn-solid">
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
