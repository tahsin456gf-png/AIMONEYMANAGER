import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import {
  UserCheck,
  Lock,
  Phone,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Database,
  Smartphone,
  Users,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { loginUser, registerUser, switchDemoAccount, currentTheme } = useMoney();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (!name.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার পুরো নাম লিখুন!');
      return;
    }
    if (cleanPhone.length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন!');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('পাসওয়ার্ড অন্তত ৪ ডিজিটের হতে হবে!');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড হুবহু এক নয়!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        phone: cleanPhone,
        password: password.trim(),
        adminPassword: adminPassword.trim() || password.trim(),
      });

      if (res.success) {
        setSuccessMsg('🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং অটো অনুমোদন পেয়েছে!');
      } else {
        setErrorMsg(res.message || 'অ্যাকাউন্ট তৈরি করা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'রেজিস্ট্রেশনে ত্রুটি ঘটেছে!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (!cleanPhone) {
      setErrorMsg('মোবাইল নম্বর লিখুন!');
      return;
    }
    if (!password) {
      setErrorMsg('পাসওয়ার্ড প্রদান করুন!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser({
        phone: cleanPhone,
        password: password.trim(),
      });

      if (!res.success) {
        setErrorMsg(res.message || 'ফোন নাম্বার বা পাসওয়ার্ড ভুল হয়েছে!');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'লগইনে সমস্যা হয়েছে!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Top Brand Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 via-sky-500 to-indigo-600 rounded-2xl p-[2px] mx-auto shadow-lg shadow-emerald-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            AI MONEY MANAGER
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            মাল্টি-ইউজার মাল্টি-অ্যাকাউন্ট ফাইন্যান্সিয়াল প্ল্যাটফর্ম
          </p>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-400 flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>১০০% আলাদা ডাটাবেজ</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-amber-400 flex items-center gap-1.5 justify-center">
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span>অটো অনুমোদন সক্রিয়</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-950 border border-slate-800 p-1 rounded-2xl flex items-center text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন রেজিস্ট্রেশন</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>লগইন করুন</span>
          </button>
        </div>

        {/* Error / Success Alert Messages */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>আপনার নাম (Name)</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: মোঃ তামিম ইকবাল"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>ফোন নম্বর (Phone Number)</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="যেমন: 01700000000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>পাসওয়ার্ড (Password)</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>কনফার্ম পাসওয়ার্ড (Confirm Password)</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>এডমিন প্যানেল পাসওয়ার্ড (Set Admin Password)</span>
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="ফাঁকা রাখলে লগইন পাসওয়ার্ডই ব্যবহৃত হবে"
                className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-all placeholder:text-slate-600"
              />
              <p className="text-[10px] text-slate-400">
                💡 এডমিন প্যানেলে প্রবেশ করার সময় এই পাসওয়ার্ডটি ব্যবহার করবেন।
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <span>রেজিস্ট্রেশন হচ্ছে...</span>
              ) : (
                <>
                  <span>রেজিস্ট্রেশন সম্পন্ন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500 text-center font-medium">
              * রেজিস্ট্রেশন করার পর আপনার প্রাথমিক ব্যালেন্স ৳০ থাকবে এবং সমস্ত হিসাব ব্যক্তিগত থাকবে।
            </p>
          </form>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>ফোন নম্বর (Phone Number)</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01700000000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>পাসওয়ার্ড (Password)</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <span>লগইন হচ্ছে...</span>
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
