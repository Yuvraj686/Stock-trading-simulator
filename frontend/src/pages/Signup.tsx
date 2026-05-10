import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail ?? "Registration failed");
      }
      // Supabase returns { user, session } — log them in immediately if session exists
      if (data.session?.access_token) {
        localStorage.setItem("token", data.session.access_token);
        localStorage.setItem("user", JSON.stringify(data.user ?? {}));
        toast.success("Account created! Welcome to Tradr.");
        navigate("/");
      } else {
        // Supabase email confirmation might be enabled
        toast.success("Account created! Check your email to confirm, then sign in.");
        navigate("/login");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "var(--gradient-glow)" }}
      />

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Activity className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-bold leading-none text-foreground">Tradr</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              Stock Market Simulator
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h1 className="font-display text-xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start paper trading with $100,000 virtual cash.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set("password")}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-11 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </label>
              <input
                type={showPwd ? "text" : "password"}
                required
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={set("confirm")}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Password strength hint */}
            {form.password.length > 0 && (
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      form.password.length >= (i + 1) * 3
                        ? i < 2 ? "bg-bear" : i === 2 ? "bg-warning" : "bg-bull"
                        : "bg-border"
                    }`}
                  />
                ))}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full gradient-primary py-6 text-base font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition-all"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Tradr · Paper trading simulator · Prices are simulated and do not reflect real markets.
        </p>
      </div>
    </div>
  );
}
