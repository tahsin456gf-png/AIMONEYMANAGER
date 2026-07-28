export type TransactionType = 'income' | 'expense';

export type PaymentMethod = string;

export type AccountCategoryType = 'cash' | 'bank' | 'virtual' | 'receivable' | 'investment';

export interface AccountMethod {
  id: string;
  name: string;
  nameBn: string;
  category?: AccountCategoryType;
  initialBalance?: number;
  isHidden?: boolean;
  isPinned?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  time?: string;
  note: string;
  paymentMethod: PaymentMethod;
  receiptImage?: string; // base64 or URL
  isHidden?: boolean;
  createdAt: number;
}

export type DebtType = 'dena' | 'pawna'; // dena = debt I owe, pawna = debt owed to me

export interface DebtItem {
  id: string;
  type: DebtType;
  personName: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  date: string;
  notes: string;
  status: 'pending' | 'settled' | 'partial';
  reminderDate?: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  type: TransactionType;
  icon: string;
  color: string;
  isCustom?: boolean;
  isHidden?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string; // 'all' or specific category name/id
  monthlyTarget: number;
  alertThresholdPercent: number; // e.g. 85
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'warning' | 'info' | 'debt' | 'budget';
  isRead: boolean;
}

export interface StructuredAction {
  type: 'ADD_TRANSACTION' | 'ADD_DEBT' | 'SET_BUDGET';
  payload: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  structuredAction?: StructuredAction;
  actionDone?: boolean;
  isVoiceResponse?: boolean;
}

export interface AppUser {
  id: string; // phone number or unique uid
  name: string;
  phone: string;
  password?: string;
  adminPassword?: string; // User-customized admin panel password
  createdAt: number;
  isApproved: boolean; // default true (অটো অনুমোদন)
  isBlocked?: boolean; // toggle user block/unblock state
  role: 'user' | 'admin';
  referredBy?: string; // Phone number or ID of referring user
}

export interface SupportMessage {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: number;
  isReadByAdmin?: boolean;
  isReadByUser?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  currency: string;
  currencySymbol?: string;
  isPremium: boolean;
  pinLockEnabled: boolean;
  pinCode: string;
  familyOrBusinessMode: 'personal' | 'family' | 'business';
  darkMode: boolean;
  language: 'bn' | 'en';
}

export interface TransferItem {
  id: string;
  fromMethod: PaymentMethod;
  toMethod: PaymentMethod;
  amount: number;
  fee: number;
  date: string;
  note: string;
  createdAt: number;
}

export interface InitialBalances {
  Cash?: number;
  Bkash?: number;
  Nagad?: number;
  Bank?: number;
  Card?: number;
  Other?: number;
}

export type ThemeId = 
  | 'emerald_pro' 
  | 'gold_luxury' 
  | 'midnight_cyber' 
  | 'clean_light' 
  | 'royal_sapphire'
  | 'crimson_ruby'
  | 'sunset_amber'
  | 'amethyst_purple'
  | 'nordic_frost'
  | 'emerald_mint_light';

export interface ResearchObservation {
  id: string;
  title: string;
  content: string;
  type?: 'warning' | 'success' | 'info';
  isHidden?: boolean;
}

export interface ResearchReportSettings {
  reportDate?: string;
  refId?: string;
  statusText?: string;
  customObservations?: ResearchObservation[];
  showDefaultAutoObservations?: boolean;
}

export interface AdminSettings {
  adminPasscode: string;
  systemPrompt: string;
  adsEnabled: boolean;
  hiddenSections: string[]; // IDs of UI features disabled by admin
  activityLogs: Array<{ id: string; action: string; timestamp: number }>;
  initialBalances?: InitialBalances;
  mainBalanceOffset?: number;
  activeTheme?: ThemeId;
  researchReportSettings?: ResearchReportSettings;
}

export interface AIParseResult {
  intent: 'EXPENSE' | 'INCOME' | 'PAWNA' | 'DENA' | 'QUERY' | 'BUDGET_ADVICE' | 'OTHER';
  extractedData?: {
    amount?: number;
    category?: string;
    date?: string;
    note?: string;
    personName?: string;
    paymentMethod?: PaymentMethod;
  };
  aiReplyMessage: string;
  structuredAction?: StructuredAction;
}
