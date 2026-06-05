import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { api, setAuthToken, setUserInfo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.login({ username: email, password });
      setAuthToken(response.token);
      if (response.user) {
        setUserInfo(response.user);
      }
      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });
      navigate("/projects");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-x-hidden overflow-y-auto min-[900px]:overflow-y-hidden bg-[#030712] relative select-none animate-fade-in flex items-center justify-center p-4 sm:p-6 min-[900px]:p-8 xl:p-12">
      {/* Layer 3: Extremely subtle grid (0.5% opacity maximum) */}
      <div className="absolute inset-0 dev-grid opacity-100 pointer-events-none" />

      {/* Layer 2: Large blurred indigo and violet ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Indigo glow behind workspace (left-ish) */}
        <div className="absolute top-[10%] left-[-10%] w-[900px] h-[900px] bg-indigo-500/[0.08] rounded-full blur-[140px] animate-orb-1" />
        {/* Violet spotlight behind login card (right-ish) */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-violet-600/[0.08] rounded-full blur-[160px] animate-orb-2" />
      </div>

      {/* Main Container Layer */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col-reverse min-[900px]:flex-row items-center justify-center min-[900px]:justify-between gap-8 min-[900px]:gap-12 h-full min-[900px]:h-auto">
        
        {/* Layer 4: Left Product Showcase visual & branding (Desktop only) */}
        <div className="hidden min-[900px]:flex w-full min-[900px]:w-[58%] xl:w-[60%] flex-col justify-center gap-6 self-stretch relative py-2 select-none h-full min-h-0">
          
          {/* Center visual: Connected Workflow story dashboard */}
          <div className="flex-1 flex items-center justify-center py-4 min-h-0">
            <div className="w-full max-w-[550px] xl:max-w-[580px] bg-[#0b0f19]/35 border border-white/[0.05] rounded-2xl p-4 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col gap-3.5 overflow-hidden backdrop-blur-md relative select-none">
              
              {/* Toolbar/Path Header */}
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 text-[9px] text-slate-500 font-mono">
                <div className="flex items-center gap-2">
                  <img src="/favicon.png" alt="cf" className="w-3.5 h-3.5 object-contain" />
                  <span className="text-slate-200 font-bold text-[10px] tracking-tight">CodeForge</span>
                  <span className="text-slate-700">/</span>
                  <span className="text-slate-500 font-mono text-[9px] font-semibold">workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-semibold font-mono text-[9px]">src/auth.ts</span>
                  <span className="text-slate-700">|</span>
                  <span className="text-emerald-400 flex items-center gap-1 text-[9px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active AI Session
                  </span>
                </div>
              </div>

              {/* Tiled Dashboard Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                
                {/* AI Assistant Card (Left Tile) */}
                <div className="bg-[#05070c]/70 border border-white/[0.04] rounded-xl p-3.5 shadow-lg flex flex-col gap-2 min-h-[150px] justify-between">
                  <div className="flex items-center justify-between border-b border-white/[0.03] pb-1">
                    <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-semibold font-mono">AI Assistant</span>
                    <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1 py-0.5 rounded-full font-mono">Active</span>
                  </div>
                  <div className="font-mono text-[9px] text-slate-300 bg-black/40 rounded-lg p-2 leading-tight">
                    <span className="text-slate-500 font-bold">Prompt:</span> Implement JWT Authentication
                  </div>
                  <div className="font-mono text-[8.5px] text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <span>✓</span>
                      <span>Create refresh token support</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <span>✓</span>
                      <span>Generate unit tests</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      <span>Compile and run test suite</span>
                    </div>
                  </div>
                </div>

                {/* Code Editor Card (Right Tile) */}
                <div className="bg-[#05070c] border border-white/[0.04] rounded-xl p-3.5 font-mono text-[8.5px] leading-relaxed shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[150px]">
                  <div className="flex items-center justify-between border-b border-white/[0.03] pb-1 text-slate-600 mb-1">
                    <span>src/auth.ts</span>
                    <span>TypeScript</span>
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="text-indigo-400"><span className="text-slate-600">1</span> import jwt from "jsonwebtoken";</div>
                    <div className="text-indigo-400"><span className="text-slate-600">2</span> </div>
                    <div className="text-indigo-400"><span className="text-slate-600">3</span> export async function authenticate(user) {'{'}</div>
                    <div className="text-indigo-400"><span className="text-slate-600">4</span>   const token = jwt.sign({'{ id: user.id }'}, SECRET);</div>
                    <div className="text-indigo-400"><span className="text-slate-600">5</span>   return {'{ token, valid: true };'}</div>
                    <div className="text-indigo-400"><span className="text-slate-600">6</span> {'}'}</div>
                  </div>
                  <div className="text-[8px] text-indigo-300/80 animate-pulse bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10 mt-2">
                    Generating authentication service...
                  </div>
                </div>

              </div>

              {/* Tiled Dashboard Row 2 (Terminal + Deployment) */}
              <div className="grid grid-cols-5 gap-3.5">
                
                {/* Console Terminal (3 columns wide) */}
                <div className="col-span-3 bg-[#04060b] border border-white/[0.04] rounded-xl p-3.5 shadow-md font-mono text-[8.5px] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-slate-500 border-b border-white/[0.04] pb-1 mb-1">
                    <span>Console</span>
                    <span>vitest</span>
                  </div>
                  <div className="text-slate-400 font-semibold">$ vitest run auth.test.ts</div>
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span>
                    <span>auth.test.ts passed</span>
                  </div>
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span>
                    <span>refresh-token.test.ts passed</span>
                  </div>
                  <div className="text-slate-300 font-semibold">Build Successful</div>
                </div>

                {/* Deployment Status Widget (2 columns wide) */}
                <div className="col-span-2 bg-[#05070c] border border-white/[0.04] rounded-xl p-3.5 shadow-md flex flex-col justify-between items-center text-center">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold font-mono">Deployment</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 my-1 animate-pulse">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-semibold font-mono">● Production Live</span>
                </div>

              </div>

            </div>
          </div>

          {/* Copy section */}
          <div className="max-w-lg mt-auto pr-4">
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight mb-2">
              Build Production Software With AI
            </h2>
            
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Plan, generate, test and deploy software from one intelligent workspace.
            </p>

            {/* Feature Highlights styled as premium capsules */}
            <div className="flex flex-wrap gap-2 text-[9px] font-mono text-slate-400 pt-4 border-t border-white/[0.04]">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-slate-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                AI Code Generation
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-slate-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                Automated Testing
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-slate-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                Workspace Orchestration
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-slate-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Instant Deployment
              </span>
            </div>
          </div>
        </div>

        {/* Layer 5: Floating Login Card (Right Side) */}
        <div className="w-full min-[900px]:w-[38%] xl:w-[40%] flex flex-col items-center justify-center z-20 relative">
          
          {/* Card Ambient Spotlight */}
          <div className="absolute inset-0 -z-10 bg-indigo-500/[0.08] rounded-full blur-[120px] pointer-events-none scale-125" />
          
          <div className="w-full max-w-[440px] xl:max-w-[460px] premium-card rounded-3xl p-8 sm:p-10 relative overflow-hidden bg-[#0b0f19]/90 border border-white/[0.06] shadow-2xl backdrop-blur-md">
            {/* Top border highlight gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* Free-floating Logo area with reduced glow intensity */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Background ambient glow ring reduced by ~50% */}
                <div className="absolute inset-1 rounded-full bg-indigo-500/5 blur-md opacity-40 animate-pulse" />
                <img 
                  src="/favicon.png" 
                  alt="CodeForge Logo" 
                  className="w-12 h-12 object-contain filter drop-shadow-[0_0_8px_rgba(139,92,246,0.15)] animate-logo-float" 
                />
              </div>

              {/* 16px Spacing */}
              <div className="h-4" />

              <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
                CodeForge
              </h1>

              {/* 8px Spacing */}
              <div className="h-2" />

              <p className="text-slate-400 text-xs font-medium">
                AI Software Engineering Workspace
              </p>

              {/* 24px Spacing */}
              <div className="h-6" />
            </div>

            {/* Credentials Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
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
                    className="pl-10 h-11 bg-[#05070c]/60 border-white/[0.08] text-white placeholder:text-muted-foreground/35 focus-visible:ring-1 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0 focus-visible:border-indigo-500/40 rounded-xl text-sm transition-all duration-300 focus:shadow-[0_0_12px_rgba(99,102,241,0.06)]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </Label>
                  <a href="#forgot" className="text-[11px] text-slate-500 hover:text-indigo-400 transition-colors">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-[#05070c]/60 border-white/[0.08] text-white placeholder:text-muted-foreground/35 focus-visible:ring-1 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0 focus-visible:border-indigo-500/40 rounded-xl text-sm transition-all duration-300 focus:shadow-[0_0_12px_rgba(99,102,241,0.06)]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white font-semibold rounded-xl text-sm shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.45)] hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.98] transition-all duration-300 border-none mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Social Divider */}
            <div className="relative my-5">
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
            <p className="text-center text-sm text-slate-400 mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                Sign up
              </Link>
            </p>

          </div>

          {/* Tablet & Mobile Hero Showcase Content (below card) */}
          <div className="flex min-[900px]:hidden flex-col items-center text-center max-w-sm mt-8 gap-4 px-2 pb-6">
            {/* Condensed Workspace Preview for Tablet (768px - 899px) and Mobile (<768px) */}
            <div className="w-full bg-[#0b0f19]/35 border border-white/[0.05] rounded-xl p-3 shadow-lg flex flex-col gap-2 backdrop-blur-md">
              <div className="flex items-center justify-between text-[8.5px] text-slate-500 font-mono border-b border-white/[0.04] pb-1.5">
                <span>workspace / cf-auth</span>
                <span className="text-emerald-500">● Active Session</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[9px] text-slate-300">Prompt: auth-provider.ts</span>
                </div>
                <div className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  Production Live
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-sm font-bold text-white">
                Build Production Software With AI
              </h2>
              <p className="text-slate-400 text-[10px] leading-normal">
                Plan, generate, test and deploy software from one intelligent workspace.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
