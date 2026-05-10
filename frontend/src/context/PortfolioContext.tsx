import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { HOLDINGS, STOCKS, TRANSACTIONS, type Holding, type Transaction, type Stock } from "@/lib/marketData";

interface Totals {
  equity: number;
  cash: number;
  pnl: number;
  pnlPct: number;
  dayPnl: number;
  dayPnlPct: number;
}

interface PortfolioContextValue {
  holdings: Holding[];
  txs: Transaction[];
  cash: number;
  selectedSymbol: string;
  setSelectedSymbol: (s: string) => void;
  selectedStock: Stock;
  totals: Totals;
  ownedQty: number;
  handleTrade: (side: "BUY" | "SELL", qty: number, price: number) => void;
  deposit: (amount: number) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [holdings, setHoldings] = useState<Holding[]>(HOLDINGS);
  const [txs, setTxs] = useState<Transaction[]>(TRANSACTIONS);
  const [cash, setCash] = useState<number>(38_240.55);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NVDA");

  const selectedStock = useMemo(
    () => STOCKS.find((s) => s.symbol === selectedSymbol) ?? STOCKS[0],
    [selectedSymbol]
  );

  const totals = useMemo<Totals>(() => {
    const equity = holdings.reduce((acc, h) => acc + h.qty * h.price, 0);
    const cost = holdings.reduce((acc, h) => acc + h.qty * h.avgCost, 0);
    const pnl = equity - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    const dayPnl = holdings.reduce((acc, h) => {
      const stk = STOCKS.find((s) => s.symbol === h.symbol);
      return acc + (stk ? stk.change * h.qty : 0);
    }, 0);
    const dayPnlPct = equity > 0 ? (dayPnl / equity) * 100 : 0;
    return { equity, pnl, pnlPct, dayPnl, dayPnlPct, cash };
  }, [holdings, cash]);

  const ownedQty = holdings.find((h) => h.symbol === selectedSymbol)?.qty ?? 0;

  const handleTrade = (side: "BUY" | "SELL", qty: number, price: number) => {
    const total = qty * price;
    setHoldings((prev) => {
      const idx = prev.findIndex((h) => h.symbol === selectedStock.symbol);
      if (side === "BUY") {
        if (idx === -1) {
          return [
            ...prev,
            { symbol: selectedStock.symbol, name: selectedStock.name, qty, avgCost: price, price: selectedStock.price },
          ];
        }
        const existing = prev[idx];
        const newQty = existing.qty + qty;
        const newAvg = (existing.avgCost * existing.qty + price * qty) / newQty;
        const next = [...prev];
        next[idx] = { ...existing, qty: newQty, avgCost: newAvg };
        return next;
      }
      if (idx === -1) return prev;
      const existing = prev[idx];
      const newQty = existing.qty - qty;
      if (newQty <= 0) return prev.filter((_, i) => i !== idx);
      const next = [...prev];
      next[idx] = { ...existing, qty: newQty };
      return next;
    });
    setCash((c) => c + (side === "SELL" ? total : -total));
    setTxs((prev) => [
      {
        id: `t${Date.now()}`,
        symbol: selectedStock.symbol,
        side,
        qty,
        price,
        date: new Date().toLocaleString([], { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
  };

  const deposit = (amount: number) => {
    setCash((c) => c + amount);
  };

  return (
    <PortfolioContext.Provider
      value={{ holdings, txs, cash, selectedSymbol, setSelectedSymbol, selectedStock, totals, ownedQty, handleTrade, deposit }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
