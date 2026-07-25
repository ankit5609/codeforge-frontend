import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowRight, Mail, Lock, Eye, EyeOff, Play } from "lucide-react";
import { api, setAuthToken, setUserInfo, ApiError } from "@/lib/api";
import { AuthLayout, AuthCard } from "@/components/auth/AuthLayout";
import { useToast } from "@/hooks/use-toast";
function describeLoginError(error) {
    const status = error instanceof ApiError ? error.status : undefined;
    const msg = error instanceof Error ? error.message : "";
    const looksLikeBadCreds = status === 401 ||
        status === 403 ||
        /bad credentials|unauthorized|invalid|incorrect|not found/i.test(msg);
    if (looksLikeBadCreds) {
        return {
            title: "Incorrect email or password",
            description: "Double-check your details and try again — or use the one-click demo below.",
        };
    }
    if (status === 429) {
        return { title: "Too many attempts", description: "Please wait a moment before trying to sign in again." };
    }
    if (status === undefined) {
        return { title: "Can't reach the server", description: "Check your connection and try again in a moment." };
    }
    return {
        title: "Couldn't sign you in",
        description: msg && msg.length < 120 ? msg : "Something went wrong on our end. Please try again.",
    };
}
export function LoginModal() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const DEMO_EMAIL = "demo@codeforge.com";
    const DEMO_PASSWORD = "password123";
    const runDemoLogin = async () => {
        setEmail(DEMO_EMAIL);
        setPassword(DEMO_PASSWORD);
        setIsLoading(true);
        try {
            const response = await api.login({ username: DEMO_EMAIL, password: DEMO_PASSWORD });
            setAuthToken(response.token);
            if (response.user)
                setUserInfo(response.user);
            toast({ title: "Demo session started", description: "Exploring CodeForge as the demo user." });
            navigate("/projects");
        }
        catch (error) {
            toast({
                title: "Demo unavailable",
                description: error instanceof Error && error.message && error.message.length < 120
                    ? error.message
                    : "We couldn't start the demo session right now. Please try again in a moment.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ title: "Missing credentials", description: "Please enter both email and password", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.login({ username: email, password });
            setAuthToken(response.token);
            if (response.user)
                setUserInfo(response.user);
            toast({ title: "Welcome back!", description: "Successfully logged in" });
            navigate("/projects");
        }
        catch (error) {
            const { title, description } = describeLoginError(error);
            toast({ title, description, variant: "destructive" });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<AuthLayout eyebrow="// Sign in" heading={<>
          Welcome back to{" "}
          <span style={{
                background: "linear-gradient(120deg, #FF5A2E 0%, #FF8A5E 45%, #E8B84B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
            }}>
            your workspace.
          </span>
        </>} description="Your projects, chats, and sandboxes are exactly as you left them." badges={["session encrypted", "isolated k8s sandboxes", "back in seconds"]}>
      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <FieldEmail value={email} onChange={setEmail} disabled={isLoading}/>
          <FieldPassword value={password} onChange={setPassword} disabled={isLoading} show={showPassword} onToggleShow={() => setShowPassword((s) => !s)}/>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer sr-only"/>
              <span className="w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors" style={{
            background: remember ? "var(--lp-ember)" : "var(--lp-bg-raised-2)",
            borderColor: remember ? "var(--lp-ember)" : "var(--lp-border)",
        }}>
                {remember && (<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#160800" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>)}
              </span>
              <span className="text-[13px]" style={{ color: "var(--lp-ink-dim)" }}>
                Remember me
              </span>
            </label>
            <Link to="/forgot-password" className="text-[13px] font-semibold transition-colors" style={{ color: "var(--lp-brass)" }}>
              Forgot password?
            </Link>
          </div>

          <SolidButton disabled={isLoading} type="submit">
            {isLoading ? (<>
                <Loader2 className="w-4 h-4 animate-spin"/>
                Signing you in…
              </>) : (<>
                Log in
                <ArrowRight className="w-4 h-4"/>
              </>)}
          </SolidButton>
        </form>

        <Divider />

        <div className="flex flex-col gap-2.5">
          <OutlineButton onClick={() => toast({ title: "Google Authentication", description: "Google OAuth integration is ready for connection." })}>
            <GoogleIcon />
            Continue with Google
          </OutlineButton>
          
          <div className="p-3.5 rounded-lg border flex flex-col gap-2" style={{ background: "rgba(255,90,46,0.06)", borderColor: "rgba(255,90,46,0.2)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5" style={{ color: "var(--lp-ember)" }}>
                ⚡ Demo Credentials
              </span>
            </div>
            <div className="text-[12.5px] font-mono flex flex-wrap gap-x-4 gap-y-1" style={{ color: "var(--lp-ink-dim)" }}>
              <span>Email: <strong style={{ color: "var(--lp-ink)" }}>demo@codeforge.com</strong></span>
              <span>Password: <strong style={{ color: "var(--lp-ink)" }}>password123</strong></span>
            </div>
            <QuietButton onClick={runDemoLogin} disabled={isLoading}>
              <Play className="w-3.5 h-3.5"/>
              Use Demo Account (Auto Log-in)
            </QuietButton>
          </div>
        </div>

        <p className="text-center mt-5 text-[14px]" style={{ color: "var(--lp-ink-faint)" }}>
          New to CodeForge?{" "}
          <Link to="/signup" className="font-bold hover:underline" style={{ color: "var(--lp-brass)" }}>
            Create an account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>);
}
/* ==================== shared presentational bits ==================== */
export function FieldEmail({ value, onChange, disabled, }) {
    return (<div>
      <label htmlFor="email" className="block font-mono uppercase mb-2" style={{ fontSize: "10.5px", letterSpacing: "0.12em", color: "var(--lp-ink-faint)" }}>
        Email
      </label>
      <FieldShell icon={<Mail className="w-4 h-4"/>}>
        <input id="email" type="email" autoComplete="username" placeholder="you@company.com" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="lp-input"/>
      </FieldShell>
    </div>);
}
export function FieldPassword({ value, onChange, disabled, show, onToggleShow, label = "Password", id = "password", autoComplete = "current-password", }) {
    return (<div>
      <label htmlFor={id} className="block font-mono uppercase mb-2" style={{ fontSize: "10.5px", letterSpacing: "0.12em", color: "var(--lp-ink-faint)" }}>
        {label}
      </label>
      <FieldShell icon={<Lock className="w-4 h-4"/>}>
        <input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} placeholder="••••••••••••" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="lp-input pr-10"/>
        <button type="button" onClick={onToggleShow} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors" style={{ color: "var(--lp-ink-faint)" }}>
          {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
        </button>
      </FieldShell>
    </div>);
}
export function FieldShell({ icon, children }) {
    return (<div className="relative flex items-center">
      <span aria-hidden className="absolute left-3.5 pointer-events-none" style={{ color: "var(--lp-ink-faint)" }}>
        {icon}
      </span>
      {children}
    </div>);
}
export function SolidButton({ children, disabled, type = "button", onClick, }) {
    return (<button type={type} onClick={onClick} disabled={disabled} className="lp-auth-btn lp-auth-btn--solid mt-1">
      {children}
    </button>);
}
export function OutlineButton({ children, onClick, disabled, }) {
    return (<button type="button" onClick={onClick} disabled={disabled} className="lp-auth-btn lp-auth-btn--outline">
      {children}
    </button>);
}
export function QuietButton({ children, onClick, disabled, }) {
    return (<button type="button" onClick={onClick} disabled={disabled} className="lp-auth-btn lp-auth-btn--quiet">
      {children}
    </button>);
}
export function Divider() {
    return (<div className="flex items-center gap-3.5 my-5">
      <span className="flex-1 h-px" style={{ background: "var(--lp-border-soft)" }}/>
      <span className="font-mono uppercase" style={{ fontSize: "10.5px", letterSpacing: "0.14em", color: "var(--lp-ink-faint)" }}>
        or
      </span>
      <span className="flex-1 h-px" style={{ background: "var(--lp-border-soft)" }}/>
    </div>);
}
export function GoogleIcon() {
    return (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>);
}
