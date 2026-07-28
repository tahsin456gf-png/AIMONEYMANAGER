import { GoogleGenAI, Type } from '@google/genai';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../constants';

// Utility to convert English numerals to Bengali numerals
export function toBnDigits(val: number | string | undefined | null): string {
  if (val === undefined || val === null || isNaN(Number(val))) return '০';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const str = absNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const bnStr = str.replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
  return isNegative ? `-${bnStr}` : bnStr;
}

// Utility to convert Bengali numerals to English numerals
export function convertBnToEnDigits(str: string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (w) => bnDigits.indexOf(w).toString());
}

// Convert ISO date (YYYY-MM-DD) or current date to "২৪ জুলাই ২০২৬"
export function toBnDateStr(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.getDate();
  const monthsBn = [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর',
  ];
  const month = monthsBn[d.getMonth()];
  const year = d.getFullYear();
  return `${toBnDigits(day)} ${month} ${toBnDigits(year)}`;
}

export interface AIParseContext {
  prompt: string;
  categories?: {
    income?: string[];
    expense?: string[];
  };
  transactions?: any[];
  debts?: any[];
  budgets?: any[];
  savingsGoals?: any[];
  adminSettings?: any;
}

export interface AIParseResult {
  intent: string;
  extractedData?: {
    amount?: number;
    category?: string;
    date?: string;
    note?: string;
    personName?: string;
    paymentMethod?: string;
  };
  aiReplyMessage: string;
  structuredAction?: {
    type: 'ADD_TRANSACTION' | 'ADD_DEBT' | 'UPDATE_TRANSACTION' | 'DELETE_TRANSACTION';
    payload: any;
  };
}

