import { Holding, fmtUSD } from "@/lib/marketData";
import { ChangeBadge } from "./ChangeBadge";
import { cn } from "@/lib/utils";

interface HoldingsTableProps {
  holdings: Holding[];
  onSelect: (symbol: string) => void;
  selected: string;
}

export function HoldingsTable({ holdings, onSelect, selected }: HoldingsTableProps) {
  return (
    <div className="glass-card animate-fade-up">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="font-display text-base font-bold text-foreground">Holdings</h3>
        <span className="text-xs text-muted-foreground">{holdings.length} positions</span>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2 font-medium">Symbol</th>
              <th className="px-3 py-2 font-medium text-right">Qty</th>
              <th className="px-3 py-2 font-medium text-right">Avg Cost</th>
              <th className="px-3 py-2 font-medium text-right">Price</th>
              <th className="px-3 py-2 font-medium text-right">Mkt Value</th>
              <th className="px-5 py-2 font-medium text-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const value = h.qty * h.price;
              const cost = h.qty * h.avgCost;
              const pnl = value - cost;
              const pct = (pnl / cost) * 100;
              const isSelected = selected === h.symbol;
              return (
                <tr
                  key={h.symbol}
                  onClick={() => onSelect(h.symbol)}
                  className={cn(
                    "cursor-pointer border-t border-border transition-colors hover:bg-surface-elevated/60",
                    isSelected && "bg-surface-elevated/80"
                  )}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-surface-elevated flex items-center justify-center font-mono text-[10px] font-bold text-foreground">
                        {h.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-mono font-semibold text-foreground">{h.symbol}</div>
                        <div className="text-[11px] text-muted-foreground">{h.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">{h.qty}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-muted-foreground">{fmtUSD(h.avgCost)}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">{fmtUSD(h.price)}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">{fmtUSD(value)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className={cn("font-mono tabular-nums font-semibold", pnl >= 0 ? "text-bull" : "text-bear")}>
                      {pnl >= 0 ? "+" : ""}{fmtUSD(pnl)}
                    </div>
                    <ChangeBadge value={pct} className="mt-0.5" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
