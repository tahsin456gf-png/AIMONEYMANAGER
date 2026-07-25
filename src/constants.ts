import { Category, Transaction, DebtItem, Budget, SavingsGoal, AccountMethod } from './types';

export const DEFAULT_PAYMENT_METHODS: AccountMethod[] = [
  { id: 'pm_cash', name: 'Cash', nameBn: '💵 ক্যাশ / পকেট', isHidden: false },
  { id: 'pm_bkash', name: 'Bkash', nameBn: '📱 বিকাশ (bKash)', isHidden: false },
  { id: 'pm_nagad', name: 'Nagad', nameBn: '📱 নগদ (Nagad)', isHidden: false },
  { id: 'pm_bank', name: 'Bank', nameBn: '🏦 ব্যাংক (Bank)', isHidden: false },
  { id: 'pm_card', name: 'Card', nameBn: '💳 কার্ড (Card)', isHidden: false },
  { id: 'pm_other', name: 'Other', nameBn: '🌐 অন্যান্য', isHidden: false },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
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

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_inc_1',
    type: 'income',
    amount: 32000,
    category: 'Freelancing (ফ্রিল্যান্সিং)',
    date: new Date().toISOString().split('T')[0],
    note: 'ওয়েব ডিজাইন প্রজেক্ট',
    paymentMethod: 'Bank',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tx_inc_2',
    type: 'income',
    amount: 45000,
    category: 'Salary (বেতন)',
    date: new Date().toISOString().split('T')[0],
    note: 'মাসিক বেতন জমা',
    paymentMethod: 'Bank',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'tx_exp_1',
    type: 'expense',
    amount: 8980,
    category: '🍔 খাদ্য',
    date: new Date().toISOString().split('T')[0],
    note: 'মাসিক খাদ্য রেস্তোরাঁ ও খাদ্যসামগ্রী',
    paymentMethod: 'Bkash',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'tx_exp_2',
    type: 'expense',
    amount: 120,
    category: '🚌 যানবাহন',
    date: new Date().toISOString().split('T')[0],
    note: 'বাস ও রিকশা ভাড়া',
    paymentMethod: 'Cash',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'tx_exp_3',
    type: 'expense',
    amount: 15000,
    category: '🏠 বাসা',
    date: new Date().toISOString().split('T')[0],
    note: 'বাসা ভাড়া পরিশোধ',
    paymentMethod: 'Bank',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'tx_exp_4',
    type: 'expense',
    amount: 3200,
    category: '⚡ বিল',
    date: new Date().toISOString().split('T')[0],
    note: 'বিদ্যুৎ ও গ্যাস বিল',
    paymentMethod: 'Bkash',
    createdAt: Date.now() - 86400000 * 2,
  },
];

export const INITIAL_DEBTS: DebtItem[] = [
  {
    id: 'debt_1',
    type: 'pawna',
    personName: 'সোহেল',
    amount: 2000,
    paidAmount: 0,
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    date: new Date().toISOString().split('T')[0],
    notes: 'জরুরী প্রয়োজনে ধার দেওয়া হয়েছে',
    status: 'pending',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'debt_2',
    type: 'dena',
    personName: 'বাবা',
    amount: 5000,
    paidAmount: 1000,
    dueDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
    date: new Date().toISOString().split('T')[0],
    notes: 'অনলাইন শপিংয়ের জন্য নেয়া ধার',
    status: 'partial',
    createdAt: Date.now() - 86400000 * 2,
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'b_food', categoryId: '🍔 খাদ্য', monthlyTarget: 500, alertThresholdPercent: 80 },
  { id: 'b_transport', categoryId: '🚌 যানবাহন', monthlyTarget: 3000, alertThresholdPercent: 80 },
  { id: 'b_rent', categoryId: '🏠 বাসা', monthlyTarget: 15000, alertThresholdPercent: 80 },
  { id: 'b_bills', categoryId: '⚡ বিল', monthlyTarget: 4000, alertThresholdPercent: 80 },
  { id: 'b_market', categoryId: '🛒 বাজার', monthlyTarget: 8000, alertThresholdPercent: 80 },
  { id: 'b_entertainment', categoryId: '🎮 বিনোদন', monthlyTarget: 2500, alertThresholdPercent: 80 },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg_1',
    title: 'নতুন ল্যাপটপ ফান্ড',
    targetAmount: 85000,
    currentAmount: 32000,
    targetDate: '2026-12-31',
    color: '#3B82F6',
    icon: 'Laptop',
    createdAt: Date.now(),
  },
  {
    id: 'sg_2',
    title: 'জরুরি তহবিল (Emergency Fund)',
    targetAmount: 50000,
    currentAmount: 25000,
    targetDate: '2026-10-15',
    color: '#10B981',
    icon: 'ShieldCheck',
    createdAt: Date.now(),
  }
];
