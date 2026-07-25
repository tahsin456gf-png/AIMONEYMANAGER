import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  query,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Transaction,
  DebtItem,
  Category,
  Budget,
  SavingsGoal,
  NotificationItem,
  ChatMessage,
  UserProfile,
  AdminSettings,
  TransferItem,
  InitialBalances,
  PaymentMethod,
  ThemeId,
  AccountMethod,
} from '../types';
import { ThemePreset, getTheme } from '../theme';
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
  INITIAL_TRANSACTIONS,
  INITIAL_DEBTS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
} from '../constants';

interface MoneyContextType {
  // State
  transactions: Transaction[];
  transfers: TransferItem[];
  debts: DebtItem[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  paymentMethods: AccountMethod[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  notifications: NotificationItem[];
  chatHistory: ChatMessage[];
  userProfile: UserProfile;
  adminSettings: AdminSettings;
  activeTab: string;
  searchQuery: string;
  isPinUnlocked: boolean;
  isSplashActive: boolean;
  isLoadingFirebase: boolean;

  currentTheme: ThemePreset;
  setActiveTheme: (themeId: ThemeId) => Promise<void>;

  // Actions
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setIsPinUnlocked: (unlocked: boolean) => void;
  dismissSplash: () => void;
  toggleDarkMode: () => void;

  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  editTransaction: (id: string, updated: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Balance Transfer
  transferBalance: (data: {
    fromMethod: PaymentMethod;
    toMethod: PaymentMethod;
    amount: number;
    fee: number;
    date: string;
    note: string;
  }) => Promise<void>;

  // Initial Balances (Admin)
  updateInitialBalances: (balances: InitialBalances, mainOffset?: number) => Promise<void>;

  // Debt CRUD
  addDebt: (debt: Omit<DebtItem, 'id' | 'createdAt' | 'paidAmount' | 'status'>) => Promise<void>;
  payDebt: (id: string, amount: number) => Promise<void>;
  settleDebt: (id: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;

  // Category CRUD (Admin & User)
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryHide: (id: string) => Promise<void>;

  // Payment Method / Account CRUD (Admin)
  addPaymentMethod: (nameBn: string, name?: string) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  togglePaymentMethodHide: (id: string) => Promise<void>;

  // Budget CRUD
  setBudgetTarget: (categoryId: string, monthlyTarget: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Savings CRUD
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => Promise<void>;
  depositSavings: (id: string, amount: number) => Promise<void>;
  withdrawSavings: (id: string, amount: number) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  // AI & Chat
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;

  // Admin & System
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateAdminSettings: (settings: Partial<AdminSettings>) => Promise<void>;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => Promise<boolean>;
  resetToDefaultData: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const MoneyContext = createContext<MoneyContextType | undefined>(undefined);

export const MoneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(true);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState<boolean>(true);

  // Firestore Collections State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<AccountMethod[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n_1',
      title: 'লাইভ ফায়ারবেস সিঙ্ক',
      message: 'ফায়ারবেস রিয়েলটাইম ডাটাবেস সক্রিয় রয়েছে।',
      date: new Date().toISOString().split('T')[0],
      type: 'budget',
      isRead: false,
    },
  ]);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'c_welcome',
      sender: 'ai',
      text: 'আসসালামু আলাইকুম! আমি আপনার AI Money Assistant। আপনি সংক্ষেপে ভয়েস বা টেক্সটে লিখুন, যেমন: "আমার এখানে ৫০০ টাকা আয় হয়েছে" বা "নাস্তায় ৫০ টাকা ব্যয়" - আমি সরাসরি ফায়ারবেস লাইভ ডাটাবেসে সেভ করে দেব!',
      timestamp: Date.now(),
    },
  ]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'তাহসিন',
    email: 'user@example.com',
    currency: '৳',
    isPremium: true,
    pinLockEnabled: false,
    pinCode: '1234',
    familyOrBusinessMode: 'personal',
    darkMode: true,
    language: 'bn',
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    adminPasscode: 'admin123',
    systemPrompt: 'You are AI Money Manager Pro assistant for Bengali financial tracking.',
    adsEnabled: false,
    hiddenSections: [],
    activityLogs: [{ id: 'log_1', action: 'Firebase initialized', timestamp: Date.now() }],
    researchReportSettings: {
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
    },
  });

  // 1. Setup Firestore Realtime Listeners
  useEffect(() => {
    // Transactions
    const unsubTx = onSnapshot(collection(db, 'transactions'), async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial transactions to Firestore
        for (const item of INITIAL_TRANSACTIONS) {
          await setDoc(doc(db, 'transactions', item.id), item);
        }
      } else {
        const list: Transaction[] = snapshot.docs.map((d) => d.data() as Transaction);
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setTransactions(list);
      }
      setIsLoadingFirebase(false);
    });

    // Transfers
    const unsubTransfers = onSnapshot(collection(db, 'transfers'), (snapshot) => {
      if (!snapshot.empty) {
        const list: TransferItem[] = snapshot.docs.map((d) => d.data() as TransferItem);
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setTransfers(list);
      }
    });

    // Debts
    const unsubDebts = onSnapshot(collection(db, 'debts'), async (snapshot) => {
      if (snapshot.empty) {
        for (const item of INITIAL_DEBTS) {
          await setDoc(doc(db, 'debts', item.id), item);
        }
      } else {
        const list: DebtItem[] = snapshot.docs.map((d) => d.data() as DebtItem);
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setDebts(list);
      }
    });

    // Categories
    const unsubCategories = onSnapshot(collection(db, 'categories'), async (snapshot) => {
      if (snapshot.empty) {
        const all = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
        for (const cat of all) {
          await setDoc(doc(db, 'categories', cat.id), cat);
        }
      } else {
        const list: Category[] = snapshot.docs.map((d) => d.data() as Category);
        setIncomeCategories(list.filter((c) => c.type === 'income'));
        setExpenseCategories(list.filter((c) => c.type === 'expense'));
      }
    });

    // Payment Methods / Accounts
    const unsubPayMethods = onSnapshot(collection(db, 'paymentMethods'), async (snapshot) => {
      if (snapshot.empty) {
        for (const pm of DEFAULT_PAYMENT_METHODS) {
          await setDoc(doc(db, 'paymentMethods', pm.id), pm);
        }
      } else {
        const list: AccountMethod[] = snapshot.docs.map((d) => d.data() as AccountMethod);
        setPaymentMethods(list);
      }
    });

    // Budgets
    const unsubBudgets = onSnapshot(collection(db, 'budgets'), async (snapshot) => {
      if (snapshot.empty) {
        for (const b of INITIAL_BUDGETS) {
          await setDoc(doc(db, 'budgets', b.id), b);
        }
      } else {
        setBudgets(snapshot.docs.map((d) => d.data() as Budget));
      }
    });

    // Savings
    const unsubSavings = onSnapshot(collection(db, 'savingsGoals'), async (snapshot) => {
      if (snapshot.empty) {
        for (const s of INITIAL_SAVINGS_GOALS) {
          await setDoc(doc(db, 'savingsGoals', s.id), s);
        }
      } else {
        setSavingsGoals(snapshot.docs.map((d) => d.data() as SavingsGoal));
      }
    });

    // User Profile
    const unsubProfile = onSnapshot(doc(db, 'userProfile', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        setDoc(doc(db, 'userProfile', 'main'), userProfile);
      }
    });

    // Admin Settings
    const unsubAdmin = onSnapshot(doc(db, 'adminSettings', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setAdminSettings(docSnap.data() as AdminSettings);
      } else {
        setDoc(doc(db, 'adminSettings', 'main'), adminSettings);
      }
    });

    return () => {
      unsubTx();
      unsubTransfers();
      unsubDebts();
      unsubCategories();
      unsubPayMethods();
      unsubBudgets();
      unsubSavings();
      unsubProfile();
      unsubAdmin();
    };
  }, []);

  // Handle PIN lock status
  useEffect(() => {
    if (userProfile.pinLockEnabled) {
      setIsPinUnlocked(false);
    }
  }, [userProfile.pinLockEnabled]);

  const dismissSplash = () => setIsSplashActive(false);

  const toggleDarkMode = () => {
    updateUserProfile({ darkMode: !userProfile.darkMode });
  };

  // Transaction Actions (Firestore) - Optimistic updates for zero lag!
  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const id = 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newTx: Transaction = {
      ...tx,
      id,
      createdAt: Date.now(),
    };

    // Optimistically update local React state immediately to fix any lag!
    setTransactions((prev) => [newTx, ...prev]);

    // Save to Firestore in background
    setDoc(doc(db, 'transactions', id), newTx).catch((e) => console.error('Firestore save error:', e));

    // Check budget threshold alert
    if (tx.type === 'expense') {
      const catBudget = budgets.find((b) => b.categoryId === tx.category || b.categoryId === 'all');
      if (catBudget) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const totalSpent = [...transactions, newTx]
          .filter((t) => t.type === 'expense' && t.category === tx.category && t.date.startsWith(currentMonth))
          .reduce((sum, t) => sum + t.amount, 0);

        const percent = Math.round((totalSpent / catBudget.monthlyTarget) * 100);
        if (percent >= catBudget.alertThresholdPercent) {
          setNotifications((prev) => [
            {
              id: 'notif_' + Date.now(),
              title: '⚠️ বাজেট সতর্কতা',
              message: `আপনার "${tx.category}" খাতে এই মাসে ${percent}% বাজেট শেষ! (৳${totalSpent.toLocaleString()} / ৳${catBudget.monthlyTarget.toLocaleString()})`,
              date: new Date().toISOString().split('T')[0],
              type: 'budget',
              isRead: false,
            },
            ...prev,
          ]);
        }
      }
    }
  };

  const editTransaction = async (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    await updateDoc(doc(db, 'transactions', id), updated);
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await deleteDoc(doc(db, 'transactions', id));
  };

  // Balance Transfer Action
  const transferBalance = async (data: {
    fromMethod: PaymentMethod;
    toMethod: PaymentMethod;
    amount: number;
    fee: number;
    date: string;
    note: string;
  }) => {
    const transferId = 'tr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newTransfer: TransferItem = {
      id: transferId,
      fromMethod: data.fromMethod,
      toMethod: data.toMethod,
      amount: data.amount,
      fee: data.fee,
      date: data.date,
      note: data.note,
      createdAt: Date.now(),
    };

    // Create Outflow Transaction for From Method
    const outTx: Omit<Transaction, 'id' | 'createdAt'> = {
      type: 'expense',
      amount: data.amount + data.fee,
      category: 'ব্যালেন্স ট্রান্সফার',
      date: data.date,
      paymentMethod: data.fromMethod,
      note: `ট্রান্সফার প্রেরণ ➔ ${data.toMethod}${data.note ? ': ' + data.note : ''}${data.fee > 0 ? ` (ফি: ৳${data.fee})` : ''}`,
    };

    // Create Inflow Transaction for To Method
    const inTx: Omit<Transaction, 'id' | 'createdAt'> = {
      type: 'income',
      amount: data.amount,
      category: 'ব্যালেন্স ট্রান্সফার',
      date: data.date,
      paymentMethod: data.toMethod,
      note: `ট্রান্সফার গ্রহণ ⬅️ ${data.fromMethod}${data.note ? ': ' + data.note : ''}`,
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    await addTransaction(outTx);
    await addTransaction(inTx);

    setDoc(doc(db, 'transfers', transferId), newTransfer).catch((err) => console.error(err));
  };

  const currentTheme = getTheme(adminSettings.activeTheme);

  const setActiveTheme = async (themeId: ThemeId) => {
    const updated = {
      ...adminSettings,
      activeTheme: themeId,
    };
    setAdminSettings(updated);
    await setDoc(doc(db, 'adminSettings', 'main'), updated);
  };

  // Initial Balances Update (Admin)
  const updateInitialBalances = async (balances: InitialBalances, mainOffset?: number) => {
    const updated = {
      ...adminSettings,
      initialBalances: {
        ...(adminSettings.initialBalances || {}),
        ...balances,
      },
      ...(mainOffset !== undefined ? { mainBalanceOffset: mainOffset } : {}),
    };
    setAdminSettings(updated);
    await setDoc(doc(db, 'adminSettings', 'main'), updated);
  };

  // Debt Actions (Firestore)
  const addDebt = async (debt: Omit<DebtItem, 'id' | 'createdAt' | 'paidAmount' | 'status'>) => {
    const id = 'debt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newDebt: DebtItem = {
      ...debt,
      id,
      paidAmount: 0,
      status: 'pending',
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'debts', id), newDebt);
  };

  const payDebt = async (id: string, amount: number) => {
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;
    const newPaid = debt.paidAmount + amount;
    const status = newPaid >= debt.amount ? 'settled' : newPaid > 0 ? 'partial' : 'pending';
    await updateDoc(doc(db, 'debts', id), {
      paidAmount: Math.min(newPaid, debt.amount),
      status,
    });
  };

  const settleDebt = async (id: string) => {
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;
    await updateDoc(doc(db, 'debts', id), {
      paidAmount: debt.amount,
      status: 'settled',
    });
  };

  const deleteDebt = async (id: string) => {
    await deleteDoc(doc(db, 'debts', id));
  };

  // Category Actions (Firestore)
  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const id = 'cat_' + Date.now();
    const newCat: Category = {
      ...cat,
      id,
      isCustom: true,
    };
    await setDoc(doc(db, 'categories', id), newCat);
  };

  const updateCategory = async (id: string, cat: Partial<Category>) => {
    await updateDoc(doc(db, 'categories', id), cat);
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
  };

  const toggleCategoryHide = async (id: string) => {
    const cat = [...incomeCategories, ...expenseCategories].find((c) => c.id === id);
    if (!cat) return;
    await updateDoc(doc(db, 'categories', id), { isHidden: !cat.isHidden });
  };

  // Payment Method / Account Actions (Firestore)
  const addPaymentMethod = async (nameBn: string, name?: string) => {
    const id = 'pm_' + Date.now();
    const newPm: AccountMethod = {
      id,
      name: name || nameBn,
      nameBn,
      isHidden: false,
    };
    await setDoc(doc(db, 'paymentMethods', id), newPm);
  };

  const deletePaymentMethod = async (id: string) => {
    await deleteDoc(doc(db, 'paymentMethods', id));
  };

  const togglePaymentMethodHide = async (id: string) => {
    const pm = paymentMethods.find((p) => p.id === id);
    if (!pm) return;
    await updateDoc(doc(db, 'paymentMethods', id), { isHidden: !pm.isHidden });
  };

  // Budget Actions (Firestore)
  const setBudgetTarget = async (categoryId: string, monthlyTarget: number) => {
    const exists = budgets.find((b) => b.categoryId === categoryId);
    if (exists) {
      await updateDoc(doc(db, 'budgets', exists.id), { monthlyTarget });
    } else {
      const id = 'b_' + Date.now();
      await setDoc(doc(db, 'budgets', id), {
        id,
        categoryId,
        monthlyTarget,
        alertThresholdPercent: 80,
      });
    }
  };

  const deleteBudget = async (id: string) => {
    await deleteDoc(doc(db, 'budgets', id));
  };

  // Savings Actions (Firestore)
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const id = 'sg_' + Date.now();
    const newGoal: SavingsGoal = {
      ...goal,
      id,
      currentAmount: 0,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'savingsGoals', id), newGoal);
  };

  const depositSavings = async (id: string, amount: number) => {
    const goal = savingsGoals.find((g) => g.id === id);
    if (!goal) return;
    await updateDoc(doc(db, 'savingsGoals', id), {
      currentAmount: goal.currentAmount + amount,
    });
  };

  const withdrawSavings = async (id: string, amount: number) => {
    const goal = savingsGoals.find((g) => g.id === id);
    if (!goal) return;
    await updateDoc(doc(db, 'savingsGoals', id), {
      currentAmount: Math.max(0, goal.currentAmount - amount),
    });
  };

  const deleteSavingsGoal = async (id: string) => {
    await deleteDoc(doc(db, 'savingsGoals', id));
  };

  // Chat Local / History
  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
    };
    setChatHistory((prev) => [...prev, newMsg]);
  };

  const clearChatHistory = () => {
    setChatHistory([
      {
        id: 'c_welcome',
        sender: 'ai',
        text: 'চ্যাট হিস্টোরি রিসেট করা হয়েছে। আপনার নতুন প্রশ্ন বা আয়/ব্যয় জানান!',
        timestamp: Date.now(),
      },
    ]);
  };

  // User Profile & Admin Settings (Firestore)
  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...profile };
    setUserProfile(updated);
    await setDoc(doc(db, 'userProfile', 'main'), updated);
  };

  const updateAdminSettings = async (settings: Partial<AdminSettings>) => {
    const updated = { ...adminSettings, ...settings };
    setAdminSettings(updated);
    await setDoc(doc(db, 'adminSettings', 'main'), updated);
  };

  const exportDatabaseJSON = () => {
    const fullData = {
      transactions,
      debts,
      incomeCategories,
      expenseCategories,
      budgets,
      savingsGoals,
      notifications,
      userProfile,
      adminSettings,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ai_money_manager_backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDatabaseJSON = async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions)) {
        for (const item of data.transactions) {
          await setDoc(doc(db, 'transactions', item.id), item);
        }
      }
      if (Array.isArray(data.debts)) {
        for (const item of data.debts) {
          await setDoc(doc(db, 'debts', item.id), item);
        }
      }
      if (Array.isArray(data.incomeCategories) || Array.isArray(data.expenseCategories)) {
        const all = [...(data.incomeCategories || []), ...(data.expenseCategories || [])];
        for (const cat of all) {
          await setDoc(doc(db, 'categories', cat.id), cat);
        }
      }
      return true;
    } catch (e) {
      console.error('Import Error:', e);
      return false;
    }
  };

  const resetToDefaultData = async () => {
    for (const t of transactions) {
      await deleteDoc(doc(db, 'transactions', t.id));
    }
    for (const d of debts) {
      await deleteDoc(doc(db, 'debts', d.id));
    }
    for (const item of INITIAL_TRANSACTIONS) {
      await setDoc(doc(db, 'transactions', item.id), item);
    }
    for (const item of INITIAL_DEBTS) {
      await setDoc(doc(db, 'debts', item.id), item);
    }
    clearChatHistory();
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <MoneyContext.Provider
      value={{
        transactions,
        transfers,
        debts,
        incomeCategories,
        expenseCategories,
        paymentMethods,
        budgets,
        savingsGoals,
        notifications,
        chatHistory,
        userProfile,
        adminSettings,
        activeTab,
        searchQuery,
        isPinUnlocked,
        isSplashActive,
        isLoadingFirebase,
        currentTheme,
        setActiveTheme,
        setActiveTab,
        setSearchQuery,
        setIsPinUnlocked,
        dismissSplash,
        toggleDarkMode,
        addTransaction,
        editTransaction,
        deleteTransaction,
        transferBalance,
        updateInitialBalances,
        addDebt,
        payDebt,
        settleDebt,
        deleteDebt,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryHide,
        addPaymentMethod,
        deletePaymentMethod,
        togglePaymentMethodHide,
        setBudgetTarget,
        deleteBudget,
        addSavingsGoal,
        depositSavings,
        withdrawSavings,
        deleteSavingsGoal,
        addChatMessage,
        clearChatHistory,
        updateUserProfile,
        updateAdminSettings,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetToDefaultData,
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
};

export const useMoney = () => {
  const context = useContext(MoneyContext);
  if (!context) {
    throw new Error('useMoney must be used within a MoneyProvider');
  }
  return context;
};