// Helper to compute full wallet balances & format screenshot-style breakdown
function computeWalletBreakdown(
  ctx: AIParseContext,
  opts: {
    intent: 'EXPENSE' | 'INCOME' | 'PAWNA' | 'DENA' | 'SUMMARY' | 'GENERAL' | 'CORRECTION';
    category?: string;
    amount?: number;
    paymentMethod?: string;
    note?: string;
    personName?: string;
    date?: string;
    wasDefaultMethod?: boolean;
    correctionNote?: string;
  }
): string {
  const initBals = ctx.adminSettings?.initialBalances || {};

  // Base initial account balances
  let cashBal = initBals.Cash !== undefined ? Number(initBals.Cash) : 1337;
  let bkashBal = initBals.Bkash !== undefined ? Number(initBals.Bkash) : 0;
  let nagadBal = initBals.Nagad !== undefined ? Number(initBals.Nagad) : 0;
  let rocketBal = initBals.Rocket !== undefined ? Number(initBals.Rocket) : 0;
  let bankBal = initBals.Bank !== undefined ? Number(initBals.Bank) : 4186.65;
  let dpsBal = initBals.DPS !== undefined ? Number(initBals.DPS) : 2000;

  let totalIncome = 0;
  let totalExpense = 0;

  // Aggregate all transactions from history
  (ctx.transactions || []).forEach((t: any) => {
    const amt = Math.abs(Number(t.amount) || 0);
    const method = (t.paymentMethod || 'Cash').toLowerCase();
    const txType = (t.type || '').toString().toLowerCase().trim();
    const isInc = txType === 'income' || txType === 'inc' || txType.includes('আয়') || txType.includes('আয়') || txType.includes('জমা');
    const isExp = txType === 'expense' || txType === 'exp' || txType.includes('ব্যয়') || txType.includes('ব্যায়') || txType.includes('খরচ');

    if (isInc) {
      totalIncome += amt;
      if (method.includes('bkash') || method.includes('বিকাশ')) bkashBal += amt;
      else if (method.includes('nagad') || method.includes('নগদ')) nagadBal += amt;
      else if (method.includes('rocket') || method.includes('রকেট')) rocketBal += amt;
      else if (method.includes('bank') || method.includes('ব্যাংক') || method.includes('ibbplc') || method.includes('card')) bankBal += amt;
      else if (method.includes('dps') || method.includes('বিনিয়োগ')) dpsBal += amt;
      else cashBal += amt;
    } else if (isExp) {
      totalExpense += amt;
      if (method.includes('bkash') || method.includes('বিকাশ')) bkashBal -= amt;
      else if (method.includes('nagad') || method.includes('নগদ')) nagadBal -= amt;
      else if (method.includes('rocket') || method.includes('রকেট')) rocketBal -= amt;
      else if (method.includes('bank') || method.includes('ব্যাংক') || method.includes('ibbplc') || method.includes('card')) bankBal -= amt;
      else if (method.includes('dps') || method.includes('বিনিয়োগ')) dpsBal -= amt;
      else cashBal -= amt;
    }
  });

  // Calculate Pawna (Lent) and Dena (Borrowed)
  let totalPawna = 0;
  let totalDena = 0;

  (ctx.debts || []).forEach((d: any) => {
    if (d.status !== 'settled') {
      const remaining = (Number(d.amount) || 0) - (Number(d.paidAmount) || 0);
      if (remaining > 0) {
        if (d.type === 'pawna') {
          totalPawna += remaining;
        } else if (d.type === 'dena') {
          totalDena += remaining;
        }
      }
    }
  });

  const totalVirtual = bkashBal + nagadBal + rocketBal;

  // Handle SUMMARY intent matching separate account categories
  if (opts.intent === 'SUMMARY') {
    const netBalance = totalIncome - totalExpense;

    return `🤖 AI Manager
📊 আপনার হিসাবের সার্বিক অ্যাকাউন্ট ক্যাটাগরি সামারি

💰 মোট আয় ও ব্যয়:
• 📈 মোট আয়: ৳${toBnDigits(totalIncome)}
• 📉 মোট ব্যয়: ৳${toBnDigits(totalExpense)}
• ⚖️ নেট ব্যালেন্স: ৳${toBnDigits(netBalance)}

🏢 ক্যাটাগরি অনুযায়ী অ্যাকাউন্ট ব্যালেন্স:
• 💵 নগদ (Cash/মানিব্যাগ): ৳${toBnDigits(cashBal)}
• 🏦 ব্যাংক (Bank/IBBPLC): ৳${toBnDigits(bankBal)}
• 📱 ভার্চুয়াল (Bkash/Nagad/Rocket): ৳${toBnDigits(totalVirtual)}
• 🤝 আমাকে ঋণী (পাওনা): ৳${toBnDigits(totalPawna)}
• 📈 বিনিয়োগ (DPS/সঞ্চয়): ৳${toBnDigits(dpsBal)}

🤝 দেনা ও দায়:
• 💳 মোট দেনা: ৳${toBnDigits(totalDena)}`;
  }

  // Handle single transaction intent
  const methodKey = (opts.paymentMethod || 'Cash').toLowerCase();

  let prevMethodBal = cashBal;
  let methodNameBn = 'ক্যাশ (পকেট)';
  if (methodKey.includes('bkash') || methodKey.includes('বিকাশ')) {
    prevMethodBal = bkashBal;
    methodNameBn = 'বিকাশ (ভার্চুয়াল)';
  } else if (methodKey.includes('nagad') || methodKey.includes('নগদ')) {
    prevMethodBal = nagadBal;
    methodNameBn = 'নগদ (ভার্চুয়াল)';
  } else if (methodKey.includes('rocket') || methodKey.includes('রকেট')) {
    prevMethodBal = rocketBal;
    methodNameBn = 'রকেট (ভার্চুয়াল)';
  } else if (methodKey.includes('bank') || methodKey.includes('ব্যাংক') || methodKey.includes('ibbplc') || methodKey.includes('card')) {
    prevMethodBal = bankBal;
    methodNameBn = 'ব্যাংক/IBBPLC';
  } else if (methodKey.includes('dps') || methodKey.includes('বিনিয়োগ')) {
    prevMethodBal = dpsBal;
    methodNameBn = 'DPS/বিনিয়োগ';
  } else {
    prevMethodBal = cashBal;
    methodNameBn = 'নগদ (Cash)';
  }

  const currentAmt = Math.abs(opts.amount || 0);
  let newMethodBal = prevMethodBal;
  if (opts.intent === "EXPENSE") newMethodBal = prevMethodBal - currentAmt;
  else if (opts.intent === "INCOME") newMethodBal = prevMethodBal + currentAmt;

  if (methodNameBn.includes("নগদ")) cashBal = newMethodBal;
  else if (methodNameBn.includes("বিকাশ")) bkashBal = newMethodBal;
  else if (methodNameBn.includes("নগদ (ভার্চুয়াল)")) nagadBal = newMethodBal;
  else if (methodNameBn.includes("রকেট")) rocketBal = newMethodBal;
  else if (methodNameBn.includes("ব্যাংক")) bankBal = newMethodBal;
  else if (methodNameBn.includes("DPS")) dpsBal = newMethodBal;

  const bnDate = toBnDateStr(opts.date);
  const bnAmt = toBnDigits(currentAmt);
  const bnPrevMethodBal = toBnDigits(prevMethodBal);
  const bnNewMethodBal = toBnDigits(newMethodBal);

  const bnCash = toBnDigits(cashBal);
  const bnBank = toBnDigits(bankBal);
  const bnTotalVirtual = toBnDigits(bkashBal + nagadBal + rocketBal);
  const bnTotalPawna = toBnDigits(totalPawna);

  const noteTip = opts.wasDefaultMethod
    ? `\n💡 টিপস: মাধ্যম উল্লেখ না করায় ডিফল্টভাবে **${methodNameBn}** ক্যাটাগরিতে যুক্ত হয়েছে। অন্য অ্যাকাউন্টে হলে "বিকাশে ছিল" বা "ব্যাংকে ছিল" বললে আপডেট করে দেওয়া হবে!`
    : "";

  if (opts.intent === 'EXPENSE') {
    return `নোট করা হলো বন্ধু! 🫡

📅 ${bnDate}

📝 খরচের বিবরণ (Expense)

• 🏷️ ক্যাটাগরি: ${opts.category || "🛒 বাজার"}
• 💰 পরিমাণ: ৳${bnAmt}
• 💳 অ্যাকাউন্ট মাধ্যম: ${methodNameBn}
• 🌐 বিবরণ: ${opts.note || "দৈনিক খরচ"}

📊 অ্যাকাউন্ট ব্যালেন্স আপডেট

• 💵 ${methodNameBn} ব্যালেন্স: ৳${bnPrevMethodBal} ➔ ৳${bnNewMethodBal}
• 📱 ভার্চুয়াল ব্যালেন্স (MFS): ৳${bnTotalVirtual}
• 🏦 ব্যাংক অ্যাকাউন্ট: ৳${bnBank}${noteTip}`;
  }

  if (opts.intent === 'INCOME') {
    return `নোট করা হলো বন্ধু! 🫡

📅 ${bnDate}

📝 আয়ের বিবরণ (Income)

• 🏷️ ক্যাটাগরি: ${opts.category || "💰 অন্যান্য আয়"}
• 💰 পরিমাণ: ৳${bnAmt}
• 💳 জমা অ্যাকাউন্ট: ${methodNameBn}
• 🌐 বিবরণ: ${opts.note || "আয়"}

📊 অ্যাকাউন্টস আপডেট

• 💵 নগদ: ৳${bnCash}
• 📱 ভার্চুয়াল (Bkash/Nagad/Rocket): ৳${bnTotalVirtual}
• 🏦 ব্যাংক: ৳${bnBank}`;
  }

  if (opts.intent === 'PAWNA') {
    return `নোট করা হলো বন্ধু। 🫡

📅 ${bnDate}

📝 পাওনা হিসাব (আমাকে ঋণী)

• 👤 গ্রহীতা: ${opts.personName || 'ব্যক্তি'}
• 💰 পরিমাণ: ৳${bnAmt}
• 📁 অ্যাকাউন্ট ক্যাটাগরি: 🤝 আমাকে ঋণী (Receivables)
• 🌐 বিবরণ: ${opts.note || 'ধার প্রদান'}

📊 আপডেটেড অ্যাকাউন্টস

• 💵 নগদ: ৳${bnCash}
• 📱 ভার্চুয়াল (MFS): ৳${bnTotalVirtual}
• 🏦 ব্যাংক: ৳${bnBank}
• 🤝 মোট পাওনা (আমাকে ঋণী): ৳${toBnDigits(totalPawna + currentAmt)}
• 👤 ${opts.personName || 'ব্যক্তি'} পাওনা: ৳${bnAmt}`;
  }

  if (opts.intent === 'DENA') {
    return `নোট করা হলো বন্ধু। 🫡

📅 ${bnDate}

📝 দেনা হিসাব (ঋণ গ্রহণ)

• 👤 দাতা: ${opts.personName || 'ব্যক্তি'}
• 💰 পরিমাণ: ৳${bnAmt}
• 📁 অ্যাকাউন্ট ক্যাটাগরি: 💳 দেনা (Liabilities)
• 🌐 বিবরণ: ${opts.note || 'ধার গ্রহণ'}

📊 আপডেটেড অ্যাকাউন্টস

• 💵 নগদ: ৳${bnCash}
• 📱 ভার্চুয়াল (MFS): ৳${bnTotalVirtual}
• 🏦 ব্যাংক: ৳${bnBank}
• 📝 মোট পাওনা: ৳${bnTotalPawna}`;
  }

  return computeWalletBreakdown(ctx, { intent: 'SUMMARY' });
}

