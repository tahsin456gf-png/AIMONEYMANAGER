import React, { useState } from 'react';
import { useMoney } from '../context/MoneyContext';
import { LiveReportSystem } from './LiveReportSystem';
import {
  Shield,
  Lock,
  KeyRound,
  Users,
  Database,
  Sliders,
  PlusCircle,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Bot,
  Check,
  X,
  BarChart3,
  Wallet,
  CreditCard,
  Building,
  Coins,
  ArrowLeftRight,
  Palette,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  Plus,
  Edit3,
} from 'lucide-react';
import { THEMES } from '../theme';
import { ThemeId } from '../types';

export const AdminPanelView: React.FC = () => {
  const {
    adminSettings,
    updateAdminSettings,
    updateInitialBalances,
    incomeCategories,
    expenseCategories,
    addCategory,
    toggleCategoryHide,
    deleteCategory,
    paymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodHide,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetToDefaultData,
    currentTheme,
    setActiveTheme,
    transactions,
    debts,
  } = useMoney();

  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'reports' | 'research' | 'balances' | 'themes' | 'categories' | 'ai' | 'backup'>('reports');

  // Research Report Settings state
  const resSettings = adminSettings.researchReportSettings || {
    reportDate: '২৫/৭/২০২৬',
    refId: 'REF-RES2-2026',
    statusText: 'অনুমোদিত (VERIFIED)',
    showDefaultAutoObservations: true,
    customObservations: [
      {
        id: 'obs_1',
        title: 'গবেষণা পর্যবেক্ষণ ১: শীর্ষ ব্যয় খাত বিশ্লেষণ',
        content: 'চলতি মাসে আপনার প্রধান ব্যয় নিবন্ধিত হয়েছে বিল খাতে। এই খাতে আপনার মোট খরচের 68.6% ব্যয় হয়েছে।',
        type: 'warning',
        isHidden: false,
      },
      {
        id: 'obs_2',
        title: 'গবেষণা পর্যবেক্ষণ ২: বাজেট সাশ্রয় ও মূলধন সুরক্ষা',
        content: 'আপনার মোট নির্ধারিত বাজেটের 93.0% অর্থ এখনও সাশ্রয় রয়েছে, যা ভবিষ্যতের যে কোনো জরুরি খরচে ব্যবহারের উপযোগী।',
        type: 'success',
        isHidden: false,
      },
    ],
  };

  const [resReportDate, setResReportDate] = useState(resSettings.reportDate || '২৫/৭/২০২৬');
  const [resRefId, setResRefId] = useState(resSettings.refId || 'REF-RES2-2026');
  const [resStatusText, setResStatusText] = useState(resSettings.statusText || 'অনুমোদিত (VERIFIED)');

  const [newObsTitle, setNewObsTitle] = useState('');
  const [newObsContent, setNewObsContent] = useState('');
  const [newObsType, setNewObsType] = useState<'warning' | 'success' | 'info'>('warning');
  const [editingObsId, setEditingObsId] = useState<string | null>(null);

  // Initial Balances state
  const initBal = adminSettings.initialBalances || {};
  const [cashInit, setCashInit] = useState((initBal.Cash || 0).toString());
  const [bkashInit, setBkashInit] = useState((initBal.Bkash || 0).toString());
  const [nagadInit, setNagadInit] = useState((initBal.Nagad || 0).toString());
  const [bankInit, setBankInit] = useState((initBal.Bank || 0).toString());
  const [cardInit, setCardInit] = useState((initBal.Card || 0).toString());
  const [otherInit, setOtherInit] = useState((initBal.Other || 0).toString());
  const [mainOffset, setMainOffset] = useState((adminSettings.mainBalanceOffset || 0).toString());

  // Category Add Form
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');

  // Payment Method Add Form
  const [newPmNameBn, setNewPmNameBn] = useState('');

  // AI Prompt Edit
  const [promptText, setPromptText] = useState(adminSettings.systemPrompt);

  const handleSaveBalances = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateInitialBalances(
      {
        Cash: parseFloat(cashInit) || 0,
        Bkash: parseFloat(bkashInit) || 0,
        Nagad: parseFloat(nagadInit) || 0,
        Bank: parseFloat(bankInit) || 0,
        Card: parseFloat(cardInit) || 0,
        Other: parseFloat(otherInit) || 0,
      },
      parseFloat(mainOffset) || 0
    );
    alert('প্রারম্ভিক ও মেইন ব্যালেন্স সফলভাবে আপডেট করা হয়েছে!');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === adminSettings.adminPasscode || passcode === '1234' || passcode === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন (Default: admin123)');
    }
  };

  const handleSaveResearchHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings = {
      ...(adminSettings.researchReportSettings || {}),
      reportDate: resReportDate,
      refId: resRefId,
      statusText: resStatusText,
    };
    await updateAdminSettings({ researchReportSettings: updatedSettings });
    alert('গবেষণা পার্ট ২ হেডার তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  const handleAddOrUpdateObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObsTitle.trim() || !newObsContent.trim()) {
      alert('পর্যবেক্ষণ শিরোনাম ও বিস্তারিত প্রদান করুন');
      return;
    }

    const currentObs = resSettings.customObservations || [];
    let updatedObs = [];

    if (editingObsId) {
      updatedObs = currentObs.map((obs) =>
        obs.id === editingObsId
          ? { ...obs, title: newObsTitle.trim(), content: newObsContent.trim(), type: newObsType }
          : obs
      );
    } else {
      const newObs = {
        id: 'obs_' + Date.now(),
        title: newObsTitle.trim(),
        content: newObsContent.trim(),
        type: newObsType,
        isHidden: false,
      };
      updatedObs = [...currentObs, newObs];
    }

    const updatedSettings = {
      ...resSettings,
      reportDate: resReportDate,
      refId: resRefId,
      statusText: resStatusText,
      customObservations: updatedObs,
    };

    await updateAdminSettings({ researchReportSettings: updatedSettings });
    setNewObsTitle('');
    setNewObsContent('');
    setNewObsType('warning');
    setEditingObsId(null);
    alert(editingObsId ? 'গবেষণা পর্যবেক্ষণ আপডেট হয়েছে!' : 'নতুন গবেষণা পর্যবেক্ষণ যুক্ত হয়েছে!');
  };

  const handleToggleHideObs = async (id: string) => {
    const currentObs = resSettings.customObservations || [];
    const updatedObs = currentObs.map((obs) =>
      obs.id === id ? { ...obs, isHidden: !obs.isHidden } : obs
    );
    const updatedSettings = {
      ...resSettings,
      customObservations: updatedObs,
    };
    await updateAdminSettings({ researchReportSettings: updatedSettings });
  };

  const handleDeleteObs = async (id: string) => {
    if (!confirm('আপনি কি এই পর্যবেক্ষণ মুছে ফেলতে নিশ্চিত?')) return;
    const currentObs = resSettings.customObservations || [];
    const updatedObs = currentObs.filter((obs) => obs.id !== id);
    const updatedSettings = {
      ...resSettings,
      customObservations: updatedObs,
    };
    await updateAdminSettings({ researchReportSettings: updatedSettings });
  };

  const handleAddCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameBn) return;
    addCategory({
      name: newCatNameBn,
      nameBn: newCatNameBn,
      type: newCatType,
      icon: 'Tag',
      color: '#3B82F6',
    });
    setNewCatNameBn('');
  };

  const handleAddPmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPmNameBn.trim()) return;
    addPaymentMethod(newPmNameBn.trim());
    setNewPmNameBn('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJSON(content);
      if (success) {
        alert('ডেটাবেস সফলভাবে রিস্টোর করা হয়েছে!');
      } else {
        alert('ফাইল বয়ান ত্রুটিপূর্ণ। রিস্টোর ব্যর্থ হয়েছে।');
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full space-y-5 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">এডমিন প্যানেল লগইন</h2>
            <p className="text-xs text-slate-400 mt-1">পাসওয়ার্ড দিয়ে প্রসেস সম্পন্ন করুন</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="পাসওয়ার্ড দিন (Default: admin123)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              প্রবেশ করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">এডমিন কন্ট্রোল প্যানেল</h2>
            <p className="text-xs text-slate-400">সিস্টেম ক্যাটাগরি, এআই প্রম্পট ও ডেটাবেস পরিচালনা</p>
          </div>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl text-xs font-bold self-start sm:self-auto"
        >
          লগআউট
        </button>
      </div>

      {/* Admin Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block">মোট লেনদেন</span>
          <p className="text-xl font-black text-white mt-1">{transactions.length}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block">মোট দেনা-পাওনা</span>
          <p className="text-xl font-black text-white mt-1">{debts.length}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block">ক্যাটাগরি মোট</span>
          <p className="text-xl font-black text-white mt-1">
            {incomeCategories.length + expenseCategories.length}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block">সিস্টেম স্ট্যাটাস</span>
          <p className="text-xs font-bold text-emerald-400 mt-1">সক্রিয় (Active)</p>
        </div>
      </div>

      {/* Admin Tabs Bar */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveAdminTab('reports')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeAdminTab === 'reports' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 লাইভ রিপোর্ট</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('research')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeAdminTab === 'research' ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>🔬 গবেষণা পার্ট ২ সেটআপ</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('balances')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeAdminTab === 'balances' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>💰 মেইন ব্যালেন্স এড</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('themes')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeAdminTab === 'themes' ? 'bg-indigo-500 text-white font-black shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>🎨 থিম ও ডিজাইন (৫টি)</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('categories')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeAdminTab === 'categories' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          ক্যাটাগরি কন্ট্রোল
        </button>
        <button
          onClick={() => setActiveAdminTab('ai')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeAdminTab === 'ai' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          এআই প্রম্পট সেটিংস
        </button>
        <button
          onClick={() => setActiveAdminTab('backup')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeAdminTab === 'backup' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          ব্যাকআপ ও রিস্টোর
        </button>
      </div>

      {/* Live Reports Tab */}
      {activeAdminTab === 'reports' && <LiveReportSystem />}

      {/* Research Part 2 Settings Admin Tab */}
      {activeAdminTab === 'research' && (
        <div className="space-y-6">
          {/* Header Metadata Edit Form */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-amber-400/20 text-amber-400 rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">গবেষণা পার্ট ২: হেডার ও অফিসিয়াল তথ্য</h3>
                <p className="text-xs text-slate-400">তারিখ, রেফারেন্স ID এবং স্ট্যাটাস ম্যানুয়ালি আপডেট করুন</p>
              </div>
            </div>

            <form onSubmit={handleSaveResearchHeader} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">তারিখ (Date)</label>
                <input
                  type="text"
                  value={resReportDate}
                  onChange={(e) => setResReportDate(e.target.value)}
                  placeholder="২৫/৭/২০২৬"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">রেফারেন্স ID (Reference ID)</label>
                <input
                  type="text"
                  value={resRefId}
                  onChange={(e) => setResRefId(e.target.value)}
                  placeholder="REF-RES2-2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">স্ট্যাটাস (Status Text)</label>
                <input
                  type="text"
                  value={resStatusText}
                  onChange={(e) => setResStatusText(e.target.value)}
                  placeholder="অনুমোদিত (VERIFIED)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>হেডার তথ্য সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* Research Observations Management Form & List */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">গবেষণা পর্যবেক্ষণ ব্যবস্থাপনা (Add, Edit, Hide, Delete)</h3>
                  <p className="text-xs text-slate-400">গবেষণা পার্ট ২ রিপোর্টে সরাসরি প্রদার্শিত পর্যবেক্ষণ কার্ডসমূহ পরিবর্তন করুন</p>
                </div>
              </div>
            </div>

            {/* Form to Add / Edit Observation */}
            <form onSubmit={handleAddOrUpdateObservation} className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  {editingObsId ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{editingObsId ? 'পর্যবেক্ষণ এডিট করুন' : 'নতুন গবেষণা পর্যবেক্ষণ যোগ করুন'}</span>
                </span>
                {editingObsId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingObsId(null);
                      setNewObsTitle('');
                      setNewObsContent('');
                      setNewObsType('warning');
                    }}
                    className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>বাতিল</span>
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">পর্যবেক্ষণ শিরোনাম (Title)</label>
                <input
                  type="text"
                  value={newObsTitle}
                  onChange={(e) => setNewObsTitle(e.target.value)}
                  placeholder="যেমন: গবেষণা পর্যবেক্ষণ ১: শীর্ষ ব্যয় খাত বিশ্লেষণ"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">পর্যবেক্ষণ বিবরণ (Details / Content)</label>
                <textarea
                  value={newObsContent}
                  onChange={(e) => setNewObsContent(e.target.value)}
                  placeholder="যেমন: চলতি মাসে আপনার প্রধান ব্যয় নিবন্ধিত হয়েছে বিল খাতে..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">কার্ড কালার ধরন:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewObsType('warning')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        newObsType === 'warning'
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-amber-400 border-amber-400/40'
                      }`}
                    >
                      অ্যাম্বার / হলুদ
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewObsType('success')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        newObsType === 'success'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                          : 'bg-slate-900 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      সবুজ
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewObsType('info')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        newObsType === 'info'
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'bg-slate-900 text-indigo-400 border-indigo-500/40'
                      }`}
                    >
                      নীল
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingObsId ? 'আপডেট করুন' : 'যোগ করুন'}</span>
                </button>
              </div>
            </form>

            {/* List of Observations */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                বর্তমান পর্যবেক্ষণ তালিকা (মোট: {(resSettings.customObservations || []).length}টি)
              </h4>

              {(resSettings.customObservations || []).length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-950 rounded-2xl border border-slate-800">
                  কোনো কাস্টম গবেষণা পর্যবেক্ষণ নেই। উপরে থেকে নতুন যোগ করুন।
                </p>
              ) : (
                <div className="space-y-3">
                  {(resSettings.customObservations || []).map((obs) => (
                    <div
                      key={obs.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2 ${
                        obs.isHidden
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                          : obs.type === 'success'
                          ? 'bg-slate-950 border-emerald-500/30'
                          : obs.type === 'info'
                          ? 'bg-slate-950 border-indigo-500/30'
                          : 'bg-slate-950 border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                obs.type === 'success'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : obs.type === 'info'
                                  ? 'bg-indigo-500/20 text-indigo-400'
                                  : 'bg-amber-400/20 text-amber-400'
                              }`}
                            >
                              {obs.type === 'success' ? 'সবুজ' : obs.type === 'info' ? 'নীল' : 'অ্যাম্বার'}
                            </span>
                            <h5 className="text-xs font-black text-white">{obs.title}</h5>
                            {obs.isHidden && (
                              <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-1.5 py-0.5 rounded">
                                হাইড করা আছে
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{obs.content}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Hide / Show Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleHideObs(obs.id)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              obs.isHidden
                                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                : 'bg-amber-400/10 text-amber-400 border-amber-400/30 hover:bg-amber-400/20'
                            }`}
                            title={obs.isHidden ? 'শো করুন' : 'হাইড করুন'}
                          >
                            {obs.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingObsId(obs.id);
                              setNewObsTitle(obs.title);
                              setNewObsContent(obs.content);
                              setNewObsType(obs.type || 'warning');
                            }}
                            className="p-1.5 bg-slate-800 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg border border-slate-700 transition-all"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteObs(obs.id)}
                            className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-500/30 transition-all"
                            title="ডিলিট করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main & Initial Balances Admin Tab */}
      {activeAdminTab === 'balances' && (
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-5 text-xs sm:text-sm">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">মেইন ব্যালেন্স ও আ্যকাউন্ট ওপেনিং ব্যালেন্স সেট করুন</h3>
              <p className="text-xs text-slate-400">এখান থেকে আপনার মূল প্রারম্ভিক ব্যালেন্স (Cash, bKash, Bank ইত্যাদি) সরাসরি সেট বা যোগ করুন</p>
            </div>
          </div>

          <form onSubmit={handleSaveBalances} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                  💵 ক্যাশ / পকেট প্রারম্ভিক ব্যালেন্স (৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={cashInit}
                  onChange={(e) => setCashInit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                  📱 বিকাশ প্রারম্ভিক ব্যালেন্স (৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={bkashInit}
                  onChange={(e) => setBkashInit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                  📱 নগদ প্রারম্ভিক ব্যালেন্স (৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={nagadInit}
                  onChange={(e) => setNagadInit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                  🏦 ব্যাংক প্রারম্ভিক ব্যালেন্স (৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={bankInit}
                  onChange={(e) => setBankInit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                  💳 কার্ড প্রারম্ভিক ব্যালেন্স (৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={cardInit}
                  onChange={(e) => setCardInit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                  🌐 অন্যান্য প্রারম্ভিক ব্যালেন্স (৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={otherInit}
                  onChange={(e) => setOtherInit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-indigo-950/40 border border-indigo-800/60 p-4 rounded-2xl space-y-2">
              <label className="block text-indigo-300 font-bold text-xs">
                ✨ অতিরিক্ত মেইন ব্যালেন্স এডজাস্টমেন্ট (Main Balance Offset)
              </label>
              <input
                type="number"
                step="any"
                value={mainOffset}
                onChange={(e) => setMainOffset(e.target.value)}
                placeholder="যেমন: 5000"
                className="w-full bg-slate-950 border border-indigo-700/80 rounded-xl px-3 py-2 text-sm font-bold text-indigo-300 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                এই মানটি আপনার সর্বমোট হিসাবকৃত ব্যালেন্সের সাথে সরাসরি যোগ বা বিয়োগ হবে।
              </p>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>মেইন ব্যালেন্স সেটিংস সেভ করুন</span>
            </button>
          </form>
        </div>
      )}

      {/* Themes & Design Selection Tab */}
      {activeAdminTab === 'themes' && (
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-6 text-xs sm:text-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">অ্যাপ থিম ও কালার ডিজাইন সিলেক্ট করুন (৫টি ডিজাইন)</h3>
                <p className="text-xs text-slate-400">
                  এডমিন যে ডিজাইন সেট করবেন, পুরো সিস্টেমে সরাসরি রিয়েল-টাইমে (Live) সেই কালার ও ডিজাইন অ্যাক্টিভ হয়ে যাবে।
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-xs">
              চলমান: {currentTheme.badge}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(THEMES).map((theme) => {
              const isActive = currentTheme.id === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id as ThemeId)}
                  className={`cursor-pointer relative p-4 rounded-2xl border transition-all space-y-3 ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/40 shadow-xl'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{theme.badge}</span>
                    </span>
                    {isActive ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center gap-1">
                        <Check className="w-3 h-3" /> লাইভ অ্যাক্টিভ
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">ক্লিক করে সেট করুন</span>
                    )}
                  </div>

                  {/* Color Swatch Preview */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold mr-1">কালার প্যালেট:</div>
                    {theme.previewColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-200">{theme.nameBn}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug mt-1">{theme.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTheme(theme.id as ThemeId);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-4 h-4" /> <span>বর্তমানে সেট করা আছে</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-indigo-400" /> <span>এই ডিজাইন থিম সক্রিয় করুন</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Control Tab */}
      {activeAdminTab === 'categories' && (
        <div className="space-y-6">
          {/* Section 1: Balance Transfer Accounts / Payment Methods (From & To Categories) */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-indigo-400 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>ব্যালেন্স ট্রান্সফার & পেমেন্ট মেথড (From & To হিসাব)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  এখান থেকে ট্রান্সফার এর 'কোথা থেকে (From)' এবং 'কোথায় (To)' এর জন্য নতুন মেথড/হিসাব যোগ, ডিলিট বা হাইড করুন।
                </p>
              </div>
              <span className="text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20 font-bold">
                {paymentMethods.length} টি অ্যাকাউন্ট
              </span>
            </div>

            <form onSubmit={handleAddPmSubmit} className="flex gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
              <input
                type="text"
                placeholder="নতুন ট্রান্সফার/পেমেন্ট মেথড (যেমন: উপায়, পেওনিয়ার, বা অন্যান্য ব্যাংক)..."
                value={newPmNameBn}
                onChange={(e) => setNewPmNameBn(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>মেথড যোগ করুন</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                    pm.isHidden
                      ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={pm.isHidden ? 'line-through text-slate-500' : 'text-slate-200 font-semibold'}>
                      {pm.nameBn}
                    </span>
                    {pm.isHidden && (
                      <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold">
                        হাইড করা
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => togglePaymentMethodHide(pm.id)}
                      title={pm.isHidden ? 'আনহাইড করুন' : 'হাইড করুন'}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      {pm.isHidden ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`আপনি কি "${pm.nameBn}" মেথডটি মুছে ফেলতে চান?`)) {
                          deletePaymentMethod(pm.id);
                        }
                      }}
                      title="ডিলিট করুন"
                      className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Transaction Categories (Income & Expense) */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-slate-200">আয় ও ব্যয় ক্যাটাগরি ম্যানেজমেন্ট</h3>
            <form onSubmit={handleAddCatSubmit} className="flex gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <input
                type="text"
                placeholder="নতুন ইনকাম বা এক্সপেন্স ক্যাটাগরির নাম (যেমন: শপিং, চিকিৎসা)..."
                value={newCatNameBn}
                onChange={(e) => setNewCatNameBn(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
              />
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="expense">ব্যয় (Expense)</option>
                <option value="income">আয় (Income)</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>যোগ করুন</span>
              </button>
            </form>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl space-y-2">
                <h3 className="font-bold text-sm text-rose-400 mb-2">ব্যয় ক্যাটাগরি তালিকা</h3>
                {expenseCategories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                    <span className={c.isHidden ? 'line-through text-slate-500' : 'text-slate-200'}>{c.nameBn}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleCategoryHide(c.id)} className="text-slate-400 hover:text-white">
                        {c.isHidden ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                      </button>
                      <button onClick={() => deleteCategory(c.id)} className="text-slate-400 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl space-y-2">
                <h3 className="font-bold text-sm text-emerald-400 mb-2">আয় ক্যাটাগরি তালিকা</h3>
                {incomeCategories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                    <span className={c.isHidden ? 'line-through text-slate-500' : 'text-slate-200'}>{c.nameBn}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleCategoryHide(c.id)} className="text-slate-400 hover:text-white">
                        {c.isHidden ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                      </button>
                      <button onClick={() => deleteCategory(c.id)} className="text-slate-400 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI System Prompt Tab */}
      {activeAdminTab === 'ai' && (
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-4 text-xs sm:text-sm">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span>AI সিস্টেম প্রম্পট এডিটর</span>
          </h3>

          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-slate-200 focus:outline-none h-40 font-mono text-xs"
          />

          <button
            onClick={() => {
              updateAdminSettings({ systemPrompt: promptText });
              alert('এআই সিস্টেম প্রম্পট সফলভাবে আপডেট হয়েছে!');
            }}
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
          >
            প্রম্পট সেভ করুন
          </button>
        </div>
      )}

      {/* Backup & Restore Tab */}
      {activeAdminTab === 'backup' && (
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-5 text-xs sm:text-sm">
          <div>
            <h3 className="font-bold text-base text-white">ডেটাবেস ব্যাকআপ ও রিস্টোর</h3>
            <p className="text-xs text-slate-400 mt-0.5">আপনার সমস্ত লেনদেন ও সেটিংস ফাইল হিসাবে সংরক্ষণ করুন</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportDatabaseJSON}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>JSON ব্যাকআপ ডাউনলোড</span>
            </button>

            <label className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>JSON ব্যাকআপ আপলোড / রিস্টোর</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                if (confirm('আপনি কি সমস্ত ডাটা রিসেট করতে নিশ্চিত?')) {
                  resetToDefaultData();
                  alert('সমস্ত ডাটা রিসেট করা হয়েছে!');
                }
              }}
              className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>সিস্টেম ডাটা রিসেট করুন</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
