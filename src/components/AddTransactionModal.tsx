import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import { X, Camera, Sparkles, PlusCircle, MinusCircle, Check } from 'lucide-react';
import { PaymentMethod, TransactionType } from '../types';

interface AddTransactionModalProps {
  initialType?: TransactionType;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  initialType = 'expense',
  onClose,
}) => {
  const { addTransaction, incomeCategories, expenseCategories, paymentMethods } = useMoney();

  const activePaymentMethods = paymentMethods.filter((p) => !p.isHidden);

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(activePaymentMethods[0]?.name || 'Cash');
  const [note, setNote] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const activeCategories =
    type === 'income' ? incomeCategories.map((c) => c.nameBn) : expenseCategories.map((c) => c.nameBn);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      date,
      paymentMethod,
      note,
      receiptImage: receiptImage || undefined,
    });

    onClose();
  };

  const handleReceiptScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setReceiptImage(base64);
      setIsScanning(true);

      try {
        const response = await fetch('/api/ai/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const ocr = await response.json();

        if (ocr.totalAmount) setAmount(ocr.totalAmount.toString());
        if (ocr.suggestedCategory) setCategory(ocr.suggestedCategory);
        if (ocr.date) setDate(ocr.date);
        if (ocr.itemsSummary || ocr.storeName) setNote(ocr.itemsSummary || ocr.storeName);
      } catch (err) {
        console.error('OCR Error:', err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full space-y-4 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {type === 'income' ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
            </div>
            <h3 className="font-bold text-base text-white">
              {type === 'income' ? 'আয় যোগ করুন (Add Income)' : 'ব্যয় যোগ করুন (Add Expense)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
          {/* Income vs Expense Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 font-bold">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400'
              }`}
            >
              ব্যয় (Expense)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                type === 'income' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              আয় (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-slate-400 mb-1">টাকার পরিমাণ (৳)</label>
            <input
              type="number"
              step="any"
              required
              placeholder="যেমন: 480"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-base font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-slate-400 mb-1">ক্যাটাগরি</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
            >
              <option value="">ক্যাটাগরি নির্বাচন করুন...</option>
              {activeCategories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">তারিখ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">পেমেন্ট মেথড</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 focus:outline-none"
              >
                {activePaymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.name}>
                    {pm.nameBn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-slate-400 mb-1">নোট / বিবরণী</label>
            <input
              type="text"
              placeholder="যেমন: নাস্তা ও বাজারের খরচ"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
            />
          </div>

          {/* Receipt Image OCR */}
          <div className="pt-1">
            <label className="flex items-center justify-center gap-2 p-3 bg-slate-950 hover:bg-slate-800/80 border border-dashed border-slate-700 rounded-2xl cursor-pointer text-xs font-semibold text-slate-300 transition-all">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>{isScanning ? 'এআই রসিদ স্ক্যান হচ্ছে...' : 'রসিদ / মেমো ফটো আপলোড ও AI Scan'}</span>
              <input type="file" accept="image/*" onChange={handleReceiptScan} className="hidden" />
            </label>
            {receiptImage && (
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> রসিদ ফটো যুক্ত হয়েছে
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-2xl font-bold transition-all text-sm mt-3 ${
              type === 'income'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-rose-500 hover:bg-rose-400 text-white'
            }`}
          >
            {type === 'income' ? 'আয় ড্যাশবোর্ডে যোগ করুন' : 'ব্যয় ড্যাশবোর্ডে যোগ করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};
