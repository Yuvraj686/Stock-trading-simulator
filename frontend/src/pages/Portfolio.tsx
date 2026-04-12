import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';

export function Portfolio() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const response = await fetch('http://localhost:8000/portfolio', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
          const data = await response.json();
          setPortfolio(data);
        }
      } catch (err) {
        console.error('Failed to fetch portfolio', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolio();
  }, []);

  // Calculate some basic stats if we have data
  const totalValue = portfolio.reduce((acc, item) => acc + (item.quantity * item.current_price), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Asset Allocation</span>
          <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface mt-1">My Portfolio</h1>
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold shadow-sm">All Assets</button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 editorial-shadow">
          <h3 className="text-xl font-bold font-headline mb-6">Holdings</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-on-surface-variant font-medium">Loading portfolio...</div>
            ) : portfolio.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant font-medium">You don't own any assets yet.</div>
            ) : (
              portfolio.map((item) => {
                const totalAssetValue = item.quantity * item.current_price;
                const totalAssetCost = item.quantity * item.avg_price;
                const totalGain = totalAssetValue - totalAssetCost;
                const totalGainPercent = totalAssetCost > 0 ? (totalGain / totalAssetCost) * 100 : 0;

                return (
                  <div key={item.symbol} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <span className="font-black text-xs">{item.symbol}</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{item.name}</div>
                        <div className="text-xs text-on-surface-variant font-medium">{item.quantity} Shares @ ${item.avg_price?.toFixed(2) || '0.00'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className={cn(
                        "text-xs font-bold flex items-center justify-end",
                        totalGain >= 0 ? "text-secondary-vibrant" : "text-error"
                      )}>
                        {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-black text-white rounded-2xl p-8 editorial-shadow flex flex-col justify-between">
          <div>
            <PieChart size={32} className="mb-4 text-secondary-vibrant" />
            <h3 className="text-2xl font-bold font-headline tracking-tight">Portfolio Value</h3>
            <p className="text-slate-400 text-sm mt-2">Total value of all your current holdings in the market.</p>
          </div>
          <div className="mt-8">
            <div className="text-4xl font-bold tracking-tight">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
