import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import { X, ArrowLeftRight, Check, AlertCircle } from 'lucide-react';
import { PaymentMethod } from '../types';

interface TransferModalProps {
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ onClose }) => {
  const { transferBalance, paymentMethods } = useMoney();

  const activeMethods = paymentMethods.filter((p) => !p.isHidden);

  const [fromMethod, setFromMethod] = useState<PaymentMethod>(activeMethods[0]?.name || 'Cash');
  const [toMethod, setToMethod] = useState<PaymentMethod>(activeMethods[1]?.name || 'Bkash');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (fromMethod === toMethod) {
      setErrorMsg('উৎস এবং গন্তব্য হিসাব এক হতে পারবে না!');
      return;
    }

    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum <= 0) {
      setErrorMsg('সঠিক টাকার পরিমাণ দিন!');
      return;
    }

    const feeNum = parseFloat(fee) || 0;

    await transferBalance({
      fromMethod,
      toMethod,
      amount: amtNum,
      fee: feeNum,
      date,
      note,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">ব্যালেন্স ট্রান্সফার (Transfer Money)</h3>
              <p className="text-[11px] text-slate-400">এক হিসাব থেকে অন্য হিসাবে টাকা স্থানান্তরিত করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          {/* Account From & To */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">কোথা থেকে (From)</label>
              <select
                value={fromMethod}
                onChange={(e) => setFromMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
              >
                {activeMethods.map((pm) => (
                  <option key={pm.id} value={pm.name}>
                    {pm.nameBn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">কোথায় (To)</label>
              <select
                value={toMethod}
                onChange={(e) => setToMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
              >
                {activeMethods.map((pm) => (
                  <option key={pm.id} value={pm.name}>
                    {pm.nameBn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Fee */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">টাকার পরিমাণ (৳)</label>
              <input
                type="number"
                step="any"
                required
                placeholder="যেমন: 2000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-base font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">চার্জ / ফি (৳)</label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-base font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">তারিখ</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">নোট / বিবরণী</label>
            <input
              type="text"
              placeholder="যেমন: ক্যাশআউট বা ব্যাংক ডিপোজিট"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl font-bold transition-all text-sm mt-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>ট্রান্সফার সম্পন্ন করুন</span>
          </button>
        </form>
      </div>
    </div>
  );
};
