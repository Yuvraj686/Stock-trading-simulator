import { Transaction, fmtUSD } from "@/lib/marketData";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function TransactionsList({ txs }: { txs: Transaction[] }) {
  return (
    <div className="glass-card animate-fade-up">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="font-display text-base font-bold text-foreground">Recent Transactions</h3>
        <button className="text-xs font-semibold text-primary hover:text-primary-glow transition-colors">View all</button>
      </div>
      <ul className="divide-y divide-border">
        {txs.map((t) => {
          const buy = t.side === "BUY";
          return (
            <li key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-elevated/40 transition-colors">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  buy ? "bg-bull-soft text-bull" : "bg-bear-soft text-bear"
                )}
              >
                {buy ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-foreground">{t.symbol}</span>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", buy ? "text-bull" : "text-bear")}>
                    {t.side}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">{t.date}</div>
              </div>
              <div className="text-right">
                <div className="font-mono tabular-nums text-sm font-semibold text-foreground">
                  {t.qty} × {fmtUSD(t.price)}
                </div>
                <div className="font-mono tabular-nums text-[11px] text-muted-foreground">
                  {fmtUSD(t.qty * t.price)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
