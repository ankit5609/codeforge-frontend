import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, ArrowLeft, Mail, MailCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { AuthLayout, AuthCard } from "@/components/auth/AuthLayout";
import { FieldShell, SolidButton } from "@/components/LoginModal";
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
    <AuthLayout
      eyebrow="// Recover access"
      heading={
        <>
          Forgot your{" "}
          <span
            style={{
              background: "linear-gradient(120deg, #FF5A2E 0%, #FF8A5E 45%, #E8B84B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            password?
          </span>
        </>
      }
      description="Enter the email tied to your workspace and we'll send you a secure link to set a new password."
      badges={["one-time link", "expires in 15 minutes", "encrypted delivery"]}
    >
      <AuthCard>
        {sent ? (
          <div className="space-y-5">
            <div
              className="flex items-start gap-3 rounded-[12px] p-4"
              style={{
                background: "rgba(69,196,184,0.06)",
                border: "1px solid rgba(69,196,184,0.25)",
              }}
            >
              <MailCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--lp-teal)" }} />
              <div className="space-y-1">
                <p className="text-[14px] font-semibold" style={{ color: "var(--lp-ink)" }}>
                  Check your inbox
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>
                  We sent a password reset link to{" "}
                  <span style={{ color: "var(--lp-brass)" }}>{email.trim()}</span>. The link expires
                  in <span style={{ color: "var(--lp-teal)" }}>15 minutes</span>.
                </p>
              </div>
            </div>
            <p className="text-[13px]" style={{ color: "var(--lp-ink-faint)" }}>
              Didn't get it? Check your spam folder, or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-semibold hover:underline"
                style={{ color: "var(--lp-brass)" }}
              >
                try another email
              </button>
              .
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[13px] font-semibold hover:underline"
              style={{ color: "var(--lp-brass)" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-[16px]">
              <div>
                <label
                  htmlFor="email"
                  className="block font-mono uppercase mb-2"
                  style={{
                    fontSize: "10.5px",
                    letterSpacing: "0.12em",
                    color: "var(--lp-ink-faint)",
                  }}
                >
                  Email
                </label>
                <FieldShell icon={<Mail className="w-4 h-4" />}>
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldError) setFieldError(null);
                    }}
                    disabled={isLoading}
                    autoFocus
                    className="lp-input"
                  />
                </FieldShell>
                {fieldError && (
                  <p className="mt-2 text-[12px]" style={{ color: "#ff7a5c" }}>
                    {fieldError}
                  </p>
                )}
              </div>

              <SolidButton disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </SolidButton>
            </form>

            <p className="text-center mt-5 text-[14px]" style={{ color: "var(--lp-ink-faint)" }}>
              Remembered it?{" "}
              <Link
                to="/login"
                className="font-bold hover:underline"
                style={{ color: "var(--lp-brass)" }}
              >
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
