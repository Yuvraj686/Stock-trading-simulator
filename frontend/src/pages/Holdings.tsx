import { Layout } from "@/components/Layout";
import { HoldingsTable } from "@/components/HoldingsTable";
import { TradePanel } from "@/components/TradePanel";
import { PriceChart } from "@/components/PriceChart";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtUSD } from "@/lib/marketData";
import { ChangeBadge } from "@/components/ChangeBadge";

export default function Holdings() {
  const { holdings, selectedSymbol, setSelectedSymbol, selectedStock, cash, ownedQty, handleTrade, totals } = usePortfolio();

  const winners = holdings.filter((h) => h.price >= h.avgCost).length;
  const losers = holdings.length - winners;
  const bestPos = [...holdings].sort((a, b) => (b.price - b.avgCost) * b.qty - (a.price - a.avgCost) * a.qty)[0];
  const worstPos = [...holdings].sort((a, b) => (a.price - a.avgCost) * a.qty - (b.price - b.avgCost) * b.qty)[0];

  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-4">
        <Tile label="Positions" value={String(holdings.length)} sub={`${winners} up · ${losers} down`} />
        <Tile label="Equity" value={fmtUSD(totals.equity)} sub="across positions" />
        <Tile
          label="Best Position"
          value={bestPos?.symbol ?? "—"}
          sub={bestPos ? `${fmtUSD((bestPos.price - bestPos.avgCost) * bestPos.qty)}` : ""}
          pct={bestPos ? ((bestPos.price - bestPos.avgCost) / bestPos.avgCost) * 100 : undefined}
        />
        <Tile
          label="Worst Position"
          value={worstPos?.symbol ?? "—"}
          sub={worstPos ? `${fmtUSD((worstPos.price - worstPos.avgCost) * worstPos.qty)}` : ""}
          pct={worstPos ? ((worstPos.price - worstPos.avgCost) / worstPos.avgCost) * 100 : undefined}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6 min-w-0">
          <HoldingsTable holdings={holdings} onSelect={setSelectedSymbol} selected={selectedSymbol} />
          <PriceChart stock={selectedStock} />
        </div>
        <TradePanel stock={selectedStock} cash={cash} onTrade={handleTrade} ownedQty={ownedQty} />
      </div>
    </Layout>
  );
}

function Tile({ label, value, sub, pct }: { label: string; value: string; sub?: string; pct?: number }) {
  return (
    <div className="glass-card p-5 animate-fade-up">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-xl font-bold tabular-nums text-foreground">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {pct !== undefined && <ChangeBadge value={pct} />}
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}
