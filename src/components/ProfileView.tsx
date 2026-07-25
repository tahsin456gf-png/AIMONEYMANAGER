import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import {
  Settings,
  Lock,
  Moon,
  Sun,
  ShieldCheck,
  Download,
  Upload,
  Bot,
  Sparkles,
  Smartphone,
  Globe,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { userProfile, updateUserProfile, exportDatabaseJSON, importDatabaseJSON, currentTheme } = useMoney();

  const [pin, setPin] = useState(userProfile.pinCode);

  const handlePinSave = () => {
    updateUserProfile({ pinCode: pin });
    alert('পিন কোড সফলভাবে পরিবর্তন করা হয়েছে!');
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const ok = importDatabaseJSON(event.target?.result as string);
      if (ok) alert('ডাটা রিস্টোর সম্পন্ন হয়েছে!');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Profile Card */}
      <div className={`${currentTheme.cardBgClass} p-6 rounded-3xl flex items-center gap-4 shadow-sm`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-[2px]">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-2xl text-emerald-400">
            {userProfile.name.charAt(0)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{userProfile.name}</h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PRO USER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{userProfile.email}</p>
        </div>
      </div>

      {/* Settings Options Grid */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-4 text-xs sm:text-sm">
        <h3 className="font-bold text-base text-white">অ্যাপ সেটিংস ও সিকিউরিটি</h3>

        {/* Security PIN Lock */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">পিন লক সিকিউরিটি (PIN Lock)</span>
            </div>
            <input
              type="checkbox"
              checked={userProfile.pinLockEnabled}
              onChange={(e) => updateUserProfile({ pinLockEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500"
            />
          </div>

          {userProfile.pinLockEnabled && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4 Digit PIN"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-center text-xs text-white"
              />
              <button
                onClick={handlePinSave}
                className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                পিন সেভ
              </button>
            </div>
          )}
        </div>

        {/* Account Mode (Personal / Family / Business) */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <label className="block text-xs font-bold text-slate-300">অ্যাকাউন্ট মোড</label>
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            {(['personal', 'family', 'business'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => updateUserProfile({ familyOrBusinessMode: mode })}
                className={`py-2 rounded-xl transition-all capitalize ${
                  userProfile.familyOrBusinessMode === mode
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                {mode === 'personal' ? 'ব্যক্তিগত' : mode === 'family' ? 'ফ্যামিলি' : 'বিজনেস'}
              </button>
            ))}
          </div>
        </div>

        {/* Backup & Data Sync */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <span className="font-bold text-slate-200 block">ডাটা ব্যাকআপ ও সিঙ্ক (Backup)</span>
          <div className="flex gap-2">
            <button
              onClick={exportDatabaseJSON}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 text-xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>ডাউনলোড ব্যাকআপ</span>
            </button>
            <label className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 text-xs cursor-pointer">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>রিস্টোর ডাটা</span>
              <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
