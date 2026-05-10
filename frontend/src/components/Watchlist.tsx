import { Stock, fmtUSD } from "@/lib/marketData";
import { ChangeBadge } from "./ChangeBadge";
import { cn } from "@/lib/utils";

interface WatchlistProps {
  stocks: Stock[];
  selected: string;
  onSelect: (symbol: string) => void;
}

export function Watchlist({ stocks, selected, onSelect }: WatchlistProps) {
  return (
    <div className="glass-card animate-fade-up">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="font-display text-base font-bold text-foreground">Markets</h3>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
          Live
        </div>
      </div>
      <ul className="max-h-[480px] overflow-y-auto scrollbar-thin">
        {stocks.map((s) => {
          const active = selected === s.symbol;
          return (
            <li key={s.symbol}>
              <button
                onClick={() => onSelect(s.symbol)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 border-l-2 px-5 py-3 text-left transition-colors",
                  active
                    ? "border-primary bg-surface-elevated/80"
                    : "border-transparent hover:bg-surface-elevated/40"
                )}
              >
                <div className="min-w-0">
                  <div className="font-mono font-semibold text-foreground">{s.symbol}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{s.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono tabular-nums text-sm font-semibold text-foreground">{fmtUSD(s.price)}</div>
                  <ChangeBadge value={s.changePct} className="mt-0.5" />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
