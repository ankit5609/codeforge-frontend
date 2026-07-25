import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowRight, User, Check } from "lucide-react";
import { api, setAuthToken, setUserInfo } from "@/lib/api";
import { AuthLayout, AuthCard } from "@/components/auth/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import {
  FieldEmail,
  FieldPassword,
  FieldShell,
  SolidButton,
  OutlineButton,
  Divider,
  GoogleIcon,
} from "@/components/LoginModal";

function scorePassword(pw: string) {
  let s = 0;
  if (!pw) return 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const STRENGTH = [
  { label: "Too short", color: "#545D6E" },
  { label: "Weak", color: "#FF5A2E" },
  { label: "Fair", color: "#E8B84B" },
  { label: "Strong", color: "#45C4B8" },
  { label: "Excellent", color: "#45C4B8" },
];

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const strength = useMemo(() => scorePassword(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Missing details", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.signup({ name, username: email, password });
      setAuthToken(response.token);
      setUserInfo(response.user);
      toast({ title: "Welcome!", description: "Account created successfully" });
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

  const steps = [
    { n: "01", label: "Create account", active: true },
    { n: "02", label: "Choose a plan", active: false },
    { n: "03", label: "Start building", active: false },
  ];

  const tracker = (
    <div className="flex items-center flex-wrap gap-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className="font-mono flex items-center justify-center rounded-md"
              style={{
                width: 22,
                height: 22,
                fontSize: 11,
                background: s.active ? "var(--lp-ember)" : "rgba(255,255,255,0.04)",
                color: s.active ? "#160800" : "var(--lp-ink-faint)",
                border: s.active ? "1px solid var(--lp-ember)" : "1px solid var(--lp-border)",
              }}
            >
              {s.n}
            </span>
            <span
              className="text-[13px]"
              style={{ color: s.active ? "var(--lp-ink)" : "var(--lp-ink-dim)", fontWeight: s.active ? 600 : 400 }}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && <span style={{ color: "var(--lp-ink-faint)" }}>→</span>}
        </div>
      ))}
    </div>
  );

  return (
    <AuthLayout
      eyebrow="// Create your workspace"
      heading={
        <>
          Turn your idea into a{" "}
          <span
            style={{
              background: "linear-gradient(120deg, #FF5A2E 0%, #FF8A5E 45%, #E8B84B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            running app.
          </span>
        </>
      }
      description="Create your account, then choose a plan to start building."
      badges={["free to start", "no credit card", "cancel anytime"]}
      aside={tracker}
    >
      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <div>
            <label
              htmlFor="name"
              className="block font-mono uppercase mb-2"
              style={{ fontSize: "10.5px", letterSpacing: "0.12em", color: "var(--lp-ink-faint)" }}
            >
              Name
            </label>
            <FieldShell icon={<User className="w-4 h-4" />}>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="lp-input"
              />
            </FieldShell>
          </div>

          <FieldEmail value={email} onChange={setEmail} disabled={isLoading} />

          <div>
            <FieldPassword
              value={password}
              onChange={setPassword}
              disabled={isLoading}
              show={showPassword}
              onToggleShow={() => setShowPassword((s) => !s)}
              autoComplete="new-password"
            />
            <div className="mt-2.5">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="flex-1 h-1 rounded-full transition-colors"
                    style={{
                      background: i < strength ? STRENGTH[strength].color : "rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
              </div>
              <div
                className="flex items-center justify-between mt-1.5 font-mono"
                style={{ fontSize: 11, color: "var(--lp-ink-faint)" }}
              >
                <span>{password ? STRENGTH[strength].label : "at least 8 characters"}</span>
                {password && strength >= 3 && (
                  <span className="flex items-center gap-1" style={{ color: "var(--lp-teal)" }}>
                    <Check className="w-3 h-3" /> looks good
                  </span>
                )}
              </div>
            </div>
          </div>

          <SolidButton disabled={isLoading} type="submit">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating your account…
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </SolidButton>
        </form>

        <Divider />

        <OutlineButton
          onClick={() =>
            toast({ title: "Google Authentication", description: "Google OAuth integration is ready for connection." })
          }
        >
          <GoogleIcon />
          Continue with Google
        </OutlineButton>

        <p className="text-center mt-5 text-[14px]" style={{ color: "var(--lp-ink-faint)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-bold hover:underline" style={{ color: "var(--lp-brass)" }}>
            Log in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

