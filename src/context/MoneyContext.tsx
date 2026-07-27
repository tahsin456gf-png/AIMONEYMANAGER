import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
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
  AccountCategoryType,
  AppUser,
  SupportMessage,
} from '../types';
import { ThemePreset, getTheme } from '../theme';
import { TransactionType } from '../types';

export const isIncomeType = (t: string | undefined): boolean => {
  if (!t) return false;
  const l = t.toString().toLowerCase().trim();
  return l === 'income' || l === 'inc' || l.includes('আয়') || l.includes('আয়') || l.includes('জমা');
};

export const isExpenseType = (t: string | undefined): boolean => {
  if (!t) return false;
  const l = t.toString().toLowerCase().trim();
  return l === 'expense' || l === 'exp' || l.includes('ব্যয়') || l.includes('ব্যায়') || l.includes('খরচ');
};

import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
} from '../constants';

interface MoneyContextType {
  // Multi-user state
  currentUser: AppUser | null;
  allUsers: AppUser[];
  supportMessages: SupportMessage[];
  registerUser: (data: { name: string; phone: string; password?: string; adminPassword?: string }) => Promise<{ success: boolean; message?: string }>;
  loginUser: (credentials: { phone: string; password?: string }) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => Promise<void>;
  switchDemoAccount: (phone: string, name: string) => Promise<void>;
  sendSupportMessage: (text: string, targetUserId?: string) => Promise<void>;

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

  // Category CRUD
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryHide: (id: string) => Promise<void>;

