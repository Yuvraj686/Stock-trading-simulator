import { useState } from "react";
import { Stock, fmtUSD } from "@/lib/marketData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Wallet, Zap } from "lucide-react";
import { toast } from "sonner";

interface TradePanelProps {
  stock: Stock;
  cash: number;
  onTrade: (side: "BUY" | "SELL", qty: number, price: number) => void;
  ownedQty: number;
}

export function TradePanel({ stock, cash, onTrade, ownedQty }: TradePanelProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [qty, setQty] = useState<number>(1);
  const [limit, setLimit] = useState<number>(stock.price);

  const price = orderType === "MARKET" ? stock.price : limit;
  const total = price * qty;
  const exceedsCash = side === "BUY" && total > cash;
  const exceedsHoldings = side === "SELL" && qty > ownedQty;
  const disabled = qty <= 0 || exceedsCash || exceedsHoldings;

  const submit = () => {
    onTrade(side, qty, price);
    toast.success(`${side === "BUY" ? "Bought" : "Sold"} ${qty} ${stock.symbol} @ ${fmtUSD(price)}`);
    setQty(1);
  };

  return (
    <div className="glass-card p-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground">Place Order</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" />
          <span className="tabular-nums">{fmtUSD(cash)}</span>
        </div>
      </div>

      {/* Side toggle */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface p-1">
        <button
          onClick={() => setSide("BUY")}
          className={cn(
            "rounded-md py-2 text-sm font-semibold transition-colors",
            side === "BUY" ? "bg-bull text-bull-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("SELL")}
          className={cn(
            "rounded-md py-2 text-sm font-semibold transition-colors",
            side === "SELL" ? "bg-bear text-bear-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div className="mt-4 flex items-center gap-2 text-xs">
        {(["MARKET", "LIMIT"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={cn(
              "rounded-full border px-3 py-1 font-semibold transition-colors",
              orderType === t
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Quantity</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono tabular-nums text-foreground outline-none focus:border-primary/40"
            />
            <div className="flex gap-1">
              {[10, 25, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setQty(n)}
                  className="rounded-md border border-border bg-surface px-2 py-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {orderType === "LIMIT" && (
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Limit Price</label>
            <input
              type="number"
              value={limit}
              step="0.01"
              onChange={(e) => setLimit(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono tabular-nums text-foreground outline-none focus:border-primary/40"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <dl className="mt-4 space-y-2 rounded-lg border border-border bg-surface/60 p-3 text-sm">
        <div className="flex justify-between"><dt className="text-muted-foreground">Market price</dt><dd className="font-mono tabular-nums text-foreground">{fmtUSD(stock.price)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Owned</dt><dd className="font-mono tabular-nums text-foreground">{ownedQty}</dd></div>
        <div className="flex justify-between border-t border-border pt-2"><dt className="font-semibold text-foreground">Estimated total</dt><dd className="font-mono tabular-nums font-bold text-foreground">{fmtUSD(total)}</dd></div>
      </dl>

      {(exceedsCash || exceedsHoldings) && (
        <p className="mt-2 text-xs text-bear">
          {exceedsCash ? "Insufficient cash for this order." : "Not enough shares to sell."}
        </p>
      )}

      <Button
        onClick={submit}
        disabled={disabled}
        className={cn(
          "mt-4 w-full text-base font-semibold py-6",
          side === "BUY" ? "bg-bull text-bull-foreground hover:bg-bull/90 shadow-glow" : "bg-bear text-bear-foreground hover:bg-bear/90"
        )}
      >
        <Zap className="h-4 w-4 mr-2" />
        {side === "BUY" ? "Buy" : "Sell"} {stock.symbol}
      </Button>
    </div>
  );
}
