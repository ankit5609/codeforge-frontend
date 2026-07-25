import { AlertCircle, X, Wrench, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface RuntimeError {
    message: string;
    source?: string;
    lineno?: number;
    colno?: number;
    filename?: string;
    stack?: string;
}

interface RuntimeErrorAlertProps {
    error: RuntimeError | null;
    onDismiss: () => void;
    onFix: (error: RuntimeError) => void;
}

export function RuntimeErrorAlert({ error, onDismiss, onFix }: RuntimeErrorAlertProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!error) return null;

    return (
        <div className="absolute bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div
                className="w-[400px] rounded-[16px] shadow-2xl overflow-hidden"
                style={{ background: "var(--lp-bg-raised)", border: "1px solid rgba(255,90,46,0.25)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4" style={{ background: "rgba(255,90,46,0.08)", borderBottom: "1px solid rgba(255,90,46,0.15)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,90,46,0.15)" }}>
                            <AlertCircle className="w-5 h-5" style={{ color: "var(--lp-ember)" }} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold" style={{ color: "var(--lp-ink)" }}>Issue detected</h3>
                            <p className="text-xs" style={{ color: "var(--lp-ember)" }}>Caught live in your running app</p>
                        </div>
                    </div>
                    <button onClick={onDismiss} className="transition-colors" style={{ color: "var(--lp-ink-faint)" }}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="flex items-start gap-2" style={{ color: "var(--lp-ink-dim)" }}>
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 mt-0.5" style={{ color: "var(--lp-ink-faint)" }} />
                            ) : (
                                <ChevronRight className="w-4 h-4 mt-0.5" style={{ color: "var(--lp-ink-faint)" }} />
                            )}
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className="text-xs font-medium px-1.5 py-0.5 rounded"
                                        style={{ background: "rgba(255,90,46,0.14)", color: "var(--lp-ember)", border: "1px solid rgba(255,90,46,0.2)" }}
                                    >
                                        {error.source || "Runtime Error"}
                                    </span>
                                    {error.filename && (
                                        <span className="text-xs truncate max-w-[200px]" style={{ color: "var(--lp-ink-faint)" }} title={error.filename}>
                                            on {error.filename.split('/').pop()}
                                        </span>
                                    )}
                                </div>
                                <p className={cn("text-xs font-mono break-words leading-relaxed", !isExpanded && "line-clamp-2")} style={{ color: "var(--lp-ink-dim)" }}>
                                    {error.message}
                                </p>
                            </div>
                        </div>
                    </div>

                    {isExpanded && error.stack && (
                        <div className="mt-4 pl-6">
                            <div className="p-3 rounded-lg" style={{ background: "var(--lp-bg)", border: "1px solid var(--lp-border)" }}>
                                <pre className="text-[10px] whitespace-pre-wrap font-mono overflow-auto max-h-[200px]" style={{ color: "var(--lp-ink-faint)" }}>
                                    {error.stack}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 flex items-center justify-between" style={{ background: "var(--lp-bg-raised-2)", borderTop: "1px solid var(--lp-border-soft)" }}>
                    <div className="flex items-center gap-3 text-xs px-2" style={{ color: "var(--lp-ink-faint)" }}>
                        <button onClick={onDismiss} className="transition-colors hover:opacity-80">Dismiss</button>
                        <span>ESC</span>
                    </div>
                    <button
                        onClick={() => onFix(error)}
                        className="lp-btn lp-btn-solid !h-8 !px-4 !text-xs"
                    >
                        <Wrench className="w-3.5 h-3.5" />
                        Fix issues
                        <kbd
                            className="hidden sm:inline-flex h-4 items-center gap-1 rounded px-1 font-mono text-[9px] font-medium"
                            style={{ border: "1px solid rgba(22,8,0,0.3)", background: "rgba(22,8,0,0.15)" }}
                        >
                            F
                        </kbd>
                    </button>
                </div>
            </div>
        </div>
    );
}
