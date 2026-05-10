import { Layout } from "@/components/Layout";
import { PriceChart } from "@/components/PriceChart";
import { TradePanel } from "@/components/TradePanel";
import { ChangeBadge } from "@/components/ChangeBadge";
import { STOCKS, fmtUSD } from "@/lib/marketData";
import { usePortfolio } from "@/context/PortfolioContext";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTORS = ["All", ...Array.from(new Set(STOCKS.map((s) => s.sector)))];

export default function Markets() {
  const { selectedSymbol, setSelectedSymbol, selectedStock, holdings, cash, handleTrade } = usePortfolio();
  const [sector, setSector] = useState("All");
  const [q, setQ] = useState("");
  const [orderOpen, setOrderOpen] = useState(false);

  const filtered = useMemo(
    () =>
      STOCKS.filter(
        (s) =>
          (sector === "All" || s.sector === sector) &&
          (q === "" ||
            s.symbol.toLowerCase().includes(q.toLowerCase()) ||
            s.name.toLowerCase().includes(q.toLowerCase()))
      ),
    [sector, q]
  );

  const gainers = [...STOCKS].sort((a, b) => b.changePct - a.changePct).slice(0, 3);
  const losers = [...STOCKS].sort((a, b) => a.changePct - b.changePct).slice(0, 3);

  const ownedQty = holdings.find((h) => h.symbol === selectedSymbol)?.qty ?? 0;

  const pickStock = (sym: string) => {
    setSelectedSymbol(sym);
    setOrderOpen(true);
  };

  return (
    <Layout>
      {/* Movers */}
      <div className="grid gap-4 md:grid-cols-2">
        <MoversCard title="Top Gainers" stocks={gainers} tone="bull" onSelect={pickStock} />
        <MoversCard title="Top Losers"  stocks={losers}  tone="bear" onSelect={pickStock} />
      </div>

      {/* Chart + (conditional) Order panel */}
      {orderOpen ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px] animate-fade-up">
          <div className="min-w-0">
            <PriceChart stock={selectedStock} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Place an order</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOrderOpen(false)}
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Close
              </Button>
            </div>
            <TradePanel stock={selectedStock} cash={cash} onTrade={handleTrade} ownedQty={ownedQty} />
          </div>
        </div>
      ) : (
        <PriceChart stock={selectedStock} />
      )}

      {/* All Markets table */}
      <div className="glass-card animate-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
          <h3 className="font-display text-base font-bold text-foreground">All Markets</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter…"
                className="w-32 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/70"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
              {SECTORS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSector(s)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                    sector === s
                      ? "bg-surface-elevated text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2 font-medium">Symbol</th>
                <th className="px-3 py-2 font-medium">Sector</th>
                <th className="px-3 py-2 font-medium text-right">Price</th>
                <th className="px-3 py-2 font-medium text-right">Change</th>
                <th className="px-5 py-2 font-medium text-right">Mkt Cap</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const active = selectedSymbol === s.symbol;
                return (
                  <tr
                    key={s.symbol}
                    onClick={() => pickStock(s.symbol)}
                    className={cn(
                      "cursor-pointer border-t border-border transition-colors hover:bg-surface-elevated/60",
                      active && "bg-surface-elevated/80"
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-surface-elevated flex items-center justify-center font-mono text-[10px] font-bold text-foreground">
                          {s.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-foreground">{s.symbol}</div>
                          <div className="text-[11px] text-muted-foreground">{s.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{s.sector}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">{fmtUSD(s.price)}</td>
                    <td className="px-3 py-3 text-right">
                      <ChangeBadge value={s.changePct} />
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-muted-foreground">{s.marketCap}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function MoversCard({
  title, stocks, tone, onSelect,
}: { title: string; stocks: typeof STOCKS; tone: "bull" | "bear"; onSelect: (s: string) => void }) {
  return (
    <div className="glass-card p-5 animate-fade-up">
      <h3 className="font-display text-base font-bold text-foreground mb-3">{title}</h3>
      <ul className="space-y-2">
        {stocks.map((s) => (
          <li key={s.symbol}>
            <button
              onClick={() => onSelect(s.symbol)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-surface/50 px-3 py-2 hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", tone === "bull" ? "bg-bull" : "bg-bear")} />
                <span className="font-mono font-semibold text-foreground text-sm">{s.symbol}</span>
                <span className="text-[11px] text-muted-foreground">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums text-sm text-foreground">{fmtUSD(s.price)}</span>
                <ChangeBadge value={s.changePct} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
