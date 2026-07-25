import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error("Uncaught error:", error, info);
    }
    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };
    render() {
        if (this.state.hasError) {
            return (<div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full rounded-2xl border border-border/70 bg-card/95 backdrop-blur-md p-8 text-center shadow-[var(--shadow-panel)]">
            <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6"/>
            </span>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              An unexpected error interrupted the workspace. You can try again, or
              reload the page if the issue persists.
            </p>
            {this.state.error?.message && (<pre className="mb-6 max-h-28 overflow-auto rounded-lg bg-muted/50 p-3 text-left font-mono text-[11px] text-muted-foreground">
                {this.state.error.message}
              </pre>)}
            <div className="flex items-center justify-center gap-3">
              <button onClick={this.handleReset} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                <RotateCcw className="h-4 w-4"/> Try again
              </button>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 h-10 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                Reload
              </button>
            </div>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
