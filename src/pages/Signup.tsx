import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowRight, Check, GitBranch, Terminal } from "lucide-react";
import { api, setAuthToken, setUserInfo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast({
        title: "Missing details",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.signup({ name, username: email, password });
      setAuthToken(response.token);
      setUserInfo(response.user);
      toast({
        title: "Welcome!",
        description: "Account created successfully",
      });
      navigate("/projects");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f1d17] relative select-none animate-fade-in flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden">
      {/* Background: faint dev grid + scanlines + ambient orbs */}
      <div className="absolute inset-0 dev-grid pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.25]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(16,185,129,0.04) 0px, rgba(16,185,129,0.04) 1px, transparent 1px, transparent 4px)",
        }}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-primary/[0.07] rounded-full blur-[160px] animate-orb-1" />
        <div className="absolute bottom-[-25%] right-[-10%] w-[700px] h-[700px] bg-secondary/[0.05] rounded-full blur-[150px] animate-orb-2" />
      </div>

      {/* Split deck */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-6 lg:gap-10 items-stretch">

        {/* ============ LEFT: Create-workspace console ============ */}
        <div className="flex flex-col">
          {/* Brand lockup */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary-500/25 flex items-center justify-center">
              <img src="/favicon.png" alt="CodeForge" className="w-5 h-5 object-contain" />
            </div>
            <div className="font-mono text-sm tracking-tight text-slate-200 font-bold">
              code<span className="text-primary">forge</span>
            </div>
          </div>

          {/* Oversized editorial headline */}
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-[1.02] tracking-tight text-white mb-3">
            Init.<br />
            Build.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-secondary">
              Forge_
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
            Spin up your AI engineering workspace and start shipping production software in minutes.
          </p>

          {/* The IDE-window signup console */}
          <div className="premium-card rounded-xl overflow-hidden bg-[#0d1a14]/90 border border-white/[0.06]">
            {/* Window chrome */}
            <div className="flex items-center justify-between px-4 h-9 border-b border-white/[0.06] bg-[#16271f]/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                <Terminal className="w-3 h-3 text-primary/80" />
                <span>workspace.init — zsh</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ready
              </span>
            </div>

            {/* Console body */}
            <div className="p-5 sm:p-6">
              <p className="font-mono text-[11px] text-slate-500 mb-5">
                <span className="text-primary">$</span> codeforge create --workspace
                
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    name
                  </label>
                  <div className="flex items-center gap-2 border-b border-white/10 focus-within:border-primary-400 transition-colors">
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 h-10 bg-transparent border-0 rounded-none px-0 text-white font-mono text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    email
                  </label>
                  <div className="flex items-center gap-2 border-b border-white/10 focus-within:border-primary-400 transition-colors">
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-10 bg-transparent border-0 rounded-none px-0 text-white font-mono text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    password
                  </label>
                  <div className="flex items-center gap-2 border-b border-white/10 focus-within:border-primary-400 transition-colors">
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 h-10 bg-transparent border-0 rounded-none px-0 text-white font-mono text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full h-11 bg-gradient-to-r from-primary via-secondary to-secondary hover:from-primary hover:via-accent hover:to-secondary text-[#052017] font-mono font-bold rounded-lg text-sm shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all duration-300 border-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      provisioning...
                    </>
                  ) : (
                    <>
                      {"> run create_workspace"}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0d1a14] px-3 font-mono text-[10px] uppercase tracking-widest text-slate-600">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Google Authentication",
                    description: "Google OAuth integration is ready for connection.",
                  });
                }}
                className="w-full h-11 bg-[#16271f]/50 border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.03] text-slate-200 font-mono font-medium rounded-lg text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                continue with Google
              </Button>

              <p className="text-center text-xs text-slate-500 mt-5 font-mono">
                have an account?{" "}
                <Link to="/login" className="text-primary hover:text-secondary transition-colors font-semibold">
                  sign_in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* ============ RIGHT: Live provisioning rail ============ */}
        <aside className="hidden lg:flex flex-col bg-[#0d1a14]/40 border border-white/[0.05] rounded-xl p-6 backdrop-blur-md shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)]">
          {/* header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.05] mb-5">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300 font-semibold">
              <GitBranch className="w-3.5 h-3.5 text-primary" />
              workspace.provision
            </div>
            <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              live
            </span>
          </div>

          {/* vertical timeline */}
          <ol className="relative pl-6 space-y-5">
            <span className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/60 via-primary/50 to-white/5" />
            {[
              { label: "Repository", meta: "git · initialized", state: "done" },
              { label: "AI Assistant", meta: "agent · configured", state: "done" },
              { label: "Test Runner", meta: "vitest · linked", state: "active" },
              { label: "Deploy Pipeline", meta: "edge · pending", state: "idle" },
            ].map((step) => (
              <li key={step.label} className="relative">
                <span
                  className={
                    "absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center " +
                    (step.state === "done"
                      ? "bg-emerald-500/20 border-emerald-500/60"
                      : step.state === "active"
                      ? "bg-primary/20 border-primary-400 animate-pulse"
                      : "bg-white/[0.03] border-white/15")
                  }
                >
                  {step.state === "done" && <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />}
                </span>
                <div
                  className={
                    "font-mono text-sm font-semibold " +
                    (step.state === "idle" ? "text-slate-500" : "text-slate-100")
                  }
                >
                  {step.label}
                </div>
                <div className="font-mono text-[10px] text-slate-500">{step.meta}</div>
              </li>
            ))}
          </ol>

          {/* telemetry terminal feed */}
          <div className="mt-6 flex-1 bg-[#112019] border border-white/[0.05] rounded-lg p-3.5 font-mono text-[10px] leading-relaxed text-slate-400 min-h-[120px]">
            <div className="text-slate-600 mb-1.5"># codeforge init project</div>
            <div className="text-emerald-400">✓ repository created</div>
            <div className="text-emerald-400">✓ ai agent configured</div>
            <div className="text-secondary">› linking test environment…</div>
            <div className="text-slate-300">
              workspace ready
              
            </div>
          </div>

          {/* capability tags */}
          <div className="flex flex-wrap gap-1.5 mt-5">
            {["AI Code Gen", "Automated Tests", "Orchestration", "Instant Deploy"].map((t, i) => (
              <span
                key={t}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/[0.05] font-mono text-[9px] text-slate-300"
              >
                <span
                  className={
                    "w-1.5 h-1.5 rounded-full " +
                    ["bg-primary", "bg-secondary", "bg-accent", "bg-emerald-500"][i]
                  }
                />
                {t}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
