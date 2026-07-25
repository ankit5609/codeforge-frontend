import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ArrowRight, ArrowLeft, ShieldAlert } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { AuthLayout, AuthCard } from "@/components/auth/AuthLayout";
import { FieldPassword, SolidButton } from "@/components/LoginModal";
import { useToast } from "@/hooks/use-toast";
export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
    const navigate = useNavigate();
    const { toast } = useToast();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [fieldError, setFieldError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const tokenMissing = !token;
    const handleSubmit = async (e) => {
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
        }
        catch (error) {
            const status = error instanceof ApiError ? error.status : undefined;
            const msg = error instanceof Error ? error.message : "";
            if (status === 400) {
                setFieldError(msg || "Invalid or expired password reset token");
            }
            else if (status === undefined) {
                toast({
                    title: "Can't reach the server",
                    description: "Check your connection and try again in a moment.",
                    variant: "destructive",
                });
            }
            else {
                toast({
                    title: "Couldn't reset password",
                    description: msg && msg.length < 120 ? msg : "Please try again shortly.",
                    variant: "destructive",
                });
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<AuthLayout eyebrow="// New password" heading={<>
          Set a new{" "}
          <span style={{
                background: "linear-gradient(120deg, #FF5A2E 0%, #FF8A5E 45%, #E8B84B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
            }}>
            password.
          </span>
        </>} description="Create a new secure password to regain access to your workspace. Your reset link is valid for 15 minutes and can only be used once." badges={["one-time use", "15 minute window", "encrypted at rest"]}>
      <AuthCard>
        {tokenMissing ? (<div className="space-y-5">
            <div className="flex items-start gap-3 rounded-[12px] p-4" style={{
                background: "rgba(255,90,46,0.06)",
                border: "1px solid rgba(255,90,46,0.25)",
            }}>
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--lp-ember)" }}/>
              <div className="space-y-1">
                <p className="text-[14px] font-semibold" style={{ color: "var(--lp-ink)" }}>
                  Missing reset token
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>
                  This link is invalid or incomplete. Request a new password reset email and try again.
                </p>
              </div>
            </div>
            <Link to="/forgot-password" className="inline-flex items-center gap-2 text-[13px] font-semibold hover:underline" style={{ color: "var(--lp-brass)" }}>
              Request new link
              <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>) : (<>
            <form onSubmit={handleSubmit} className="space-y-[16px]">
              <FieldPassword id="password" label="New password" autoComplete="new-password" value={password} onChange={(v) => {
                setPassword(v);
                if (fieldError)
                    setFieldError(null);
            }} disabled={isLoading} show={showPw} onToggleShow={() => setShowPw((v) => !v)}/>
              <FieldPassword id="confirm" label="Confirm password" autoComplete="new-password" value={confirm} onChange={(v) => {
                setConfirm(v);
                if (fieldError)
                    setFieldError(null);
            }} disabled={isLoading} show={showPw} onToggleShow={() => setShowPw((v) => !v)}/>

              {fieldError && (<p className="text-[12px]" style={{ color: "#ff7a5c" }}>
                  {fieldError}
                </p>)}

              <SolidButton disabled={isLoading} type="submit">
                {isLoading ? (<>
                    <Loader2 className="w-4 h-4 animate-spin"/>
                    Updating…
                  </>) : (<>
                    Update password
                    <ArrowRight className="w-4 h-4"/>
                  </>)}
              </SolidButton>
            </form>

            <p className="text-center mt-5 text-[14px]" style={{ color: "var(--lp-ink-faint)" }}>
              <Link to="/login" className="inline-flex items-center gap-1.5 font-bold hover:underline" style={{ color: "var(--lp-brass)" }}>
                <ArrowLeft className="w-3.5 h-3.5"/>
                Back to sign in
              </Link>
            </p>
          </>)}
      </AuthCard>
    </AuthLayout>);
}
