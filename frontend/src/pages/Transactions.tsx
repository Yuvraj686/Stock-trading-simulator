import { Layout } from "@/components/Layout";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtUSD } from "@/lib/marketData";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

type Filter = "ALL" | "BUY" | "SELL";

export default function Transactions() {
  const { txs } = usePortfolio();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      txs.filter(
        (t) =>
          (filter === "ALL" || t.side === filter) &&
          (q === "" || t.symbol.toLowerCase().includes(q.toLowerCase()))
      ),
    [txs, filter, q]
  );

  const buyVol = txs.filter((t) => t.side === "BUY").reduce((a, t) => a + t.qty * t.price, 0);
  const sellVol = txs.filter((t) => t.side === "SELL").reduce((a, t) => a + t.qty * t.price, 0);

  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total Trades" value={String(txs.length)} />
        <Stat label="Buy Volume" value={fmtUSD(buyVol)} tone="bull" />
        <Stat label="Sell Volume" value={fmtUSD(sellVol)} tone="bear" />
      </div>

      <div className="glass-card animate-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
          <h3 className="font-display text-base font-bold text-foreground">Order History</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Symbol…"
                className="w-28 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/70"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
              {(["ALL", "BUY", "SELL"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                    filter === f
                      ? "bg-surface-elevated text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Symbol</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium text-right">Price</th>
                <th className="px-3 py-2 font-medium text-right">Total</th>
                <th className="px-5 py-2 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const buy = t.side === "BUY";
                return (
                  <tr key={t.id} className="border-t border-border hover:bg-surface-elevated/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", buy ? "bg-bull-soft text-bull" : "bg-bear-soft text-bear")}>
                          {buy ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <span className={cn("text-[11px] font-bold uppercase tracking-wider", buy ? "text-bull" : "text-bear")}>
                          {t.side}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono font-semibold text-foreground">{t.symbol}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">{t.qty}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-muted-foreground">{fmtUSD(t.price)}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold text-foreground">{fmtUSD(t.qty * t.price)}</td>
                    <td className="px-5 py-3 text-right text-xs text-muted-foreground">{t.date}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" }) {
  return (
    <div className="glass-card p-5 animate-fade-up">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn(
        "mt-2 font-display text-2xl font-bold tabular-nums",
        tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "text-foreground"
      )}>
        {value}
      </div>
    </div>
  );
}
