import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CHART_DATA } from '../constants';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Apple, Search, Zap, Box, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { cn } from '../lib/utils';

export function StockDetails() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  
  const [stock, setStock] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [transactionState, setTransactionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
          const found = stocksData.find((s: any) => s.symbol === symbol);
          setStock(found || null);
        }
        
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.balance);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [symbol]);

  const handleTransaction = async (type: 'buy' | 'sell') => {
    if (!quantity || quantity <= 0) return;
    
    setTransactionState('loading');
    setMessage('');
    
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`http://localhost:8000/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          stock_symbol: symbol,
          quantity: Number(quantity)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTransactionState('success');
        setMessage(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${symbol}.`);
        setQuantity('');
        
        // Refresh wallet balance
        const walletRes = await fetch('http://localhost:8000/wallet', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.balance);
        }
      } else {
        setTransactionState('error');
        setMessage(data.detail || `Failed to ${type} stock.`);
      }
    } catch (err) {
      setTransactionState('error');
      setMessage(`A network error occurred. Please try again.`);
    }
  };

  const getIcon = (sym: string) => {
    switch(sym) {
      case 'AAPL': return <Apple size={32} />;
      case 'GOOGL': return <Search size={32} />;
      case 'TSLA': return <Zap size={32} />;
      case 'MSFT': return <Box size={32} />;
      case 'AMZN': return <ShoppingCart size={32} />;
      default: return <Apple size={32} />;
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-on-surface-variant font-medium">Loading market data...</div>;
  }

  if (!stock) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold font-headline">Stock Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-black font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const estimatedTotal = (Number(quantity) || 0) * stock.price;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-black transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <section className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 bg-black flex items-center justify-center rounded-3xl editorial-shadow">
            <div className="text-white">{getIcon(stock.symbol)}</div>
          </div>
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tighter">{stock.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-lg font-bold text-on-surface-variant uppercase">{stock.symbol}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black uppercase tracking-widest">{stock.sector}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black font-headline">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-secondary-vibrant font-bold text-lg flex items-center justify-end mt-1">
             Live Market Price
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-8 editorial-shadow h-[400px]">
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
                <Tooltip />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-8 editorial-shadow">
            <h3 className="text-xl font-bold font-headline mb-4">About {stock.name}</h3>
            <p className="text-on-surface-variant leading-relaxed font-medium">
              {stock.name} ({stock.symbol}) operates within the {stock.sector} sector. This asset is currently trading actively on the open market and is fully compliant with live portfolio synchronization parameters.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black text-white rounded-2xl p-8 editorial-shadow">
            <h3 className="text-xl font-bold font-headline mb-6">Trade {stock.symbol}</h3>
            <div className="space-y-6">
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Liquid Balance</span>
                <span className="font-bold">${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Quantity (Shares)</label>
                  {quantity && <span className="text-xs font-medium text-secondary-vibrant">≈ ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>}
                </div>
                <input 
                  type="number" 
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-secondary-vibrant transition-all"
                  placeholder="0"
                />
              </div>
              
              {message && (
                <div className={cn(
                  "p-3 rounded-lg text-xs font-bold w-full text-center",
                  transactionState === 'error' ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                )}>
                  {message}
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => handleTransaction('buy')}
                  disabled={!quantity || transactionState === 'loading'}
                  className="w-full bg-secondary-vibrant text-white font-bold py-4 rounded-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  Buy
                </button>
                <button 
                  onClick={() => handleTransaction('sell')}
                  disabled={!quantity || transactionState === 'loading'}
                  className="w-full bg-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  Sell
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold font-headline">Execution Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Spread</div>
                <div className="text-sm font-bold">0.02%</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Fee</div>
                <div className="text-sm font-bold">$0.00</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Settlement</div>
                <div className="text-sm font-bold">T+0 (Instant)</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Exchange</div>
                <div className="text-sm font-bold">Local Simulator</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
