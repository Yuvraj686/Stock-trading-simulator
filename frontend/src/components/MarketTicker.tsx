import { STOCKS, fmtUSD } from "@/lib/marketData";

export function MarketTicker() {
  // duplicate for seamless scroll
  const items = [...STOCKS, ...STOCKS];
  return (
    <div className="relative overflow-hidden border-y border-border bg-surface/60 backdrop-blur">
      <div className="flex animate-ticker whitespace-nowrap py-2.5">
        {items.map((s, i) => {
          const positive = s.change >= 0;
          return (
            <div key={i} className="flex items-center gap-2 px-6 text-sm">
              <span className="font-mono font-semibold text-foreground">{s.symbol}</span>
              <span className="font-mono tabular-nums text-muted-foreground">{fmtUSD(s.price)}</span>
              <span className={`font-mono tabular-nums text-xs ${positive ? "text-bull" : "text-bear"}`}>
                {positive ? "▲" : "▼"} {Math.abs(s.changePct).toFixed(2)}%
              </span>
              <span className="text-border">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
