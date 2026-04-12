import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export function Wallet() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const [walletRes, transactionsRes] = await Promise.all([
          fetch('http://localhost:8000/wallet', {
             headers: token ? { Authorization: `Bearer ${token}` } : {}
          }),
          fetch('http://localhost:8000/transactions', {
             headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
        ]);
        
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.balance);
        }
        
        if (transactionsRes.ok) {
          const txData = await transactionsRes.json();
          setTransactions(txData);
        }
      } catch (err) {
        console.error('Failed to fetch wallet and transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Available Liquidity</span>
          <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface mt-1">${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all editorial-shadow flex items-center gap-2">
            <Plus size={18} /> Add Funds
          </button>
          <button className="bg-white border-2 border-slate-100 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-slate-50 flex items-center gap-2">
            <Download size={18} /> Withdraw
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 editorial-shadow">
          <h3 className="text-xl font-bold font-headline mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-on-surface-variant font-medium">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant font-medium">No recent activity.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      tx.type === 'sell' ? "bg-secondary-vibrant/10 text-secondary-vibrant" : "bg-slate-100 text-slate-600"
                    )}>
                      {tx.type === 'sell' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <div className="font-bold text-sm capitalize">{tx.type} {tx.symbol && `- ${tx.symbol}`}</div>
                      <div className="text-xs text-on-surface-variant font-medium">
                        {tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'} • {tx.quantity} shares
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-bold text-sm",
                      tx.type === 'sell' ? "text-secondary-vibrant" : "text-black"
                    )}>
                      {tx.type === 'sell' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-variant">{tx.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-100 rounded-2xl p-6">
            <h4 className="font-bold font-headline mb-4">Linked Accounts</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">CHASE</div>
                  <div className="text-xs font-bold">Chase Checking •••• 4242</div>
                </div>
                <div className="w-2 h-2 bg-secondary-vibrant rounded-full"></div>
              </div>
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-black transition-colors">
              + Link New Bank Account
            </button>
          </div>
          
          <div className="bg-secondary-vibrant/10 border border-secondary-vibrant/20 rounded-2xl p-6">
            <h4 className="font-bold font-headline text-secondary-vibrant mb-2">Auto-Invest</h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Your recurring deposit of $500 is scheduled for the 1st of every month.
            </p>
            <button className="mt-4 text-xs font-bold text-secondary-vibrant hover:underline">Manage Schedule</button>
          </div>
        </div>
      </div>
    </div>
  );
}