// Smart Dynamic Category Finder
function matchCategoryFromList(
  prompt: string,
  categoryList: any[] = [],
  type: 'income' | 'expense'
): string {
  const defaults = type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  const fullList = [...(categoryList || []), ...defaults];
  const lowerPrompt = prompt.toLowerCase();

  const cleanStr = (s: string) =>
    s ? s.replace(/[\p{Extended_Pictographic}\p{Emoji}]/gu, '').replace(/(আয়|আয়|ব্যয়|ব্যায়|খরচ)/gi, '').replace(/[^\u0980-\u09FFa-zA-Z0-9]/g, '').trim().toLowerCase() : '';

  const getCatName = (c: any): string => (typeof c === 'string' ? c : c.nameBn || c.name || '');

  // Helper to search existing category list
  const findExisting = (query: string) => {
    const cleanQ = cleanStr(query);
    if (!cleanQ || cleanQ.length < 2) return null;
    return fullList.find((c) => {
      const name = getCatName(c);
      const cleanName = cleanStr(name);
      return cleanName === cleanQ || cleanName.includes(cleanQ) || cleanQ.includes(cleanName);
    });
  };

  // 1. Search existing categories first (Admin, User pre-defined, or default)
  for (const cat of fullList) {
    if (!cat) continue;
    const catNameBn = getCatName(cat);
    const cleanBn = cleanStr(catNameBn);

    if (cleanBn.length >= 2) {
      if (lowerPrompt.includes(cleanBn)) {
        return catNameBn;
      }
      // Check inflection root matching (e.g., "দোকান" matches "দোকানে", "দোকানের", "দোকান থেকে")
      const rootRegex = new RegExp(`${cleanBn}(ে|িতে|ের|ে\\s*আয়|ে\\s*ব্যয়|ে\\s*থেকে|ের\\s*থেকে)?`, 'i');
      if (rootRegex.test(lowerPrompt)) {
        return catNameBn;
      }
    }
  }

  // 2. Keyword-based matching if existing list did not yield direct prompt match
  if (type === 'expense') {
    if (/দান|সদকা|সাহায্য|যাকাত|দান করেছি|দান করলাম|দানে/i.test(prompt)) {
      const found = findExisting('দান') || categoryList.find((c) => getCatName(c).includes('দান') || getCatName(c).includes('সদকা'));
      return found ? getCatName(found) : '🎁 দান/সদকা';
    }
    if (/বাজার|শাক|সবজি|মাছ|মাংস|চাল|ডাল|মুদি|গ্রোসারি|সুপারশপ/i.test(prompt)) {
      const found = findExisting('বাজার') || categoryList.find((c) => getCatName(c).includes('বাজার') || getCatName(c).includes('মুদি'));
      return found ? getCatName(found) : '🛒 বাজার';
    }
    if (/গাড়ি|বাস|রিকশা|ভাড়া|যাতায়াত|গাড়িতে|যানবাহন|সিএনজি|বাইক|ফুয়েল|তেল|অটো/i.test(prompt)) {
      const found = findExisting('যানবাহন') || categoryList.find((c) => getCatName(c).includes('যানবাহন') || getCatName(c).includes('যাতায়াত') || getCatName(c).includes('গাড়ি'));
      return found ? getCatName(found) : '🚌 যানবাহন';
    }
    if (/খাবার|চা|নাস্তা|খাইলাম|খেলাম|বিরিয়ানি|হোটেল|লাঞ্চ|ডিনার|রেস্টুরেন্ট|টিফিন|বার্গার|পিজ্জা/i.test(prompt)) {
      const found = findExisting('খাদ্য') || categoryList.find((c) => getCatName(c).includes('খাদ্য') || getCatName(c).includes('খাবার'));
      return found ? getCatName(found) : '🍔 খাদ্য';
    }
    if (/মোবাইল|এমবি|রিচার্জ|ফ্লেক্সি|জিবি|ফোন|সিম|ইন্টারনেট|নেট/i.test(prompt)) {
      const found = findExisting('মোবাইল') || categoryList.find((c) => getCatName(c).includes('মোবাইল'));
      return found ? getCatName(found) : '📱 মোবাইল';
    }
    if (/পানি|ওয়াটার/i.test(prompt) && !/বিল|কারেন্ট|বিদ্যুৎ|ওয়াইফাই/i.test(prompt)) {
      const found = findExisting('পানি') || categoryList.find((c) => getCatName(c).includes('পানি'));
      return found ? getCatName(found) : '🚰 পানি';
    }
    if (/বিল|কারেন্ট|বিদ্যুৎ|গ্যাস|ওয়াইফাই/i.test(prompt)) {
      const found = findExisting('বিল') || categoryList.find((c) => getCatName(c).includes('বিল'));
      return found ? getCatName(found) : '⚡ বিল';
    }
    if (/চিকিৎসা|ওষুধ|ডাক্তার|মেডিসিন|হাসপাতাল|প্রেসক্রিপশন/i.test(prompt)) {
      const found = findExisting('চিকিৎসা') || categoryList.find((c) => getCatName(c).includes('চিকিৎসা') || getCatName(c).includes('ওষুধ'));
      return found ? getCatName(found) : '💊 চিকিৎসা';
    }
    if (/পোশাক|কাপড়|জামা|জুতা|প্যান্ট|শার্ট|শাড়ি|কুর্তি/i.test(prompt)) {
      const found = findExisting('পোশাক') || categoryList.find((c) => getCatName(c).includes('পোশাক'));
      return found ? getCatName(found) : '👕 পোশাক';
    }
    if (/বই|শিক্ষা|পড়াশোনা|টিউশন|টিউটর|কোর্স|খাতা|কলম|স্কুল|কলেজ|ফি/i.test(prompt)) {
      const found = findExisting('শিক্ষা') || categoryList.find((c) => getCatName(c).includes('শিক্ষা') || getCatName(c).includes('বই'));
      return found ? getCatName(found) : '🎓 শিক্ষা';
    }
    if (/উপহার|গিফট/i.test(prompt)) {
      const found = findExisting('উপহার') || categoryList.find((c) => getCatName(c).includes('উপহার'));
      return found ? getCatName(found) : '🎁 উপহার';
    }
    if (/জিম|ফিটনেস|কসরত|ব্যায়াম/i.test(prompt)) {
      const found = findExisting('জিম') || categoryList.find((c) => getCatName(c).includes('জিম'));
      return found ? getCatName(found) : '🏋️ জিম';
    }
    if (/মেস|বাসা ভাড়া|ফ্ল্যাট|ভাড়া/i.test(prompt)) {
      const found = findExisting('বাসা') || categoryList.find((c) => getCatName(c).includes('ভাড়া') || getCatName(c).includes('বাসা') || getCatName(c).includes('মেস'));
      return found ? getCatName(found) : '🏠 মেস ভাড়া';
    }
    if (/বিনোদন|মুভি|সিনেমা|গেম|ট্যুর|পিকনিক|পার্ক/i.test(prompt)) {
      const found = findExisting('বিনোদন') || categoryList.find((c) => getCatName(c).includes('বিনোদন'));
      return found ? getCatName(found) : '🎉 বিনোদন';
    }

    // 3. Dynamic subject extraction for custom expenses - MUST check categoryList first!
    const matchSubject = prompt.match(/([অ-য়a-zA-Z]+)(ের|র)?\s*(জন্য|বাবদ|খাতে|ফি|বিল|খরচ|ক্রয়|কেনা|করলাম|দিলাম|ব্যয়|ব্যায়|ে|িতে)/i);
    if (matchSubject && matchSubject[1] && matchSubject[1].length >= 2) {
      const subject = matchSubject[1].trim();
      if (!/টাকা|আজকে|কালকে|বিকাশ|নগদ|ক্যাশ|ব্যাংক|খরচ|আমার|আমাদের|টাকায়|টাকায়/i.test(subject)) {
        const existingSubjectCat = findExisting(subject);
        if (existingSubjectCat) {
          return getCatName(existingSubjectCat);
        }
        return `🏷️ ${subject}`;
      }
    }

    const foundOtherExp = categoryList.find((c) => getCatName(c).includes('অন্যান্য'));
    return foundOtherExp ? getCatName(foundOtherExp) : '🏷️ অন্যান্য';
  } else {
    // Income
    if (/দোকান|ব্যবসা|সেল|বিক্রি|কাস্টমার|দোকানে|দোকানের/i.test(prompt)) {
      const found = findExisting('ব্যবসা') || categoryList.find((c) => getCatName(c).includes('ব্যবসা') || getCatName(c).includes('দোকান'));
      return found ? getCatName(found) : '🏪 ব্যবসা';
    }
    if (/বাজার|মুদি|সুপারশপ|গ্রোসারি/i.test(prompt)) {
      const found = findExisting('বাজার') || categoryList.find((c) => getCatName(c).includes('বাজার') || getCatName(c).includes('মুদি'));
      return found ? getCatName(found) : '🛒 বাজার';
    }
    if (/বেতন|স্যালারি/i.test(prompt)) {
      const found = findExisting('বেতন') || categoryList.find((c) => getCatName(c).includes('বেতন'));
      return found ? getCatName(found) : '💼 বেতন';
    }
    if (/উপহার|গিফট|বক্শিস/i.test(prompt)) {
      const found = findExisting('উপহার') || categoryList.find((c) => getCatName(c).includes('উপহার'));
      return found ? getCatName(found) : '🎁 উপহার';
    }
    if (/ফ্রিল্যান্সিং|কাজ|প্রজেক্ট/i.test(prompt)) {
      const found = findExisting('ফ্রিল্যান্সিং') || categoryList.find((c) => getCatName(c).includes('ফ্রিল্যান্সিং'));
      return found ? getCatName(found) : '💻 ফ্রিল্যান্সিং';
    }
    if (/বোনাস|ইনসেন্টিভ/i.test(prompt)) {
      const found = findExisting('বোনাস') || categoryList.find((c) => getCatName(c).includes('বোনাস'));
      return found ? getCatName(found) : '🎁 বোনাস';
    }

    const foundOtherInc = categoryList.find((c) => getCatName(c).includes('অন্যান্য'));
    return foundOtherInc ? getCatName(foundOtherInc) : '💰 অন্যান্য আয়';
  }
}

