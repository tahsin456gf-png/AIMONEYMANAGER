import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import {
  ArrowLeftRight,
  PlusCircle,
  UserCheck,
  UserX,
  CheckCircle2,
  Trash2,
  Send,
  Calendar,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DebtType } from '../types';

export const DebtManagerView: React.FC = () => {
  const { debts, addDebt, payDebt, settleDebt, deleteDebt, currentTheme } = useMoney();

  const [activeTab, setActiveTab] = useState<DebtType>('pawna');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<string | null>(null);

  // Add Form State
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Pay Amount State
  const [payAmountInput, setPayAmountInput] = useState('');

  // Summaries
  const totalPawna = debts
    .filter((d) => d.type === 'pawna')
    .reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);

  const totalDena = debts
    .filter((d) => d.type === 'dena')
    .reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);

  const filteredDebts = debts.filter((d) => d.type === activeTab);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !amount) return;

    addDebt({
      type: activeTab,
      personName,
      amount: parseFloat(amount),
      dueDate: dueDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      date: new Date().toISOString().split('T')[0],
      notes,
    });

    setPersonName('');
    setAmount('');
    setNotes('');
    setDueDate('');
    setShowAddModal(false);
  };

  const handlePaySubmit = (debtId: string) => {
    if (!payAmountInput) return;
    payDebt(debtId, parseFloat(payAmountInput));
    setPayAmountInput('');
    setShowPayModal(null);
  };

  const copyReminderSMS = (person: string, remAmount: number, date: string) => {
    const text = `প্রিয় ${person}, আপনাকে ${date} তারিখে প্রদত্ত ৳${remAmount.toLocaleString()} টাকা পরিশোধের জন্য বিনম্র অনুরোধ করা হচ্ছে। - AI Money Manager`;
    navigator.clipboard.writeText(text);
    alert('রিমাইন্ডার মেসেজ কপি করা হয়েছে:\n\n' + text);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          onClick={() => setActiveTab('pawna')}
          className={`p-4 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'pawna'
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xl'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
            <span>পাওনা (আমার পাওনা টাকা)</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white">৳{totalPawna.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">যে টাকা অন্য ব্যক্তি আমাকে দিবে</span>
        </div>

        <div
          onClick={() => setActiveTab('dena')}
          className={`p-4 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'dena'
              ? 'bg-rose-500/10 border-rose-500/40 shadow-xl'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-1">
            <span>দেনা (অন্যের কাছে আমার দেনা)</span>
            <UserX className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white">৳{totalDena.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">যে টাকা আমাকে পরিশোধ করতে হবে</span>
        </div>
      </div>

      {/* Actions & Tab Header */}
      <div className={`flex items-center justify-between ${currentTheme.cardBgClass} p-3 rounded-2xl`}>
        <div className={`flex ${currentTheme.inputBgClass} p-1 rounded-xl text-xs font-bold`}>
          <button
            onClick={() => setActiveTab('pawna')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'pawna' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'opacity-70'
            }`}
          >
            পাওনা তালিকা ({debts.filter((d) => d.type === 'pawna').length})
          </button>
          <button
            onClick={() => setActiveTab('dena')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'dena' ? 'bg-rose-500 text-white font-extrabold' : 'opacity-70'
            }`}
          >
            দেনা তালিকা ({debts.filter((d) => d.type === 'dena').length})
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
            activeTab === 'pawna' ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'bg-rose-500 hover:bg-rose-400 text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{activeTab === 'pawna' ? 'নতুন পাওনা এড' : 'নতুন দেনা এড'}</span>
        </button>
      </div>

      {/* Debts Feed List */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className={`text-center py-12 ${currentTheme.cardBgClass} rounded-3xl`}>
            <p className="opacity-70 text-sm">কোন রেকর্ড পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredDebts.map((debt) => {
            const remaining = debt.amount - debt.paidAmount;
            return (
              <div
                key={debt.id}
                className={`${currentTheme.cardBgClass} ${currentTheme.cardHoverClass} p-4 rounded-3xl transition-all text-xs sm:text-sm space-y-3`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-100">{debt.personName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          debt.status === 'settled'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : debt.status === 'partial'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {debt.status === 'settled'
                          ? 'পরিশোধিত'
                          : debt.status === 'partial'
                          ? 'আংশিক পরিশোধিত'
                          : 'অপেক্ষমাণ'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{debt.notes || 'কোন বিবরণী নেই'}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-lg text-white">
                      ৳{remaining.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      মোট: ৳{debt.amount.toLocaleString()} (পরিশোধ: ৳{debt.paidAmount.toLocaleString()})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>মেয়াদ: {debt.dueDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {debt.type === 'pawna' && debt.status !== 'settled' && (
                      <button
                        onClick={() => copyReminderSMS(debt.personName, remaining, debt.dueDate)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        title="রিমাইন্ডার কপি করুন"
                      >
                        <Send className="w-3 h-3" />
                        <span>রিমাইন্ডার SMS</span>
                      </button>
                    )}

                    {debt.status !== 'settled' && (
                      <button
                        onClick={() => setShowPayModal(debt.id)}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-[11px] font-bold"
                      >
                        টাকা জমাদান
                      </button>
                    )}

                    <button
                      onClick={() => deleteDebt(debt.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Debt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">
                {activeTab === 'pawna' ? 'নতুন পাওনা যোগ' : 'নতুন দেনা যোগ'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 mb-1">ব্যক্তির নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সোহেল বা রহিম ভাই"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">টাকার পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  placeholder="যেমন: 2000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">পরিশোধের আনুমানিক তারিখ (Due Date)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">নোট বা কারণ</label>
                <textarea
                  placeholder="সংক্ষিপ্ত বিবরণী..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none h-20"
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

      {/* Pay Debt Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-base text-slate-100">টাকা জমা / আংশিক পরিশোধ</h3>
            <input
              type="number"
              placeholder="জমা টাকার পরিমাণ (৳)"
              value={payAmountInput}
              onChange={(e) => setPayAmountInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPayModal(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={() => handlePaySubmit(showPayModal)}
                className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
              >
                জমা নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
