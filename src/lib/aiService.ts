import { GoogleGenAI, Type } from '@google/genai';

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
  let cashBal = initBals.Cash !== undefined ? Number(initBals.Cash) : 0;
  let bkashBal = initBals.Bkash !== undefined ? Number(initBals.Bkash) : 0;
  let nagadBal = initBals.Nagad !== undefined ? Number(initBals.Nagad) : 0;
  let rocketBal = initBals.Rocket !== undefined ? Number(initBals.Rocket) : 0;
  let bankBal = initBals.Bank !== undefined ? Number(initBals.Bank) : 0;
  let dpsBal = initBals.DPS !== undefined ? Number(initBals.DPS) : 0;

  let totalIncome = 0;
  let totalExpense = 0;

  // Aggregate all transactions from history (ensuring Math.abs is used)
  (ctx.transactions || []).forEach((t: any) => {
    const amt = Math.abs(Number(t.amount) || 0);
    const method = (t.paymentMethod || 'Cash').toLowerCase();

    if (t.type === 'income') {
      totalIncome += amt;
      if (method.includes('bkash') || method.includes('বিকাশ')) bkashBal += amt;
      else if (method.includes('nagad') || method.includes('নগদ')) nagadBal += amt;
      else if (method.includes('rocket') || method.includes('রকেট')) rocketBal += amt;
      else if (method.includes('bank') || method.includes('ব্যাংক') || method.includes('ibbplc')) bankBal += amt;
      else cashBal += amt;
    } else if (t.type === 'expense') {
      totalExpense += amt;
      if (method.includes('bkash') || method.includes('বিকাশ')) bkashBal -= amt;
      else if (method.includes('nagad') || method.includes('নগদ')) nagadBal -= amt;
      else if (method.includes('rocket') || method.includes('রকেট')) rocketBal -= amt;
      else if (method.includes('bank') || method.includes('ব্যাংক') || method.includes('ibbplc')) bankBal -= amt;
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

  // Handle SUMMARY intent matching Screenshot #1 EXACTLY
  if (opts.intent === 'SUMMARY') {
    const netBalance = totalIncome - totalExpense;
    const totalMFS = bkashBal + nagadBal + rocketBal;

    return `🤖 AI Manager
📊 আপনার হিসাবের সার্বিক সামারি

💰 মোট আয় ও ব্যয়:
• 📈 মোট আয়: ৳${toBnDigits(totalIncome)}
• 📉 মোট ব্যয়: ৳${toBnDigits(totalExpense)}
• ⚖️ নেট ব্যালেন্স: ৳${toBnDigits(netBalance)}

💳 অ্যাকাউন্ট ব্যালেন্স:
• 💵 পকেট (ক্যাশ): ৳${toBnDigits(cashBal)}
• 📱 বিকাশ: ৳${toBnDigits(bkashBal)}
• 📱 নগদ: ৳${toBnDigits(nagadBal)}
• 🏦 ব্যাংক (IBBPLC): ৳${toBnDigits(bankBal)}
• 📱 মোট MFS: ৳${toBnDigits(totalMFS)}

🤝 দেনা ও পাওনা:
• 📝 মোট পাওনা: ৳${toBnDigits(totalPawna)}
• 💳 মোট দেনা: ৳${toBnDigits(totalDena)}`;
  }

  // Handle single transaction intent
  const methodKey = (opts.paymentMethod || 'Cash').toLowerCase();

  let prevMethodBal = cashBal;
  let methodNameBn = 'ক্যাশ (পকেট)';
  if (methodKey.includes('bkash') || methodKey.includes('বিকাশ')) {
    prevMethodBal = bkashBal;
    methodNameBn = 'বিকাশ';
  } else if (methodKey.includes('nagad') || methodKey.includes('নগদ')) {
    prevMethodBal = nagadBal;
    methodNameBn = 'নগদ';
  } else if (methodKey.includes('rocket') || methodKey.includes('রকেট')) {
    prevMethodBal = rocketBal;
    methodNameBn = 'রকেট';
  } else if (methodKey.includes('bank') || methodKey.includes('ব্যাংক') || methodKey.includes('ibbplc')) {
    prevMethodBal = bankBal;
    methodNameBn = 'IBBPLC ব্যাংক';
  } else {
    prevMethodBal = cashBal;
    methodNameBn = 'ক্যাশ';
  }

  const currentAmt = Math.abs(opts.amount || 0);
  let newMethodBal = prevMethodBal;
  if (opts.intent === "EXPENSE") newMethodBal = prevMethodBal - currentAmt;
  else if (opts.intent === "INCOME") newMethodBal = prevMethodBal + currentAmt;

  if (methodNameBn === "ক্যাশ") cashBal = newMethodBal;
  else if (methodNameBn === "বিকাশ") bkashBal = newMethodBal;
  else if (methodNameBn === "নগদ") nagadBal = newMethodBal;
  else if (methodNameBn === "রকেট") rocketBal = newMethodBal;
  else if (methodNameBn === "IBBPLC ব্যাংক") bankBal = newMethodBal;

  const totalMFS = bkashBal + nagadBal + rocketBal;

  const bnDate = toBnDateStr(opts.date);
  const bnAmt = toBnDigits(currentAmt);
  const bnPrevMethodBal = toBnDigits(prevMethodBal);
  const bnNewMethodBal = toBnDigits(newMethodBal);

  const bnCash = toBnDigits(cashBal);
  const bnBkash = toBnDigits(bkashBal);
  const bnNagad = toBnDigits(nagadBal);
  const bnTotalMFS = toBnDigits(totalMFS);
  const bnBank = toBnDigits(bankBal);
  const bnTotalPawna = toBnDigits(totalPawna);

  const noteTip = opts.wasDefaultMethod
    ? `\n💡 টিপস: মাধ্যম উল্লেখ না করায় ডিফল্টভাবে **${methodNameBn}** ধরা হয়েছে। অন্য মাধ্যমে হয়ে থাকলে "বিকাশে ছিল" বা "নগদে ছিল" বললে সংশোধন করে দেব!`
    : "";

    if (opts.intent === 'EXPENSE') {
    return `নোট করা হলো বন্ধু! 🫡

📅 ${bnDate}

📝 খরচের বিবরণ (Expense)

• 🏷️ ক্যাটাগরি: ${opts.category || "🛒 বাজার"}
• 💰 পরিমাণ: ৳${bnAmt}
• 💳 লেনদেন মাধ্যম: ${methodNameBn}
• 🌐 বিবরণ: ${opts.note || "দৈনিক খরচ"}

📊 অ্যাকাউন্ট ব্যালেন্স আপডেট

• 💵 ${methodNameBn} ব্যালেন্স: ৳${bnPrevMethodBal} ➔ ৳${bnNewMethodBal}
• 📱 মোট MFS (বিকাশ/নগদ): ৳${bnTotalMFS}
• 🏦 ব্যাংক (IBBPLC): ৳${bnBank}${noteTip}`;
  }

  if (opts.intent === 'INCOME') {
    return `নোট করা হলো বন্ধু! 🫡

📅 ${bnDate}

📝 আয়ের বিবরণ (Income)

• 🏷️ ক্যাটাগরি: ${opts.category || "💰 অন্যান্য আয়"}
• 💰 পরিমাণ: ৳${bnAmt}
• 💳 জমা মাধ্যম: ${methodNameBn}
• 🌐 বিবরণ: ${opts.note || "আয়"}

📊 আপডেটেড অবস্থা

• 💵 পকেট: ৳${bnCash}
• 📱 বিকাশ: ৳${bnBkash}
• 📱 নগদ: ৳${bnNagad}
• 🏦 ব্যাংক: ৳${bnBank}`;
  }

  if (opts.intent === 'PAWNA') {
    return `নোট করা হলো বন্ধু। 🫡

📅 ${bnDate}

📝 পাওনা হিসাব (ধার দেওয়া)

• 👤 গ্রহীতা: ${opts.personName || 'ব্যক্তি'}
• 💰 পরিমাণ: ৳${bnAmt}
• 🌐 বিবরণ: ${opts.note || 'ধার প্রদান'}

📊 আপডেটেড অবস্থা

• 💵 পকেট: ৳${bnCash}
• 📱 বিকাশ: ৳${bnBkash}
• 📱 মোট MFS: ৳${bnTotalMFS}
• 🏦 IBBPLC: ৳${bnBank}
• 📝 মোট পাওনা: ৳${toBnDigits(totalPawna + currentAmt)}
• 👧 ${opts.personName || 'ব্যক্তি'} পাওনা: ৳${bnAmt}`;
  }

  if (opts.intent === 'DENA') {
    return `নোট করা হলো বন্ধু। 🫡

📅 ${bnDate}

📝 দেনা হিসাব (ঋণ গ্রহণ)

• 👤 দাতা: ${opts.personName || 'ব্যক্তি'}
• 💰 পরিমাণ: ৳${bnAmt}
• 🌐 বিবরণ: ${opts.note || 'ধার গ্রহণ'}

📊 আপডেটেড অবস্থা

• 💵 পকেট: ৳${bnCash}
• 📱 বিকাশ: ৳${bnBkash}
• 📱 মোট MFS: ৳${bnTotalMFS}
• 🏦 IBBPLC: ৳${bnBank}
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
  const lowerPrompt = prompt.toLowerCase();

  const cleanStr = (s: string) =>
    s ? s.replace(/[\p{Extended_Pictographic}\p{Emoji}]/gu, '').replace(/[^\u0980-\u09FFa-zA-Z0-9]/g, '').trim().toLowerCase() : '';

  const getCatName = (c: any): string => (typeof c === 'string' ? c : c.nameBn || c.name || '');

  // Helper to search existing category list
  const findExisting = (query: string) => {
    const cleanQ = cleanStr(query);
    if (!cleanQ || cleanQ.length < 2) return null;
    return categoryList.find((c) => {
      const name = getCatName(c);
      const cleanName = cleanStr(name);
      return cleanName === cleanQ || cleanName.includes(cleanQ) || cleanQ.includes(cleanName);
    });
  };

  // 1. Search existing categories first (Admin or User pre-defined)
  for (const cat of categoryList) {
    if (!cat) continue;
    const catNameBn = getCatName(cat);
    const cleanBn = cleanStr(catNameBn);

    if (cleanBn.length >= 2) {
      if (lowerPrompt.includes(cleanBn)) {
        return catNameBn;
      }
      // Check inflection root matching (e.g., "দোকান" matches "দোকানে", "দোকানের", "দোকান থেকে")
      const rootRegex = new RegExp(`${cleanBn}(ে|িতে|ের|ে\\s*আয়|ে\\s*খরচ|ে\\s*থেকে|ের\\s*থেকে)?`, 'i');
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
    if (/বিল|কারেন্ট|বিদ্যুৎ|গ্যাস|পানি|ওয়াইফাই/i.test(prompt)) {
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
    const matchSubject = prompt.match(/([অ-য়a-zA-Z]+)(ে|িতে|\s+এ|\s+খরচ|\s+করলাম|\s+দিলাম|\s+ব্যয়|\s+ব্যায়)/i);
    if (matchSubject && matchSubject[1] && matchSubject[1].length >= 2) {
      const subject = matchSubject[1].trim();
      if (!/টাকা|আজকে|কালকে|বিকাশ|নগদ|ক্যাশ|ব্যাংক|খরচ/i.test(subject)) {
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
  } else if (/ব্যাংক|bank|ibbplc|কার্ড/i.test(rawPrompt)) {
    paymentMethod = 'Bank';
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

  // B. Check for Summary / Overall Financial Status Request
  if (/সামারি|রিপোর্ট|বর্তমান আর্থিক|সার্বিক|অবস্থা কেমন|হিসাব দাও|পোর্টফোলিও|ব্যালেন্স কত|মোট কত আয় ব্যয় হলো|মোট আয় ব্যয়/i.test(rawPrompt) || (!extractedAmount && /হিসাব|ব্যালেন্স|সামারি/i.test(rawPrompt))) {
    const aiReplyMessage = computeWalletBreakdown(ctx, { intent: 'SUMMARY' });
    return {
      intent: 'SUMMARY',
      aiReplyMessage,
    };
  }

  // C. Check for Casual Greeting / Conversation
  if (/কেমন আছ|কেমন আছেন|কেমন আছো|হাই|হ্যালো|কথা বল|কথা বলো|শোনো|কে তুমি/i.test(rawPrompt) && !extractedAmount) {
    let reply = 'আমি আলহামদুলিল্লাহ ভালো আছি, বন্ধু! 🤖\nআপনার আজকের হিসাব বা কোনো প্রশ্ন থাকলে বলতে পারেন, আমি সঙ্গে সঙ্গে সব খাতা ও ফায়ারস্টোর ডাটাবেজে আপডেট করে দেব!';
    if (/কথা বল|কথা বলো/i.test(rawPrompt)) {
      reply = 'হ্যাঁ বন্ধু! 🫡 আমি আপনার স্বাধীন এআই মানি ম্যানেজার।\nআজকে বাজারে বা কোথায় কত টাকা খরচ কিংবা আয় হয়েছে বলুন, আমি ক্যাটাগরি খুঁজে বের করে সরাসরি আপনার ব্যালেন্স ও সাম্প্রতিক হিসাব আপডেট করে দিচ্ছি!';
    }
    return {
      intent: 'GREETING',
      aiReplyMessage: reply,
    };
  }

  // D. Check for PAWNA (Lent Money)
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

  // E. Check for DENA (Borrowed Money)
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

  // F. Check for INCOME
  if (/আয়|বেতন|বোনাস|উপহার পেলাম|জমা হলো|ইনকাম|আয় হয়েছে|পেলাম/i.test(rawPrompt) && extractedAmount) {
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

  // G. Check for EXPENSE
  if (extractedAmount || /খরচ|কিনলাম|কিনছি|দিলাম|খেলাম|ভাড়া|বিল|বাজার|রিকশা|গাড়ি|দান|এমবি|নাস্তা|চা/i.test(rawPrompt)) {
    const amt = extractedAmount || 100;
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

  // Fallback
  return {
    intent: 'GENERAL',
    aiReplyMessage: computeWalletBreakdown(ctx, { intent: 'SUMMARY' }),
  };
}

// Main Entry Point: Synchronous & Instant to prevent ANY lag or delays!
export async function parseTransactionWithAI(ctx: AIParseContext): Promise<AIParseResult> {
  return smartLocalBengaliParser(ctx);
}
