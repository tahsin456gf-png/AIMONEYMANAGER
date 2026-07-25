import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import {
  Wallet,
  PlusCircle,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit2,
  Download,
  Calendar,
  CreditCard,
  Image,
  X,
  ArrowLeftRight,
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsViewProps {
  onOpenAddModal: (type: 'income' | 'expense') => void;
  onOpenTransferModal?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddModal,
  onOpenTransferModal,
}) => {
  const {
    transactions,
    deleteTransaction,
    incomeCategories,
    expenseCategories,
    currentTheme,
  } = useMoney();

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Filter Logic
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
    if (
      searchFilter &&
      !tx.note.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !tx.category.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !tx.amount.toString().includes(searchFilter)
    ) {
      return false;
    }
    return true;
  });

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // CSV Export
  const exportCSV = () => {
    const headers = ['ID,Type,Category,Amount,Date,Note,PaymentMethod\n'];
    const rows = filteredTransactions.map(
      (t) => `"${t.id}","${t.type}","${t.category}",${t.amount},"${t.date}","${t.note}","${t.paymentMethod}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  const allCategories = [
    ...incomeCategories.map((c) => c.nameBn),
    ...expenseCategories.map((c) => c.nameBn),
  ];

  return (
    <div className="space-y-5 pb-24">
      {/* Header Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${currentTheme.cardBgClass} p-4 rounded-3xl`}>
        <div>
          <h2 className="text-lg font-bold">লেনদেন ইতিহাস (Transactions)</h2>
          <p className="text-xs opacity-70">আপনার সমস্ত আয় ও ব্যয়ের তালিকা</p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTransferModal && (
            <button
              onClick={onOpenTransferModal}
              className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>ট্রান্সফার</span>
            </button>
          )}
          <button
            onClick={exportCSV}
            className={`p-2.5 rounded-xl ${currentTheme.isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-200'} text-xs font-semibold flex items-center gap-1.5`}
            title="CSV ডাউনলোড করুন"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={() => onOpenAddModal('expense')}
            className={`p-2.5 rounded-xl ${currentTheme.accentBtnClass} text-xs flex items-center gap-1.5`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন লেনদেন</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 opacity-50 absolute left-3 top-3" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="নোট বা ক্যাটাগরি সার্চ করুন..."
            className={`w-full ${currentTheme.inputBgClass} rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none`}
          />
        </div>

        {/* Type Toggle */}
        <div className={`flex ${currentTheme.inputBgClass} p-1 rounded-2xl text-xs font-semibold`}>
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              filterType === 'all' ? currentTheme.primaryAccentClass : 'opacity-70'
            }`}
          >
            সব ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              filterType === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'opacity-70'
            }`}
          >
            আয়
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              filterType === 'expense' ? 'bg-rose-500/20 text-rose-400' : 'opacity-70'
            }`}
          >
            ব্যয়
          </button>
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`w-full ${currentTheme.inputBgClass} rounded-2xl px-3 py-2 text-xs focus:outline-none`}
        >
          <option value="all">সব ক্যাটাগরি</option>
          {allCategories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Totals */}
      <div className={`flex items-center justify-between ${currentTheme.cardBgClass} p-3 rounded-2xl text-xs`}>
        <span className="opacity-80">ফিল্টার মোট আয়: <strong className="text-emerald-500 font-black">৳{totalFilteredIncome.toLocaleString()}</strong></span>
        <span className="opacity-80">ফিল্টার মোট ব্যয়: <strong className="text-rose-500 font-black">৳{totalFilteredExpense.toLocaleString()}</strong></span>
      </div>

      {/* Transactions Feed List */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className={`text-center py-12 ${currentTheme.cardBgClass} rounded-3xl`}>
            <p className="opacity-70 text-sm">কোন লেনদেন পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl ${currentTheme.cardBgClass} ${currentTheme.cardHoverClass} transition-all text-xs sm:text-sm`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    tx.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{tx.category}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${currentTheme.badgeClass}`}>
                      {tx.paymentMethod}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 mt-0.5">{tx.note || 'কোন বর্ণনা নেই'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {tx.receiptImage && (
                  <button
                    onClick={() => setSelectedReceipt(tx.receiptImage!)}
                    className="p-1.5 bg-slate-800/40 rounded-lg opacity-80 hover:opacity-100"
                    title="রসিদ মেমো দেখুন"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                )}

                <div className="text-right">
                  <span
                    className={`font-black text-sm block ${
                      tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] opacity-60">{tx.date}</span>
                </div>

                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="p-1.5 opacity-50 hover:opacity-100 text-rose-500 transition-opacity"
                  title="ডিলিট করুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Receipt Image Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 max-w-lg w-full">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-3 right-3 p-1.5 bg-slate-800 text-slate-300 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-sm text-slate-200 mb-3">মেমো / রসিদ ছবি</h3>
            <img src={selectedReceipt} alt="Receipt" className="w-full h-auto rounded-2xl max-h-[70vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
