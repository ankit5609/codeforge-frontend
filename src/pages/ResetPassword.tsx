import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ArrowRight, ArrowLeft, Terminal, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const tokenMissing = !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    if (tokenMissing) {
      setFieldError("Reset token is missing from the URL");
      return;
    }
    if (!password) {
      setFieldError("New password is required");
      return;
    }
    if (password.length < 4 || password.length > 50) {
      setFieldError("Password must be 4–50 characters");
      return;
    }
    if (password !== confirm) {
      setFieldError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword(token, password);
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
      navigate("/login");
    } catch (error) {
      const status = error instanceof ApiError ? error.status : undefined;
      const msg = error instanceof Error ? error.message : "";

      if (status === 400) {
        setFieldError(msg || "Invalid or expired password reset token");
      } else if (status === undefined) {
        toast({
          title: "Can't reach the server",
          description: "Check your connection and try again in a moment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Couldn't reset password",
          description: msg && msg.length < 120 ? msg : "Please try again shortly.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f1d17] relative select-none animate-fade-in flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden overflow-y-auto">
      {/* Background */}
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

      <div className="relative z-10 w-full max-w-md flex flex-col">
        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 mb-4 w-fit rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="CodeForge — home"
        >
          <Logo variant="mono" markClassName="w-8 h-8" />
        </button>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-[1.08] tracking-tight text-white mb-2">
          Set a new{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-secondary">
            password_
          </span>
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-sm mb-5">
          Choose something strong you'll remember. Your reset link is valid for 15 minutes and can only be used once.
        </p>

        {/* IDE-window console */}
        <div className="premium-card rounded-xl overflow-hidden bg-[#0d1a14]/90 border border-white/[0.06]">
          {/* Window chrome */}
          <div className="flex items-center justify-between px-4 h-9 border-b border-white/[0.06] bg-[#16271f]/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
              <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
              <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
              <Terminal className="w-3 h-3 text-primary/80" />
              <span>auth.reset — zsh</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              secure
            </span>
          </div>

          <div className="p-5">
            {tokenMissing ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.05] p-4">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-white font-semibold">Missing reset token</p>
                    <p className="font-mono text-[11px] text-slate-300 leading-relaxed">
                      This link is invalid. Request a new password reset email and try again.
                    </p>
                  </div>
                </div>
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 font-mono text-[11px] text-primary hover:text-secondary transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  request new link
                </Link>
              </div>
            ) : (
              <>
                <p className="font-mono text-[11px] text-slate-300 mb-4">
                  <span className="text-primary">$</span> reset --new-password
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300"
                    >
                      new password
                    </label>
                    <div className="flex items-center gap-2 border-b border-white/10 focus-within:border-primary-400 transition-colors">
                      <Input
                        id="password"
                        type={showPw ? "text" : "password"}
                        placeholder="4–50 characters"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldError) setFieldError(null);
                        }}
                        className="flex-1 h-10 bg-transparent border-0 rounded-none px-0 text-white font-mono text-sm placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                        disabled={isLoading}
                        autoFocus
                        minLength={4}
                        maxLength={50}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="p-1 text-slate-400 hover:text-primary transition-colors"
                        aria-label={showPw ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="confirm"
                      className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300"
                    >
                      confirm password
                    </label>
                    <div className="flex items-center gap-2 border-b border-white/10 focus-within:border-primary-400 transition-colors">
                      <Input
                        id="confirm"
                        type={showPw ? "text" : "password"}
                        placeholder="re-enter password"
                        value={confirm}
                        onChange={(e) => {
                          setConfirm(e.target.value);
                          if (fieldError) setFieldError(null);
                        }}
                        className="flex-1 h-10 bg-transparent border-0 rounded-none px-0 text-white font-mono text-sm placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                        disabled={isLoading}
                        minLength={4}
                        maxLength={50}
                      />
                    </div>
                  </div>

                  {fieldError && (
                    <p className="font-mono text-[10px] text-red-400">! {fieldError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full h-11 bg-gradient-to-r from-primary via-secondary to-secondary hover:from-primary hover:via-accent hover:to-secondary text-[#052017] font-mono font-bold rounded-lg text-sm shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all duration-300 border-none flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        updating...
                      </>
                    ) : (
                      <>
                        {"> commit new_password"}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-5 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    back_to_sign_in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
