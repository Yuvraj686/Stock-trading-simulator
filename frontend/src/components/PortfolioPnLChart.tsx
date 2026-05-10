import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PORTFOLIO_HISTORY, fmtUSD } from "@/lib/marketData";
import { ChangeBadge } from "./ChangeBadge";

export function PortfolioPnLChart({ pnl, pnlPct }: { pnl: number; pnlPct: number }) {
  const data = PORTFOLIO_HISTORY;
  return (
    <div className="glass-card p-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Portfolio Performance</h3>
          <p className="text-xs text-muted-foreground">Last 60 days</p>
        </div>
        <div className="text-right">
          <div className={`font-display text-xl font-bold tabular-nums ${pnl >= 0 ? "text-bull" : "text-bear"}`}>
            {pnl >= 0 ? "+" : ""}{fmtUSD(pnl)}
          </div>
          <ChangeBadge value={pnlPct} className="mt-1" />
        </div>
      </div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pfFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} minTickGap={50} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={45} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [fmtUSD(v), "Equity"]}
            />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#pfFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
