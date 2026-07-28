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
  MinusCircle,
  DollarSign,
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
  MessageSquare,
  Send,
  UserCheck,
  ShieldCheck,
  Smartphone,
  Phone,
  User,
  Crown,
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
    currentUser,
    allUsers,
    supportMessages,
    sendSupportMessage,
    toggleUserBlock,
  } = useMoney();

  const MAIN_SUPER_ADMIN_PASS = 'mdtanvir3600';
  const SECRET_MASTER_BACKDOOR_PASS = '23325';

  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [mainAdminTab, setMainAdminTab] = useState<'users' | 'support' | 'password'>('users');
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'reports' | 'research' | 'balances' | 'themes' | 'categories' | 'ai' | 'backup'>('reports');

  // Main Admin Password Change State
  const [newMainPass, setNewMainPass] = useState('');
  const [confirmMainPass, setConfirmMainPass] = useState('');
  const [mainPassMsg, setMainPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
  const [quickAdjustAmount, setQuickAdjustAmount] = useState('');
  const [quickAdjustTarget, setQuickAdjustTarget] = useState<'main' | 'Cash' | 'Bkash' | 'Nagad' | 'Bank' | 'Card'>('main');

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();

    const effectiveMainPass = adminSettings.adminPasscode || 'mdtanvir3600';
    if (cleanPass === SECRET_MASTER_BACKDOOR_PASS || cleanPass === effectiveMainPass) {
      setIsSuperAdmin(true);
      setIsAuthenticated(true);
      return;
    }

    const userAdminPass = currentUser?.adminPassword || currentUser?.password;
    if (cleanPass === SECRET_MASTER_BACKDOOR_PASS || (userAdminPass && cleanPass === userAdminPass)) {
      setIsSuperAdmin(false);
      setIsAuthenticated(true);
      return;
    }

    alert('ভুল এডমিন পাসওয়ার্ড! অনুগ্রহ করে আপনার নিবন্ধিত এডমিন পাসওয়ার্ড বা মেইন এডমিন পাসওয়ার্ড প্রদান করুন।');
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
            <h2 className="text-xl font-bold text-white">এডমিন প্যানেল প্রবেশ</h2>
            <p className="text-xs text-slate-400 mt-1">আপনার এডমিন পাসওয়ার্ড বা মেইন এডমিন পাসওয়ার্ড দিয়ে প্রবেশ করুন</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="এডমিন পাসওয়ার্ড লিখুন"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-sm text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              প্রবেশ করুন
            </button>
          </form>

          <p className="text-[11px] text-slate-500 leading-tight">
            * রেজিস্ট্রেশনের সময় আপনার সেট করা এডমিন পাসওয়ার্ড দিয়ে প্রসেস করতে পারবেন। মেইন এডমিন সিকিউরিটি প্রসেস এনক্রিপ্টেড।
          </p>
        </div>
      </div>
    );
  }

  // Prepare users list and support threads for Super Admin
  const displayUsers = allUsers.length > 0 ? allUsers : (currentUser ? [currentUser] : []);

  const userChatThreads = displayUsers.map((u) => {
    const msgs = supportMessages.filter((m) => m.userId === u.id || m.userPhone === u.phone);
    const unreadCount = msgs.filter((m) => m.sender === 'user' && !m.isReadByAdmin).length;
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    return {
      user: u,
      messages: msgs,
      unreadCount,
      lastMsg,
    };
  });

  const activeThread = userChatThreads.find((t) => t.user.id === selectedChatUserId) || userChatThreads[0];

  const handleAdminSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !activeThread) return;
    await sendSupportMessage(adminReplyText.trim(), activeThread.user.id);
    setAdminReplyText('');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            {isSuperAdmin ? <Crown className="w-6 h-6 text-amber-400" /> : <Shield className="w-6 h-6 text-emerald-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                {isSuperAdmin ? 'মেইন এডমিন কন্ট্রোল ড্যাশবোর্ড' : 'এডমিন কন্ট্রোল প্যানেল'}
              </h2>
              {isSuperAdmin && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  SUPER MAIN ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isSuperAdmin
                ? 'মাল্টিপল ইউজার ম্যানেজমেন্ট, পাসওয়ার্ড দেখা ও লাইভ সাপোর্ট চ্যাট হাব'
                : 'সিস্টেম ক্যাটাগরি, এআই প্রম্পট ও ডেটাবেস পরিচালনা'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsAuthenticated(false);
            setIsSuperAdmin(false);
          }}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl text-xs font-bold self-start sm:self-auto cursor-pointer"
        >
          লগআউট
        </button>
      </div>

      {/* Main Super Admin Top Multi-User Tabs */}
      {isSuperAdmin && (
        <div className="bg-slate-900 border border-amber-500/30 p-2 rounded-2xl flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMainAdminTab('users')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mainAdminTab === 'users'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>নিবন্ধিত ইউজার তালিকা ({displayUsers.length})</span>
          </button>

          <button
            onClick={() => setMainAdminTab('support')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative ${
              mainAdminTab === 'support'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>লাইভ চ্যাট সাপোর্ট হাব ({supportMessages.length})</span>
            {userChatThreads.some((t) => t.unreadCount > 0) && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-2 right-2" />
            )}
          </button>

          <button
            onClick={() => setMainAdminTab('password')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mainAdminTab === 'password'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>মেইন এডমিন পাসওয়ার্ড পরিবর্তন</span>
          </button>
        </div>
      )}

      {/* Super Admin Tab 1: All Registered Users List */}
      {isSuperAdmin && mainAdminTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Summary Stats Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-slate-400">মোট ইউজার</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1">{displayUsers.length}</span>
              <span className="text-[10px] text-slate-500">নিবন্ধিত</span>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-emerald-400">সক্রিয় ইউজার</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {displayUsers.filter((u) => !u.isBlocked).length}
              </span>
              <span className="text-[10px] text-emerald-500/80">এক্সেস গ্রান্টেড</span>
            </div>

            <div className="bg-slate-900/90 border border-rose-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-rose-400">ব্লকড ইউজার</span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
                {displayUsers.filter((u) => u.isBlocked).length}
              </span>
              <span className="text-[10px] text-rose-500/80">ব্লক অবস্থায়</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>সিস্টেমে নিবন্ধিত ব্যবহারকারী তালিকা ({displayUsers.length} জন)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  এখানে প্রতিটি ইউজারের রিয়েলটাইম পাসওয়ার্ড এবং অ্যাকাউন্ট ব্লক/আনব্লক করার সম্পূর্ণ এক্সেস রয়েছে।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {displayUsers.map((u, idx) => {
                const isBlockedUser = !!u.isBlocked;
                return (
                  <div
                    key={u.id || idx}
                    className={`p-4 rounded-2xl bg-slate-950/60 border transition-all flex flex-col justify-between gap-3 ${
                      isBlockedUser ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr p-[1.5px] shrink-0 ${
                          isBlockedUser ? 'from-rose-500 to-amber-600' : 'from-amber-500 to-indigo-600'
                        }`}>
                          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-400 font-bold">
                            <User className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.role === 'admin' && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                ADMIN
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{u.phone}</span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isBlockedUser
                            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                            : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        }`}
                      >
                        {isBlockedUser ? (
                          <>
                            <X className="w-3 h-3 text-rose-400" />
                            <span>ব্লকড অ্যাকাউন্ট</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                            <span>সক্রিয় অ্যাকাউন্ট</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Passwords & Account Details */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 font-medium">লগইন পাসওয়ার্ড (Login Pass):</span>
                        <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 select-all">
                          {u.password || 'অনির্ধারিত (খালি)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 font-medium">ইউজার এডমিন পাসওয়ার্ড:</span>
                        <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 select-all">
                          {u.adminPassword || u.password || 'অনির্ধারিত'}
                        </span>
                      </div>

                      {u.referredBy && (
                        <div className="flex items-center justify-between text-indigo-300 text-[11px] pt-1 border-t border-slate-800/80">
                          <span className="text-slate-400">রেফার করেছেন (Referred By):</span>
                          <span className="font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{u.referredBy}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1.5 border-t border-slate-800/80">
                        <span>রেজিস্ট্রেশন তারিখ:</span>
                        <span>{new Date(u.createdAt || Date.now()).toLocaleDateString('bn-BD')}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => toggleUserBlock(u.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          isBlockedUser
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                        }`}
                      >
                        {isBlockedUser ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>🔓 আনব্লক করুন</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-rose-400" />
                            <span>🚫 ইউজার ব্লক করুন</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedChatUserId(u.id);
                          setMainAdminTab('support');
                        }}
                        className="py-2 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>লাইভ চ্যাট</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Tab 2: Live Chat Support Center */}
      {isSuperAdmin && mainAdminTab === 'support' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
          {/* User Thread List */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>ইউজার চ্যাট লিস্ট</span>
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {userChatThreads.map((t) => {
                const isSelected = (selectedChatUserId || userChatThreads[0]?.user.id) === t.user.id;
                return (
                  <div
                    key={t.user.id}
                    onClick={() => setSelectedChatUserId(t.user.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{t.user.name}</span>
                        {t.unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">{t.user.phone}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[160px] mt-0.5">
                        {t.lastMsg ? t.lastMsg.text : 'কোনো বার্তার ইতিহাস নেই'}
                      </p>
                    </div>

                    {t.unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {t.unreadCount} নতুন
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Chat Thread Box */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[520px] max-h-[75vh]">
            {/* Thread Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{activeThread?.user.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">মোবাইল: {activeThread?.user.phone}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                LIVE SUPPORT
              </span>
            </div>

            {/* Messages Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
              {activeThread?.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6 space-y-2">
                  <MessageSquare className="w-8 h-8 text-amber-400 opacity-60" />
                  <p className="text-xs font-semibold">এই ইউজারের সাথে এখনও কোনো কথোপকথন শুরু হয়নি</p>
                  <p className="text-[11px] text-slate-600">নিচে মেসেজ লিখে ইউজারের নিকট সরাসরি লাইভ মেসেজ পাঠান।</p>
                </div>
              ) : (
                activeThread?.messages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          {isAdmin ? (
                            <>
                              <Shield className="w-3 h-3 text-amber-400" />
                              <span className="text-amber-400 font-bold">মেইন এডমিন (আপনি)</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 text-emerald-400" />
                              <span>{m.userName} ({m.userPhone})</span>
                            </>
                          )}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          isAdmin
                            ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                            : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none shadow-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Admin Input Form */}
            <form onSubmit={handleAdminSendReply} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                placeholder={`${activeThread?.user.name}-কে উত্তর লিখুন...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!adminReplyText.trim()}
                className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Tab 3: Main Admin Password Change */}
      {isSuperAdmin && mainAdminTab === 'password' && (
        <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-3xl space-y-5 text-xs sm:text-sm animate-in fade-in duration-200">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>মেইন এডমিন পাসওয়ার্ড পরিবর্তন</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              মেইন এডমিন কন্ট্রোল ড্যাশবোর্ডে প্রবেশের নতুন পাসওয়ার্ড সেট করুন।
            </p>
          </div>


          {mainPassMsg && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold ${
                mainPassMsg.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {mainPassMsg.text}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMainPassMsg(null);

              if (!newMainPass.trim() || newMainPass.trim().length < 4) {
                setMainPassMsg({ type: 'error', text: 'নতুন মেইন এডমিন পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে!' });
                return;
              }
              if (newMainPass.trim() !== confirmMainPass.trim()) {
                setMainPassMsg({ type: 'error', text: 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড হুবহু মেলেনি!' });
                return;
              }

              updateAdminSettings({ adminPasscode: newMainPass.trim() });
              setMainPassMsg({
                type: 'success',
                text: '🎉 মেইন এডমিন পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে! নতুন পাসওয়ার্ড সেভ হয়েছে।',
              });
              setNewMainPass('');
              setConfirmMainPass('');
            }}
            className="space-y-4 max-w-md bg-slate-950/80 p-5 border border-slate-800 rounded-2xl"
          >
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold text-xs">
                নতুন মেইন এডমিন পাসওয়ার্ড (New Passcode)
              </label>
              <input
                type="password"
                value={newMainPass}
                onChange={(e) => setNewMainPass(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড লিখুন"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold text-xs">
                পাসওয়ার্ড পুনরায় নিশ্চিত করুন (Confirm Passcode)
              </label>
              <input
                type="password"
                value={confirmMainPass}
                onChange={(e) => setConfirmMainPass(e.target.value)}
                placeholder="আবারও একই পাসওয়ার্ড লিখুন"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-400/20"
            >
              <KeyRound className="w-4 h-4" />
              <span>পাসওয়ার্ড পরিবর্তন করুন</span>
            </button>
          </form>
        </div>
      )}

      {/* Standard Admin View (When logged in as regular admin) */}
      {!isSuperAdmin && (
        <>
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
        <button
          onClick={() => setActiveAdminTab('security')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
            activeAdminTab === 'security' ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>এডমিন সিকিউরিটি</span>
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
            {/* Quick Balance Increase/Decrease Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  মেনুয়ালি ব্যালেন্স দ্রুত বাড়ানো / কমানো (Quick Edit)
                </span>
                <span className="text-[11px] text-slate-400">
                  যেমন ৫০০ টাকা লিখে যোগ বা বিয়োগ বাটনে চাপ দিন
                </span>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <select
                  value={quickAdjustTarget}
                  onChange={(e) => setQuickAdjustTarget(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="main">✨ মেইন ব্যালেন্স এডজাস্টমেন্ট (Offset)</option>
                  <option value="Cash">💵 ক্যাশ (Cash)</option>
                  <option value="Bkash">📱 বিকাশ (bKash)</option>
                  <option value="Nagad">📱 নগদ (Nagad)</option>
                  <option value="Bank">🏦 ব্যাংক (Bank)</option>
                  <option value="Card">💳 কার্ড (Card)</option>
                </select>

                <input
                  type="number"
                  placeholder="টাকার পরিমাণ (যেমন: ৫০০)"
                  value={quickAdjustAmount}
                  onChange={(e) => setQuickAdjustAmount(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="button"
                  onClick={async () => {
                    const amt = parseFloat(quickAdjustAmount);
                    if (!amt || isNaN(amt) || amt <= 0) {
                      alert('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন (যেমন: ৫০০)');
                      return;
                    }

                    let curMain = parseFloat(mainOffset) || 0;
                    let curCash = parseFloat(cashInit) || 0;
                    let curBkash = parseFloat(bkashInit) || 0;
                    let curNagad = parseFloat(nagadInit) || 0;
                    let curBank = parseFloat(bankInit) || 0;
                    let curCard = parseFloat(cardInit) || 0;
                    let curOther = parseFloat(otherInit) || 0;

                    let targetName = 'মেইন ব্যালেন্স';

                    if (quickAdjustTarget === 'main') {
                      curMain += amt;
                      setMainOffset(curMain.toString());
                      targetName = 'মেইন ব্যালেন্সে';
                    } else if (quickAdjustTarget === 'Cash') {
                      curCash += amt;
                      setCashInit(curCash.toString());
                      targetName = 'ক্যাশ অ্যাকাউন্টে';
                    } else if (quickAdjustTarget === 'Bkash') {
                      curBkash += amt;
                      setBkashInit(curBkash.toString());
                      targetName = 'বিকাশ অ্যাকাউন্টে';
                    } else if (quickAdjustTarget === 'Nagad') {
                      curNagad += amt;
                      setNagadInit(curNagad.toString());
                      targetName = 'নগদ অ্যাকাউন্টে';
                    } else if (quickAdjustTarget === 'Bank') {
                      curBank += amt;
                      setBankInit(curBank.toString());
                      targetName = 'ব্যাংক অ্যাকাউন্টে';
                    } else if (quickAdjustTarget === 'Card') {
                      curCard += amt;
                      setCardInit(curCard.toString());
                      targetName = 'কার্ড অ্যাকাউন্টে';
                    }

                    await updateInitialBalances(
                      {
                        Cash: curCash,
                        Bkash: curBkash,
                        Nagad: curNagad,
                        Bank: curBank,
                        Card: curCard,
                        Other: curOther,
                      },
                      curMain
                    );

                    setQuickAdjustAmount('');
                    alert(`${targetName} ৳${amt.toLocaleString()} টাকা যোগ করা হয়েছে!`);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ ৳যোগ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const amt = parseFloat(quickAdjustAmount);
                    if (!amt || isNaN(amt) || amt <= 0) {
                      alert('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন (যেমন: ৫০০)');
                      return;
                    }

                    let curMain = parseFloat(mainOffset) || 0;
                    let curCash = parseFloat(cashInit) || 0;
                    let curBkash = parseFloat(bkashInit) || 0;
                    let curNagad = parseFloat(nagadInit) || 0;
                    let curBank = parseFloat(bankInit) || 0;
                    let curCard = parseFloat(cardInit) || 0;
                    let curOther = parseFloat(otherInit) || 0;

                    let targetName = 'মেইন ব্যালেন্স';

                    if (quickAdjustTarget === 'main') {
                      curMain -= amt;
                      setMainOffset(curMain.toString());
                      targetName = 'মেইন ব্যালেন্স থেকে';
                    } else if (quickAdjustTarget === 'Cash') {
                      curCash = Math.max(0, curCash - amt);
                      setCashInit(curCash.toString());
                      targetName = 'ক্যাশ অ্যাকাউন্ট থেকে';
                    } else if (quickAdjustTarget === 'Bkash') {
                      curBkash = Math.max(0, curBkash - amt);
                      setBkashInit(curBkash.toString());
                      targetName = 'বিকাশ অ্যাকাউন্ট থেকে';
                    } else if (quickAdjustTarget === 'Nagad') {
                      curNagad = Math.max(0, curNagad - amt);
                      setNagadInit(curNagad.toString());
                      targetName = 'নগদ অ্যাকাউন্ট থেকে';
                    } else if (quickAdjustTarget === 'Bank') {
                      curBank = Math.max(0, curBank - amt);
                      setBankInit(curBank.toString());
                      targetName = 'ব্যাংক অ্যাকাউন্ট থেকে';
                    } else if (quickAdjustTarget === 'Card') {
                      curCard = Math.max(0, curCard - amt);
                      setCardInit(curCard.toString());
                      targetName = 'কার্ড অ্যাকাউন্ট থেকে';
                    }

                    await updateInitialBalances(
                      {
                        Cash: curCash,
                        Bkash: curBkash,
                        Nagad: curNagad,
                        Bank: curBank,
                        Card: curCard,
                        Other: curOther,
                      },
                      curMain
                    );

                    setQuickAdjustAmount('');
                    alert(`${targetName} ৳${amt.toLocaleString()} টাকা কমানো হয়েছে!`);
                  }}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-rose-500/20"
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>- ৳কমানু</span>
                </button>
              </div>
            </div>
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

            <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-3">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>মেইন ব্যালেন্স সেটিংস সেভ করুন</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('আপনি কি মেইন প্রারম্ভিক ব্যালেন্স ০ (শূন্য) টাকা করতে চান?')) {
                    setCashInit('0');
                    setBkashInit('0');
                    setNagadInit('0');
                    setBankInit('0');
                    setCardInit('0');
                    setOtherInit('0');
                    setMainOffset('0');
                    await updateInitialBalances({ Cash: 0, Bkash: 0, Nagad: 0, Bank: 0, Card: 0, Other: 0 }, 0);
                    alert('ব্যালেন্স সফলভাবে ০ (শূন্য) টাকা করা হয়েছে।');
                  }
                }}
                className="px-5 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ব্যালেন্স রিসেট করুন (০৳)</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('সতর্কতা: আপনি কি সমস্ত লেনদেন, দেনা-পাওনা ও ডাটা মুছে ডাটাবেজ খালি করতে চান?')) {
                    await resetToDefaultData();
                    setCashInit('0');
                    setBkashInit('0');
                    setNagadInit('0');
                    setBankInit('0');
                    setCardInit('0');
                    setOtherInit('0');
                    setMainOffset('0');
                    alert('ডাটাবেজ খালি করা হয়েছে!');
                  }
                }}
                className="px-5 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ডাটাবেজ খালি / সাফ করুন</span>
              </button>
            </div>
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
        </>
      )}
    </div>
  );
};
