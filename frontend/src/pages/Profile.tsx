import React from 'react';
import { User, Settings, Shield, Bell, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Settings, label: 'Account Settings', sub: 'Manage your personal details' },
    { icon: Shield, label: 'Security', sub: '2FA, password, and active sessions' },
    { icon: Bell, label: 'Notifications', sub: 'Price alerts and news preferences' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-700">
      <section className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto flex items-center justify-center border-4 border-white editorial-shadow">
            <User size={64} className="text-slate-400" />
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full editorial-shadow">
            <Settings size={16} />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter">John Doe</h1>
          <p className="text-on-surface-variant font-medium">Premium Member since 2023</p>
        </div>
      </section>

      <div className="bg-white rounded-2xl editorial-shadow overflow-hidden">
        {menuItems.map((item, i) => (
          <button 
            key={i}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                <item.icon size={20} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm">{item.label}</div>
                <div className="text-xs text-on-surface-variant font-medium">{item.sub}</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        ))}
      </div>

      <button 
        onClick={() => navigate('/login')}
        className="w-full flex items-center justify-center gap-2 p-4 text-error font-bold hover:bg-error/5 rounded-xl transition-all"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );
}
