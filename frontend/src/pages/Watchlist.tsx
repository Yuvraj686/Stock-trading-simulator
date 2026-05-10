import { Layout } from "@/components/Layout";
import { Watchlist } from "@/components/Watchlist";
import { PriceChart } from "@/components/PriceChart";
import { TradePanel } from "@/components/TradePanel";
import { STOCKS } from "@/lib/marketData";
import { usePortfolio } from "@/context/PortfolioContext";

export default function WatchlistPage() {
  const { selectedSymbol, setSelectedSymbol, selectedStock, cash, ownedQty, handleTrade } = usePortfolio();

  return (
    <Layout>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr_360px]">
        <Watchlist stocks={STOCKS} selected={selectedSymbol} onSelect={setSelectedSymbol} />
        <div className="min-w-0">
          <PriceChart stock={selectedStock} />
        </div>
        <TradePanel stock={selectedStock} cash={cash} onTrade={handleTrade} ownedQty={ownedQty} />
      </div>
    </Layout>
  );
}
