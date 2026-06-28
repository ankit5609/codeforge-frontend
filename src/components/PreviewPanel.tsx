import { useState, useEffect } from "react";
import { Play, Loader2, ExternalLink, RefreshCw, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StateView } from "@/components/StateView";
import { api, PREVIEW_URL_KEY } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { RuntimeErrorAlert, RuntimeError } from "@/components/RuntimeErrorAlert";

interface PreviewPanelProps {
  projectId: string;
  runtimeError: RuntimeError | null;
  onDismiss: () => void;
  onFix: (error: RuntimeError) => void;
}

export function PreviewPanel({ projectId, runtimeError, onDismiss, onFix }: PreviewPanelProps) {
  const getPreviewUrlKey = (projId: string) => `${PREVIEW_URL_KEY}_${projId}`;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isWaitingForServer, setIsWaitingForServer] = useState(false);
  const [waitAttempt, setWaitAttempt] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const { toast } = useToast();

  // Poll the preview URL until it responds with a non-502/non-404 status
  const waitForPreviewReady = async (url: string) => {
    setIsWaitingForServer(true);
    setIframeReady(false);
    const MAX_ATTEMPTS = 40; // 40 × 3s = 2 minutes

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      setWaitAttempt(attempt);
      try {
        // Use no-cors so browser doesn't block cross-origin; we just need a response (not an error)
        const res = await fetch(url, { method: "GET", mode: "no-cors", cache: "no-store" });
        // no-cors gives "opaque" response with status 0 — any non-network-error means server is up
        if (res.type === "opaque" || res.ok) {
          setIsWaitingForServer(false);
          setIframeReady(true);
          setIframeKey((prev) => prev + 1);
          return;
        }
      } catch {
        // Network error = server still starting, keep polling
      }
      await new Promise((r) => setTimeout(r, 3000));
    }

    // Timed out — show iframe anyway (might work by now or show its own error)
    setIsWaitingForServer(false);
    setIframeReady(true);
    toast({
      title: "Preview may still be starting",
      description: "The server took longer than expected. Try refreshing in a moment.",
      variant: "destructive",
    });
  };

  // Sync state when projectId changes
  useEffect(() => {
    const savedUrl = localStorage.getItem(getPreviewUrlKey(projectId));
    if (savedUrl && savedUrl.includes(`project-${projectId}`)) {
      setPreviewUrl(savedUrl);
      waitForPreviewReady(savedUrl);
    } else {
      setPreviewUrl(null);
      setIsWaitingForServer(false);
      setIframeReady(false);
    }
  }, [projectId]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setIframeReady(false);

    try {
      const response = await api.deploy(projectId);
      setPreviewUrl(response.previewUrl);
      localStorage.setItem(getPreviewUrlKey(projectId), response.previewUrl);
      toast({
        title: "Deployment successful",
        description: "Starting preview server, please wait...",
      });
      // Start polling — Vite takes 30-60s to start after npm install
      waitForPreviewReady(response.previewUrl);
    } catch (error) {
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* URL Bar */}
      <div className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-border/60 bg-panel">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh preview"
            onClick={handleRefresh}
            disabled={!previewUrl || isWaitingForServer}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 flex items-center h-8 px-3 rounded-lg bg-muted/40 text-xs text-muted-foreground border border-border/50">
          <Globe className="w-3.5 h-3.5 mr-2 shrink-0 text-primary/70" />
          <span className="truncate">
            {previewUrl || "No preview running yet"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {previewUrl && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open preview in new tab"
              onClick={() => window.open(previewUrl, "_blank")}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            onClick={handleDeploy}
            disabled={isDeploying || isWaitingForServer}
            size="sm"
            className="h-7 px-3 bg-primary hover:bg-primary/90 text-xs font-medium"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Deploying
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1.5" />
                Run Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-muted/20">
        {isWaitingForServer ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div>
              <p className="text-sm font-medium text-foreground">Starting preview server...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Installing dependencies &amp; launching Vite ({waitAttempt * 3}s elapsed)
              </p>
            </div>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : previewUrl && iframeReady ? (
          <iframe
            key={`iframe-${iframeKey}`}
            src={previewUrl}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : previewUrl && !iframeReady ? (
          // Has a saved URL from a previous session — show iframe directly
          <iframe
            key={`iframe-${iframeKey}`}
            src={previewUrl}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <StateView
            icon={Globe}
            title="No preview running yet"
            description="Run a preview to launch your app in a live sandbox."
            action={
              !isDeploying && !isWaitingForServer
                ? { label: "Run Preview", onClick: handleDeploy }
                : undefined
            }
          />
        )}
      </div>

      {/* Error Alert Overlay - Inside the Preview Panel */}
      <RuntimeErrorAlert
        error={runtimeError}
        onDismiss={onDismiss}
        onFix={onFix}
      />
    </div>
  );
}
