import { useState, useEffect } from "react";
import { Play, Loader2, ExternalLink, RefreshCw, Globe } from "lucide-react";
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
        const res = await fetch(url, { method: "GET", cache: "no-store" });
        if (res.ok) {
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
      const response = await api.deploy(projectId, true);
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

  // New: lets the workspace-aware command palette trigger a deploy without
  // prop-drilling or duplicating this logic elsewhere (Milestone 5).
  useEffect(() => {
    const onWorkspaceDeploy = () => {
      if (!isDeploying && !isWaitingForServer) handleDeploy();
    };
    window.addEventListener("workspace-deploy", onWorkspaceDeploy);
    return () => window.removeEventListener("workspace-deploy", onWorkspaceDeploy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeploying, isWaitingForServer]);

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--lp-bg)" }}>
      {/* URL Bar */}
      <div className="h-12 shrink-0 flex items-center gap-2 px-3" style={{ borderBottom: "1px solid var(--lp-border-soft)", background: "var(--lp-bg-raised)" }}>
        <button
          aria-label="Refresh preview"
          onClick={handleRefresh}
          disabled={!previewUrl || isWaitingForServer}
          className="h-7 w-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-40"
          style={{ color: "var(--lp-ink-faint)" }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 flex items-center h-8 px-3 rounded-lg text-xs" style={{ background: "var(--lp-bg-raised-2)", color: "var(--lp-ink-faint)", border: "1px solid var(--lp-border)" }}>
          <Globe className="w-3.5 h-3.5 mr-2 shrink-0" style={{ color: "var(--lp-teal)" }} />
          <span className="truncate font-mono">
            {previewUrl || "No preview running yet"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {previewUrl && (
            <button
              aria-label="Open preview in new tab"
              onClick={() => window.open(previewUrl, "_blank")}
              className="h-7 w-7 rounded-md flex items-center justify-center transition-colors"
              style={{ color: "var(--lp-ink-faint)" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleDeploy}
            disabled={isDeploying || isWaitingForServer}
            className="lp-btn lp-btn-solid !h-7 !px-3 !text-xs disabled:opacity-60"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Deploying
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                Run Preview
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1" style={{ background: "var(--lp-bg)" }}>
        {isWaitingForServer ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--lp-ember)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--lp-ink)" }}>Starting preview server...</p>
              <p className="text-xs mt-1" style={{ color: "var(--lp-ink-faint)" }}>
                Installing dependencies &amp; launching Vite ({waitAttempt * 3}s elapsed)
              </p>
            </div>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "var(--lp-ember)", opacity: 0.5, animationDelay: `${i * 0.15}s` }}
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
