import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Code, Eye, Loader2, LogOut, RotateCcw, Maximize2, RefreshCw, MoreVertical, Trash, Download, Edit, MessageSquare, Search, Keyboard, Settings as SettingsIcon } from "lucide-react";
import { DeployStatus, DeployState } from "@/components/DeployStatus";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ChatPanel, ChatMessage } from "@/components/ChatPanel";
import { CodePanel } from "@/components/CodePanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, isAuthenticated, removeAuthToken, getUserInfo, removeUserInfo } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { RuntimeErrorAlert, RuntimeError } from "@/components/RuntimeErrorAlert";
import { generateGradient, cn } from "@/lib/utils";
import { ProjectResponse } from "@/lib/types";
import { ShareDialog } from "@/components/ShareDialog";

type ViewMode = "code" | "preview";
type MobileTab = "chat" | "code" | "preview";

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

  const handleSendMessage = useCallback((content: string) => {
    if (!projectId) return;

    // Reset edited files tracker
    currentEditedFilesRef.current = [];

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
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
      }
    );

    return cleanup;
  }, [projectId, toast]);

  // Listen for runtime errors from the preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: ensure message is from our expected source if possible
      // In local dev, origins might be localhost:5173 or localhost:8080

      const data = event.data;
      if (data?.type === 'PreviewError') {
        const error = data.payload;
        console.log("Caught runtime error:", error);
        setRuntimeError({
          message: error.message,
          source: data.subType,
          stack: error.stack,
          filename: error.source, // Map filename from payload source
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

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid project ID</p>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-background">
      <a href="#workspace-main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-card focus:px-3 focus:py-1.5 focus:rounded-md focus:border focus:border-border focus:text-sm">Skip to content</a>
      {/* Workspace header */}
      <header className="h-14 shrink-0 border-b border-border/60 bg-card/70 backdrop-blur-md flex items-center justify-between px-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate("/projects")} className="text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">
            ← Projects
          </button>
          <span className="w-px h-5 bg-border shrink-0" />
          {project ? (
            <>
              <div
                className="w-7 h-7 rounded-lg shadow-sm border border-white/10 shrink-0"
                style={generateGradient(project.name)}
              />
              <span className="font-display font-semibold text-base text-foreground truncate">{project.name}</span>
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="font-display font-medium text-base text-muted-foreground">Loading…</span>
            </>
          )}
          {project?.role !== 'VIEWER' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Project options" className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={openRenameDialog} className="cursor-pointer">
                  <Edit className="w-4 h-4 mr-2" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadProject} className="cursor-pointer">
                  <Download className="w-4 h-4 mr-2" /> Download
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleDeleteProject}>
                  <Trash className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="hidden md:flex items-center">
          {/* View Mode Toggle (desktop) */}
          <div className="flex items-center bg-muted/50 border border-border/60 rounded-full p-1">
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-all rounded-full ${viewMode === "preview"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-all rounded-full ${viewMode === "code"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Code className="w-3.5 h-3.5" />
              Code
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DeployStatus state={deployState} className="hidden lg:inline-flex" />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            Search
            <kbd className="rounded border border-border bg-background px-1 text-[10px]">⌘K</kbd>
          </button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Keyboard shortcuts"
            onClick={() => window.dispatchEvent(new Event("open-shortcuts"))}
            className="hidden md:inline-flex h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          {project?.role && (
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border hidden md:inline",
              project.role === 'OWNER' ? "bg-primary/10 text-primary border-primary/20" :
                project.role === 'EDITOR' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                  "bg-muted text-muted-foreground border-border"
            )}>
              {project.role}
            </span>
          )}

          <ShareDialog
            projectId={projectId}
            trigger={
              <Button variant="outline" size="sm" className="h-9 text-sm rounded-full px-4" disabled={project?.role === 'VIEWER'}>
                Share
              </Button>
            }
          />
          {project?.role !== 'VIEWER' && (
            <Button size="sm" className="hidden sm:inline-flex h-9 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5">
              Publish
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account menu" className="h-9 w-9 rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/15 text-primary font-semibold">
                    {(getUserInfo()?.name ? getUserInfo()!.name.charAt(0).toUpperCase() : "U")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-muted/30 border-b border-border/60">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm bg-primary/15 text-primary font-semibold">
                    {(getUserInfo()?.name ? getUserInfo()!.name.charAt(0).toUpperCase() : "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight text-foreground truncate">{getUserInfo()?.name || "User"}</p>
                  <p className="text-xs leading-tight text-muted-foreground truncate mt-0.5">{getUserInfo()?.username || ""}</p>
                </div>
              </div>
              <div className="p-1">
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer rounded-md py-2">
                  <SettingsIcon className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer rounded-md py-2">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>

          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main id="workspace-main" className="flex-1 overflow-hidden">
        {isMobile ? (
          /* Mobile: single visible panel with a bottom tab bar */
          <div className="h-full flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              <div className={cn("absolute inset-0 bg-panel", mobileTab !== "chat" && "hidden")}>
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
              className="shrink-0 grid grid-cols-3 border-t border-border/60 bg-card/80 backdrop-blur-md"
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
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2.5 min-h-12 text-[11px] font-medium transition-colors",
                    mobileTab === id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
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
              <div className="h-full border-r border-border/50 bg-panel">
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isStreaming={isStreaming}
                  isLoading={isLoadingHistory}
                  readOnly={project?.role === 'VIEWER'}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-px bg-border/50 hover:bg-primary/50 transition-colors" />

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameSubmit} disabled={!renameName.trim() || renameName === project?.name}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
