import { Layout } from "@/components/Layout";
import { StatGrid } from "@/components/StatGrid";
import { PriceChart } from "@/components/PriceChart";
import { PortfolioPnLChart } from "@/components/PortfolioPnLChart";
import { usePortfolio } from "@/context/PortfolioContext";

const Index = () => {
  const { selectedStock, totals } = usePortfolio();

  return (
    <Layout>
      <StatGrid totals={totals} />
      <PriceChart stock={selectedStock} />
      <PortfolioPnLChart pnl={totals.pnl} pnlPct={totals.pnlPct} />
    </Layout>
  );
};

export default Index;
