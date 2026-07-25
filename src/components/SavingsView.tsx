import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import { Target, PlusCircle, PiggyBank, Trash2, ShieldCheck, Sparkles, X, Plus, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SavingsView: React.FC = () => {
  const { savingsGoals, addSavingsGoal, depositSavings, withdrawSavings, deleteSavingsGoal, currentTheme } = useMoney();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [modalMode, setModalMode] = useState<'deposit' | 'withdraw'>('deposit');

  // Add Form
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    addSavingsGoal({
      title,
      targetAmount: parseFloat(targetAmount),
      targetDate: targetDate || '2026-12-31',
      color: '#3B82F6',
      icon: 'Target',
    });

    setTitle('');
    setTargetAmount('');
    setTargetDate('');
    setShowAddModal(false);
  };

  const handleAmountSubmit = () => {
    if (!selectedGoalId || !amountInput) return;
    const num = parseFloat(amountInput);

    if (modalMode === 'deposit') {
      depositSavings(selectedGoalId, num);
      const goal = savingsGoals.find((g) => g.id === selectedGoalId);
      if (goal && goal.currentAmount + num >= goal.targetAmount) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } else {
      withdrawSavings(selectedGoalId, num);
    }

    setAmountInput('');
    setSelectedGoalId(null);
  };

  const totalSavedAll = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetAll = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="space-y-5 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
            <PiggyBank className="w-4 h-4" />
            <span>স্মার্ট সঞ্চয় ট্র্যাকার</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            মোট সঞ্চয়: ৳{totalSavedAll.toLocaleString()}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            মোট টার্গেট: ৳{totalTargetAll.toLocaleString()} (
            {totalTargetAll > 0 ? Math.round((totalSavedAll / totalTargetAll) * 100) : 0}
            % সম্পন্ন)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন লক্ষ্য এড</span>
        </button>
      </div>

      {/* Savings Goal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {savingsGoals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className={`${currentTheme.cardBgClass} ${currentTheme.cardHoverClass} p-5 rounded-3xl space-y-4 relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{goal.title}</h3>
                  <span className="text-[11px] text-slate-400">মেয়াদ: {goal.targetDate}</span>
                </div>
                <button
                  onClick={() => deleteSavingsGoal(goal.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">
                    ৳{goal.currentAmount.toLocaleString()} / ৳{goal.targetAmount.toLocaleString()}
                  </span>
                  <span className="text-emerald-400 font-bold">{percent}%</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">বাকি আছে: ৳{remaining.toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setSelectedGoalId(goal.id);
                    setModalMode('deposit');
                  }}
                  className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>টাকা জমা</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedGoalId(goal.id);
                    setModalMode('withdraw');
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>উত্তোলন</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Savings Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">নতুন সঞ্চয় লক্ষ্য</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 mb-1">লক্ষ্যের নাম (Goal Title)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: নতুন ল্যাপটপ ফান্ড বা ইমার্জেন্সি ফান্ড"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">টার্গেট টাকার পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  placeholder="যেমন: 50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">টার্গেট ডেট</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all text-sm mt-2"
              >
                সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit/Withdraw Modal */}
      {selectedGoalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-base text-white">
              {modalMode === 'deposit' ? 'সঞ্চয়ে টাকা জমা' : 'সঞ্চয় থেকে টাকা উত্তোলন'}
            </h3>
            <input
              type="number"
              placeholder="টাকার পরিমাণ (৳)"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedGoalId(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold text-xs"
              >
                বাতিল
              </button>
              <button
                onClick={handleAmountSubmit}
                className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
