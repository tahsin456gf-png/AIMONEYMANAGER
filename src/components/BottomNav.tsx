import React from 'react';
import { useMoney } from '../context/MoneyContext';
import { Home, Wallet, Bot, BarChart3, Settings, ArrowLeftRight, PiggyBank, Target, Shield } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentTheme } = useMoney();

  const navItems = [
    { id: 'home', label: 'হোম', icon: Home, color: 'text-emerald-400' },
    { id: 'transactions', label: 'লেনদেন', icon: Wallet, color: 'text-blue-400' },
    { id: 'ai', label: 'এআই সহকারী', icon: Bot, color: 'text-indigo-400', isHighlight: true },
    { id: 'reports', label: 'রিপোর্ট', icon: BarChart3, color: 'text-purple-400' },
    { id: 'debt', label: 'দেনা-পাওনা', icon: ArrowLeftRight, color: 'text-orange-400' },
    { id: 'profile', label: 'প্রোফাইল', icon: Settings, color: 'text-slate-400' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 no-print ${currentTheme.navBgClass} backdrop-blur-2xl border-t px-2 py-2 shadow-2xl transition-colors duration-300`}>
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isHighlight) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative -top-4 flex flex-col items-center group"
              >
                <div
                  className={`w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 p-[2px] shadow-lg shadow-indigo-500/30 transition-transform ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Bot className="w-7 h-7 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