// Smart Local Bengali Parser (Super-Fast, Instant 0-Lag)
export function smartLocalBengaliParser(ctx: AIParseContext): AIParseResult {
  const rawPrompt = ctx.prompt || '';
  const promptEnDigits = convertBnToEnDigits(rawPrompt);

  // Intelligent extraction of amount:
  let extractedAmount: number | undefined = undefined;
  const takaMatch = promptEnDigits.match(/(\d+(\.\d+)?)\s*(টাকা|টাকায়|tk|taka|\/-)/i);

  if (takaMatch && takaMatch[1]) {
    extractedAmount = parseFloat(takaMatch[1]);
  } else {
    const cleanedText = promptEnDigits.replace(/\(\d+\)/g, '');
    const numMatches = cleanedText.match(/\b\d+(\.\d+)?\b/g);
    if (numMatches && numMatches.length > 0) {
      extractedAmount = parseFloat(numMatches[0]);
    }
  }

  // Determine Payment Method intelligently
  let paymentMethod = 'Cash';
  let wasDefaultMethod = false;

  if (/বিকাশ|bkash/i.test(rawPrompt)) {
    paymentMethod = 'Bkash';
  } else if (/নগদ|nagad/i.test(rawPrompt)) {
    paymentMethod = 'Nagad';
  } else if (/রকেট|rocket/i.test(rawPrompt)) {
    paymentMethod = 'Rocket';
  } else if (/উপায়|upay|ট্যাপ|tap/i.test(rawPrompt)) {
    paymentMethod = 'Upay';
  } else if (/ব্যাংক|bank|ibbplc|কার্ড|card/i.test(rawPrompt)) {
    paymentMethod = 'Bank';
  } else if (/dps|ডিপিএস|সঞ্চয়|বিনিয়োগ|invest/i.test(rawPrompt)) {
    paymentMethod = 'DPS';
  } else if (/ক্যাশ|পকেট|cash|pocket|হাত/i.test(rawPrompt)) {
    paymentMethod = 'Cash';
  } else {
    if (/মোবাইল|এমবি|রিচার্জ|ফ্লেক্সি|জিবি/i.test(rawPrompt)) {
      paymentMethod = 'Bkash';
      wasDefaultMethod = true;
    } else {
      paymentMethod = 'Cash';
      wasDefaultMethod = true;
    }
  }

  // A. Check for CORRECTION / SELF-REVISION Requests
  if (/বিকাশ না|ক্যাশ না|নগদ না|ভুল হয়েছে|ভুল হইছে|ভুল|সংশোধন|ক্যাশ ছিল|বিকাশ ছিল|নগদ ছিল|বদলে দাও|ভুল হিসাব/i.test(rawPrompt)) {
    let targetMethod = 'Cash';
    if (/বিকাশ ছিল|বিকাশে|বিকাশ ধরো/i.test(rawPrompt)) targetMethod = 'Bkash';
    else if (/নগদ ছিল|নগদে|নগদ ধরো/i.test(rawPrompt)) targetMethod = 'Nagad';
    else if (/ক্যাশ ছিল|ক্যাশে|ক্যাশ ধরো/i.test(rawPrompt)) targetMethod = 'Cash';
    else if (/ব্যাংক ছিল|ব্যাংকে/i.test(rawPrompt)) targetMethod = 'Bank';

    const lastTx = ctx.transactions && ctx.transactions.length > 0 ? ctx.transactions[0] : null;

    if (lastTx) {
      const updatedTx = {
        ...lastTx,
        paymentMethod: targetMethod,
        amount: extractedAmount || lastTx.amount,
      };

      const aiReplyMessage = computeWalletBreakdown(ctx, {
        intent: 'CORRECTION',
        category: lastTx.category || 'সংশোধিত খরচ',
        amount: updatedTx.amount,
        paymentMethod: targetMethod,
        note: lastTx.note || 'সংশোধিত লেনদেন',
        correctionNote: `বিকাশ/অন্যান্য মাধ্যমের বদলে **${targetMethod === 'Cash' ? 'ক্যাশ (পকেট)' : targetMethod}** মাধ্যমে আপডেট করে দেওয়া হয়েছে!`,
      });

      return {
        intent: 'CORRECTION',
        extractedData: {
          amount: updatedTx.amount,
          category: lastTx.category,
          paymentMethod: targetMethod,
        },
        aiReplyMessage,
        structuredAction: {
          type: 'UPDATE_TRANSACTION',
          payload: updatedTx,
        },
      };
    }
  }

  // B. Check for PAWNA (Lent Money)
  if (/ধার দিলাম|ধারে দিলাম|ধার দিয়েছি|পাবো|পাওনা/i.test(rawPrompt) && extractedAmount) {
    const nameMatch = rawPrompt.match(/([অ-য়a-zA-Z]+)(কে|রে|\s+কে|\s+রে)/i);
    const personName = nameMatch ? nameMatch[1] : 'পরিচিত';

    const aiReplyMessage = computeWalletBreakdown(ctx, {
      intent: 'PAWNA',
      amount: extractedAmount,
      personName,
      note: rawPrompt,
    });

    return {
      intent: 'PAWNA',
      extractedData: {
        amount: extractedAmount,
        personName,
        note: rawPrompt,
      },
      aiReplyMessage,
      structuredAction: {
        type: 'ADD_DEBT',
        payload: {
          type: 'pawna',
          personName,
          amount: extractedAmount,
          notes: rawPrompt,
          dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
          date: new Date().toISOString().split('T')[0],
        },
      },
    };
  }

  // C. Check for DENA (Borrowed Money)
  if (/ধার নিলাম|ধার নিয়েছি|ধার পেলাম|দেনা|ঋণ/i.test(rawPrompt) && extractedAmount) {
    const nameMatch = rawPrompt.match(/([অ-য়a-zA-Z]+)(কাছ থেকে|র কাছ থেকে|থেকে|র থেকে)/i);
    const personName = nameMatch ? nameMatch[1] : 'পরিচিত';

    const aiReplyMessage = computeWalletBreakdown(ctx, {
      intent: 'DENA',
      amount: extractedAmount,
      personName,
      note: rawPrompt,
    });

    return {
      intent: 'DENA',
      extractedData: {
        amount: extractedAmount,
        personName,
        note: rawPrompt,
      },
      aiReplyMessage,
      structuredAction: {
        type: 'ADD_DEBT',
        payload: {
          type: 'dena',
          personName,
          amount: extractedAmount,
          notes: rawPrompt,
          dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
          date: new Date().toISOString().split('T')[0],
        },
      },
    };
  }

  // D. Explicit intent classification for INCOME & EXPENSE
  const hasIncomeKeyword = /আয়|ইনকাম|জমা|লাভ|পেলাম|উপহার পেলাম|বোনাস|স্যালারি|বেতন|জমা হয়েছে|জমা হলো/i.test(rawPrompt) && !/আয় থেকে খরচ|আয়ের চেয়ে/i.test(rawPrompt);
  const hasExpenseKeyword = /ব্যয়|ব্যায়|খরচ|কিনলাম|কিনছি|দিলাম|দিছি|খেলাম|ভাড়া|বিল|রিকশা|গাড়ি|দান|এমবি|নাস্তা|চা|যাতায়াত|পাঠালাম|গেছে|গেলো|কেনাকাটা|মেস|পার্লার|শপিং|ফি/i.test(rawPrompt);

  const isExplicitIncome = hasIncomeKeyword;
  const isExplicitExpense = !hasIncomeKeyword && (hasExpenseKeyword || /বাজার/i.test(rawPrompt));

  if (isExplicitIncome && extractedAmount) {
    const category = matchCategoryFromList(rawPrompt, ctx.categories?.income, 'income');

    const aiReplyMessage = computeWalletBreakdown(ctx, {
      intent: 'INCOME',
      category,
      amount: extractedAmount,
      paymentMethod,
      note: rawPrompt,
      wasDefaultMethod,
    });

    return {
      intent: 'INCOME',
      extractedData: {
        amount: extractedAmount,
        category,
        note: rawPrompt,
        paymentMethod,
        date: new Date().toISOString().split('T')[0],
      },
      aiReplyMessage,
      structuredAction: {
        type: 'ADD_TRANSACTION',
        payload: {
          type: 'income',
          amount: extractedAmount,
          category,
          note: rawPrompt,
          paymentMethod,
          date: new Date().toISOString().split('T')[0],
        },
      },
    };
  }

  if (extractedAmount && (isExplicitExpense || /কিশে|বিকাশ|নগদ|টাকা|ভাড়া|চা|বাজার|মোবাইল|এমবি/i.test(rawPrompt))) {
    const amt = extractedAmount;
    const category = matchCategoryFromList(rawPrompt, ctx.categories?.expense, 'expense');

    const aiReplyMessage = computeWalletBreakdown(ctx, {
      intent: 'EXPENSE',
      category,
      amount: amt,
      paymentMethod,
      note: rawPrompt,
      wasDefaultMethod,
    });

    return {
      intent: 'EXPENSE',
      extractedData: {
        amount: amt,
        category,
        note: rawPrompt,
        paymentMethod,
        date: new Date().toISOString().split('T')[0],
      },
      aiReplyMessage,
      structuredAction: {
        type: 'ADD_TRANSACTION',
        payload: {
          type: 'expense',
          amount: amt,
          category,
          note: rawPrompt,
          paymentMethod,
          date: new Date().toISOString().split('T')[0],
        },
      },
    };
  }

  // E. Mathematical Calculations / Calculator Expression
  const mathPromptEn = convertBnToEnDigits(rawPrompt);
  const percentageMatch = mathPromptEn.match(/(\d+(?:\.\d+)?)\s*(?:টাকার|এর|of)?\s*(\d+(?:\.\d+)?)\s*(?:%|পার্সেন্ট|পারসেন্ট)/i) ||
                          mathPromptEn.match(/(\d+(?:\.\d+)?)\s*(?:%|পার্সেন্ট|পারসেন্ট)\s*(?:of|এর|টাকার)?\s*(\d+(?:\.\d+)?)/i);
  
  const isExplicitMath = /ক্যালকুলেটর|গাণিতিক|হিসাব করো|যোগ|বিয়োগ|গুণ|ভাগ|পার্সেন্ট|পারসেন্ট/i.test(rawPrompt);
  const mathOpMatch = mathPromptEn.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)(?:\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?))?/);

  if ((percentageMatch || mathOpMatch || isExplicitMath) && !/আয়|ইনকাম|বেতন|বাজার|বিকাশ|নগদ|ধার|রিসিপ্ট/i.test(rawPrompt)) {
    try {
      let exprStr = '';
      let calculatedVal = 0;

      if (percentageMatch) {
        const num1 = parseFloat(percentageMatch[1]);
        const num2 = parseFloat(percentageMatch[2]);
        if (rawPrompt.includes('%') || /পার্সেন্ট|পারসেন্ট/i.test(rawPrompt)) {
          if (mathPromptEn.indexOf('%') > mathPromptEn.indexOf(percentageMatch[1]) || rawPrompt.indexOf('এর') !== -1 || rawPrompt.indexOf('টাকার') !== -1) {
            calculatedVal = (num1 * num2) / 100;
            exprStr = `${toBnDigits(num1)} টাকার ${toBnDigits(num2)}%`;
          } else {
            calculatedVal = (num2 * num1) / 100;
            exprStr = `${toBnDigits(num2)} টাকার ${toBnDigits(num1)}%`;
          }
        }
      } else if (mathOpMatch) {
        const cleanedExpr = mathOpMatch[0];
        calculatedVal = Function(`"use strict"; return (${cleanedExpr})`)();
        exprStr = cleanedExpr.replace(/\+/g, ' + ').replace(/\-/g, ' - ').replace(/\*/g, ' × ').replace(/\//g, ' ÷ ');
        exprStr = convertBnToEnDigits(exprStr).replace(/[0-9.]+/g, (m) => toBnDigits(m));
      }

      if (exprStr && !isNaN(calculatedVal)) {
        const reply = `🤖 AI Math Calculator 🧮
        
গাণিতিক হিসাবের ফলাফল:

• 📐 হিসাবের রাশি: ${exprStr}
• 🎯 সমান সমান: ৳${toBnDigits(calculatedVal)}

💡 টিপস: আপনি যেকোনো গাণিতিক যোগ, বিয়োগ, গুণ, ভাগ বা পার্সেন্ট হিসাব চাইলে আমাকে সরাসরি লিখতে পারেন!`;

        return {
          intent: 'MATH_CALCULATION',
          aiReplyMessage: reply,
        };
      }
    } catch (e) {
      // Fall through if math parsing fails
    }
  }

  // F. Financial Advice & Overspending Warning Engine
  if (/পরামর্শ|উপদেশ|কি করব|কী করব|কী করবো|কি করবো|কীভাবে ভালো রাখা যায়|অতিরিক্ত খরচ|খরচ বেশি|সঞ্চয় করার উপায়|আয় ব্যয়ের পরামর্শ|আর্থিক অবস্থা|পরামর্শ দাও/i.test(rawPrompt)) {
    let totalIncome = 0;
    let totalExpense = 0;
    const catExpenses: Record<string, number> = {};

    (ctx.transactions || []).forEach((t: any) => {
      const amt = Math.abs(Number(t.amount) || 0);
      const txType = (t.type || '').toString().toLowerCase();
      if (txType === 'income' || txType.includes('আয়')) {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        const cat = t.category || 'অন্যান্য';
        catExpenses[cat] = (catExpenses[cat] || 0) + amt;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;

    let topCat = 'কোনো খরচ নেই';
    let topCatAmt = 0;
    Object.keys(catExpenses).forEach((cat) => {
      if (catExpenses[cat] > topCatAmt) {
        topCatAmt = catExpenses[cat];
        topCat = cat;
      }
    });

    let warningText = '';
    if (totalExpense > totalIncome && totalIncome > 0) {
      warningText = `⚠️ **অতিরিক্ত ব্যয়ের গুরুতর সতর্কতা:**\nআপনার মোট আয়ের (৳${toBnDigits(totalIncome)}) চেয়ে মোট ব্যয় (৳${toBnDigits(totalExpense)}) বেশি হয়ে গেছে! অবিলম্বে অপ্রয়োজনীয় কেনাকাটা বন্ধ রাখা প্রয়োজন।\n\n`;
    } else if (expenseRatio >= 75) {
      warningText = `⚠️ **অতিরিক্ত ব্যয়ের সংকেত:**\nআপনার আয়ের ইতোমধ্যে **${toBnDigits(Math.round(expenseRatio))}%** ব্যয় হয়ে গেছে (৳${toBnDigits(totalExpense)})! হাতে আর খুব কম উদ্বৃত্ত আছে।\n\n`;
    } else {
      warningText = `✅ **আর্থিক অবস্থা চমৎকার:**\nআপনার আয়-ব্যয়ের ভারসাম্য বেশ ভালো রয়েছে। আপনার আয়ের ${toBnDigits(Math.round(expenseRatio))}% ব্যয় হয়েছে।\n\n`;
    }

    const adviceReply = `🤖 AI Financial Advisor 📊

${warningText}📊 আপনার বর্তমান আয়-ব্যয় হাইলাইটস:
• 📈 মোট আয়: ৳${toBnDigits(totalIncome)}
• 📉 মোট ব্যয়: ৳${toBnDigits(totalExpense)}
• ⚖️ নিট ব্যালেন্স: ৳${toBnDigits(netBalance)}
• 🛒 সবচেয়ে বেশি ব্যয়িত খাত: **${topCat}** (৳${toBnDigits(topCatAmt)})

💡 এআই মানি ম্যানেজারের বিশেষ ৩টি পরামর্শ:
১. **আগে সঞ্চয়, পরে ব্যয় (50-30-20 Rule):** যেকোনো আয় পাওয়া মাত্রই অন্তত ২০% টাকা সঞ্চয় অ্যাকাউন্ট বা DPS-এ সরিয়ে রাখুন।
২. **${topCat} খাতে বাজেট নিয়ন্ত্রণ:** আপনার সবচেয়ে বেশি টাকা খরচ হচ্ছে ${topCat} খাতে। কেনাকাটার পূর্বে একটি নির্দিষ্ট সাপ্তাহিক বাজেট নির্ধারণ করে নিন।
৩. **জরুরি ফান্ড গঠন:** অন্তত ৩ মাসের খরচের সমপরিমাণ টাকা আলাদা জরুরি ফান্ডে গচ্ছিত রাখুন।

বন্ধু, যেকোনো গাণিতিক বা হিসাবসংক্রান্ত প্রশ্ন থাকলে আমাকে নির্দ্বিধায় জিজ্ঞেস করতে পারেন! 🫡`;

    return {
      intent: 'ADVICE',
      aiReplyMessage: adviceReply,
    };
  }

  // G. Summary / Report Request
  if (/সামারি|রিপোর্ট|বর্তমান আর্থিক|সার্বিক|অবস্থা কেমন|হিসাব দাও|পোর্টফোলিও|ব্যালেন্স কত|মোট কত আয় ব্যয় হলো|মোট আয় ব্যয়/i.test(rawPrompt) || (!extractedAmount && /হিসাব|ব্যালেন্স|সামারি/i.test(rawPrompt) && !/কেমন আছ|হাই|হ্যালো|কথা বল/i.test(rawPrompt))) {
    const aiReplyMessage = computeWalletBreakdown(ctx, { intent: 'SUMMARY' });
    return {
      intent: 'SUMMARY',
      aiReplyMessage,
    };
  }

  // H. Casual Greeting & Smart Conversational Chat
  if (/কেমন আছ|কেমন আছেন|কেমন আছো|হাই|হ্যালো|হেই|সালাম|আসসালামু|কথা বল|কথা বলো|শোনো|কে তুমি|ধন্যবাদ|থ্যাঙ্কস|থ্যাংকস|কী অবস্থা|কি অবস্থা/i.test(rawPrompt) || !extractedAmount) {
    let totalInc = 0;
    let totalExp = 0;
    (ctx.transactions || []).forEach((t: any) => {
      const a = Math.abs(Number(t.amount) || 0);
      if ((t.type || '').toString().toLowerCase() === 'income' || (t.type || '').toString().includes('আয়')) totalInc += a;
      else totalExp += a;
    });
    const balance = totalInc - totalExp;

    let greetingText = 'আসসালামু আলাইকুম ও শুভেচ্ছা বন্ধু! 🤖\nআমি আলহামদুলিল্লাহ ভালো আছি!';
    if (/কেমন আছ|কেমন আছেন|কেমন আছো|কী অবস্থা|কি অবস্থা/i.test(rawPrompt)) {
      greetingText = 'আলহামদুলিল্লাহ, আমি চমৎকার আছি বন্ধু! 🤖\nআশা করি আপনার দিনটি অনেক সুন্দর ও সফল কাটছে।';
    } else if (/হাই|হ্যালো|হেই/i.test(rawPrompt)) {
      greetingText = 'হ্যালো বন্ধু! 👋 ওয়ালাইকুম আসসালাম! আশা করি ভালো আছেন। 🤖';
    } else if (/সালাম|আসসালামু/i.test(rawPrompt)) {
      greetingText = 'ওয়ালাইকুম আসসালাম ওয়া রহমাতুল্লাহি ওয়া বারাকাতুহু! 🫡';
    } else if (/ধন্যবাদ|থ্যাঙ্কস|থ্যাংকস/i.test(rawPrompt)) {
      greetingText = 'আপনাকেও অনেক ধন্যবাদ বন্ধু! 🌸 আপনার হিসাব নিখুঁত রাখাই আমার মূল কাজ!';
    } else if (/কে তুমি|তুমি কে/i.test(rawPrompt)) {
      greetingText = 'আমি আপনার নিজস্ব "AI Money Manager Pro" 🤖—বাংলাদেশের একমাত্র স্বাধীন ও সম্পূর্ণ স্মার্ট এআই আর্থিক সহকারী!';
    }

    const reply = `${greetingText}

📊 আপনার বর্তমান হিসাবের অবস্থান একনজরে:
• 📈 মোট আয়: ৳${toBnDigits(totalInc)}
• 📉 মোট ব্যয়: ৳${toBnDigits(totalExp)}
• ⚖️ নিট ব্যালেন্স: ৳${toBnDigits(balance)}

💡 আপনি আমাকে যেকোনো কিছু বলতে পারেন:
১. 📝 আয়-ব্যয়ের হিসাব রাখতে: "আজকে বাজারে ৩০০ টাকা খরচ হয়েছে"
২. 🧮 গাণিতিক হিসাব বা পার্সেন্টেজ: "৪৫০০০ টাকার ২০% কত?"
৩. 📊 পরামর্শ বা বাজেট রিভিউ: "আমার আয়-ব্যয়ের পরামর্শ দাও"
৪. 💬 বা যেকোনো তথ্য বা সাধারণ আলোচনা!

আজকে আমি আপনাকে কীভাবে সাহায্য করতে পারি? 🫡`;

    return {
      intent: 'GREETING',
      aiReplyMessage: reply,
    };
  }

  // Fallback
  return {
    intent: 'GENERAL',
    aiReplyMessage: computeWalletBreakdown(ctx, { intent: 'SUMMARY' }),
  };
}

// Main Entry Point: Gemini AI Server API with Instant Fallback
export async function parseTransactionWithAI(ctx: AIParseContext): Promise<AIParseResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s max timeout for zero lag

    // Lightweight payload
    const lightweightCtx = {
      prompt: ctx.prompt,
      categories: ctx.categories,
      transactions: (ctx.transactions || []).slice(0, 20),
      debts: (ctx.debts || []).slice(0, 10),
      budgets: ctx.budgets,
      savingsGoals: ctx.savingsGoals,
      adminSettings: ctx.adminSettings,
    };

    const response = await fetch('/api/ai/parse-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lightweightCtx),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const serverResult = await response.json();
      if (serverResult && serverResult.aiReplyMessage) {
        return serverResult;
      }
    }
  } catch (e) {
    // Fast fallback to instant local AI engine
  }

  return smartLocalBengaliParser(ctx);
}
