import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Mail, Sparkles, User, Lock } from "lucide-react";
import { api, setAuthToken, setUserInfo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="h-screen w-screen overflow-x-hidden overflow-y-auto min-[900px]:overflow-hidden bg-[#030712] relative select-none animate-fade-in flex items-center justify-center p-4 sm:p-6 min-[900px]:p-8 xl:p-12">
      {/* Layer 3: Extremely subtle grid (0.5% opacity maximum) */}
      <div className="absolute inset-0 dev-grid opacity-100 pointer-events-none" />

      {/* Layer 2: Large blurred indigo and violet ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Indigo glow behind workspace (left-ish) */}
        <div className="absolute top-[10%] left-[-10%] w-[900px] h-[900px] bg-indigo-500/[0.08] rounded-full blur-[140px] animate-orb-1" />
        {/* Violet spotlight behind signup card (right-ish) */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-violet-600/[0.08] rounded-full blur-[160px] animate-orb-2" />
      </div>

      {/* Main Container Layer */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col-reverse min-[900px]:flex-row items-center justify-center min-[900px]:justify-between gap-6 min-[900px]:gap-10 h-full min-[900px]:h-[calc(100vh-80px)] min-[900px]:max-h-[700px] xl:max-h-[740px]">
        
        {/* Layer 4: Left Product Showcase / Onboarding visual & branding */}
        <div className="hidden min-[900px]:flex w-full min-[900px]:w-[60%] flex-col justify-center items-center text-center gap-5 self-stretch relative py-2 select-none h-full min-h-0">
          
          {/* Top: Branding and indicators */}
          <div className="flex items-center justify-between w-full max-w-[550px] xl:max-w-[580px] px-1 text-[10px] xl:text-xs text-slate-400 font-mono">
            {/* Small CodeForge product badge */}
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-full px-2.5 py-1 text-slate-200">
              <img src="/favicon.png" alt="cf" className="w-3.5 h-3.5 object-contain" />
              <span className="font-bold tracking-tight">CodeForge</span>
            </div>
            
            {/* Workspace label */}
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="text-slate-600">/</span>
              <span>project-setup</span>
            </div>

            {/* Pulsing Workspace Ready status badge */}
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" style={{ animationDuration: "2.5s" }} />
              Workspace Ready
            </div>
          </div>

          {/* Center: Workspace setup mockup canvas */}
          <div className="w-full max-w-[550px] xl:max-w-[580px] bg-[#0b0f19]/90 premium-card rounded-2xl overflow-hidden shadow-2xl flex flex-col flex-1 min-h-0 max-h-[290px] xl:max-h-[330px] border border-white/[0.08] relative select-none">
            {/* Top border highlight gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {/* Workspace Mockup Header Bar */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#070a10]/80 select-none">
              {/* Window Controls */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/30 border border-rose-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/20" />
              </div>
              
              {/* Active Tab */}
              <div className="flex items-center gap-2 px-3 py-1 bg-[#05070c] border-x border-t border-white/[0.06] rounded-t-lg text-[9px] font-mono text-indigo-400 mt-2 h-8">
                <span className="text-slate-400 font-semibold">workspace-initialization.sh</span>
              </div>
              
              {/* Extra dummy tabs / state */}
              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
            </div>

            {/* Split panels */}
            <div className="flex-1 flex min-h-0 overflow-hidden text-left">
              {/* Setup Steps (Left Panel) */}
              <div className="hidden min-[900px]:flex min-[900px]:w-[42%] flex-col border-r border-white/[0.06] bg-[#070a10]/50 h-full min-h-0">
                <div className="px-3 py-2 border-b border-white/[0.04] text-[8.5px] uppercase tracking-wider text-slate-500 font-semibold font-mono">
                  Setup Steps
                </div>
                <div className="flex-1 p-3 flex flex-col gap-2 font-mono text-[9px] text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span>✓</span>
                    <span>Repository Created</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span>✓</span>
                    <span>AI Assistant Activated</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span>✓</span>
                    <span>Testing Environment Ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span>✓</span>
                    <span>Deployment Pipeline Ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span>✓</span>
                    <span>Workspace Ready</span>
                  </div>
                </div>
              </div>

              {/* Console log (Right Panel) */}
              <div className="flex-1 flex flex-col min-h-0 bg-[#05070c]/30">
                <div className="px-3 py-1.5 border-b border-white/[0.04] text-[8px] uppercase tracking-wider text-slate-500 font-semibold font-mono flex items-center justify-between">
                  <span>Console</span>
                  <span className="text-indigo-400 font-normal lowercase">bash</span>
                </div>
                <div className="flex-1 p-3.5 overflow-y-auto font-mono text-[9px] text-slate-400 leading-relaxed space-y-0.5">
                  <div className="text-slate-300">$ codeforge init project</div>
                  <div className="h-1" />
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span>
                    <span>Repository created</span>
                  </div>
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span>
                    <span>AI agent configured</span>
                  </div>
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span>
                    <span>Test environment ready</span>
                  </div>
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span>
                    <span>Deployment pipeline linked</span>
                  </div>
                  <div className="h-1" />
                  <div className="text-emerald-400 font-semibold border-t border-white/[0.04] pt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Workspace Ready
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom: Headline & feature chips */}
          <div className="max-w-xl flex flex-col items-center text-center">
            <h2 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2">
              Your AI Engineering Environment Is Ready
            </h2>
            
            <p className="text-slate-400 text-xs xl:text-sm leading-relaxed max-w-md mb-3">
              Plan, generate, test and deploy software from one intelligent workspace.
            </p>

            {/* Feature Highlights styled as premium capsules */}
            <div className="flex flex-wrap justify-center gap-2 text-[9px] xl:text-[10px] font-mono text-slate-400 pt-3 border-t border-white/[0.04] w-full">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-slate-300 font-semibold transition-colors hover:bg-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                AI Code Generation
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-slate-300 font-semibold transition-colors hover:bg-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                Automated Testing
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-slate-300 font-semibold transition-colors hover:bg-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                Workspace Orchestration
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-slate-300 font-semibold transition-colors hover:bg-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Instant Deployment
              </span>
            </div>
          </div>

        </div>

        {/* Layer 5: Floating Signup Card (Right Side) */}
        <div className="w-full min-[900px]:w-[38%] xl:w-[40%] flex flex-col items-center justify-center z-20 relative">
          
          {/* Card Ambient Spotlight */}
          <div className="absolute inset-0 -z-10 bg-indigo-500/[0.08] rounded-full blur-[120px] pointer-events-none scale-125" />
          
          <div className="w-full max-w-[440px] xl:max-w-[460px] premium-card rounded-3xl p-6 sm:p-8 xl:p-9 relative overflow-hidden bg-[#0b0f19]/90 border border-white/[0.06] shadow-2xl backdrop-blur-md">
            {/* Top border highlight gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* Logo area */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-10 h-10 flex items-center justify-center">
                {/* Background ambient glow ring reduced by ~50% */}
                <div className="absolute inset-1 rounded-full bg-indigo-500/5 blur-md opacity-40 animate-pulse" />
                <img 
                  src="/favicon.png" 
                  alt="CodeForge Logo" 
                  className="w-8 h-8 object-contain filter drop-shadow-[0_0_8px_rgba(139,92,246,0.15)] animate-logo-float" 
                />
              </div>

              {/* 16px Spacing */}
              <div className="h-3.5" />

              <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
                CodeForge
              </h1>

              {/* 8px Spacing */}
              <div className="h-1.5" />

              <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">
                AI Software Engineering Workspace
              </p>
              
              <div className="text-[9px] text-indigo-400/85 font-mono mt-0.5">
                Generate • Debug • Test • Deploy
              </div>

              {/* 20px Spacing */}
              <div className="h-4" />

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">Create Your Workspace</h2>
                <p className="text-[11px] text-slate-400 max-w-[280px]">
                  Join CodeForge and start building production-ready software with AI.
                </p>
              </div>

              {/* 20px Spacing */}
              <div className="h-4" />
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Full Name
                </Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 bg-[#05070c] border-white/[0.08] text-white placeholder:text-muted-foreground/35 focus-visible:ring-1 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0 focus-visible:border-indigo-500/40 rounded-xl text-sm transition-all duration-300 focus:shadow-[0_0_12px_rgba(99,102,241,0.06)]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-[#05070c] border-white/[0.08] text-white placeholder:text-muted-foreground/35 focus-visible:ring-1 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0 focus-visible:border-indigo-500/40 rounded-xl text-sm transition-all duration-300 focus:shadow-[0_0_12px_rgba(99,102,241,0.06)]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-[#05070c] border-white/[0.08] text-white placeholder:text-muted-foreground/35 focus-visible:ring-1 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0 focus-visible:border-indigo-500/40 rounded-xl text-sm transition-all duration-300 focus:shadow-[0_0_12px_rgba(99,102,241,0.06)]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-indigo-500 via-violet-600 to-pink-500 hover:from-indigo-450 hover:via-violet-550 hover:to-pink-450 text-white font-semibold rounded-xl text-sm shadow-[0_4px_20px_rgba(99,102,241,0.2)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.4)] hover:-translate-y-[1.5px] active:translate-y-[0.5px] active:scale-[0.98] transition-all duration-300 border-none mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Workspace...
                  </>
                ) : (
                  "Create Workspace"
                )}
              </Button>
            </form>

            {/* Social Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#0b0f19] px-3 text-slate-500 font-semibold">or continue with</span>
              </div>
            </div>

            {/* Google Social Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                toast({
                  title: "Google Authentication",
                  description: "Google OAuth integration is ready for connection.",
                });
              }}
              className="w-full h-11 bg-[#05070c]/50 border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.03] text-slate-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] hover:shadow-[0_4px_20px_rgba(255,255,255,0.02)]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </Button>

            {/* Bottom Footer Signup Link */}
            <p className="text-center text-sm text-slate-400 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                Sign in
              </Link>
            </p>

          </div>

          {/* Tablet & Mobile Hero Onboarding Showcase Content (below card) */}
          <div className="flex min-[900px]:hidden flex-col items-center text-center max-w-sm mt-6 px-2 pb-6 w-full">
            {/* Minimal status card - height under 100px, no heavy shadows or borders */}
            <div className="w-full bg-[#0b0f19]/35 border border-white/[0.05] rounded-xl p-3 flex flex-col gap-1.5 backdrop-blur-md">
              <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono">
                <span>workspace / project-setup</span>
                {/* pulsing green dot, label: Workspace Ready */}
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" style={{ animationDuration: "2.5s" }} />
                  <span>Workspace Ready</span>
                </div>
              </div>
              <div className="font-mono text-[9px] text-emerald-400/90 text-left">
                ✓ All 5 provisioning checks passed. CodeForge workspace online.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
