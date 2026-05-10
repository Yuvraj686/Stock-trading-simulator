import { ArrowUpRight, Wallet, TrendingUp, PieChart, Coins, X } from "lucide-react";
import { ChangeBadge } from "./ChangeBadge";
import { fmtUSD } from "@/lib/marketData";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  changePct?: number;
  icon: React.ElementType;
  spark?: { v: number }[];
  tone?: "primary" | "bull" | "bear" | "neutral";
  onClick?: () => void;
  detailContent?: React.ReactNode;
}

function StatCard({ label, value, sub, changePct, icon: Icon, spark, tone = "neutral", onClick, detailContent }: StatCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const sparkColor =
    tone === "bear" ? "hsl(var(--bear))"
    : tone === "primary" ? "hsl(var(--primary))"
    : "hsl(var(--bull))";

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDetail(true);
    }
  };

  return (
    <>
      <div
        className="glass-card relative overflow-hidden p-5 animate-fade-up cursor-pointer group transition-all hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98]"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
            <div className="font-display text-2xl font-bold tabular-nums text-foreground">{value}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {changePct !== undefined && <ChangeBadge value={changePct} />}
              {sub && <span>{sub}</span>}
            </div>
          </div>
          <div className="rounded-lg bg-surface-elevated p-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${sparkColor}15, transparent 70%)` }}
        />
      </div>

      {/* Detail overlay */}
      {showDetail && detailContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetail(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 glass-card overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">{label}</h3>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">{detailContent}</div>
          </div>
        </div>
      )}
    </>
  );
}

const spark = (seed: number, trend = 1) =>
  Array.from({ length: 24 }, (_, i) => ({ v: Math.sin(i / 3 + seed) * 10 + i * trend + 50 + Math.random() * 4 }));

export function StatGrid({ totals }: { totals: { equity: number; cash: number; pnl: number; pnlPct: number; dayPnl: number; dayPnlPct: number } }) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Portfolio Value"
        value={fmtUSD(totals.equity + totals.cash)}
        changePct={totals.dayPnlPct}
        sub="today"
        icon={Wallet}
        spark={spark(1, 0.6)}
        tone="primary"
        detailContent={
          <div className="space-y-4">
            <div className="rounded-xl bg-surface p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Value</div>
              <div className="font-display text-2xl font-bold tabular-nums text-foreground mt-1">{fmtUSD(totals.equity + totals.cash)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Holdings</div>
                <div className="font-display text-lg font-bold tabular-nums text-foreground mt-1">{fmtUSD(totals.equity)}</div>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Cash</div>
                <div className="font-display text-lg font-bold tabular-nums text-foreground mt-1">{fmtUSD(totals.cash)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Today's Change</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-semibold ${totals.dayPnl >= 0 ? "text-bull" : "text-bear"}`}>
                  {totals.dayPnl >= 0 ? "+" : ""}{fmtUSD(totals.dayPnl)}
                </span>
                <ChangeBadge value={totals.dayPnlPct} />
              </div>
            </div>
          </div>
        }
      />
      <StatCard
        label="Total P&L"
        value={fmtUSD(totals.pnl)}
        changePct={totals.pnlPct}
        sub="all time"
        icon={TrendingUp}
        spark={spark(2, totals.pnl >= 0 ? 0.8 : -0.6)}
        tone={totals.pnl >= 0 ? "bull" : "bear"}
        detailContent={
          <div className="space-y-4">
            <div className="rounded-xl bg-surface p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Profit / Loss</div>
              <div className={`font-display text-2xl font-bold tabular-nums mt-1 ${totals.pnl >= 0 ? "text-bull" : "text-bear"}`}>
                {totals.pnl >= 0 ? "+" : ""}{fmtUSD(totals.pnl)}
              </div>
              <ChangeBadge value={totals.pnlPct} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</div>
                <div className={`font-display text-lg font-bold tabular-nums mt-1 ${totals.dayPnl >= 0 ? "text-bull" : "text-bear"}`}>
                  {totals.dayPnl >= 0 ? "+" : ""}{fmtUSD(totals.dayPnl)}
                </div>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">All Time</div>
                <div className={`font-display text-lg font-bold tabular-nums mt-1 ${totals.pnl >= 0 ? "text-bull" : "text-bear"}`}>
                  {totals.pnl >= 0 ? "+" : ""}{fmtUSD(totals.pnl)}
                </div>
              </div>
            </div>
          </div>
        }
      />
      <StatCard
        label="Holdings Equity"
        value={fmtUSD(totals.equity)}
        sub={`across positions`}
        icon={PieChart}
        spark={spark(3, 0.4)}
        tone="bull"
        onClick={() => navigate("/holdings")}
      />
      <StatCard
        label="Cash Balance"
        value={fmtUSD(totals.cash)}
        sub="available to trade"
        icon={Coins}
        spark={spark(4, 0)}
        tone="neutral"
        detailContent={
          <div className="space-y-4">
            <div className="rounded-xl bg-surface p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Available Cash</div>
              <div className="font-display text-2xl font-bold tabular-nums text-foreground mt-1">{fmtUSD(totals.cash)}</div>
            </div>
            <div className="rounded-xl bg-surface p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">% of Portfolio</span>
                <span className="font-mono font-semibold text-foreground">
                  {((totals.cash / (totals.equity + totals.cash)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full gradient-primary transition-all"
                  style={{ width: `${((totals.cash / (totals.equity + totals.cash)) * 100)}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Use the <span className="font-semibold text-primary">Deposit</span> button in the top bar to add more funds.
            </p>
          </div>
        }
      />
    </div>
  );
}
