import React, { useState, useRef } from 'react';
import { useMoney } from '../context/MoneyContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  ChevronRight,
  Download,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  Layers,
  Search,
  Printer,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building,
  Award,
  ShieldCheck,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { motion } from 'motion/react';

export const LiveReportSystem: React.FC = () => {
  const { transactions, budgets, expenseCategories, incomeCategories, currentTheme, adminSettings } = useMoney();

  // Printable sheet ref and PDF state
  const printableSheetRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (!printableSheetRef.current) return;
    try {
      setIsGeneratingPDF(true);
      const element = printableSheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`AI_Money_Manager_Research_Report_${new Date().toISOString().substring(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('PDF ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Top Main View Selector: 'categoryChart' | 'accounts' | 'analysis' | 'excel' | 'researchPart2'
  const [activeView, setActiveView] = useState<'categoryChart' | 'accounts' | 'analysis' | 'excel' | 'researchPart2'>('categoryChart');

  // Type Switcher: 'expense' (ব্যয়) vs 'income' (আয়) vs 'all' (সব)
  const [reportType, setReportType] = useState<'expense' | 'income' | 'all'>('all');

  // Month/Date Filter Switcher: 'thisMonth' | 'lastMonth' | 'may' | 'april' | 'custom' | 'all'
  const [timePeriod, setTimePeriod] = useState<'thisMonth' | 'lastMonth' | 'may' | 'april' | 'custom' | 'all'>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Search filter for excel view
  const [searchQuery, setSearchQuery] = useState('');

  // Date strings calculation
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const lastMonthObj = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonthObj.getFullYear()}-${String(lastMonthObj.getMonth() + 1).padStart(2, '0')}`;

  // Filter transactions
  const monthFilteredTransactions = transactions.filter((t) => {
    if (timePeriod === 'all') return true;
    if (timePeriod === 'thisMonth') return t.date.startsWith(currentMonthStr);
    if (timePeriod === 'lastMonth') return t.date.startsWith(lastMonthStr);
    if (timePeriod === 'may') return t.date.startsWith('2026-05');
    if (timePeriod === 'april') return t.date.startsWith('2026-04');
    if (timePeriod === 'custom') {
      if (customStartDate && customEndDate) {
        return t.date >= customStartDate && t.date <= customEndDate;
      }
      if (customStartDate) {
        return t.date >= customStartDate;
      }
      if (customEndDate) {
        return t.date <= customEndDate;
      }
      return true;
    }
    return true;
  });

  // Totals
  const totalIncome = monthFilteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const totalExpense = monthFilteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  // Monthly Budget Calculation
  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.monthlyTarget, 0) || 33000;
  const budgetRemaining = Math.max(0, totalMonthlyBudget - totalExpense);
  const budgetUsedPercent = totalMonthlyBudget > 0
    ? ((totalExpense / totalMonthlyBudget) * 100).toFixed(2)
    : '0.00';

  // Custom colors matching Screenshot 3 & 2
  const CATEGORY_STYLE: { [key: string]: { color: string; bg: string; icon: string } } = {
    '🍔 খাদ্য': { color: '#FACC15', bg: '#FEF08A', icon: '🍽️' },
    '🚌 যানবাহন': { color: '#38BDF8', bg: '#BAE6FD', icon: '🚌' },
    '📱 ফোন': { color: '#F43F5E', bg: '#FECDD3', icon: '📱' },
    '🛒 কেনাকাটা': { color: '#2DD4BF', bg: '#CCFBF1', icon: '🛒' },
    '🔧 মেরামত': { color: '#10B981', bg: '#D1FAE5', icon: '🔧' },
    '👶 শিশু': { color: '#F472B6', bg: '#FCE7F3', icon: '👶' },
    '💇 সৌন্দর্য': { color: '#FB7185', bg: '#FFE4E6', icon: '💇' },
    '🎈 দান': { color: '#F87171', bg: '#FEE2E2', icon: '🎈' },
    '⚙️ চার্জ': { color: '#A3E635', bg: '#ECFCCB', icon: '⚙️' },
    '🏠 বাসা': { color: '#34D399', bg: '#D1FAE5', icon: '🏠' },
    '⚡ বিল': { color: '#A855F7', bg: '#F3E8FF', icon: '⚡' },
    '💻 ফ্রিল্যান্সিং': { color: '#10B981', bg: '#D1FAE5', icon: '💻' },
    '💰 বেতন': { color: '#3B82F6', bg: '#DBEAFE', icon: '💼' },
  } as any;

  const parseCategoryInfo = (catName: string, activeCategories: any[]) => {
    if (!catName) return { displayName: 'অন্যান্য', icon: '📁', color: '#9CA3AF' };

    // Match leading emoji if present
    const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\u200d)+\s*/u;
    const match = catName.match(emojiRegex);

    let icon = '📁';
    let displayName = catName;

    if (match) {
      icon = match[0].trim();
      displayName = catName.replace(emojiRegex, '').trim() || catName;
    }

    // Find matching category object in context categories
    const matchedSys = activeCategories.find((c) =>
      c.nameBn === catName ||
      c.name === catName ||
      c.nameBn === displayName ||
      c.name === displayName ||
      `${c.nameBn} (${c.name})` === catName
    );

    let color = matchedSys?.color;

    if (!color) {
      const style = CATEGORY_STYLE[catName] || CATEGORY_STYLE[displayName];
      if (style) {
        color = typeof style === 'string' ? style : style.color;
        if (typeof style === 'object' && style.icon) {
          icon = style.icon;
        }
      }
    }

    if (matchedSys && !match) {
      const iconMap: { [key: string]: string } = {
        Utensils: '🍽️',
        Bus: '🚌',
        Home: '🏠',
        Zap: '⚡',
        Smartphone: '📱',
        Activity: '💊',
        GraduationCap: '🎓',
        ShoppingCart: '🛒',
        Shirt: '👕',
        Gamepad2: '🎮',
        Gift: '🎁',
        Briefcase: '💼',
        CreditCard: '💳',
        Building2: '🏢',
        Laptop: '💻',
        Coins: '🪙',
        HeartHandshake: '🤝',
        MoreHorizontal: '📁',
      };
      if (matchedSys.icon && iconMap[matchedSys.icon]) {
        icon = iconMap[matchedSys.icon];
      }
    }

    return {
      displayName,
      icon,
      color: color || '#38BDF8',
    };
  };

  const DEFAULT_COLORS = ['#A855F7', '#FACC15', '#38BDF8', '#F43F5E', '#2DD4BF', '#10B981', '#F472B6', '#FB7185', '#06B6D4', '#EAB308'];

  // Category Breakdown for current type (expense, income, or all)
  const activeSystemCategories = reportType === 'all'
    ? [...expenseCategories, ...incomeCategories]
    : (reportType === 'expense' ? expenseCategories : incomeCategories);

  const typeTransactions = monthFilteredTransactions.filter((t) => {
    if (reportType === 'all') return true;
    return t.type === reportType;
  });
  const totalTypeAmount = typeTransactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap: { [cat: string]: number } = {};

  typeTransactions.forEach((t) => {
    if (!t.category) return;
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryList = Object.keys(categoryMap).map((catName, idx) => {
    const amt = categoryMap[catName];
    const pct = totalTypeAmount > 0 ? (amt / totalTypeAmount) * 100 : 0;
    const info = parseCategoryInfo(catName, activeSystemCategories);

    return {
      name: catName,
      displayName: info.displayName,
      amount: amt,
      percentage: pct,
      color: info.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      icon: info.icon,
    };
  }).sort((a, b) => b.amount - a.amount);

  // Line Chart Date Data
  const dateMap: { [date: string]: { income: number; expense: number } } = {};
  monthFilteredTransactions.forEach((t) => {
    if (!dateMap[t.date]) {
      dateMap[t.date] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      dateMap[t.date].income += t.amount;
    } else {
      dateMap[t.date].expense += t.amount;
    }
  });

  const sortedDates = Object.keys(dateMap).sort();
  const lineChartData = sortedDates.map((d) => ({
    date: d,
    Income: dateMap[d].income,
    Expense: dateMap[d].expense,
  }));

  const barChartData = [
    { name: 'Income (আয়)', amount: totalIncome, fill: '#10B981' },
    { name: 'Expense (ব্যয়)', amount: totalExpense, fill: '#F43F5E' },
  ];

  return (
    <div className="space-y-4 pb-28">
      {/* 1. Multi-Tab Bar preserving ALL system views */}
      <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none shadow-xl text-xs font-bold">
        <button
          onClick={() => setActiveView('categoryChart')}
          className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeView === 'categoryChart'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PieChartIcon className="w-3.5 h-3.5" />
          <span>খাতওয়ারী চার্ট</span>
        </button>

        <button
          onClick={() => setActiveView('accounts')}
          className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeView === 'accounts'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>অ্যাকাউন্টস</span>
        </button>

        <button
          onClick={() => setActiveView('analysis')}
          className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeView === 'analysis'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>গ্রাফ বিশ্লেষণ</span>
        </button>

        <button
          onClick={() => setActiveView('excel')}
          className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeView === 'excel'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>আয়-ব্যয় শিট</span>
        </button>

        <button
          onClick={() => setActiveView('researchPart2')}
          className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeView === 'researchPart2'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          <span>গবেষণা পার্ট ২</span>
        </button>
      </div>

      {/* 2. Top Yellow Header matching Screenshot 3 */}
      <div className="bg-amber-400 p-2 sm:p-3 rounded-2xl shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          {/* Black / Yellow Expense, Income & All Pill Toggle */}
          <div className="flex bg-amber-400 border border-slate-900/30 p-0.5 rounded-2xl w-60 sm:w-64">
            <button
              onClick={() => setReportType('all')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                reportType === 'all'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-950 hover:bg-amber-300'
              }`}
            >
              সব
            </button>
            <button
              onClick={() => setReportType('expense')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                reportType === 'expense'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-950 hover:bg-amber-300'
              }`}
            >
              ব্যয়
            </button>
            <button
              onClick={() => setReportType('income')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                reportType === 'income'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-950 hover:bg-amber-300'
              }`}
            >
              আয়
            </button>
          </div>

          {/* Calendar Icon Button */}
          <button
            onClick={() => setShowDatePicker(true)}
            className="p-2 bg-slate-950 text-amber-400 rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5 text-xs font-bold"
            title="তারিখ ফিল্টার করুন"
          >
            <Calendar className="w-4 h-4" />
            <span>তারিখ</span>
            {timePeriod === 'custom' && (
              <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-md">
                {customStartDate || 'শুরু'} - {customEndDate || 'শেষ'}
              </span>
            )}
          </button>
        </div>

        {/* Horizontal Month Filter Row */}
        <div className="flex items-center justify-between pt-1 text-xs font-bold border-t border-slate-950/10 overflow-x-auto gap-1 scrollbar-none">
          <button
            onClick={() => setTimePeriod('all')}
            className={`px-2 py-1 transition-all whitespace-nowrap ${
              timePeriod === 'all'
                ? 'text-slate-950 font-black border-b-2 border-slate-950'
                : 'text-slate-800/80 hover:text-slate-950'
            }`}
          >
            সব সময়
          </button>

          <button
            onClick={() => setTimePeriod('thisMonth')}
            className={`px-2 py-1 transition-all whitespace-nowrap ${
              timePeriod === 'thisMonth'
                ? 'text-slate-950 font-black border-b-2 border-slate-950'
                : 'text-slate-800/80 hover:text-slate-950'
            }`}
          >
            এই মাস
          </button>

          <button
            onClick={() => setTimePeriod('lastMonth')}
            className={`px-2 py-1 transition-all whitespace-nowrap ${
              timePeriod === 'lastMonth'
                ? 'text-slate-950 font-black border-b-2 border-slate-950'
                : 'text-slate-800/80 hover:text-slate-950'
            }`}
          >
            গত মাস
          </button>

          <button
            onClick={() => setTimePeriod('may')}
            className={`px-2 py-1 transition-all whitespace-nowrap ${
              timePeriod === 'may'
                ? 'text-slate-950 font-black border-b-2 border-slate-950'
                : 'text-slate-800/80 hover:text-slate-950'
            }`}
          >
            মে ২০২৬
          </button>

          <button
            onClick={() => setTimePeriod('april')}
            className={`px-2 py-1 transition-all whitespace-nowrap ${
              timePeriod === 'april'
                ? 'text-slate-950 font-black border-b-2 border-slate-950'
                : 'text-slate-800/80 hover:text-slate-950'
            }`}
          >
            এপ্রিল ২০২৬
          </button>

          {timePeriod === 'custom' && (
            <button
              onClick={() => setShowDatePicker(true)}
              className="px-2 py-1 text-slate-950 font-black border-b-2 border-slate-950 transition-all whitespace-nowrap flex items-center gap-1"
            >
              <span>📅 নির্দিষ্ট তারিখ</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 w-full max-w-md p-5 rounded-3xl space-y-4 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>তারিখ নির্বাচন করুন (LIVE DATE FILTER)</span>
              </h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block">দ্রুত তারিখ নির্বাচন (QUICK PRESETS):</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => {
                    setTimePeriod('all');
                    setShowDatePicker(false);
                  }}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-indigo-400 flex items-center justify-center gap-1 col-span-2"
                >
                  🌐 সব সময়ের হিসাব (ALL TIME RECORDS)
                </button>
                <button
                  onClick={() => {
                    setCustomStartDate(todayStr);
                    setCustomEndDate(todayStr);
                    setTimePeriod('custom');
                    setShowDatePicker(false);
                  }}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-amber-400 flex items-center justify-center gap-1"
                >
                  📅 আজ ({todayStr})
                </button>
                <button
                  onClick={() => {
                    setTimePeriod('thisMonth');
                    setShowDatePicker(false);
                  }}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-emerald-400 flex items-center justify-center gap-1"
                >
                  📆 এই মাস (চলতি মাস)
                </button>
                <button
                  onClick={() => {
                    setTimePeriod('lastMonth');
                    setShowDatePicker(false);
                  }}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-sky-400 flex items-center justify-center gap-1"
                >
                  ⏮️ গত মাস
                </button>
                <button
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 7);
                    setCustomStartDate(d.toISOString().split('T')[0]);
                    setCustomEndDate(todayStr);
                    setTimePeriod('custom');
                    setShowDatePicker(false);
                  }}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-purple-400 flex items-center justify-center gap-1"
                >
                  ⌛ গত ৭ দিন
                </button>
              </div>
            </div>

            {/* Custom Start & End Date Inputs */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 block">কাস্টম তারিখ রেন্জ (CUSTOM RANGE):</label>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block mb-1">শুরুর তারিখ (START DATE):</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block mb-1">শেষ তারিখ (END DATE):</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setTimePeriod('thisMonth');
                  setShowDatePicker(false);
                }}
                className="px-3 py-2 text-slate-400 hover:text-white text-xs font-bold"
              >
                রিসেট
              </button>
              <button
                onClick={() => {
                  setTimePeriod('custom');
                  setShowDatePicker(false);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-lg"
              >
                প্রয়োগ করুন (APPLY FILTER)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= VIEW 1: CATEGORY CHART (Exact Screenshot 3) ================= */}
      {activeView === 'categoryChart' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Donut Chart with Right Side Legend matching Screenshot 3 */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              {/* Left Side: Donut Chart with Total inside */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryList}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="amount"
                    >
                      {categoryList.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-xs sm:text-sm font-black text-white font-mono">
                    {totalTypeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Right Side: Category Legend matching Screenshot 3 */}
              <div className="flex-1 space-y-1.5 pl-2 text-xs">
                {categoryList.slice(0, 6).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-200 truncate">{cat.displayName}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-100 ml-1">
                      {cat.percentage.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots `...` */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
          </div>

          {/* Category List Items matching Screenshot 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 space-y-2 shadow-2xl">
            {categoryList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                কোন {reportType === 'expense' ? 'ব্যয়' : 'আয়'} রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              categoryList.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  {/* Round Icon Badge */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-inner"
                    style={{ backgroundColor: `${cat.color}25`, border: `1px solid ${cat.color}50` }}
                  >
                    <span>{cat.icon}</span>
                  </div>

                  {/* Name & Progress Bar */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                      <span className="text-white">{cat.displayName}</span>
                      <span className="text-slate-100 font-mono font-black">
                        ৳{cat.amount.toLocaleString('en-US')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, cat.percentage)}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                        {cat.percentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* ================= VIEW 2: ACCOUNTS & BUDGET (Exact Screenshot 2) ================= */}
      {activeView === 'accounts' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Card 1: "মাসিক পরিসংখ্যান - জুলাই >" */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1">
                <span>মাসিক পরিসংখ্যান - {timePeriod === 'thisMonth' ? 'জুলাই' : 'আগের মাস'}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-800">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1">ব্যয়</span>
                <span className="text-sm sm:text-base font-black text-rose-400 font-mono">
                  {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1">আয়</span>
                <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                  {totalIncome.toLocaleString('en-US')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1">ব্যালেন্স</span>
                <span className="text-sm sm:text-base font-black text-white font-mono">
                  {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: "মাসিক বাজেট >" */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1">
                <span>মাসিক বাজেট</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </h3>

              <div className="space-y-1 text-xs font-mono font-bold">
                <p className="text-slate-300">
                  <span className="text-slate-400 font-sans">বাজেট : </span>
                  <span className="text-white">{totalMonthlyBudget.toLocaleString('en-US')}</span>
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-400 font-sans">ব্যয় : </span>
                  <span className="text-rose-400">{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-400 font-sans">অবশিষ্ট : </span>
                  <span className="text-emerald-400">{budgetRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </p>
              </div>
            </div>

            {/* Pink Circular Progress Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-rose-500 transition-all duration-1000"
                  strokeDasharray={`${Math.min(100, parseFloat(budgetUsedPercent))}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                <span className="text-[11px] font-black text-rose-400 font-mono leading-tight">
                  {budgetUsedPercent}%
                </span>
                <span className="text-[9px] font-bold text-slate-400">ব্যবহৃত</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ================= VIEW 3: GRAPH ANALYSIS (Exact Screenshot 1) ================= */}
      {activeView === 'analysis' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* 1. Category Breakdown Pie Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
              খাতওয়ারী শতকরা খরচ
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
              {categoryList.map((cat) => (
                <span
                  key={cat.name}
                  className="px-2.5 py-1 rounded-full border bg-slate-950 font-mono"
                  style={{ color: cat.color, borderColor: `${cat.color}40` }}
                >
                  {cat.displayName} {Math.round(cat.percentage)}%
                </span>
              ))}
            </div>

            <div className="w-full h-60 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryList}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="amount"
                  >
                    {categoryList.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                    formatter={(val: number) => `৳${val.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Bar Chart: "আয় ও ব্যয়ের তুলনা (Bar Chart)" */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">📈</span>
              <span>আয় ও ব্যয়ের তুলনা (Bar Chart)</span>
            </h3>

            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', color: '#0F172A', fontWeight: 'bold' }}
                    formatter={(val: number, name: string) => [`পরিমাণ : ৳${val.toLocaleString()}`, name]}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Line Chart: "দৈনন্দিন খরচের ট্রেন্ড (Line Chart)" */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400">📈</span>
              <span>দৈনন্দিন খরচের ট্রেন্ড (Line Chart)</span>
            </h3>

            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', color: '#0F172A', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Expense" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* ================= VIEW 4: EXCEL LEDGER SHEET ================= */}
      {activeView === 'excel' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">স্মার্ট আয়-ব্যয় শিট (EXCEL SHEET VIEW)</h3>
                <p className="text-xs text-slate-400">তারিখ, সময়, বার, খাত ও টাকার বিস্তারিত টেবিল</p>
              </div>

              <button
                onClick={() => {
                  const headers = ['Date,Type,Category,Note,Amount\n'];
                  const rows = monthFilteredTransactions.map(
                    (t) => `"${t.date}","${t.type}","${t.category}","${t.note || ''}",${t.amount}\n`
                  );
                  const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `excel_sheet_report_${new Date().toISOString().substring(0, 10)}.csv`;
                  a.click();
                }}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shrink-0 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>📥 এক্সপোর্ট (CSV/Excel)</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="🔍 খাত বা নোট দিয়ে সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-2.5">তারিখ (DATE)</th>
                    <th className="p-2.5">ধরন</th>
                    <th className="p-2.5">খাত (SECTOR)</th>
                    <th className="p-2.5">নোট</th>
                    <th className="p-2.5 text-right">পরিমাণ (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono">
                  {monthFilteredTransactions
                    .filter((t) =>
                      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.note.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-950/40">
                        <td className="p-2.5 text-slate-300 whitespace-nowrap">📅 {tx.date}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.type === 'income'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {tx.type === 'income' ? 'আয়' : 'ব্যয়'}
                          </span>
                        </td>
                        <td className="p-2.5 text-white font-bold font-sans whitespace-nowrap">{tx.category}</td>
                        <td className="p-2.5 text-slate-400 font-sans text-[11px]">{tx.note || '-'}</td>
                        <td
                          className={`p-2.5 text-right font-black whitespace-nowrap ${
                            tx.type === 'income' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          ৳{tx.amount.toLocaleString()} BDT
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ================= VIEW 5: RESEARCH PART 2 (A4 PRINTABLE REPORT) ================= */}
      {activeView === 'researchPart2' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Top Bar with Print & Download Controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>গবেষণা পার্ট ২: A4 সাইজ অফিসিয়াল রিপোর্ট</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                উপরে আর্থিক গবেষণা বিশ্লেষণ এবং নিচে সম্পূর্ণ আয়-ব্যয় খাতের তালিকা
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>PDF ডাউনলোড হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>📥 A4 PDF ডাউনলোড</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shrink-0 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>📄 A4 প্রিন্ট</span>
              </button>
            </div>
          </div>

          {/* Printable A4 Document Sheet */}
          <div
            ref={printableSheetRef}
            className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-2xl border border-slate-200 max-w-4xl mx-auto space-y-6 font-sans print:shadow-none print:border-none print:p-0 print:m-0"
          >
            {/* 1. Official Header / Letterhead */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                    AI
                  </div>
                  <h1 className="text-xl font-black text-slate-950 tracking-tight">
                    AI MONEY MANAGER - গবেষণা পার্ট ২
                  </h1>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  অফিসিয়াল মাসিক আর্থিক গবেষণা ও আয়-ব্যয় প্রতিবেদন (A4 FORMAT)
                </p>
              </div>

              <div className="text-right text-xs text-slate-600 space-y-0.5 font-mono">
                <p>
                  <span className="font-bold text-slate-800">তারিখ:</span>{' '}
                  {adminSettings.researchReportSettings?.reportDate || '২৫/৭/২০২৬'}
                </p>
                <p>
                  <span className="font-bold text-slate-800">রেফারেন্স ID:</span>{' '}
                  {adminSettings.researchReportSettings?.refId || 'REF-RES2-2026'}
                </p>
                <p>
                  <span className="font-bold text-slate-800">স্ট্যাটাস:</span>{' '}
                  <span className="text-emerald-700 font-bold">
                    {adminSettings.researchReportSettings?.statusText || 'অনুমোদিত (VERIFIED)'}
                  </span>
                </p>
              </div>
            </div>

            {/* 2. RESEARCH ANALYSIS SECTION AT TOP (উপরে গবেষণা থাকবে) */}
            <div className="space-y-4 bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>১. সার্বিক আর্থিক গবেষণা বিশ্লেষণ (RESEARCH SUMMARY)</span>
                </h2>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  গবেষণা পার্ট ২
                </span>
              </div>

              {/* Research Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 block">মোট প্রাপ্তি (আয়)</span>
                  <span className="text-sm font-black text-emerald-700 font-mono">
                    ৳{totalIncome.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 block">মোট ব্যয়</span>
                  <span className="text-sm font-black text-rose-700 font-mono">
                    ৳{totalExpense.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 block">অবশিষ্ট ব্যালেন্স</span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    ৳{balance.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 block">বাজেট ব্যবহার</span>
                  <span className="text-sm font-black text-indigo-700 font-mono">
                    {budgetUsedPercent}%
                  </span>
                </div>
              </div>

              {/* Research Insights Cards */}
              <div className="space-y-2 text-xs text-slate-700">
                {(adminSettings.researchReportSettings?.customObservations || []).filter((obs) => !obs.isHidden).length > 0 ? (
                  (adminSettings.researchReportSettings?.customObservations || [])
                    .filter((obs) => !obs.isHidden)
                    .map((obs) => (
                      <div
                        key={obs.id}
                        className={`p-3 bg-white border-l-4 rounded-r-lg space-y-1 shadow-sm ${
                          obs.type === 'success'
                            ? 'border-emerald-500'
                            : obs.type === 'info'
                            ? 'border-indigo-500'
                            : 'border-amber-500'
                        }`}
                      >
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              obs.type === 'success'
                                ? 'text-emerald-600'
                                : obs.type === 'info'
                                ? 'text-indigo-600'
                                : 'text-amber-600'
                            }`}
                          />
                          <span>{obs.title}</span>
                        </p>
                        <p className="text-slate-600 leading-relaxed">{obs.content}</p>
                      </div>
                    ))
                ) : (
                  <>
                    <div className="p-3 bg-white border-l-4 border-amber-500 rounded-r-lg space-y-1 shadow-sm">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>গবেষণা পর্যবেক্ষণ ১: শীর্ষ ব্যয় খাত বিশ্লেষণ</span>
                      </p>
                      <p className="text-slate-600">
                        চলতি মাসে আপনার প্রধান ব্যয় নিবন্ধিত হয়েছে <span className="font-bold text-slate-950">{categoryList[0]?.name || 'খাদ্য'}</span> খাতে। এই খাতে আপনার মোট খরচের <span className="font-bold text-slate-950">{categoryList[0]?.percentage.toFixed(1) || '36.98'}%</span> ব্যয় হয়েছে।
                      </p>
                    </div>

                    <div className="p-3 bg-white border-l-4 border-emerald-500 rounded-r-lg space-y-1 shadow-sm">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>গবেষণা পর্যবেক্ষণ ২: বাজেট সাশ্রয় ও মূলধন সুরক্ষা</span>
                      </p>
                      <p className="text-slate-600">
                        আপনার মোট নির্ধারিত বাজেটের <span className="font-bold text-emerald-700">{(100 - parseFloat(budgetUsedPercent)).toFixed(1)}%</span> অর্থ এখনও সাশ্রয় রয়েছে, যা ভবিষ্যতের যে কোনো জরুরি খরচে ব্যবহারের উপযোগী।
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 3. SECTOR BREAKDOWN LIST BELOW (নিচে আয় ব্যায় খাত থাকবে) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>২. খাতভিত্তিক আয় ও ব্যয় বিবরণী (SECTOR BREAKDOWN)</span>
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  মোট খাত: {expenseCategories.filter(c => !c.isHidden).length + incomeCategories.filter(c => !c.isHidden).length}টি
                </span>
              </div>

              {/* Expense & Income Sector Table */}
              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase">
                      <th className="p-2.5">খাত (SECTOR)</th>
                      <th className="p-2.5">ধরন</th>
                      <th className="p-2.5 text-right">পরিমাণ (BDT)</th>
                      <th className="p-2.5 text-right">শতকরা হার (%)</th>
                      <th className="p-2.5 text-center">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {/* Active Expense Categories in sequence */}
                    {expenseCategories
                      .filter((c) => !c.isHidden)
                      .map((cat) => {
                        const amt = categoryMap[cat.nameBn] || categoryMap[cat.name] || 0;
                        const pct = totalExpense > 0 ? (amt / totalExpense) * 100 : 0;
                        return (
                          <tr key={cat.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{cat.nameBn}</span>
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                ব্যয়
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-bold font-mono text-slate-900">
                              ৳{amt.toLocaleString('en-US')}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-700">
                              {pct.toFixed(2)}%
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                সক্রিয়
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                    {/* Active Income Categories in sequence */}
                    {incomeCategories
                      .filter((c) => !c.isHidden)
                      .map((cat) => {
                        const amt = categoryMap[cat.nameBn] || categoryMap[cat.name] || 0;
                        const pct = totalIncome > 0 ? (amt / totalIncome) * 100 : 0;
                        return (
                          <tr key={cat.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{cat.nameBn}</span>
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                আয়
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-bold font-mono text-slate-900">
                              ৳{amt.toLocaleString('en-US')}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-700">
                              {pct.toFixed(2)}%
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                সক্রিয়
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature & Official Footer Block */}
            <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs text-slate-600">
              <div className="space-y-1">
                <div className="w-36 border-b border-slate-400 pb-1" />
                <p className="font-bold text-slate-800">প্রস্তুতকারকের স্বাক্ষর</p>
                <p className="text-[10px] text-slate-500">AI Money Manager System</p>
              </div>

              <div className="text-center space-y-1">
                <p className="text-[10px] font-mono text-slate-400">A4 OFFICIAL REPORT - PART 2</p>
                <p className="text-[10px] text-slate-500">স্বয়ংক্রিয় আর্থিক স্টেটমেন্ট</p>
              </div>

              <div className="space-y-1 text-right">
                <div className="w-36 border-b border-slate-400 pb-1 ml-auto" />
                <p className="font-bold text-slate-800">এডমিন অনুমোদন</p>
                <p className="text-[10px] text-slate-500">Verified & Approved</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
