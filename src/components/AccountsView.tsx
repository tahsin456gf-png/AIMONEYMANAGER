import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import { AccountMethod, AccountCategoryType } from '../types';
import {
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
  TrendingUp,
  UserCheck,
  PlusCircle,
  Edit2,
  Trash2,
  Pin,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeftRight,
  Check,
  X,
  PieChart,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AccountsView: React.FC = () => {
  const {
    paymentMethods,
    debts,
    setActiveTab,
    getAccountBalance,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodHide,
    togglePaymentMethodPin,
  } = useMoney();

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<AccountMethod | null>(null);

  // Form states for Add / Edit
  const [formNameBn, setFormNameBn] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<AccountCategoryType>('cash');
  const [formInitBalance, setFormInitBalance] = useState('0');

  // Filter out hidden items for main view
  const activeMethods = paymentMethods.filter((p) => !p.isHidden);

  // Helper to categorize accounts
  const resolveAccountCategory = (m: AccountMethod): AccountCategoryType => {
    if (m.category) return m.category;
    const n = ((m.name || '') + ' ' + (m.nameBn || '')).toLowerCase();
    if (
      n.includes('bkash') ||
      n.includes('বিকাশ') ||
      n.includes('nagad') ||
      n.includes('নগদ') ||
      n.includes('upay') ||
      n.includes('উপায়') ||
      n.includes('tap') ||
      n.includes('ট্যাপ') ||
      n.includes('islamic') ||
      n.includes('rocket') ||
      n.includes('রকেট') ||
      n.includes('ভার্চুয়াল') ||
      n.includes('virtual')
    ) {
      return 'virtual';
    }
    if (
      n.includes('bank') ||
      n.includes('ব্যাংক') ||
      n.includes('card') ||
      n.includes('কার্ড') ||
      n.includes('ibbplc') ||
      n.includes('সোনালী') ||
      n.includes('সিটি')
    ) {
      return 'bank';
    }
    if (
      n.includes('dps') ||
      n.includes('সঞ্চয়') ||
      n.includes('শেয়ার') ||
      n.includes('ইনভেস্ট') ||
      n.includes('invest')
    ) {
      return 'investment';
    }
    if (
      n.includes('হোসাইন') ||
      n.includes('আম্মু') ||
      n.includes('স্যার') ||
      n.includes('ওবায়দুল্লাহ') ||
      n.includes('জাহিদুল') ||
      n.includes('বাসিত') ||
      n.includes('পাওনা') ||
      n.includes('ঋণী')
    ) {
      return 'receivable';
    }
    return 'cash';
  };

  const getCategoryItems = (cat: AccountCategoryType) => {
    return activeMethods.filter((m) => resolveAccountCategory(m) === cat);
  };

  const cashItems = getCategoryItems('cash');
  const bankItems = getCategoryItems('bank');
  const virtualItems = getCategoryItems('virtual');
  const receivableItems = getCategoryItems('receivable');
  const investmentItems = getCategoryItems('investment');

  // Subtotals
  const sumItems = (items: AccountMethod[]) => items.reduce((acc, item) => acc + getAccountBalance(item), 0);

  const cashTotal = sumItems(cashItems);
  const bankTotal = sumItems(bankItems);
  const virtualTotal = sumItems(virtualItems);
  const receivableTotal = sumItems(receivableItems);
  const investmentTotal = sumItems(investmentItems);

  // Denas (Liabilities)
  const totalLiabilities = debts
    .filter((d) => d.type === 'dena' && d.status !== 'settled')
    .reduce((sum, d) => sum + Math.max(0, d.amount - (d.paidAmount || 0)), 0);

  // Total Assets = Cash + Bank + Virtual + Receivables + Investments
  const totalAssets = cashTotal + bankTotal + virtualTotal + receivableTotal + investmentTotal;

  // Net Worth = Assets - Liabilities
  const netWorth = totalAssets - totalLiabilities;

  const handleOpenAdd = () => {
    setFormNameBn('');
    setFormName('');
    setFormCategory('cash');
    setFormInitBalance('0');
    setIsAddModalOpen(true);
  };

  const handleSaveNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameBn.trim()) {
      alert('অনুগ্রহ করে অ্যাকাউন্টের নাম লিখুন');
      return;
    }
    await addPaymentMethod(
      formNameBn.trim(),
      formName.trim() || formNameBn.trim(),
      formCategory,
      parseFloat(formInitBalance) || 0
    );
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (acc: AccountMethod) => {
    setEditingAcc(acc);
    setFormNameBn(acc.nameBn || '');
    setFormName(acc.name || '');
    setFormCategory(acc.category || 'cash');
    setFormInitBalance((acc.initialBalance || 0).toString());
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcc) return;
    await updatePaymentMethod(editingAcc.id, {
      nameBn: formNameBn,
      name: formName || formNameBn,
      category: formCategory,
      initialBalance: parseFloat(formInitBalance) || 0,
    });
    setEditingAcc(null);
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Top Bar Switcher (Matching User Screenshot 2) */}
      <div className="flex items-center justify-center p-1 bg-amber-400/20 rounded-2xl max-w-sm mx-auto border border-amber-400/30">
        <button
          onClick={() => setActiveTab('reports')}
          className="flex-1 py-2 text-xs sm:text-sm font-extrabold text-amber-200 hover:text-white rounded-xl transition-all text-center"
        >
          বিশ্লেষণ
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className="flex-1 py-2 text-xs sm:text-sm font-extrabold bg-slate-950 text-amber-400 shadow-md rounded-xl transition-all text-center border border-amber-400/50"
        >
          অ্যাকাউন্টস
        </button>
      </div>

      {/* Net Worth Card (নেট ওয়ার্থ) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-5 rounded-3xl border border-amber-500/30 shadow-xl relative overflow-hidden"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              নেট ওয়ার্থ (Net Worth)
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              BDT {netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
            <Wallet className="w-7 h-7" />
          </div>
        </div>

        {/* Sub-Card Breakdown: Asset & Liability */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-400 block mb-0.5">সম্পদ (Assets)</span>
            <p className="text-base sm:text-lg font-black text-emerald-300">
              BDT {totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-rose-500/30">
            <span className="text-xs font-bold text-rose-400 block mb-0.5">দায় (Liabilities)</span>
            <p className="text-base sm:text-lg font-black text-rose-300">
              BDT {totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-black text-slate-300 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          অ্যাকাউন্ট ক্যাটাগরি ও ব্যালেন্স
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন অ্যাকাউন্ট</span>
          </button>
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span>অ্যাকাউন্ট পরিচালনা</span>
          </button>
        </div>
      </div>

      {/* Category Section 1: নগদ (Cash) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 tracking-wider">নগদ</span>
          <span className="text-xs font-black text-amber-400">
            {cashTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {cashItems.map((item) => {
            const bal = getAccountBalance(item);
            return (
              <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{item.nameBn || item.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-white">
                  <span>BDT {bal.toLocaleString('en-US')}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Section 2: ডেবিট কার্ড / ব্যাংক (Bank) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 tracking-wider">ডেবিট কার্ড / ব্যাংক</span>
          <span className="text-xs font-black text-indigo-400">
            {bankTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {bankItems.map((item) => {
            const bal = getAccountBalance(item);
            return (
              <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{item.nameBn || item.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-white">
                  <span>BDT {bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Section 3: ভার্চুয়াল অ্যাকাউন্ট (Virtual Accounts) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 tracking-wider">ভার্চুয়াল অ্যাকাউন্ট</span>
          <span className="text-xs font-black text-sky-400">
            {virtualTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {virtualItems.map((item) => {
            const bal = getAccountBalance(item);
            return (
              <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{item.nameBn || item.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-white">
                  <span>BDT {bal.toLocaleString('en-US', { minimumFractionDigits: bal % 1 !== 0 ? 2 : 0 })}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Section 4: ক. আমাকে ঋণী (Receivables / পাওনা) */}
      <div className="bg-slate-900/90 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-md">
        <div className="px-4 py-3 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-emerald-400 tracking-wider block">
              ক. আমাকে ঋণী (Receivables)
            </span>
            <span className="text-[10px] text-emerald-300/70 font-medium">
              ইউজার অন্য কারোর কাছে টাকা পায় (নিজের সম্পদ / Asset)
            </span>
          </div>
          <span className="text-xs font-black text-emerald-400">
            BDT {receivableTotal.toLocaleString('en-US')}
          </span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {receivableItems.map((item) => {
            const bal = getAccountBalance(item);
            return (
              <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{item.nameBn || item.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-emerald-300">
                  <span>BDT {bal.toLocaleString('en-US')}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Section 5: খ. বিনিয়োগ (Investments) */}
      <div className="bg-slate-900/90 rounded-2xl border border-purple-500/30 overflow-hidden shadow-md">
        <div className="px-4 py-3 bg-purple-950/40 border-b border-purple-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-purple-400 tracking-wider block">
              খ. বিনিয়োগ (Investments)
            </span>
            <span className="text-[10px] text-purple-300/70 font-medium">
              সঞ্চয়পত্র, DPS, শেয়ারমার্কেট ইত্যাদি (নিজের সম্পদ / Asset)
            </span>
          </div>
          <span className="text-xs font-black text-purple-400">
            BDT {investmentTotal.toLocaleString('en-US')}
          </span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {investmentItems.map((item) => {
            const bal = getAccountBalance(item);
            return (
              <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{item.nameBn || item.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-purple-300">
                  <span>BDT {bal.toLocaleString('en-US')}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Management Modal (Matching User Screenshot 3) */}
      <AnimatePresence>
        {isManageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  অ্যাকাউন্ট পরিচালনা করুন
                </h3>
                <button
                  onClick={() => setIsManageModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800 pr-1 space-y-1">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-100 block">
                          {pm.nameBn || pm.name}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {pm.category === 'cash' ? 'নগদ' : pm.category === 'bank' ? 'ব্যাংক' : pm.category === 'virtual' ? 'ভার্চুয়াল' : pm.category === 'receivable' ? 'আমাকে ঋণী' : 'বিনিয়োগ'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => togglePaymentMethodPin(pm.id)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          pm.isPinned
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title="Pin / Unpin"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => togglePaymentMethodHide(pm.id)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          pm.isHidden
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title={pm.isHidden ? 'শো করুন' : 'হাইড করুন'}
                      >
                        {pm.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(pm)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${pm.nameBn || pm.name}" অ্যাকাউন্টটি ডিলিট করতে চান?`)) {
                            deletePaymentMethod(pm.id);
                          }
                        }}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={handleOpenAdd}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>নতুন অ্যাকাউন্ট যোগ করুন</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Account Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.form
              onSubmit={handleSaveNewAccount}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  নতুন অ্যাকাউন্ট যোগ করুন
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">অ্যাকাউন্টের বাংলা নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ডাচ-বাংলা ব্যাংক, জাহিদুল, DPS"
                    value={formNameBn}
                    onChange={(e) => setFormNameBn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">ক্যাটাগরি টাইপ</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AccountCategoryType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="cash">💵 নগদ (Cash)</option>
                    <option value="bank">🏦 ডেবিট কার্ড / ব্যাংক (Bank)</option>
                    <option value="virtual">📱 ভার্চুয়াল অ্যাকাউন্ট (Mobile Banking)</option>
                    <option value="receivable">🤝 ক. আমাকে ঋণী (Receivables / পাওনা)</option>
                    <option value="investment">📈 খ. বিনিয়োগ (Investments / DPS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">প্রারম্ভিক ব্যালেন্স (Initial Balance)</label>
                  <input
                    type="number"
                    step="any"
                    value={formInitBalance}
                    onChange={(e) => setFormInitBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:bg-amber-400"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Account Modal */}
      <AnimatePresence>
        {editingAcc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.form
              onSubmit={handleSaveEdit}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-400" />
                  অ্যাকাউন্ট এডিট করুন
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingAcc(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">অ্যাকাউন্টের বাংলা নাম</label>
                  <input
                    type="text"
                    required
                    value={formNameBn}
                    onChange={(e) => setFormNameBn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">ক্যাটাগরি টাইপ</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AccountCategoryType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="cash">💵 নগদ (Cash)</option>
                    <option value="bank">🏦 ডেবিট কার্ড / ব্যাংক (Bank)</option>
                    <option value="virtual">📱 ভার্চুয়াল অ্যাকাউন্ট (Mobile Banking)</option>
                    <option value="receivable">🤝 ক. আমাকে ঋণী (Receivables / পাওনা)</option>
                    <option value="investment">📈 খ. বিনিয়োগ (Investments / DPS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">প্রারম্ভিক ব্যালেন্স (Initial Balance)</label>
                  <input
                    type="number"
                    step="any"
                    value={formInitBalance}
                    onChange={(e) => setFormInitBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAcc(null)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:bg-amber-400"
                >
                  আপডেট করুন
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
