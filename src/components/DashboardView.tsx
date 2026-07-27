import React, { useState } from 'react';
import { useMoney, isIncomeType, isExpenseType } from '../context/MoneyContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PlusCircle,
  MinusCircle,
  Bot,
  BarChart2,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ArrowLeftRight,
  Target,
  ShieldCheck,
  Search,
  ChevronRight,
  Receipt,
  Edit3,
  Trash2,
  RefreshCw,
  X,
  Check,
  DollarSign,
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  onOpenAddModal: (type: 'income' | 'expense') => void;
  onOpenTransferModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddModal, onOpenTransferModal }) => {
  const {
    transactions,
    debts,
    savingsGoals,
    budgets,
    userProfile,
    adminSettings,
    setActiveTab,
    currentTheme,
    deleteTransaction,
    updateInitialBalances,
    resetToDefaultData,
  } = useMoney();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Initial & Admin Balances
  const initBal = adminSettings.initialBalances || {};
  const mainOffset = adminSettings.mainBalanceOffset || 0;
  const initialTotal =
    (initBal.Cash || 0) +
    (initBal.Bkash || 0) +
    (initBal.Nagad || 0) +
    (initBal.Bank || 0) +
    (initBal.Card || 0) +
    (initBal.Other || 0);

  // Calculations
  const totalIncome = transactions
    .filter((t) => isIncomeType(t.type))
    .reduce((acc, t) => acc + Math.abs(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => isExpenseType(t.type))
    .reduce((acc, t) => acc + Math.abs(t.amount || 0), 0);

  const totalBalance = initialTotal + mainOffset + totalIncome - totalExpense;

  const todayIncome = transactions
    .filter((t) => isIncomeType(t.type) && t.date === todayStr)
    .reduce((acc, t) => acc + Math.abs(t.amount || 0), 0);

  const todayExpense = transactions
    .filter((t) => isExpenseType(t.type) && t.date === todayStr)
    .reduce((acc, t) => acc + Math.abs(t.amount || 0), 0);

  const monthExpense = transactions
    .filter((t) => isExpenseType(t.type) && t.date.startsWith(currentMonthStr))
    .reduce((acc, t) => acc + Math.abs(t.amount || 0), 0);

  const monthIncome = transactions
    .filter((t) => isIncomeType(t.type) && t.date.startsWith(currentMonthStr))
    .reduce((acc, t) => acc + Math.abs(t.amount || 0), 0);

  const monthSavings = Math.max(0, monthIncome - monthExpense);

  const totalPawna = debts
    .filter((d) => d.type === 'pawna')
    .reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);

  const totalDena = debts
    .filter((d) => d.type === 'dena')
    .reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);

  // Budget Warnings
  const budgetAlerts = budgets.map((b) => {
    const catSpent = transactions
      .filter((t) => t.type === 'expense' && t.category === b.categoryId && t.date.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = Math.round((catSpent / b.monthlyTarget) * 100);
    return {
      category: b.categoryId,
      target: b.monthlyTarget,
      spent: catSpent,
      percent,
    };
  }).filter((a) => a.percent >= 75);

  // Financial Health Score mock calculation
  const savingsRate = monthIncome > 0 ? (monthSavings / monthIncome) * 100 : 50;
  const healthScore = Math.min(100, Math.max(30, Math.round(50 + savingsRate * 0.4)));

  const themeId = currentTheme.id;

  return (
    <div className="space-y-6 pb-24">
      {/* MODEL 1: Emerald Pro (Cyber Grid) */}
      {themeId === 'emerald_pro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 shadow-2xl"
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">🟢 সাইবার গ্রিড লেজার • মোট ব্যালেন্স</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                ৳{totalBalance.toLocaleString()}
              </h2>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-medium">হেলথ স্কোর</span>
              <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{healthScore}/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/60 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-1">
                <span>আজকের আয়</span>
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-100">৳{todayIncome.toLocaleString()}</p>
            </div>
            <div className="bg-slate-950/60 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-rose-400 text-xs font-semibold mb-1">
                <span>আজকের ব্যয়</span>
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-100">৳{todayExpense.toLocaleString()}</p>
            </div>
            <div className="bg-slate-950/60 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-1">
                <span>মাসিক সঞ্চয়</span>
                <PiggyBank className="w-3.5 h-3.5" />
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-100">৳{monthSavings.toLocaleString()}</p>
            </div>
            <div className="bg-slate-950/60 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-orange-400 text-xs font-semibold mb-1">
                <span>পাওনা / দেনা</span>
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-medium text-slate-300">
                <span className="text-emerald-400 font-bold">৳{totalPawna}</span> / <span className="text-rose-400 font-bold">৳{totalDena}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODEL 2: Gold Luxury (VIP Metallic Credit Card Model) */}
      {themeId === 'gold_luxury' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border-2 border-amber-600/60 p-6 shadow-2xl text-amber-50"
        >
          <div className="flex items-center justify-between mb-3 border-b border-amber-600/30 pb-3">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-[10px] tracking-widest uppercase">
                💳 VIP GOLD DEBIT CARD
              </div>
              <span className="text-xs font-semibold text-amber-300/80">•••• •••• •••• 8888</span>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
              VIP MEMBER
            </span>
          </div>

          <div className="flex items-end justify-between my-2">
            <div>
              <p className="text-[11px] text-amber-300/70 font-medium">সর্বমোট ক্লায়েন্ট ব্যালেন্স</p>
              <h2 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight drop-shadow-md mt-0.5">
                ৳{totalBalance.toLocaleString()}
              </h2>
              <p className="text-xs font-semibold text-amber-200/90 mt-1">{userProfile.name || 'সম্মানিত ব্যবহারকারী'}</p>
            </div>
            <div className="text-right">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-2xl font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{healthScore} SCORES</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-2 border-t border-amber-600/30">
            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-amber-800/40">
              <span className="text-[10px] text-amber-400 font-bold block">আজকের জমা</span>
              <span className="text-sm font-extrabold text-amber-200">৳{todayIncome.toLocaleString()}</span>
            </div>
            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-amber-800/40">
              <span className="text-[10px] text-rose-400 font-bold block">আজকের খরচ</span>
              <span className="text-sm font-extrabold text-amber-200">৳{todayExpense.toLocaleString()}</span>
            </div>
            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-amber-800/40">
              <span className="text-[10px] text-amber-400 font-bold block">মাসিক সঞ্চয়</span>
              <span className="text-sm font-extrabold text-amber-200">৳{monthSavings.toLocaleString()}</span>
            </div>
            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-amber-800/40">
              <span className="text-[10px] text-amber-300 font-bold block">পাওনা / দেনা</span>
              <span className="text-xs font-extrabold text-amber-100">৳{totalPawna} / ৳{totalDena}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODEL 3: Midnight Cyber (Gaming Terminal HUD Model) */}
      {themeId === 'midnight_cyber' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-neutral-950 border-2 border-cyan-500/50 p-5 shadow-2xl font-mono text-cyan-400"
        >
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-3 text-xs">
            <span className="font-bold tracking-widest text-cyan-300">[ TERMINAL // BALANCE_NODE_v3.2 ]</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ONLINE_CONNECTED
            </span>
          </div>

          <div className="flex items-center justify-between my-3">
            <div>
              <p className="text-[10px] text-cyan-500 font-bold">&gt; TOTAL_NET_WORTH_VAL:</p>
              <h2 className="text-3xl sm:text-4xl font-black text-cyan-300 tracking-wider text-shadow-glow">
                ৳{totalBalance.toLocaleString()}
              </h2>
            </div>
            <div className="border border-purple-500/50 bg-purple-950/40 p-2.5 rounded-xl text-center">
              <span className="text-[9px] text-purple-300 block font-bold">HEALTH_INDEX</span>
              <span className="text-base font-black text-cyan-300">{healthScore} / 100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-cyan-500/30 text-xs">
            <div className="bg-purple-950/30 p-2 rounded border border-cyan-500/20">
              <span className="text-[9px] text-cyan-400 block">&gt; TODAY_INFLOW</span>
              <span className="font-bold text-emerald-400">৳{todayIncome.toLocaleString()}</span>
            </div>
            <div className="bg-purple-950/30 p-2 rounded border border-cyan-500/20">
              <span className="text-[9px] text-rose-400 block">&gt; TODAY_OUTFLOW</span>
              <span className="font-bold text-rose-400">৳{todayExpense.toLocaleString()}</span>
            </div>
            <div className="bg-purple-950/30 p-2 rounded border border-cyan-500/20">
              <span className="text-[9px] text-cyan-400 block">&gt; MONTH_RESERVE</span>
              <span className="font-bold text-cyan-300">৳{monthSavings.toLocaleString()}</span>
            </div>
            <div className="bg-purple-950/30 p-2 rounded border border-cyan-500/20">
              <span className="text-[9px] text-purple-300 block">&gt; DEBT_RATIO</span>
              <span className="font-bold text-amber-300">৳{totalPawna}/৳{totalDena}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODEL 4: Clean Light (Minimalist Studio White Model) */}
      {themeId === 'clean_light' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 shadow-xl text-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">☀️ স্টুডিও ক্লিন • বর্তমান মোট তহবিল</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                ৳{totalBalance.toLocaleString()}
              </h2>
            </div>
            <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>স্কোর {healthScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-teal-700 block mb-0.5">আজকের জমা</span>
              <p className="text-base font-bold text-slate-900">৳{todayIncome.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-rose-600 block mb-0.5">আজকের খরচ</span>
              <p className="text-base font-bold text-slate-900">৳{todayExpense.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-blue-700 block mb-0.5">মাসিক জমানো</span>
              <p className="text-base font-bold text-slate-900">৳{monthSavings.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-600 block mb-0.5">পাওনা / দেনা</span>
              <p className="text-xs font-bold text-slate-900">
                <span className="text-teal-700">৳{totalPawna}</span> / <span className="text-rose-600">৳{totalDena}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODEL 5: Royal Sapphire (Corporate Ocean Glassmorphic Model) */}
      {themeId === 'royal_sapphire' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-sky-950 to-blue-900 border-2 border-sky-400/40 p-6 shadow-2xl text-sky-50"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-sky-300 uppercase tracking-widest flex items-center gap-1.5">
                💎 রয়্যাল স্যফায়ার ব্যাংকিং
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 drop-shadow">
                ৳{totalBalance.toLocaleString()}
              </h2>
            </div>
            <div className="bg-sky-400/20 border border-sky-400/50 px-3.5 py-1.5 rounded-2xl text-sky-200 text-xs font-black shadow">
              SCORE: {healthScore}/100
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-sky-800/60">
            <div className="bg-blue-900/60 backdrop-blur-lg p-3 rounded-2xl border border-sky-500/30">
              <span className="text-xs font-semibold text-sky-300 block mb-0.5">আজকের আয়</span>
              <p className="text-base font-bold text-white">৳{todayIncome.toLocaleString()}</p>
            </div>
            <div className="bg-blue-900/60 backdrop-blur-lg p-3 rounded-2xl border border-sky-500/30">
              <span className="text-xs font-semibold text-rose-300 block mb-0.5">আজকের ব্যয়</span>
              <p className="text-base font-bold text-white">৳{todayExpense.toLocaleString()}</p>
            </div>
            <div className="bg-blue-900/60 backdrop-blur-lg p-3 rounded-2xl border border-sky-500/30">
              <span className="text-xs font-semibold text-sky-300 block mb-0.5">মাসিক জমানো</span>
              <p className="text-base font-bold text-white">৳{monthSavings.toLocaleString()}</p>
            </div>
            <div className="bg-blue-900/60 backdrop-blur-lg p-3 rounded-2xl border border-sky-500/30">
              <span className="text-xs font-semibold text-sky-200 block mb-0.5">পাওনা / দেনা</span>
              <p className="text-xs font-bold text-white">
                <span className="text-sky-300">৳{totalPawna}</span> / <span className="text-rose-300">৳{totalDena}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODEL 6: Crimson Ruby (Velvet Red & Rose Model) */}
      {themeId === 'crimson_ruby' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-rose-950 to-stone-900 border-2 border-rose-600/50 p-6 shadow-2xl text-rose-50"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                🌹 ক্রিমসন রুবি ভেলভেট • মোট ব্যালেন্স
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                ৳{totalBalance.toLocaleString()}
              </h2>
            </div>
            <div className="bg-rose-500/20 border border-rose-500/40 px-3.5 py-1.5 rounded-2xl text-rose-200 text-xs font-bold shadow flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>SCORE: {healthScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-rose-900/60">
            <div className="bg-stone-950/80 p-3 rounded-2xl border border-rose-900/50">
              <span className="text-xs font-semibold text-rose-400 block mb-0.5">আজকের জমা</span>
              <p className="text-base font-bold text-white">৳{todayIncome.toLocaleString()}</p>
            </div>
            <div className="bg-stone-950/80 p-3 rounded-2xl border border-rose-900/50">
              <span className="text-xs font-semibold text-rose-300 block mb-0.5">আজকের খরচ</span>
              <p className="text-base font-bold text-white">৳{todayExpense.toLocaleString()}</p>
            </div>
            <div className="bg-stone-950/80 p-3 rounded-2xl border border-rose-900/50">
              <span className="text-xs font-semibold text-rose-400 block mb-0.5">মাসিক সঞ্চয়</span>
              <p className="text-base font-bold text-white">৳{monthSavings.toLocaleString()}</p>
            </div>
            <div className="bg-stone-950/80 p-3 rounded-2xl border border-rose-900/50">
              <span className="text-xs font-semibold text-rose-300 block mb-0.5">পাওনা / দেনা</span>
              <p className="text-xs font-bold text-white">
                <span className="text-rose-400">৳{totalPawna}</span> / <span className="text-rose-200">৳{totalDena}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODEL 7: Sunset Amber (Warm Orange Amber Model) */}
      {themeId === 'sunset_amber' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-950 via-amber-950 to-stone-900 border-2 border-orange-500/50 p-6 shadow-2xl text-orange-50"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                🌅 সানসেট প্রাইভেট ব্যাংকিং
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-amber-100 tracking-tight mt-1">
                ৳{totalBalance.toLocaleString()}
              </h2>
            </div>
            <div className="bg-orange-500/20 border border-orange-500/40 px-3.5 py-1.5 rounded-2xl text-orange-300 text-xs font-bold shadow">
              SCORE: {healthScore}/100
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-orange-900/60">
            <div className="bg-stone-950/80 p-3 rounded-2xl border border-orange-900/50">
              <span className="text-xs font-semibold text-orange-400 block mb-0.5">আজকের আয়</span>
              <p className="text-base font-bold text-amber-100">৳{todayIncome.toLocaleString()}</p>
            </div>
            <div className="bg-stone-950/80 p-3 rounded-2xl border border-orange-900/50">
              <span className="text-xs font-semibold text-rose-400 block mb-0.5">আজকের ব্যয়</span>
              <p className="text-base font-bold text-amber-100">৳{todayExpense.toLocaleString()}</p>
            </div>
            <div className="bg-stone-950/80 p-3 rounded-2xl border border-orange-900/50">
              <span className="text-xs font-semibold text-orange-400 block mb-0.5">মাসিক জমানো</span>
              <p className="text-base font-bold text-amber-100">৳{monthSavings.toLocaleString()}</p>
            </div>
            <div className="bg-stone-950/80 p-3 rounded-2xl border border-orange-900/50">
              <span className="text-xs font-semibold text-orange-300 block mb-0.5">পাওনা / দেনা</span>
              <p className="text-xs font-bold text-amber-100">
                <span className="text-orange-400">৳{totalPawna}</span> / <span className="text-rose-400">৳{totalDena}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODEL 8: Amethyst Purple (Royal Violet Glass Model) */}
      {themeId === 'amethyst_purple' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 border-2 border-purple-500/50 p-6 shadow-2xl text-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                🔮 রয়্যাল অ্যামেথিস্ট ব্যাংক
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                ৳{totalBalance.toLocaleString()}
              </h2>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/40 px-3.5 py-1.5 rounded-2xl text-purple-300 text-xs font-bold shadow">
              SCORE: {healthScore}/100
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-purple-900/60">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-purple-900/50">
              <span className="text-xs font-semibold text-purple-400 block mb-0.5">আজকের জমা</span>
              <p className="text-base font-bold text-white">৳{todayIncome.toLocaleString()}</p>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-purple-900/50">
              <span className="text-xs font-semibold text-rose-400 block mb-0.5">আজকের খরচ</span>
              <p className="text-base font-bold text-white">৳{todayExpense.toLocaleString()}</p>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-purple-900/50">
              <span className="text-xs font-semibold text-purple-400 block mb-0.5">মাসিক সঞ্চয়</span>
              <p className="text-base font-bold text-white">৳{monthSavings.toLocaleString()}</p>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-purple-900/50">
              <span className="text-xs font-semibold text-purple-300 block mb-0.5">পাওনা / দেনা</span>
              <p className="text-xs font-bold text-white">
                <span className="text-purple-400">৳{totalPawna}</span> / <span className="text-rose-400">৳{totalDena}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODEL 9: Nordic Frost (Nordic Ice Cyan Model) */}
      {themeId === 'nordic_frost' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-white/95 border-2 border-cyan-300 p-6 shadow-xl text-slate-800 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-cyan-700 uppercase tracking-widest flex items-center gap-1.5">
                ❄️ নর্ডিক ফ্রস্ট ব্যাংক • মোট তহবিল
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                ৳{totalBalance.toLocaleString()}
              </h2>
            </div>
            <div className="bg-cyan-100 border border-cyan-300 text-cyan-900 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-700" />
              <span>SCORE {healthScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-cyan-100">
            <div className="bg-cyan-50/70 p-3 rounded-2xl border border-cyan-200">
              <span className="text-xs font-semibold text-cyan-800 block mb-0.5">আজকের জমা</span>
              <p className="text-base font-bold text-slate-900">৳{todayIncome.toLocaleString()}</p>
            </div>
            <div className="bg-cyan-50/70 p-3 rounded-2xl border border-cyan-200">
              <span className="text-xs font-semibold text-rose-600 block mb-0.5">আজকের খরচ</span>
              <p className="text-base font-bold text-slate-900">৳{todayExpense.toLocaleString()}</p>
            </div>
            <div className="bg-cyan-50/70 p-3 rounded-2xl border border-cyan-200">
              <span className="text-xs font-semibold text-cyan-800 block mb-0.5">মাসিক সঞ্চয়</span>
              <p className="text-base font-bold text-slate-900">৳{monthSavings.toLocaleString()}</p>
            </div>
            <div className="bg-cyan-50/70 p-3 rounded-2xl border border-cyan-200">
              <span className="text-xs font-semibold text-slate-700 block mb-0.5">পাওনা / দেনা</span>
              <p className="text-xs font-bold text-slate-900">
                <span className="text-cyan-700">৳{totalPawna}</span> / <span className="text-rose-600">৳{totalDena}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODEL 10: Emerald Mint Light (Fresh Mint Studio Model) */}
      {themeId === 'emerald_mint_light' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-white border-2 border-emerald-300 p-6 shadow-xl text-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                🌿 ফ্রেশ মিন্ট স্টুডিও • মোট ব্যালেন্স
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                ৳{totalBalance.toLocaleString()}
              </h2>
            </div>
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>SCORE {healthScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-100">
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-800 block mb-0.5">আজকের জমা</span>
              <p className="text-base font-bold text-slate-900">৳{todayIncome.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
              <span className="text-xs font-semibold text-rose-600 block mb-0.5">আজকের খরচ</span>
              <p className="text-base font-bold text-slate-900">৳{todayExpense.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-800 block mb-0.5">মাসিক সঞ্চয়</span>
              <p className="text-base font-bold text-slate-900">৳{monthSavings.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
              <span className="text-xs font-semibold text-slate-700 block mb-0.5">পাওনা / দেনা</span>
              <p className="text-xs font-bold text-slate-900">
                <span className="text-emerald-700">৳{totalPawna}</span> / <span className="text-rose-600">৳{totalDena}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Smart Alert Widget */}
      {budgetAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-200"
        >
          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                এআই বাজেট সতর্কতা!
              </span>
              <button
                onClick={() => setActiveTab('budget')}
                className="text-[11px] underline text-amber-300 hover:text-amber-100"
              >
                বাজেট দেখুন
              </button>
            </div>
            {budgetAlerts.map((a, idx) => (
              <p key={idx} className="mt-1 font-medium leading-relaxed">
                এই মাসে <strong className="text-amber-100">{a.category}</strong> খাতে {a.percent}% বাজেট শেষ! (৳{a.spent.toLocaleString()} / ৳{a.target.toLocaleString()})
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Action Buttons */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          কুইক অ্যাকশন (Quick Actions)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
          <button
            onClick={() => onOpenAddModal('income')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 transition-all font-semibold text-xs sm:text-sm group"
          >
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left">
              <span className="block text-white font-bold text-xs sm:text-sm">Add Income</span>
              <span className="text-[10px] text-emerald-400/80 font-normal">আয় যোগ</span>
            </div>
          </button>

          <button
            onClick={() => onOpenAddModal('expense')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 transition-all font-semibold text-xs sm:text-sm group"
          >
            <div className="p-2 rounded-xl bg-rose-500 text-white group-hover:scale-110 transition-transform">
              <MinusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left">
              <span className="block text-white font-bold text-xs sm:text-sm">Add Expense</span>
              <span className="text-[10px] text-rose-400/80 font-normal">ব্যয় যোগ</span>
            </div>
          </button>

          {onOpenTransferModal && (
            <button
              onClick={onOpenTransferModal}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 transition-all font-semibold text-xs sm:text-sm group"
            >
              <div className="p-2 rounded-xl bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-left">
                <span className="block text-white font-bold text-xs sm:text-sm">Transfer</span>
                <span className="text-[10px] text-indigo-400/80 font-normal">ট্রান্সফার</span>
              </div>
            </button>
          )}

          <button
            onClick={() => setActiveTab('ai')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 transition-all font-semibold text-xs sm:text-sm group"
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left">
              <span className="block text-white font-bold text-xs sm:text-sm">AI Chat</span>
              <span className="text-[10px] text-blue-400/80 font-normal">এআই সহকারী</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 transition-all font-semibold text-xs sm:text-sm group"
          >
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left">
              <span className="block text-white font-bold text-xs sm:text-sm">Accounts</span>
              <span className="text-[10px] text-amber-400/80 font-normal">অ্যাকাউন্টস</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 transition-all font-semibold text-xs sm:text-sm group"
          >
            <div className="p-2 rounded-xl bg-purple-500 text-white group-hover:scale-110 transition-transform">
              <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-left">
              <span className="block text-white font-bold text-xs sm:text-sm">Reports</span>
              <span className="text-[10px] text-purple-400/80 font-normal">রিপোর্ট</span>
            </div>
          </button>
        </div>
      </div>

      {/* Feature Navigation Cards (Debt, Savings, Budget) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setActiveTab('debt')}
          className={`${currentTheme.cardBgClass} ${currentTheme.cardHoverClass} p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-sm`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">দেনা-পাওনা ম্যানেজার</h4>
              <p className="text-xs opacity-70">পাওনা: ৳{totalPawna} | দেনা: ৳{totalDena}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>

        <div
          onClick={() => setActiveTab('savings')}
          className={`${currentTheme.cardBgClass} ${currentTheme.cardHoverClass} p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-sm`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">সঞ্চয় লক্ষ্য</h4>
              <p className="text-xs opacity-70">{savingsGoals.length}টি অ্যাক্টিভ গোল</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>

        <div
          onClick={() => setActiveTab('budget')}
          className={`${currentTheme.cardBgClass} ${currentTheme.cardHoverClass} p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-sm`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">মাসিক বাজেট</h4>
              <p className="text-xs opacity-70">{budgets.length}টি ক্যাটাগরি সেট</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Recent Transactions List Feed */}
      <div className={`${currentTheme.cardBgClass} rounded-3xl p-5 space-y-4 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">সাম্প্রতিক লেনদেন</h3>
            <p className="text-xs opacity-70">সর্বশেষ ইনকাম ও এক্সপেন্স রেকর্ড</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`text-xs font-semibold ${currentTheme.accentTextClass} flex items-center gap-1`}
          >
            <span>সব দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {transactions.slice(0, 5).map((tx) => {
            const isInc = isIncomeType(tx.type);
            return (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-3 rounded-2xl border ${
                  currentTheme.isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/40 border-slate-800/60'
                } transition-all text-xs sm:text-sm`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isInc
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}
                  >
                    {isInc ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold">{tx.category}</h4>
                    <p className="text-[11px] opacity-70">
                      {tx.note || 'কোন নোট নেই'} • {tx.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`font-black text-sm block ${
                        isInc ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {isInc ? '+' : '-'}৳{tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] opacity-60">{tx.date}</span>
                  </div>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                    title="ডিলিট করুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {transactions.length === 0 && (
            <p className="text-center py-6 text-xs opacity-60">এখনও কোন লেনদেন রেকর্ড নেই</p>
          )}
        </div>
      </div>

    </div>
  );
};
