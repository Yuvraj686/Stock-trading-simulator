import { Layout } from "@/components/Layout";
import { StatGrid } from "@/components/StatGrid";
import { PortfolioPnLChart } from "@/components/PortfolioPnLChart";
import { HoldingsTable } from "@/components/HoldingsTable";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtUSD } from "@/lib/marketData";
import { ChangeBadge } from "@/components/ChangeBadge";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Distinct, vibrant colors for pie chart — each stock is easily distinguishable
const COLORS = [
  "#6366f1", // indigo
  "#22c55e", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
  "#3b82f6", // blue
];

export default function Portfolio() {
  const { holdings, totals, setSelectedSymbol, selectedSymbol } = usePortfolio();

  const allocation = holdings.map((h) => ({
    name: h.symbol,
    value: +(h.qty * h.price).toFixed(2),
  }));

  return (
    <Layout>
      <StatGrid totals={totals} />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <PortfolioPnLChart pnl={totals.pnl} pnlPct={totals.pnlPct} />

        <div className="glass-card p-5 animate-fade-up">
          <h3 className="font-display text-base font-bold text-foreground">Allocation</h3>
          <p className="text-xs text-muted-foreground">By market value</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {allocation.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [fmtUSD(v), "Value"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {allocation.map((a, i) => {
              const pct = ((a.value / totals.equity) * 100).toFixed(1);
              return (
                <li key={a.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="font-mono font-semibold text-foreground">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono tabular-nums text-muted-foreground">{fmtUSD(a.value)}</span>
                    <span className="font-mono tabular-nums text-foreground w-10 text-right">{pct}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCell label="Total Equity" value={fmtUSD(totals.equity + totals.cash)} sub="cash + holdings" />
        <SummaryCell label="Realized + Unrealized P&L" value={`${totals.pnl >= 0 ? "+" : ""}${fmtUSD(totals.pnl)}`} pct={totals.pnlPct} />
        <SummaryCell label="Today's P&L" value={`${totals.dayPnl >= 0 ? "+" : ""}${fmtUSD(totals.dayPnl)}`} pct={totals.dayPnlPct} />
      </div>

      <HoldingsTable holdings={holdings} onSelect={setSelectedSymbol} selected={selectedSymbol} />
    </Layout>
  );
}

function SummaryCell({ label, value, sub, pct }: { label: string; value: string; sub?: string; pct?: number }) {
  return (
    <div className="glass-card p-5 animate-fade-up">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {pct !== undefined && <ChangeBadge value={pct} />}
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}