  // Payment Method / Account CRUD
  addPaymentMethod: (nameBn: string, name?: string, category?: AccountCategoryType, initialBalance?: number) => Promise<void>;
  updatePaymentMethod: (id: string, updated: Partial<AccountMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  togglePaymentMethodHide: (id: string) => Promise<void>;
  togglePaymentMethodPin: (id: string) => Promise<void>;
  getAccountBalance: (pm: AccountMethod | string) => number;

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

// Default initial user for instant access
const DEFAULT_USER: AppUser = {
  id: '01700000001',
  name: 'তাহসিন আহমেদ',
  phone: '01700000001',
  createdAt: Date.now(),
  isApproved: true,
  role: 'admin',
};

export const MoneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Active Logged User State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('ai_money_active_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_USER;
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(true);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState<boolean>(true);

  // Global Multi-User and Support State
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);

  // Firestore Collections State (Strictly isolated per user ID!)
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
      title: '🎉 AI মানি ম্যানেজারে স্বাগতম',
      message: 'আপনার মাল্টি-ইউজার একাউন্ট এখন সক্রিয়!',
      date: new Date().toISOString().split('T')[0],
      type: 'info',
      isRead: false,
    },
  ]);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: 'আসসালামু আলাইকুম বন্ধু! 🤖\nআমি আপনার ব্যক্তিগত এআই মানি ম্যানেজার। আপনার দৈনিক খরচ, আয়, বাজার কিংবা ঋণের হিসাব বলতে পারেন!',
      timestamp: Date.now(),
    },
  ]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: currentUser?.name || 'ব্যবহারকারী',
    email: currentUser ? `${currentUser.phone}@aimoney.app` : 'user@aimoney.app',
    phone: currentUser?.phone || '',
    currency: 'BDT',
    currencySymbol: '৳',
    language: 'bn',
    darkMode: true,
    pinLockEnabled: false,
    pinCode: '1234',
    isPremium: true,
    familyOrBusinessMode: 'personal',
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    adminPasscode: 'admin123',
    systemPrompt: 'You are AI Money Manager Pro assistant for Bengali financial tracking.',
    adsEnabled: false,
    hiddenSections: [],
    activityLogs: [{ id: 'log_1', action: 'System active', timestamp: Date.now() }],
    researchReportSettings: {
      reportDate: '২৫/৭/২০২০',
      refId: 'REF-RES2-2026',
      statusText: 'অনুমোদিত (VERIFIED)',
      showDefaultAutoObservations: true,
      customObservations: [],
    },
  });

  // Save current logged user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ai_money_active_user', JSON.stringify(currentUser));
      setUserProfile((prev) => ({
        ...prev,
        name: currentUser.name,
        phone: currentUser.phone,
        email: `${currentUser.phone}@aimoney.app`,
      }));
    } else {
      localStorage.removeItem('ai_money_active_user');
    }
  }, [currentUser]);

  // Global Realtime Listeners for All Users and Support Chat Messages
  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, 'app_users'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as AppUser);
          setAllUsers(list);
        }
      },
      (err) => console.log('app_users listener error:', err)
    );

    const unsubSupport = onSnapshot(
      collection(db, 'support_messages'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as SupportMessage);
          list.sort((a, b) => a.timestamp - b.timestamp);
          setSupportMessages(list);
        }
      },
      (err) => console.log('support_messages listener error:', err)
    );

    return () => {
      unsubUsers();
      unsubSupport();
    };
  }, []);

  const sendSupportMessage = async (text: string, targetUserId?: string) => {
    if (!text.trim()) return;
    const targetId = targetUserId || currentUser?.id || '01700000001';
    const targetName = currentUser?.name || 'ইউজার';
    const targetPhone = currentUser?.phone || targetId;

    const msgId = 'sup_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newMsg: SupportMessage = {
      id: msgId,
      userId: targetId,
      userName: targetName,
      userPhone: targetPhone,
      sender: targetUserId ? 'admin' : 'user',
      text: text.trim(),
      timestamp: Date.now(),
      isReadByAdmin: targetUserId ? true : false,
      isReadByUser: targetUserId ? false : true,
    };

    setSupportMessages((prev) => [...prev, newMsg]);
    await setDoc(doc(db, 'support_messages', msgId), newMsg).catch((err) => console.error(err));
  };

  // Sync isolated User-Scoped Realtime Listeners with Firestore + Local Caching
  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      setTransfers([]);
      setDebts([]);
      setBudgets([]);
      setSavingsGoals([]);
      setIsLoadingFirebase(false);
      return;
    }

    const userId = currentUser.id;

    // Load Local Cache first for instant zero-lag loading!
    try {
      const cachedTxs = localStorage.getItem(`ai_money_txs_${userId}`);
      if (cachedTxs) setTransactions(JSON.parse(cachedTxs));
      const cachedDebts = localStorage.getItem(`ai_money_debts_${userId}`);
      if (cachedDebts) setDebts(JSON.parse(cachedDebts));
      const cachedPay = localStorage.getItem(`ai_money_pay_${userId}`);
      if (cachedPay) setPaymentMethods(JSON.parse(cachedPay));
    } catch (e) {}

    // 1. Transactions Listener: users/{userId}/transactions
    const unsubTx = onSnapshot(collection(db, 'users', userId, 'transactions'), async (snapshot) => {
      if (snapshot.empty) {
        setTransactions([]);
        localStorage.setItem(`ai_money_txs_${userId}`, JSON.stringify([]));
      } else {
        const rawList: Transaction[] = snapshot.docs.map((d) => {
          const data = d.data() as Transaction;
          const rawType = (data.type || '').toString();
          const normalizedType: TransactionType = isIncomeType(rawType) ? 'income' : 'expense';
          return {
            ...data,
            type: normalizedType,
            amount: Math.abs(Number(data.amount) || 0),
          };
        });

        const list = rawList.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setTransactions(list);
        localStorage.setItem(`ai_money_txs_${userId}`, JSON.stringify(list));
      }
      setIsLoadingFirebase(false);
    });

    // 2. Transfers Listener: users/{userId}/transfers
    const unsubTransfers = onSnapshot(collection(db, 'users', userId, 'transfers'), (snapshot) => {
      if (snapshot.empty) {
        setTransfers([]);
      } else {
        const list: TransferItem[] = snapshot.docs.map((d) => d.data() as TransferItem);
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setTransfers(list);
      }
    });

    // 3. Debts Listener: users/{userId}/debts
    const unsubDebts = onSnapshot(collection(db, 'users', userId, 'debts'), async (snapshot) => {
      if (snapshot.empty) {
        setDebts([]);
        localStorage.setItem(`ai_money_debts_${userId}`, JSON.stringify([]));
      } else {
        const list: DebtItem[] = snapshot.docs.map((d) => d.data() as DebtItem);
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setDebts(list);
        localStorage.setItem(`ai_money_debts_${userId}`, JSON.stringify(list));
      }
    });

    // 4. Categories Listener: users/{userId}/categories
    const unsubCategories = onSnapshot(collection(db, 'users', userId, 'categories'), async (snapshot) => {
      if (snapshot.empty) {
        // Seed default categories for this user
        const all = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
        for (const cat of all) {
          await setDoc(doc(db, 'users', userId, 'categories', cat.id), cat).catch(() => {});
        }
      } else {
        const list: Category[] = snapshot.docs.map((d) => d.data() as Category);
        const dedupe = (cats: Category[]) => {
          const seen = new Set<string>();
          return cats.filter((c) => {
            const clean = (c.nameBn || c.name || '')
              .replace(/[\p{Extended_Pictographic}\p{Emoji}]/gu, '')
              .replace(/[^\u0980-\u09FFa-zA-Z0-9]/g, '')
              .trim()
              .toLowerCase();
            if (!clean || seen.has(clean)) return false;
            seen.add(clean);
            return true;
          });
        };

        setIncomeCategories(dedupe(list.filter((c) => c.type === 'income')));
        setExpenseCategories(dedupe(list.filter((c) => c.type === 'expense')));
      }
    });

    // 5. Payment Methods Listener: users/{userId}/paymentMethods
    const unsubPayMethods = onSnapshot(collection(db, 'users', userId, 'paymentMethods'), async (snapshot) => {
      if (snapshot.empty) {
        // Seed default accounts starting with ZERO (0 BDT) initial balance for new user!
        const zeroDefaultPayMethods = DEFAULT_PAYMENT_METHODS.map((pm) => ({
          ...pm,
          initialBalance: 0,
        }));
        for (const pm of zeroDefaultPayMethods) {
          await setDoc(doc(db, 'users', userId, 'paymentMethods', pm.id), pm).catch(() => {});
        }
      } else {
        const list: AccountMethod[] = snapshot.docs.map((d) => d.data() as AccountMethod);
        setPaymentMethods(list);
        localStorage.setItem(`ai_money_pay_${userId}`, JSON.stringify(list));
      }
    });

    // 6. Budgets Listener: users/{userId}/budgets
    const unsubBudgets = onSnapshot(collection(db, 'users', userId, 'budgets'), async (snapshot) => {
      if (snapshot.empty) {
        setBudgets([]);
      } else {
        setBudgets(snapshot.docs.map((d) => d.data() as Budget));
      }
    });

    // 7. Savings Listener: users/{userId}/savingsGoals
    const unsubSavings = onSnapshot(collection(db, 'users', userId, 'savingsGoals'), async (snapshot) => {
      if (snapshot.empty) {
        setSavingsGoals([]);
      } else {
        setSavingsGoals(snapshot.docs.map((d) => d.data() as SavingsGoal));
      }
    });

    // 8. AI Chat History Listener: users/{userId}/chatHistory
    const unsubChat = onSnapshot(collection(db, 'users', userId, 'chatHistory'), (snapshot) => {
      if (snapshot.empty) {
        const defaultWelcome: ChatMessage = {
          id: 'msg_welcome',
          sender: 'ai',
          text: `আসসালামু আলাইকুম ${currentUser.name}! 🤖\nআমি আপনার ব্যক্তিগত এআই মানি ম্যানেজার। আপনার দৈনিক খরচ, আয়, বাজার কিংবা ঋণের হিসাব আমাকে বলতে পারেন!`,
          timestamp: Date.now(),
        };
        setChatHistory([defaultWelcome]);
      } else {
        const list: ChatMessage[] = snapshot.docs.map((d) => d.data() as ChatMessage);
        list.sort((a, b) => a.timestamp - b.timestamp);
        setChatHistory(list);
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
      unsubChat();
    };
  }, [currentUser?.id]);

  // Auth Functions (Register with Auto-Approval, Login, Logout)
  const registerUser = async (data: { name: string; phone: string; password?: string; adminPassword?: string }): Promise<{ success: boolean; message?: string }> => {
    const cleanPhone = data.phone.replace(/[^\d]/g, '');
    if (!cleanPhone) return { success: false, message: 'সঠিক মোবাইল নম্বর লিখুন!' };

    try {
      // Check Firestore app_users collection
      const userRef = doc(db, 'app_users', cleanPhone);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        return { success: false, message: 'এই ফোন নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে! অনুগ্রহ করে লগইন করুন।' };
      }

      const newUser: AppUser = {
        id: cleanPhone,
        name: data.name.trim(),
        phone: cleanPhone,
        password: data.password || '',
        adminPassword: data.adminPassword || data.password || '1234',
        createdAt: Date.now(),
        isApproved: true, // Auto-approval required by user
        role: 'user',
      };

      // Save user profile in Firestore
      await setDoc(userRef, newUser);

      // Auto login user
      setCurrentUser(newUser);

      return { success: true };
    } catch (e: any) {
      console.error('Registration error:', e);
      // Fallback local registration if offline
      const newUser: AppUser = {
        id: cleanPhone,
        name: data.name.trim(),
        phone: cleanPhone,
        password: data.password || '',
        adminPassword: data.adminPassword || data.password || '1234',
        createdAt: Date.now(),
        isApproved: true,
        role: 'user',
      };
      setCurrentUser(newUser);
      return { success: true };
    }
  };

  const loginUser = async (credentials: { phone: string; password?: string }): Promise<{ success: boolean; message?: string }> => {
    const cleanPhone = credentials.phone.replace(/[^\d]/g, '');
    if (!cleanPhone) return { success: false, message: 'সঠিক মোবাইল নম্বর প্রদান করুন!' };

    try {
      const userRef = doc(db, 'app_users', cleanPhone);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as AppUser;
        if (userData.password && credentials.password && userData.password !== credentials.password) {
          return { success: false, message: 'পাসওয়ার্ড সঠিক নয়!' };
        }
        setCurrentUser(userData);
        return { success: true };
      } else {
        // Auto-create account if logging in for first time
        const autoUser: AppUser = {
          id: cleanPhone,
          name: `ইউজার (${cleanPhone.slice(-4)})`,
          phone: cleanPhone,
          password: credentials.password || '',
          createdAt: Date.now(),
          isApproved: true,
          role: 'user',
        };
        await setDoc(userRef, autoUser).catch(() => {});
        setCurrentUser(autoUser);
        return { success: true };
      }
    } catch (e) {
      // Local login fallback
      const fallbackUser: AppUser = {
        id: cleanPhone,
        name: `ইউজার (${cleanPhone.slice(-4)})`,
        phone: cleanPhone,
        createdAt: Date.now(),
        isApproved: true,
        role: 'user',
      };
      setCurrentUser(fallbackUser);
      return { success: true };
    }
  };

  const logoutUser = async () => {
    setCurrentUser(null);
    localStorage.removeItem('ai_money_active_user');
  };

  const switchDemoAccount = async (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const userObj: AppUser = {
      id: cleanPhone,
      name,
      phone: cleanPhone,
      createdAt: Date.now(),
      isApproved: true,
      role: 'user',
    };
    await setDoc(doc(db, 'app_users', cleanPhone), userObj).catch(() => {});
    setCurrentUser(userObj);
  };

  useEffect(() => {
    if (userProfile.pinLockEnabled) {
      setIsPinUnlocked(false);
    }
  }, [userProfile.pinLockEnabled]);

  const dismissSplash = () => setIsSplashActive(false);

  const toggleDarkMode = () => {
    updateUserProfile({ darkMode: !userProfile.darkMode });
  };

  // Transaction Actions (User-Scoped Firestore + Local Cache)
  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    const userId = currentUser.id;
    const id = 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const positiveAmount = Math.abs(Number(tx.amount) || 0);
    const normalizedType: 'income' | 'expense' = isIncomeType(tx.type) ? 'income' : 'expense';

    const stateCats = normalizedType === 'income' ? incomeCategories : expenseCategories;
    const defaultCats = normalizedType === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
    const catList = [...stateCats, ...defaultCats];

    const rawCatStr = tx.category || '';
    const cleanCatTarget = rawCatStr
      .replace(/[\p{Extended_Pictographic}\p{Emoji}]/gu, '')
      .replace(/(ে|িতে|\s+এ|\s+খরচ|\s+করলাম|\s+দিলাম|\s+ব্যয়|\s+ব্যায়|\s+বাবদ)/gi, '')
      .replace(/[^\u0980-\u09FFa-zA-Z0-9]/g, '')
      .trim()
      .toLowerCase();

    const matchedCat = catList.find((c) => {
      const nameBnClean = c.nameBn
        ? c.nameBn.replace(/[\p{Extended_Pictographic}\p{Emoji}]/gu, '').replace(/[^\u0980-\u09FFa-zA-Z0-9]/g, '').trim().toLowerCase()
        : '';
      const nameClean = c.name
        ? c.name.replace(/[\p{Extended_Pictographic}\p{Emoji}]/gu, '').replace(/[^\u0980-\u09FFa-zA-Z0-9]/g, '').trim().toLowerCase()
        : '';

      if (c.nameBn === rawCatStr || c.name === rawCatStr || c.id === rawCatStr) return true;
      if (cleanCatTarget.length >= 2) {
        if (nameBnClean === cleanCatTarget || nameClean === cleanCatTarget) return true;
        if (nameBnClean.includes(cleanCatTarget) || cleanCatTarget.includes(nameBnClean)) return true;
      }
      return false;
    });

    let resolvedCategoryName = rawCatStr;

    if (matchedCat) {
      resolvedCategoryName = matchedCat.nameBn || matchedCat.name;
    } else if (rawCatStr) {
      const iconMatch = rawCatStr.match(/^(\p{Extended_Pictographic}|\p{Emoji})/u);
      const icon = iconMatch ? iconMatch[0] : normalizedType === 'income' ? '💰' : '🏷️';
      const cleanName = rawCatStr.replace(/^(\p{Extended_Pictographic}|\p{Emoji})\s*/u, '').trim() || rawCatStr;
      resolvedCategoryName = iconMatch ? rawCatStr : `${icon} ${cleanName}`;

      const newCat: Category = {
        id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        name: cleanName,
        nameBn: resolvedCategoryName,
        type: normalizedType,
        icon,
        color: normalizedType === 'income' ? '#10B981' : '#EF4444',
        isCustom: true,
        isHidden: false,
      };

      if (normalizedType === 'income') {
        setIncomeCategories((prev) => [...prev, newCat]);
      } else {
        setExpenseCategories((prev) => [...prev, newCat]);
      }

      setDoc(doc(db, 'users', userId, 'categories', newCat.id), newCat).catch((err) => console.error(err));
    }

    const txDate = tx.date || new Date().toISOString().split('T')[0];
    const now = new Date();
    const txTime = tx.time || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newTx: Transaction = {
      ...tx,
      type: normalizedType,
      category: resolvedCategoryName,
      amount: positiveAmount,
      date: txDate,
      time: txTime,
      id,
      createdAt: Date.now(),
      note: tx.note || `${resolvedCategoryName} ${normalizedType === 'income' ? 'আয়' : 'খরচ'} • ${tx.paymentMethod || 'Cash'}`,
    };

    // Optimistically update React state immediately
    setTransactions((prev) => [newTx, ...prev]);

    // Save to isolated user collection in Firestore
    setDoc(doc(db, 'users', userId, 'transactions', id), newTx).catch((e) => console.error(e));
  };

  const editTransaction = async (id: string, updated: Partial<Transaction>) => {
    if (!currentUser) return;
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    await updateDoc(doc(db, 'users', currentUser.id, 'transactions', id), updated);
  };

  const deleteTransaction = async (id: string) => {
    if (!currentUser) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await deleteDoc(doc(db, 'users', currentUser.id, 'transactions', id));
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
    if (!currentUser) return;
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

    const outTx: Omit<Transaction, 'id' | 'createdAt'> = {
      type: 'expense',
      amount: data.amount + data.fee,
      category: 'ব্যালেন্স ট্রান্সফার',
      date: data.date,
      paymentMethod: data.fromMethod,
      note: `ট্রান্সফার প্রেরণ ➔ ${data.toMethod}${data.note ? ': ' + data.note : ''}${data.fee > 0 ? ` (ফি: ৳${data.fee})` : ''}`,
    };

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

    setDoc(doc(db, 'users', currentUser.id, 'transfers', transferId), newTransfer).catch((err) => console.error(err));
  };

  const currentTheme = getTheme(adminSettings.activeTheme);

  const setActiveTheme = async (themeId: ThemeId) => {
    const updated = {
      ...adminSettings,
      activeTheme: themeId,
    };
    setAdminSettings(updated);
    if (currentUser) {
      await setDoc(doc(db, 'users', currentUser.id, 'adminSettings', 'main'), updated).catch(() => {});
    }
  };

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
    if (currentUser) {
      await setDoc(doc(db, 'users', currentUser.id, 'adminSettings', 'main'), updated).catch(() => {});
    }
  };

  // Debt Actions (Firestore)
  const addDebt = async (debt: Omit<DebtItem, 'id' | 'createdAt' | 'paidAmount' | 'status'>) => {
    if (!currentUser) return;
    const id = 'debt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newDebt: DebtItem = {
      ...debt,
      id,
      paidAmount: 0,
      status: 'pending',
      createdAt: Date.now(),
    };
    setDebts((prev) => [newDebt, ...prev]);
    await setDoc(doc(db, 'users', currentUser.id, 'debts', id), newDebt).catch((err) => console.error(err));

    const isPawna = debt.type === 'pawna';
    const txCat = isPawna ? 'ধার দেওয়া (পাওনা)' : 'ধার নেওয়া (দেনা)';
    await addTransaction({
      type: isPawna ? 'expense' : 'income',
      amount: debt.amount,
      category: txCat,
      date: debt.date || new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      note: `${isPawna ? debt.personName + ' কে ধার প্রদান' : debt.personName + ' এর কাছ থেকে ধার গ্রহণ'}${debt.notes ? ' • ' + debt.notes : ''}`,
    });
  };

  const payDebt = async (id: string, amount: number) => {
    if (!currentUser) return;
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;
    const newPaid = debt.paidAmount + amount;
    const status = newPaid >= debt.amount ? 'settled' : newPaid > 0 ? 'partial' : 'pending';
    await updateDoc(doc(db, 'users', currentUser.id, 'debts', id), {
      paidAmount: Math.min(newPaid, debt.amount),
      status,
    });
  };

  const settleDebt = async (id: string) => {
    if (!currentUser) return;
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;
    await updateDoc(doc(db, 'users', currentUser.id, 'debts', id), {
      paidAmount: debt.amount,
      status: 'settled',
    });
  };

  const deleteDebt = async (id: string) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.id, 'debts', id));
  };

  // Category Actions
  const addCategory = async (cat: Omit<Category, 'id'>) => {
    if (!currentUser) return;
    const id = 'cat_' + Date.now();
    const newCat: Category = {
      ...cat,
      id,
      isCustom: true,
    };
    await setDoc(doc(db, 'users', currentUser.id, 'categories', id), newCat);
  };

  const updateCategory = async (id: string, cat: Partial<Category>) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.id, 'categories', id), cat);
  };

  const deleteCategory = async (id: string) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.id, 'categories', id));
  };

  const toggleCategoryHide = async (id: string) => {
    if (!currentUser) return;
    const cat = [...incomeCategories, ...expenseCategories].find((c) => c.id === id);
    if (!cat) return;
    await updateDoc(doc(db, 'users', currentUser.id, 'categories', id), { isHidden: !cat.isHidden });
  };

  // Payment Method / Account Balance Calculation
  const getAccountBalance = (pm: AccountMethod | string): number => {
    const accObj = typeof pm === 'string' ? paymentMethods.find((p) => p.id === pm || p.name === pm || p.nameBn === pm) : pm;
    const accName = accObj ? accObj.name : typeof pm === 'string' ? pm : '';
    const accNameBn = accObj ? accObj.nameBn : '';
    const accId = accObj ? accObj.id : '';

    let total = accObj?.initialBalance ?? 0;

    if (adminSettings.initialBalances) {
      if (accName.toLowerCase().includes('cash') || accNameBn.includes('ক্যাশ')) {
        total += adminSettings.initialBalances.Cash || 0;
      } else if (accName.toLowerCase().includes('bkash') || accNameBn.includes('বিকাশ')) {
        total += adminSettings.initialBalances.Bkash || 0;
      } else if (accName.toLowerCase().includes('nagad') || accNameBn.includes('নগদ')) {
        total += adminSettings.initialBalances.Nagad || 0;
      } else if (accName.toLowerCase().includes('bank') || accNameBn.includes('ব্যাংক')) {
        total += adminSettings.initialBalances.Bank || 0;
      } else if (accName.toLowerCase().includes('card') || accNameBn.includes('কার্ড')) {
        total += adminSettings.initialBalances.Card || 0;
      }
    }

    transactions.forEach((tx) => {
      const pmStr = (tx.paymentMethod || '').toLowerCase().trim();
      const match =
        (accName && pmStr === accName.toLowerCase().trim()) ||
        (accNameBn && pmStr === accNameBn.toLowerCase().trim()) ||
        (accId && pmStr === accId.toLowerCase().trim()) ||
        (accName && pmStr.includes(accName.toLowerCase().trim())) ||
        (accNameBn && pmStr.includes(accNameBn.toLowerCase().trim()));

      if (match) {
        if (isIncomeType(tx.type)) {
          total += tx.amount || 0;
        } else if (isExpenseType(tx.type)) {
          total -= tx.amount || 0;
        }
      }
    });

    transfers.forEach((tr) => {
      const fromStr = (tr.fromMethod || '').toLowerCase().trim();
      const toStr = (tr.toMethod || '').toLowerCase().trim();

      const matchFrom =
        (accName && fromStr === accName.toLowerCase().trim()) ||
        (accNameBn && fromStr === accNameBn.toLowerCase().trim()) ||
        (accId && fromStr === accId.toLowerCase().trim()) ||
        (accName && fromStr.includes(accName.toLowerCase().trim())) ||
        (accNameBn && fromStr.includes(accNameBn.toLowerCase().trim()));

      const matchTo =
        (accName && toStr === accName.toLowerCase().trim()) ||
        (accNameBn && toStr === accNameBn.toLowerCase().trim()) ||
        (accId && toStr === accId.toLowerCase().trim()) ||
        (accName && toStr.includes(accName.toLowerCase().trim())) ||
        (accNameBn && toStr.includes(accNameBn.toLowerCase().trim()));

      if (matchFrom) {
        total -= (tr.amount || 0) + (tr.fee || 0);
      }
      if (matchTo) {
        total += tr.amount || 0;
      }
    });

    return Math.max(0, Math.round(total * 100) / 100);
  };

  const addPaymentMethod = async (nameBn: string, name?: string, category?: AccountCategoryType, initialBalance?: number) => {
    if (!currentUser) return;
    const id = 'pm_' + Date.now();
    const newPm: AccountMethod = {
      id,
      name: name || nameBn,
      nameBn,
      category: category || 'cash',
      initialBalance: initialBalance || 0,
      isHidden: false,
      isPinned: false,
    };
    await setDoc(doc(db, 'users', currentUser.id, 'paymentMethods', id), newPm);
  };

  const updatePaymentMethod = async (id: string, updated: Partial<AccountMethod>) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.id, 'paymentMethods', id), updated);
  };

  const deletePaymentMethod = async (id: string) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.id, 'paymentMethods', id));
  };

  const togglePaymentMethodHide = async (id: string) => {
    if (!currentUser) return;
    const pm = paymentMethods.find((p) => p.id === id);
    if (!pm) return;
    await updateDoc(doc(db, 'users', currentUser.id, 'paymentMethods', id), { isHidden: !pm.isHidden });
  };

  const togglePaymentMethodPin = async (id: string) => {
    if (!currentUser) return;
    const pm = paymentMethods.find((p) => p.id === id);
    if (!pm) return;
    await updateDoc(doc(db, 'users', currentUser.id, 'paymentMethods', id), { isPinned: !pm.isPinned });
  };

  // Budget Actions
  const setBudgetTarget = async (categoryId: string, monthlyTarget: number) => {
    if (!currentUser) return;
    const existing = budgets.find((b) => b.categoryId === categoryId);
    if (existing) {
      await updateDoc(doc(db, 'users', currentUser.id, 'budgets', existing.id), { monthlyTarget });
    } else {
      const id = 'b_' + Date.now();
      const newB: Budget = {
        id,
        categoryId,
        monthlyTarget,
        alertThresholdPercent: 85,
      };
      await setDoc(doc(db, 'users', currentUser.id, 'budgets', id), newB);
    }
  };

  const deleteBudget = async (id: string) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.id, 'budgets', id));
  };

  // Savings Actions
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => {
    if (!currentUser) return;
    const id = 's_' + Date.now();
    const newS: SavingsGoal = {
      ...goal,
      id,
      currentAmount: 0,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', currentUser.id, 'savingsGoals', id), newS);
  };

  const depositSavings = async (id: string, amount: number) => {
    if (!currentUser) return;
    const goal = savingsGoals.find((s) => s.id === id);
    if (!goal) return;
    await updateDoc(doc(db, 'users', currentUser.id, 'savingsGoals', id), {
      currentAmount: goal.currentAmount + amount,
    });
  };

  const withdrawSavings = async (id: string, amount: number) => {
    if (!currentUser) return;
    const goal = savingsGoals.find((s) => s.id === id);
    if (!goal) return;
    await updateDoc(doc(db, 'users', currentUser.id, 'savingsGoals', id), {
      currentAmount: Math.max(0, goal.currentAmount - amount),
    });
  };

  const deleteSavingsGoal = async (id: string) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.id, 'savingsGoals', id));
  };

  // Chat Actions
  const addChatMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    setChatHistory((prev) => [...prev, newMsg]);
    if (currentUser?.id) {
      await setDoc(doc(db, 'users', currentUser.id, 'chatHistory', newMsg.id), newMsg).catch(() => {});
    }
  };

  const clearChatHistory = async () => {
    const defaultWelcome: ChatMessage = {
      id: 'msg_welcome_' + Date.now(),
      sender: 'ai',
      text: `আসসালামু আলাইকুম ${currentUser?.name || 'ব্যবহারকারী'}! 🤖\nআমি আপনার ব্যক্তিগত এআই মানি ম্যানেজার।`,
      timestamp: Date.now(),
    };
    setChatHistory([defaultWelcome]);
    if (currentUser?.id) {
      const snapshot = await getDocs(collection(db, 'users', currentUser.id, 'chatHistory')).catch(() => null);
      if (snapshot) {
        for (const d of snapshot.docs) {
          await deleteDoc(d.ref).catch(() => {});
        }
      }
    }
  };

  // Admin & System
  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...profile };
    setUserProfile(updated);
  };

  const updateAdminSettings = async (settings: Partial<AdminSettings>) => {
    const updated = { ...adminSettings, ...settings };
    setAdminSettings(updated);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const exportDatabaseJSON = () => {
    const data = {
      user: currentUser,
      transactions,
      transfers,
      debts,
      incomeCategories,
      expenseCategories,
      paymentMethods,
      budgets,
      savingsGoals,
      userProfile,
      adminSettings,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AIMoneyManager_Backup_${currentUser?.name || 'User'}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJSON = async (jsonString: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions && Array.isArray(data.transactions)) {
        for (const t of data.transactions) {
          await setDoc(doc(db, 'users', currentUser.id, 'transactions', t.id), t);
        }
      }
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const resetToDefaultData = async () => {
    if (!currentUser) return;
    const userId = currentUser.id;
    const collectionsToClear = [
      'transactions',
      'debts',
      'transfers',
      'budgets',
      'savingsGoals',
    ];
    for (const colName of collectionsToClear) {
      try {
        const snap = await getDocs(collection(db, 'users', userId, colName));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, 'users', userId, colName, d.id)).catch(() => {});
        }
      } catch (e) {}
    }

    setTransactions([]);
    setDebts([]);
    setTransfers([]);
    setBudgets([]);
    setSavingsGoals([]);
    setNotifications([]);
  };

  return (
    <MoneyContext.Provider
      value={{
        currentUser,
        allUsers,
        supportMessages,
        registerUser,
        loginUser,
        logoutUser,
        switchDemoAccount,
        sendSupportMessage,
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
        updatePaymentMethod,
        deletePaymentMethod,
        togglePaymentMethodHide,
        togglePaymentMethodPin,
        getAccountBalance,
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
