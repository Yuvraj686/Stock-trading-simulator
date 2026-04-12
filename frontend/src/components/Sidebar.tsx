import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, User, Briefcase, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Briefcase, label: 'Portfolio', to: '/portfolio' },
    { icon: Wallet, label: 'Wallet', to: '/wallet' },
    { icon: User, label: 'Profile', to: '/profile' },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-screen p-4 gap-2 bg-slate-50 border-r border-slate-200/10 sticky top-0 w-64">
      <div className="px-4 py-6">
        <h2 className="text-lg font-black text-black font-headline">Portfolio</h2>
        <p className="text-slate-500 text-xs font-semibold tracking-tight uppercase">Precision Ledger</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out font-headline font-bold tracking-tight",
              isActive 
                ? "text-black bg-slate-200/50" 
                : "text-slate-500 hover:text-black hover:bg-slate-100"
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-black text-white rounded-xl flex flex-col items-center text-center gap-2 editorial-shadow">
        <span className="text-sm font-bold">Ready to scale?</span>
        <button className="w-full bg-white text-black font-bold py-2 rounded-lg text-sm transition-transform active:scale-95">
          Trade Now
        </button>
      </div>
    </aside>
  );
}
