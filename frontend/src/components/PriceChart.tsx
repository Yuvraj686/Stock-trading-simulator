import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Stock, fmtUSD, generateSeries } from "@/lib/marketData";
import { ChangeBadge } from "./ChangeBadge";
import { cn } from "@/lib/utils";

const RANGES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;
type Range = typeof RANGES[number];

const rangeConfig: Record<Range, { points: number; vol: number; trend: number }> = {
  "1D":  { points: 80,  vol: 0.008, trend: 0.0004 },
  "1W":  { points: 60,  vol: 0.014, trend: 0.0006 },
  "1M":  { points: 70,  vol: 0.020, trend: 0.0008 },
  "3M":  { points: 90,  vol: 0.026, trend: 0.0006 },
  "1Y":  { points: 120, vol: 0.034, trend: 0.0004 },
  "ALL": { points: 160, vol: 0.040, trend: 0.0003 },
};

export function PriceChart({ stock }: { stock: Stock }) {
  const [range, setRange] = useState<Range>("1D");
  const cfg = rangeConfig[range];
  const data = useMemo(
    () => generateSeries(stock.price, cfg.points, cfg.vol, stock.change >= 0 ? cfg.trend : -cfg.trend),
    [stock.symbol, range] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const positive = stock.change >= 0;
  const stroke = positive ? "hsl(var(--bull))" : "hsl(var(--bear))";

  const min = Math.min(...data.map(d => d.price));
  const max = Math.max(...data.map(d => d.price));

  return (
    <div className="glass-card p-5 lg:p-6 animate-fade-up">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated font-mono text-sm font-bold text-foreground">
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-foreground">{stock.symbol}</h2>
                <span className="text-xs text-muted-foreground">· {stock.name}</span>
              </div>
              <div className="text-xs text-muted-foreground">{stock.sector} · Mkt Cap {stock.marketCap}</div>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <div className="font-display text-3xl font-bold tabular-nums text-foreground">
              {fmtUSD(stock.price)}
            </div>
            <ChangeBadge value={stock.changePct} size="md" />
            <span className={cn("text-sm font-mono tabular-nums", positive ? "text-bull" : "text-bear")}>
              {positive ? "+" : ""}{stock.change.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold tabular-nums transition-colors",
                range === r
                  ? "bg-surface-elevated text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="t"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={40}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[min * 0.995, max * 1.005]}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              formatter={(v: number) => [fmtUSD(v), "Price"]}
            />
            <Area type="monotone" dataKey="price" stroke={stroke} strokeWidth={2.5} fill="url(#priceFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
