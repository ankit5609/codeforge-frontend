import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, ArrowLeft, Terminal, MailCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError("Email is required");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setFieldError("Enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await api.forgotPassword(trimmed);
      setSent(true);
      toast({
        title: "Reset link sent",
        description: "Check your inbox — the link expires in 15 minutes.",
      });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : undefined;
      const msg = error instanceof Error ? error.message : "";

      if (status === 404) {
        setFieldError(msg || `No account found for ${trimmed}`);
      } else if (status === 400) {
        setFieldError(msg || "Invalid email address");
      } else if (status === 500) {
        toast({
          title: "Failed to send email",
          description: "We couldn't send the password reset email. Please try again.",
          variant: "destructive",
        });
      } else if (status === undefined) {
        toast({
          title: "Can't reach the server",
          description: "Check your connection and try again in a moment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
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
          Reset your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-secondary">
            access_
          </span>
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-sm mb-5">
          Enter the email tied to your workspace and we'll send you a secure link to set a new password.
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
              <span>auth.recover — zsh</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              secure
            </span>
          </div>

          {/* Body */}
          <div className="p-5">
            {sent ? (
              <div className="space-y-4">
                <p className="font-mono text-[11px] text-slate-300">
                  <span className="text-primary">$</span> reset --link sent
                </p>
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] p-4">
                  <MailCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-white font-semibold">Check your inbox</p>
                    <p className="font-mono text-[11px] text-slate-300 leading-relaxed">
                      We sent a password reset link to{" "}
                      <span className="text-primary">{email.trim()}</span>. The link expires in{" "}
                      <span className="text-secondary">15 minutes</span>.
                    </p>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-slate-400 leading-relaxed">
                  Didn't get it? Check your spam folder, or{" "}
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="text-primary hover:text-secondary transition-colors"
                  >
                    try another email
                  </button>
                  .
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 font-mono text-[11px] text-slate-300 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  back to sign_in
                </Link>
              </div>
            ) : (
              <>
                <p className="font-mono text-[11px] text-slate-300 mb-4">
                  <span className="text-primary">$</span> reset --email
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="email"
                      className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300"
                    >
                      email
                    </label>
                    <div
                      className={
                        "flex items-center gap-2 border-b transition-colors " +
                        (fieldError
                          ? "border-red-500/60 focus-within:border-red-400"
                          : "border-white/10 focus-within:border-primary-400")
                      }
                    >
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldError) setFieldError(null);
                        }}
                        className="flex-1 h-10 bg-transparent border-0 rounded-none px-0 text-white font-mono text-sm placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                    {fieldError && (
                      <p className="font-mono text-[10px] text-red-400 mt-1">
                        ! {fieldError}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full h-11 bg-gradient-to-r from-primary via-secondary to-secondary hover:from-primary hover:via-accent hover:to-secondary text-[#052017] font-mono font-bold rounded-lg text-sm shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all duration-300 border-none flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        sending...
                      </>
                    ) : (
                      <>
                        {"> send reset_link"}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-5 font-mono">
                  remembered it?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:text-secondary transition-colors font-semibold"
                  >
                    back_to_sign_in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
