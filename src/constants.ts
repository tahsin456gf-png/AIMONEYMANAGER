import { Category, Transaction, DebtItem, Budget, SavingsGoal, AccountMethod } from './types';

export const DEFAULT_PAYMENT_METHODS: AccountMethod[] = [
  // Cash (নগদ)
  { id: 'pm_cash_wallet', name: 'মানিব্যাগ', nameBn: 'মানিব্যাগ', category: 'cash', initialBalance: 945, isHidden: false },
  { id: 'pm_cash_new_notes', name: 'নতুন নোট সংগ্রহ', nameBn: 'নতুন নোট সংগ্রহ', category: 'cash', initialBalance: 392, isHidden: false },
  
  // Bank / Debit Card (ডেবিট কার্ড / ব্যাংক)
  { id: 'pm_bank_ibbplc', name: 'IBBPLC', nameBn: 'IBBPLC', category: 'bank', initialBalance: 4186.65, isHidden: false },
  { id: 'pm_card', name: 'Card', nameBn: '💳 কার্ড (Card)', category: 'bank', initialBalance: 0, isHidden: false },

  // Virtual Accounts (ভার্চুয়াল অ্যাকাউন্ট)
  { id: 'pm_v_islamic', name: 'ISLAMIC WALLET', nameBn: 'ISLAMIC WALLET', category: 'virtual', initialBalance: 20, isHidden: false },
  { id: 'pm_v_upay', name: 'UPAY', nameBn: 'UPAY', category: 'virtual', initialBalance: 29, isHidden: false },
  { id: 'pm_v_tap', name: 'Tap', nameBn: 'Tap', category: 'virtual', initialBalance: 5, isHidden: false },
  { id: 'pm_bkash', name: 'Bkash', nameBn: '📱 বিকাশ (bKash)', category: 'virtual', initialBalance: 0, isHidden: false },
  { id: 'pm_nagad', name: 'Nagad', nameBn: '📱 নগদ (Nagad)', category: 'virtual', initialBalance: 0, isHidden: false },
  { id: 'pm_v_rocket', name: 'Rocket', nameBn: 'Rocket', category: 'virtual', initialBalance: 0, isHidden: false },

  // Receivables (আমাকে ঋণী - Pawna)
  { id: 'pm_rec_hosain', name: 'হোসাইন', nameBn: 'হোসাইন', category: 'receivable', initialBalance: 0, isHidden: false },
  { id: 'pm_rec_ammu', name: 'আম্মু', nameBn: 'আম্মু', category: 'receivable', initialBalance: 720, isHidden: false },
  { id: 'pm_rec_sir', name: 'স্যার', nameBn: 'স্যার', category: 'receivable', initialBalance: 350, isHidden: false },
  { id: 'pm_rec_obaidullah', name: 'ওবায়দুল্লাহ', nameBn: 'ওবায়দুল্লাহ', category: 'receivable', initialBalance: 3600, isHidden: false },
  { id: 'pm_rec_jahidul', name: 'জাহিদুল', nameBn: 'জাহিদুল', category: 'receivable', initialBalance: 200, isHidden: false },
  { id: 'pm_rec_basit', name: 'বাসিত', nameBn: 'বাসিত', category: 'receivable', initialBalance: 60, isHidden: false },

  // Investments (বিনিয়োগ)
  { id: 'pm_inv_dps', name: 'DPS', nameBn: 'DPS', category: 'investment', initialBalance: 2000, isHidden: false },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'inc_bazar', name: 'Market Income', nameBn: '🛒 বাজার', type: 'income', icon: 'ShoppingCart', color: '#10B981' },
  { id: 'inc_salary', name: 'Salary', nameBn: 'বেতন', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: 'inc_business', name: 'Business', nameBn: 'ব্যবসা', type: 'income', icon: 'Building2', color: '#059669' },
  { id: 'inc_bonus', name: 'Bonus', nameBn: 'বোনাস', type: 'income', icon: 'Gift', color: '#3B82F6' },
  { id: 'inc_gift', name: 'Gift', nameBn: 'উপহার', type: 'income', icon: 'HeartHandshake', color: '#8B5CF6' },
  { id: 'inc_freelance', name: 'Freelancing', nameBn: 'ফ্রিল্যান্সিং', type: 'income', icon: 'Laptop', color: '#06B6D4' },
  { id: 'inc_other', name: 'Other Income', nameBn: 'অন্যান্য আয়', type: 'income', icon: 'Coins', color: '#6B7280' },
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'exp_food', name: 'Food & Dining', nameBn: '🍔 খাদ্য', type: 'expense', icon: 'Utensils', color: '#EF4444' },
  { id: 'exp_transport', name: 'Transport', nameBn: '🚌 যানবাহন', type: 'expense', icon: 'Bus', color: '#F97316' },
  { id: 'exp_rent', name: 'Housing / Rent', nameBn: '🏠 বাসা', type: 'expense', icon: 'Home', color: '#8B5CF6' },
  { id: 'exp_bills', name: 'Utilities & Bills', nameBn: '⚡ বিল', type: 'expense', icon: 'Zap', color: '#EAB308' },
  { id: 'exp_mobile', name: 'Mobile & Internet', nameBn: '📱 মোবাইল', type: 'expense', icon: 'Smartphone', color: '#06B6D4' },
  { id: 'exp_medical', name: 'Medical & Health', nameBn: '💊 চিকিৎসা', type: 'expense', icon: 'Activity', color: '#EC4899' },
  { id: 'exp_education', name: 'Education', nameBn: '🎓 শিক্ষা', type: 'expense', icon: 'GraduationCap', color: '#3B82F6' },
  { id: 'exp_groceries', name: 'Groceries / Market', nameBn: '🛒 বাজার', type: 'expense', icon: 'ShoppingCart', color: '#10B981' },
  { id: 'exp_clothing', name: 'Clothing', nameBn: '👕 পোশাক', type: 'expense', icon: 'Shirt', color: '#A855F7' },
  { id: 'exp_entertainment', name: 'Entertainment', nameBn: '🎮 বিনোদন', type: 'expense', icon: 'Gamepad2', color: '#F43F5E' },
  { id: 'exp_gifts', name: 'Gifts & Donations', nameBn: '🎁 উপহার', type: 'expense', icon: 'Gift', color: '#14B8A6' },
  { id: 'exp_office', name: 'Office Expense', nameBn: '💼 অফিস', type: 'expense', icon: 'Briefcase', color: '#64748B' },
  { id: 'exp_emi', name: 'EMI / Loan Repay', nameBn: '💰 EMI', type: 'expense', icon: 'CreditCard', color: '#D97706' },
  { id: 'exp_other', name: 'Other Expense', nameBn: 'অন্যান্য', type: 'expense', icon: 'MoreHorizontal', color: '#9CA3AF' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_DEBTS: DebtItem[] = [];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];
