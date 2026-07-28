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
  where,
  writeBatch,
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
  registerUser: (data: { name: string; phone: string; password?: string; adminPassword?: string; referredBy?: string }) => Promise<{ success: boolean; message?: string }>;
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
  toggleUserBlock: (userId: string) => Promise<void>;
  updateUserPasswords: (passwords: { password?: string; adminPassword?: string }) => Promise<{ success: boolean; message?: string }>;
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
  // Active Logged User State - Always require login when opening app or URL
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const [activeTab, setActiveTab] = useState<string>('auth');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(true);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState<boolean>(true);

  // Global Multi-User and Support State - Loaded with Local Cache + Firestore Live Sync
  const [allUsers, setAllUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem('ai_money_all_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [DEFAULT_USER];
  });
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);

  // Firestore Collections State (Strictly isolated per user ID!)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(DEFAULT_INCOME_CATEGORIES);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<AccountMethod[]>(DEFAULT_PAYMENT_METHODS);
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

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem('ai_money_admin_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      adminPasscode: 'mdtanvir3600',
      systemPrompt: 'You are AI Money Manager Pro assistant for Bengali financial tracking.',
      adsEnabled: false,
      hiddenSections: [],
      activityLogs: [{ id: 'log_1', action: 'System active', timestamp: Date.now() }],
      researchReportSettings: {
        reportDate: '২৫/৭/২০২৬',
        refId: 'REF-RES2-2026',
        statusText: 'অনুমোদিত (VERIFIED)',
        showDefaultAutoObservations: true,
        customObservations: [],
      },
    };
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

  // High-performance Realtime Listeners for Registered Users and Support Messages
  useEffect(() => {
    // Always subscribe to app_users collection in Firestore so Main Admin & all devices receive real-time registered users list
    const unsubUsers = onSnapshot(
      collection(db, 'app_users'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as AppUser);
          if (!list.some((u) => u.phone === '01700000001')) {
            list.unshift(DEFAULT_USER);
          }
          setAllUsers(list);
          try {
            localStorage.setItem('ai_money_all_users', JSON.stringify(list));
          } catch (e) {}
        }
      },
      (err) => console.log('app_users listener error:', err)
    );

    let unsubSupport = () => {};

    if (currentUser) {
      const isAdmin = currentUser.role === 'admin' || currentUser.phone === '01700000001' || currentUser.phone === '01334003916';

      if (isAdmin) {
        unsubSupport = onSnapshot(
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
      } else {
        const qSupport = query(
          collection(db, 'support_messages'),
          where('userId', '==', currentUser.id)
        );

        unsubSupport = onSnapshot(
          qSupport,
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as SupportMessage);
            list.sort((a, b) => a.timestamp - b.timestamp);
            setSupportMessages(list);
          },
          (err) => console.log('support_messages listener error:', err)
        );
      }
    } else {
      setSupportMessages([]);
    }

    return () => {
      unsubUsers();
      unsubSupport();
    };
  }, [currentUser?.id, currentUser?.role, currentUser?.phone]);

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

        // Helper to extract clean category key for deduplication
        const cleanCatKey = (catStr: string) =>
          (catStr || '')
            .replace(/[\p{Extended_Pictographic}\p{Emoji}]/gu, '')
            .replace(/(আয়|আয়|ব্যয়|ব্যায়|খরচ|ইনকাম|ে|িতে|\s+এ|\s+করলাম|\s+দিলাম|\s+বাবদ|\s+থেকে)/gi, '')
            .replace(/[^\u0980-\u09FFa-zA-Z0-9]/g, '')
            .trim()
            .toLowerCase();

        // Merge duplicate transaction entries on the same date for the same category & type
        const mergedMap = new Map<string, Transaction>();
        const duplicatesToDelete: string[] = [];

        rawList.forEach((t) => {
          const normType = isIncomeType(t.type) ? 'income' : 'expense';
          const cKey = cleanCatKey(t.category);
          const key = `${t.date || ''}_${normType}_${cKey}`;

          if (!mergedMap.has(key)) {
            mergedMap.set(key, { ...t, type: normType });
          } else {
            const existing = mergedMap.get(key)!;
            existing.amount = (Number(existing.amount) || 0) + (Number(t.amount) || 0);
            existing.createdAt = Math.max(existing.createdAt || 0, t.createdAt || 0);
            duplicatesToDelete.push(t.id);
          }
        });

        // Clean up duplicate entries in Firestore in background
        if (duplicatesToDelete.length > 0 && userId) {
          const batch = writeBatch(db);
          duplicatesToDelete.forEach((dupId) => {
            batch.delete(doc(db, 'users', userId, 'transactions', dupId));
          });
          mergedMap.forEach((mTx) => {
            batch.set(doc(db, 'users', userId, 'transactions', mTx.id), mTx, { merge: true });
          });
          batch.commit().catch((err) => console.error('Error auto-merging duplicate txs:', err));
        }

        const list = Array.from(mergedMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
        // Seed default categories for this user in a single batch
        const all = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
        const batch = writeBatch(db);
        all.forEach((cat) => {
          batch.set(doc(db, 'users', userId, 'categories', cat.id), cat);
        });
        await batch.commit().catch(() => {});
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
        // Seed default accounts starting with ZERO (0 BDT) initial balance in a single batch
        const zeroDefaultPayMethods = DEFAULT_PAYMENT_METHODS.map((pm) => ({
          ...pm,
          initialBalance: 0,
        }));
        const batch = writeBatch(db);
        zeroDefaultPayMethods.forEach((pm) => {
          batch.set(doc(db, 'users', userId, 'paymentMethods', pm.id), pm);
        });
        await batch.commit().catch(() => {});
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
  const registerUser = async (data: { name: string; phone: string; password?: string; adminPassword?: string; referredBy?: string }): Promise<{ success: boolean; message?: string }> => {
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
        ...(data.referredBy ? { referredBy: data.referredBy } : {}),
      };

      // Save user profile in Firestore
      await setDoc(userRef, newUser);

      // Ensure default admin user is synced in Firestore
      await setDoc(doc(db, 'app_users', '01700000001'), DEFAULT_USER, { merge: true }).catch(() => {});

      // Update local storage cache and allUsers state immediately
      setAllUsers((prev) => {
        const filtered = prev.filter((u) => u.id !== cleanPhone);
        const updated = [newUser, ...filtered];
        try {
          localStorage.setItem('ai_money_all_users', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // Auto login user
      setCurrentUser(newUser);
      setActiveTab('home');

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
        ...(data.referredBy ? { referredBy: data.referredBy } : {}),
      };
      setAllUsers((prev) => {
        const filtered = prev.filter((u) => u.id !== cleanPhone);
        const updated = [newUser, ...filtered];
        try {
          localStorage.setItem('ai_money_all_users', JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
      setCurrentUser(newUser);
      setActiveTab('home');
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

        if (userData.isBlocked) {
          return { success: false, message: 'আপনার অ্যাকাউন্টটি ব্লক করা রয়েছে! সহায়তার জন্য মেইন এডমিনের সাথে যোগাযোগ করুন।' };
        }

        if (userData.password && credentials.password && userData.password !== credentials.password) {
          return { success: false, message: 'পাসওয়ার্ড সঠিক নয়!' };
        }
        setCurrentUser(userData);
        setActiveTab('home');
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
        setActiveTab('home');
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
      setActiveTab('home');
      return { success: true };
    }
  };

  const toggleUserBlock = async (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    const newBlockedState = target ? !target.isBlocked : true;
    
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlocked: newBlockedState } : u))
    );

    try {
      await setDoc(doc(db, 'app_users', userId), { isBlocked: newBlockedState }, { merge: true });
    } catch (e) {
      console.error('Error toggling block state:', e);
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

    // Category cleaner helper
    const cleanCatKey = (catStr: string) =>
      (catStr || '')
        .replace(/[\p{Extended_Pictographic}\p{Emoji}]/gu, '')
        .replace(/(আয়|আয়|ব্যয়|ব্যায়|খরচ|ইনকাম|ে|িতে|\s+এ|\s+করলাম|\s+দিলাম|\s+বাবদ|\s+থেকে)/gi, '')
        .replace(/[^\u0980-\u09FFa-zA-Z0-9]/g, '')
        .trim()
        .toLowerCase();

    const targetCatKey = cleanCatKey(resolvedCategoryName);

    // Search for existing transaction entry on same date, type, and clean category
    const existingTx = transactions.find((t) => {
      const sameType = isIncomeType(t.type) === (normalizedType === 'income');
      const sameDate = (t.date || '') === txDate;
      const tKey = cleanCatKey(t.category);
      const sameCategory = tKey === targetCatKey || t.category === resolvedCategoryName;
      return sameType && sameDate && sameCategory;
    });

    if (existingTx) {
      const newTotalAmount = (Number(existingTx.amount) || 0) + positiveAmount;
      const updatedNote = `${existingTx.category} ${normalizedType === 'income' ? 'আয়' : 'ব্যয়'} ${newTotalAmount} • ${tx.paymentMethod || existingTx.paymentMethod || 'Cash'}`;

      const updatedTx: Transaction = {
        ...existingTx,
        amount: newTotalAmount,
        note: updatedNote,
        time: txTime,
        paymentMethod: tx.paymentMethod || existingTx.paymentMethod || 'Cash',
        createdAt: Date.now(),
      };

      // Optimistically update React state immediately
      setTransactions((prev) => prev.map((t) => (t.id === existingTx.id ? updatedTx : t)));

      // Update Firestore document
      updateDoc(doc(db, 'users', userId, 'transactions', existingTx.id), {
        amount: newTotalAmount,
        note: updatedNote,
        time: txTime,
        paymentMethod: tx.paymentMethod || existingTx.paymentMethod || 'Cash',
        createdAt: Date.now(),
      }).catch((err) => console.error('Error updating existing transaction:', err));
    } else {
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
    }
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
  const updateUserPasswords = async (passwords: { password?: string; adminPassword?: string }): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) return { success: false, message: 'ব্যবহারকারী লগইন অবস্থায় নেই!' };

    const updatedUser: AppUser = {
      ...currentUser,
      ...(passwords.password !== undefined ? { password: passwords.password } : {}),
      ...(passwords.adminPassword !== undefined ? { adminPassword: passwords.adminPassword } : {}),
    };

    try {
      // 1. Update Firestore app_users collection
      const userRef = doc(db, 'app_users', currentUser.id);
      await setDoc(userRef, updatedUser, { merge: true });

      // 2. Update active current user state & local storage
      setCurrentUser(updatedUser);
      localStorage.setItem('ai_money_active_user', JSON.stringify(updatedUser));

      // 3. Update in allUsers list state if loaded
      setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

      return { success: true };
    } catch (e: any) {
      console.error('Password update error:', e);
      setCurrentUser(updatedUser);
      localStorage.setItem('ai_money_active_user', JSON.stringify(updatedUser));
      return { success: true };
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...profile };
    setUserProfile(updated);
  };

  const updateAdminSettings = async (settings: Partial<AdminSettings>) => {
    const updated = { ...adminSettings, ...settings };
    setAdminSettings(updated);
    try {
      localStorage.setItem('ai_money_admin_settings', JSON.stringify(updated));
      await setDoc(doc(db, 'system', 'adminSettings'), updated).catch(() => {});
    } catch (e) {}
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
        toggleUserBlock,
        updateUserProfile,
        updateUserPasswords,
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
