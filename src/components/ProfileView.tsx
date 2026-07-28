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
  LogOut,
  UserCheck,
  User,
  Phone,
  Calendar,
  Shield,
  Key,
  Save,
  Share2,
  Copy,
  Check,
  Gift,
  Users,
  MessageCircle,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    updateUserPasswords,
    exportDatabaseJSON,
    importDatabaseJSON,
    currentTheme,
    currentUser,
    logoutUser,
    allUsers,
  } = useMoney();

  const [pin, setPin] = useState(userProfile.pinCode);

  // State for Password change
  const [newPassword, setNewPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Referral Link state
  const [copiedLink, setCopiedLink] = useState(false);

  const refCode = currentUser?.phone || userProfile.phone || '01700000001';
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const referralUrl = `${baseUrl}?ref=${refCode}`;

  const referredUsersList = allUsers.filter((u) => u.referredBy === refCode || u.referredBy === currentUser?.id);

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      alert(`আপনার রেফারেল লিংক: ${referralUrl}`);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `🎉 AI Money Manager অ্যাপে জয়েন করুন! আপনার আয়-ব্যয়ের হিসাব রাখুন সহজে ও নিরাপদে।\n\nআমার রেফারেল লিংক ব্যবহার করে ফ্রিতে একাউন্ট করুন:\n${referralUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'AI Money Manager - রেফারেল লিংক',
          text: `AI Money Manager-এ জয়েন করুন আমার রেফারেল লিংক থেকে:`,
          url: referralUrl,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handlePinSave = () => {
    updateUserProfile({ pinCode: pin });
    alert('পিন কোড সফলভাবে পরিবর্তন করা হয়েছে!');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (!newPassword.trim() && !newAdminPassword.trim()) {
      setPassMessage({ type: 'error', text: 'অনুগ্রহ করে নতুন লগইন পাসওয়ার্ড বা ইউজার এডমিন পাসওয়ার্ড লিখুন!' });
      return;
    }

    if (newPassword.trim() && newPassword.trim().length < 4) {
      setPassMessage({ type: 'error', text: 'নতুন লগইন পাসওয়ার্ড অন্তত ৪ ডিজিটের হতে হবে!' });
      return;
    }

    if (newAdminPassword.trim() && newAdminPassword.trim().length < 4) {
      setPassMessage({ type: 'error', text: 'নতুন এডমিন পাসওয়ার্ড অন্তত ৪ ডিজিটের হতে হবে!' });
      return;
    }

    setIsUpdatingPass(true);
    try {
      const payload: { password?: string; adminPassword?: string } = {};
      if (newPassword.trim()) payload.password = newPassword.trim();
      if (newAdminPassword.trim()) payload.adminPassword = newAdminPassword.trim();

      const res = await updateUserPasswords(payload);
      if (res.success) {
        setPassMessage({
          type: 'success',
          text: '🎉 পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে! এখন থেকে আপনার পুরনো পাসওয়ার্ড আর কাজ করবে না।',
        });
        setNewPassword('');
        setNewAdminPassword('');
      } else {
        setPassMessage({ type: 'error', text: res.message || 'পাসওয়ার্ড পরিবর্তন করা সম্ভব হয়নি।' });
      }
    } catch (err: any) {
      setPassMessage({ type: 'error', text: 'পাসওয়ার্ড আপডেটে সমস্যা হয়েছে!' });
    } finally {
      setIsUpdatingPass(false);
    }
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

  // Registration date formatting
  const formattedJoinedDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'সম্প্রতি';

  return (
    <div className="space-y-6 pb-24">
      {/* Header Profile Card */}
      <div className={`${currentTheme.cardBgClass} p-6 rounded-3xl flex items-center justify-between shadow-sm`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-[2px]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-2xl text-emerald-400">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{currentUser?.name || userProfile.name}</h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                VERIFIED USER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">📱 {currentUser?.phone || userProfile.phone}</p>
          </div>
        </div>

        <button
          onClick={() => logoutUser()}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>লগআউট</span>
        </button>
      </div>

      {/* 1. Registration Info Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base border-b border-slate-800 pb-3">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          <h3>রেজিস্ট্রেশন ও অ্যাকাউন্ট তথ্য (Registration Info)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <User className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-slate-400 text-[11px]">পুরো নাম</p>
              <p className="font-bold text-slate-100">{currentUser?.name || 'অজ্ঞাত'}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <Phone className="w-4 h-4 text-sky-400" />
            <div>
              <p className="text-slate-400 text-[11px]">মোবাইল নম্বর</p>
              <p className="font-bold text-slate-100 font-mono">{currentUser?.phone || 'প্রযোজ্য নয়'}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-slate-400 text-[11px]">রেজিস্ট্রেশন তারিখ</p>
              <p className="font-bold text-slate-100">{formattedJoinedDate}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <Shield className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-slate-400 text-[11px]">অ্যাকাউন্ট রোল ও স্ট্যাটাস</p>
              <p className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {currentUser?.role === 'admin' ? 'এডমিন অ্যাকাউন্ট' : 'সাধারণ ইউজার'} (অনুমোদিত)
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real Referral Link & Share Card */}
      <div className="bg-slate-900/80 border border-indigo-500/30 p-5 rounded-3xl space-y-4 relative overflow-hidden shadow-xl shadow-indigo-500/5">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <Gift className="w-5 h-5 text-indigo-400" />
            <h3>রেফারেল লিংক ও ইনভাইট (Referral & Share)</h3>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            রেফারেল কোড: {refCode}
          </span>
        </div>

        <p className="text-xs text-slate-300">
          নিচের আপনার রিয়েল রেফারেল লিংকটি কপি করে বন্ধুদের সাথে শেয়ার করুন। এই লিংকে ক্লিক করে কেউ রেজিস্ট্রেশন করলে তিনি আপনার রেফারে যুক্ত হবেন!
        </p>

        {/* Copyable Referral URL Box */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-400">আপনার ব্যক্তিগত রেফারেল লিংক (Referral Link):</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-indigo-300 font-mono focus:outline-none select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>হোয়াটসঅ্যাপে শেয়ার করুন</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="py-2.5 px-4 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-sky-400" />
            <span>অন্যান্য সোশ্যাল মিডিয়ায় শেয়ার</span>
          </button>
        </div>

        {/* Total Referred Users Counter */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-4 h-4 text-amber-400" />
            <span>আপনার লিংকে মোট আমন্ত্রিত ইউজার:</span>
          </div>
          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            {referredUsersList.length} জন
          </span>
        </div>

        {referredUsersList.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold text-slate-400">আমন্ত্রিত ইউজার তালিকা:</p>
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
              {referredUsersList.map((u) => (
                <div key={u.id} className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-200">{u.name}</span>
                  <span className="font-mono text-slate-400">{u.phone}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Password Change Section */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base border-b border-slate-800 pb-3">
          <KeyRound className="w-5 h-5 text-amber-400" />
          <h3>পাসওয়ার্ড পরিবর্তন (Security & Passwords)</h3>
        </div>

        <p className="text-xs text-slate-400">
          এখানে আপনার অ্যাকাউন্টের লগইন পাসওয়ার্ড ও এডমিন পাসওয়ার্ড পরিবর্তন করতে পারেন। পাসওয়ার্ড পরিবর্তন করলে পুরনো পাসওয়ার্ডটি অবিলম্বে বাতিল হয়ে যাবে।
        </p>

        {passMessage && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold ${
              passMessage.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {passMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>নতুন লগইন পাসওয়ার্ড (New Login Password)</span>
              </label>
              <input
                type="password"
                placeholder="নতুন পাসওয়ার্ড লিখুন"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>নতুন ইউজার এডমিন পাসওয়ার্ড (New Admin Password)</span>
              </label>
              <input
                type="password"
                placeholder="নতুন এডমিন পাসওয়ার্ড লিখুন"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingPass}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" />
            <span>পাসওয়ার্ড পরিবর্তন করুন</span>
          </button>
        </form>
      </div>

      {/* 3. Settings Options Grid */}
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
