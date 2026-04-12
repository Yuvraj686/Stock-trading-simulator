import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal, Apple, Search, Zap, Box, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { MOCK_CHART_DATA } from '../constants';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const [stocksRes, walletRes] = await Promise.all([
          fetch('http://localhost:8000/stocks'),
          fetch('http://localhost:8000/wallet', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
        ]);
        
        if (stocksRes.ok) {
          const stocksData = await stocksRes.json();
          setStocks(stocksData);
        }
        
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.balance);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Available Balance</span>
          <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface mt-1">${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-secondary-vibrant/10 text-secondary-vibrant">
              <TrendingUp size={14} className="mr-1" />
              Active
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-highest px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-slate-200">Withdraw</button>
          <button className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all editorial-shadow active:scale-95">Deposit Funds</button>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Stock Card */}
        <section className="lg:col-span-8 bg-white rounded-2xl p-8 editorial-shadow relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-black flex items-center justify-center rounded-2xl">
                <Apple size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-headline tracking-tight">Apple Inc.</h3>
                <span className="text-sm font-medium text-on-surface-variant">NASDAQ: AAPL</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black font-headline">$189.42</div>
              <div className="text-secondary-vibrant font-bold text-sm flex items-center justify-end">
                <ArrowUpRight size={16} />
                +2.14 (1.14%)
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-10 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-card p-3 rounded-xl shadow-sm border-none">
                          <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-wider">Aug 24, 2023</p>
                          <p className="text-sm font-bold">${payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Range Bar */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <div className="flex justify-between text-[0.65rem] font-bold text-on-surface-variant uppercase">
                <span>Day Low</span>
                <span>Day High</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full relative">
                <div className="absolute left-1/4 right-1/4 h-full bg-black rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span>$187.10</span>
                <span>$190.55</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <button onClick={() => navigate('/stock/AAPL')} className="px-6 py-2 border-2 border-black rounded-xl font-bold text-sm hover:bg-black hover:text-white transition-all">Sell</button>
              <button onClick={() => navigate('/stock/AAPL')} className="px-8 py-2 bg-black text-white rounded-xl font-bold text-sm transition-all active:scale-95">Buy Now</button>
            </div>
          </div>
        </section>

        {/* Market Summary */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-slate-100/50 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-bold font-headline">Market Sentiment</h4>
              <MoreHorizontal size={20} className="text-slate-400" />
            </div>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-slate-200" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" />
                  <circle className="text-secondary-vibrant" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="110" strokeWidth="12" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">75%</span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest text-secondary-vibrant">Bullish</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Analysts are maintaining a buy rating for 14/20 of your watchlist items this week.
            </p>
          </div>

          <div className="bg-black text-white rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-60">AI Insight</div>
              <div className="text-lg font-bold font-headline mt-1">Portfolio Health: Optimal</div>
            </div>
            <TrendingUp size={48} className="opacity-20 relative z-10" />
            <div className="absolute right-0 top-0 w-32 h-32 bg-secondary-vibrant/20 blur-[60px]"></div>
          </div>
        </section>

        {/* Watchlist Table */}
        <section className="lg:col-span-12 bg-white rounded-2xl p-8 editorial-shadow">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h3 className="text-2xl font-bold font-headline tracking-tight">Market Watchlist</h3>
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold shadow-sm">All Stocks</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left">
                  <th className="pb-4 px-4 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest">Asset</th>
                  <th className="pb-4 px-4 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest">Price</th>
                  <th className="pb-4 px-4 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr 
                    key={stock.symbol} 
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                    className="group hover:bg-slate-50 transition-colors rounded-xl cursor-pointer"
                  >
                    <td className="py-4 px-4 first:rounded-l-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          {stock.symbol === 'GOOGL' && <Search size={20} />}
                          {stock.symbol === 'TSLA' && <Zap size={20} />}
                          {stock.symbol === 'MSFT' && <Box size={20} />}
                          {stock.symbol === 'AMZN' && <ShoppingCart size={20} />}
                          {stock.symbol === 'AAPL' && <Apple size={20} />}
                          {/* Fallback pattern */}
                          {!['GOOGL', 'TSLA', 'MSFT', 'AMZN', 'AAPL'].includes(stock.symbol) && <span className="font-bold text-xs">{stock.symbol.slice(0, 2)}</span>}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{stock.name}</div>
                          <div className="text-[0.65rem] text-on-surface-variant font-bold uppercase">{stock.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-headline font-bold text-sm">${stock.price.toLocaleString()}</td>
                    <td className="py-4 px-4 last:rounded-r-2xl">
                      <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                        <MoreHorizontal size={18} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
                {stocks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500 font-medium text-sm">
                      No stocks available right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
