import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TopNav() {
  const [query, setQuery] = useState('');
  const [stocks, setStocks] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch('http://localhost:8000/stocks');
        if (res.ok) {
          const data = await res.json();
          setStocks(data);
        }
      } catch (err) {
        console.error('Failed to fetch stocks for search', err);
      }
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
    stock.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const handleSelect = (symbol: string) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/stock/${symbol}`);
  };

  return (
    <header className="bg-white/80 backdrop-blur-3xl sticky top-0 z-50 flex justify-between items-center w-full px-6 py-3 border-b border-slate-200/10">
      <div className="flex items-center gap-8">
        <span className="text-xl font-black text-black tracking-tighter font-headline">The Precision Ledger</span>
        <div className="hidden md:flex flex-col relative" ref={dropdownRef}>
          <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 gap-2 w-96">
            <Search size={18} className="text-slate-400" />
            <input 
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full placeholder:text-slate-400" 
              placeholder="Search markets, stocks, or indices..." 
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
          </div>
          
          {showDropdown && query && (
            <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSelect(stock.symbol)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-black">{stock.name}</div>
                      <div className="text-xs text-slate-500">{stock.symbol}</div>
                    </div>
                    <div className="text-sm font-bold text-black">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500">No results found for "{query}"</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
          <Bell size={20} className="text-slate-600" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-all">
          <UserCircle size={24} className="text-slate-600" />
          <span className="font-headline font-bold text-sm text-black">John Doe</span>
        </div>
      </nav>
    </header>
  );
}
