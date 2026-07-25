import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import {
  Wallet,
  AlertTriangle,
  PlusCircle,
  Sparkles,
  Trash2,
  Edit2,
  X,
  Target,
  BarChart3,
  Pencil,
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const {
    budgets,
    expenseCategories,
    setBudgetTarget,
    deleteBudget,
    transactions,
    savingsGoals,
    setActiveTab,
    currentTheme,
  } = useMoney();

  const [activeSubTab, setActiveSubTab] = useState<'monthlyBudget' | 'savingsGoals'>('monthlyBudget');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState('');
  const [targetAmountInput, setTargetAmountInput] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const currentMonthStr = new Date().toISOString().substring(0, 7);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat || !targetAmountInput) return;
    setBudgetTarget(selectedCat, parseFloat(targetAmountInput));
    setSelectedCat('');
    setTargetAmountInput('');
    setShowAddModal(false);
    setEditingBudgetId(null);
  };

  const handleStartEdit = (catName: string, currentTarget: number) => {
    setSelectedCat(catName);
    setTargetAmountInput(currentTarget.toString());
    setShowAddModal(true);
  };

  return (
    <div className="space-y-5 pb-28">
      {/* 1. Top Navigation Pills: Monthly Budget | Savings Goals */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('monthlyBudget')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'monthlyBudget'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Monthly Budget</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('savingsGoals');
            setActiveTab('savings');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'savingsGoals'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Savings Goals</span>
        </button>
      </div>

      {/* 2. AI Budget Warning Engine Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950 border border-amber-500/30 p-4 sm:p-5 rounded-3xl shadow-xl space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 text-sm sm:text-base font-black">
            <Sparkles className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>✨ AI Budget Warning Engine</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shrink-0 transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>নতুন বাজেট</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          বাজেটের 80% বা তার বেশি খরচ হলেই AI স্বয়ংক্রিয় সতর্কবার্তা দেবে।
        </p>
      </div>

      {/* 3. Category Budgets Grid matching Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {budgets.map((budget) => {
          const catSpent = transactions
            .filter(
              (t) =>
                t.type === 'expense' &&
                (t.category === budget.categoryId || t.category.includes(budget.categoryId)) &&
                t.date.startsWith(currentMonthStr)
            )
            .reduce((sum, t) => sum + t.amount, 0);

          const percent = budget.monthlyTarget > 0
            ? Math.round((catSpent / budget.monthlyTarget) * 100)
            : 0;

          const isWarning = percent >= 80;

          return (
            <div
              key={budget.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3 relative ${
                isWarning
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : `${currentTheme.cardBgClass} ${currentTheme.cardHoverClass}`
              }`}
            >
              {/* Category Name & AI Warning Tag */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-white">{budget.categoryId}</h3>

                  {isWarning && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Warning ({percent}%)</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(budget.categoryId, budget.monthlyTarget)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="ডিলিট করুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Amount Display */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                <span className="text-slate-200 font-mono">
                  ৳{catSpent.toLocaleString()} / ৳{budget.monthlyTarget.toLocaleString()}
                </span>
                <span
                  className={`font-black font-mono ${
                    percent >= 100
                      ? 'text-rose-400'
                      : percent >= 80
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {percent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percent >= 100
                      ? 'bg-rose-500'
                      : percent >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>

              {/* Quote Warning Banner matching Screenshot 1 */}
              {isWarning && (
                <p className="text-xs italic text-amber-300/90 font-medium pt-1">
                  "এই মাসে {budget.categoryId} খাতে {percent}% বাজেট শেষ!"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">ক্যাটাগরি বাজেট সেট করুন</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">ক্যাটাগরি নির্বাচন</label>
                <select
                  required
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">ক্যাটাগরি বেছে নিন...</option>
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.nameBn}>
                      {c.nameBn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">মাসিক বাজেট সীমা (৳)</label>
                <input
                  type="number"
                  required
                  placeholder="যেমন: 8000"
                  value={targetAmountInput}
                  onChange={(e) => setTargetAmountInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all text-sm mt-2 shadow-lg"
              >
                বাজেট সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
