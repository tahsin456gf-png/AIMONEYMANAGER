import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import { Search, X, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';

interface SearchModalProps {
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const { transactions, debts, searchQuery, setSearchQuery } = useMoney();
  const [query, setQuery] = useState(searchQuery || '');

  const lowerQuery = query.toLowerCase().trim();

  // Filter transactions
  const matchedTx = transactions.filter((t) => {
    if (!lowerQuery) return true;
    return (
      t.note.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery) ||
      t.amount.toString().includes(lowerQuery) ||
      t.paymentMethod.toLowerCase().includes(lowerQuery) ||
      t.date.includes(lowerQuery)
    );
  });

  // Filter debts
  const matchedDebts = debts.filter((d) => {
    if (!lowerQuery) return true;
    return (
      d.personName.toLowerCase().includes(lowerQuery) ||
      d.notes.toLowerCase().includes(lowerQuery) ||
      d.amount.toString().includes(lowerQuery)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 pt-16">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xl w-full space-y-4 shadow-2xl">
        {/* Search Header */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-slate-100">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchQuery(e.target.value);
            }}
            placeholder="যেমন: খাদ্যে কত খরচ?, জুন মাসের খরচ, রহিমের পাওনা..."
            className="flex-1 bg-transparent text-xs sm:text-sm placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 py-1">
          {/* Matched Debts */}
          {matchedDebts.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-orange-400 block px-1">
                দেনা-পাওনা ম্যাচ ({matchedDebts.length})
              </span>
              {matchedDebts.map((d) => (
                <div
                  key={d.id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-orange-400" />
                    <div>
                      <h4 className="font-bold text-slate-100">{d.personName}</h4>
                      <p className="text-[10px] text-slate-400">{d.notes || d.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="font-black text-white">৳{(d.amount - d.paidAmount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Transactions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 block px-1">
              লেনদেন ম্যাচ ({matchedTx.length})
            </span>
            {matchedTx.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">কোন লেনদেন পাওয়া যায়নি।</p>
            ) : (
              matchedTx.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl ${
                        tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">{tx.category}</h4>
                      <p className="text-[10px] text-slate-400">{tx.note || 'নোট নেই'} • {tx.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-black text-xs block ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">{tx.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
