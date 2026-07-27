import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import { SupportChatModal } from './SupportChatModal';
import {
  Bot,
  Bell,
  Search,
  Moon,
  Sun,
  Shield,
  Sparkles,
  CheckCheck,
  X,
  Lock,
  ArrowLeftRight,
  MessageCircle,
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenTransfer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenTransfer }) => {
  const {
    userProfile,
    notifications,
    toggleDarkMode,
    setActiveTab,
    activeTab,
    markNotificationRead,
    clearNotifications,
    isPinUnlocked,
    currentTheme,
    supportMessages,
    currentUser,
  } = useMoney();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Unread support replies from main admin
  const unreadSupportCount = supportMessages.filter(
    (m) => (m.userId === currentUser?.id || m.userPhone === currentUser?.phone) && m.sender === 'admin' && !m.isReadByUser
  ).length;

  return (
    <header className={`sticky top-0 z-40 no-print ${currentTheme.headerBgClass} backdrop-blur-xl border-b px-4 py-3 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & App Title */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-[1.5px] shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">
                AI Money Manager
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Finance Assistant</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Transfer Button */}
          {onOpenTransfer && (
            <button
              onClick={onOpenTransfer}
              className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="ব্যালেন্স ট্রান্সফার"
            >
              <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">ট্রান্সফার</span>
            </button>
          )}

          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-all flex items-center gap-1.5 text-xs font-medium"
            title="সার্চ করুন"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">সার্চ...</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-all"
            title="থিম পরিবর্তন"
          >
            {userProfile.darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-all relative"
              title="নোটিফিকেশন"
            >
              <Bell className="w-4 h-4 text-indigo-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 text-slate-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span>নোটিফিকেশন</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        ক্লিয়ার
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifs(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto py-2 space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">
                      কোন নতুন নোটিফিকেশন নেই।
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          n.isRead
                            ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                            : 'bg-indigo-950/30 border-indigo-500/30 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-emerald-400">{n.title}</span>
                          <span className="text-[10px] text-slate-500">{n.date}</span>
                        </div>
                        <p className="text-slate-300 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Live Admin Support Button */}
          <button
            onClick={() => setShowSupportModal(true)}
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold relative"
            title="মেইন এডমিন সাপোর্ট চ্যাট"
          >
            <MessageCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">সাপোর্ট</span>
            {unreadSupportCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                {unreadSupportCount}
              </span>
            )}
          </button>

          {/* Admin / Profile Trigger */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              activeTab === 'admin'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/50'
            }`}
            title="এডমিন প্যানেল"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">এডমিন</span>
          </button>
        </div>
      </div>

      <SupportChatModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
    </header>
  );
};
