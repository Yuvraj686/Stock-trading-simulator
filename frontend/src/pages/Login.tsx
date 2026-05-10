import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Invalid credentials");
      }
      const data = await res.json();
      // Supabase auth returns { user, session } — token is in session
      const token = data.session?.access_token ?? data.access_token ?? "";
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user ?? {}));
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Gradient background blob */}
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
          <h1 className="font-display text-xl font-bold text-foreground">Sign in to your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back — pick up where you left off.
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full gradient-primary py-6 text-base font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition-all"
            >
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Create one
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
