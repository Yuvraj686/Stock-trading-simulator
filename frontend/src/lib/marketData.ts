export type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;      // absolute
  changePct: number;   // percent
  sector: string;
  marketCap: string;
};

export type Holding = {
  symbol: string;
  name: string;
  qty: number;
  avgCost: number;
  price: number;
};

export type Transaction = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  date: string;
};

export const STOCKS: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.",        price: 224.31, change:  2.14, changePct:  0.96, sector: "Tech",       marketCap: "3.42T" },
  { symbol: "NVDA", name: "NVIDIA Corp.",      price: 138.07, change:  4.82, changePct:  3.62, sector: "Semis",      marketCap: "3.38T" },
  { symbol: "MSFT", name: "Microsoft",         price: 421.55, change: -1.20, changePct: -0.28, sector: "Tech",       marketCap: "3.13T" },
  { symbol: "TSLA", name: "Tesla Inc.",        price: 248.50, change: -6.31, changePct: -2.48, sector: "Auto",       marketCap: "789B"  },
  { symbol: "AMZN", name: "Amazon",            price: 192.84, change:  1.07, changePct:  0.56, sector: "Retail",     marketCap: "2.02T" },
  { symbol: "META", name: "Meta Platforms",    price: 575.10, change:  8.42, changePct:  1.49, sector: "Tech",       marketCap: "1.46T" },
  { symbol: "GOOG", name: "Alphabet",          price: 168.22, change:  0.41, changePct:  0.24, sector: "Tech",       marketCap: "2.07T" },
  { symbol: "AMD",  name: "AMD",               price: 155.34, change: -2.18, changePct: -1.38, sector: "Semis",      marketCap: "251B"  },
  { symbol: "NFLX", name: "Netflix",           price: 712.99, change: 12.65, changePct:  1.81, sector: "Media",      marketCap: "305B"  },
  { symbol: "JPM",  name: "JPMorgan Chase",    price: 218.40, change:  0.92, changePct:  0.42, sector: "Finance",    marketCap: "623B"  },
];

export const HOLDINGS: Holding[] = [
  { symbol: "AAPL", name: "Apple Inc.",     qty: 25, avgCost: 198.40, price: 224.31 },
  { symbol: "NVDA", name: "NVIDIA Corp.",   qty: 40, avgCost:  98.10, price: 138.07 },
  { symbol: "TSLA", name: "Tesla Inc.",     qty: 15, avgCost: 270.00, price: 248.50 },
  { symbol: "META", name: "Meta Platforms", qty: 10, avgCost: 480.20, price: 575.10 },
  { symbol: "AMZN", name: "Amazon",         qty: 18, avgCost: 175.00, price: 192.84 },
];

export const TRANSACTIONS: Transaction[] = [
  { id: "t1", symbol: "NVDA", side: "BUY",  qty: 10, price: 132.40, date: "2025-04-26 14:32" },
  { id: "t2", symbol: "TSLA", side: "SELL", qty:  5, price: 252.10, date: "2025-04-25 11:08" },
  { id: "t3", symbol: "AAPL", side: "BUY",  qty: 12, price: 220.15, date: "2025-04-24 09:55" },
  { id: "t4", symbol: "META", side: "BUY",  qty:  4, price: 568.40, date: "2025-04-23 15:42" },
  { id: "t5", symbol: "AMZN", side: "SELL", qty:  6, price: 191.20, date: "2025-04-22 10:17" },
  { id: "t6", symbol: "AMD",  side: "BUY",  qty: 20, price: 158.00, date: "2025-04-21 13:01" },
  { id: "t7", symbol: "NVDA", side: "BUY",  qty: 15, price:  92.10, date: "2025-04-18 09:33" },
];

// Generates a synthetic intraday candle/line series
export function generateSeries(base: number, points = 80, volatility = 0.012, trend = 0.0003) {
  const out: { t: string; price: number }[] = [];
  let p = base * 0.96;
  const start = new Date();
  start.setHours(9, 30, 0, 0);
  for (let i = 0; i < points; i++) {
    const dt = new Date(start.getTime() + i * 5 * 60 * 1000);
    const noise = (Math.random() - 0.5) * volatility * p;
    p = Math.max(1, p + noise + trend * p);
    out.push({
      t: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      price: +p.toFixed(2),
    });
  }
  // pin last price near base
  out[out.length - 1].price = base;
  return out;
}

export const PORTFOLIO_HISTORY = (() => {
  const out: { t: string; value: number }[] = [];
  let v = 95000;
  for (let i = 0; i < 60; i++) {
    v = v + (Math.random() - 0.45) * 1200;
    const d = new Date();
    d.setDate(d.getDate() - (60 - i));
    out.push({ t: d.toLocaleDateString([], { month: "short", day: "numeric" }), value: Math.round(v) });
  }
  out[out.length - 1].value = 128_450;
  return out;
})();

export const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
