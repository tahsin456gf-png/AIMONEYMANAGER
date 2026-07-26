import { GoogleGenAI, Type } from "@google/genai";

function toBnDigits(val: number | string | undefined | null): string {
  if (val === undefined || val === null || isNaN(Number(val))) return '০';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  const str = num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
}

function toBnDateStr(dateStr?: string): string {
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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      prompt,
      categories,
      transactions = [],
      debts = [],
      budgets = [],
      savingsGoals = [],
      adminSettings = {},
    } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY missing",
        aiReplyMessage: "দুঃখিত, এআই API কি পাওয়া যায়নি। তবে লোকাল এআই মোড সক্রিয় আছে।",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are "AI Money Manager Pro", a personal finance assistant in Bengali.
Extract financial transactions (EXPENSE, INCOME, PAWNA, DENA, SUMMARY).
You MUST generate a response in Bengali with rich emojis matching the exact structured account report format:

For EXPENSE:
নোট করা হলো দোস্ত। 🫡

📅 [তারিখ বাংলায়]

📱 [ক্যাটাগরি]

• 🌐 বিবরণ: [নোট]: ৳[পরিমাণ]
• 💳 মাধ্যম: [বিকাশ/নগদ/ক্যাশ/ব্যাংক]

📱 [পেমেন্ট মাধ্যম]-এর হিসাব

• আগের [পেমেন্ট মাধ্যম] ব্যালেন্স: ৳[আগের ব্যালেন্স]
• [ক্যাটাগরি] ক্রয়: -৳[পরিমাণ]

📱 বর্তমান [পেমেন্ট মাধ্যম] ব্যালেন্স: ৳[নতুন ব্যালেন্স]

📊 আপডেটেড অবস্থা

• 💵 পকেট: ৳[পকেট ব্যালেন্স]
• 📱 বিকাশ: ৳[বিকাশ ব্যালেন্স]
• 📱 মোট MFS: ৳[MFS ব্যালেন্স]
• 🏦 IBBPLC: ৳[ব্যাংক ব্যালেন্স]
• 📝 মোট পাওনা: ৳[মোট পাওনা]
• 💰 DPS সঞ্চয়: ৳[ডিপিএস]

Return valid JSON with keys: intent, extractedData, aiReplyMessage.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            extractedData: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
                date: { type: Type.STRING },
                note: { type: Type.STRING },
                personName: { type: Type.STRING },
                paymentMethod: { type: Type.STRING },
              },
            },
            aiReplyMessage: { type: Type.STRING },
          },
          required: ["intent", "aiReplyMessage"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");

    let structuredAction = undefined;
    if (parsedData.intent === "EXPENSE" && parsedData.extractedData?.amount) {
      structuredAction = {
        type: "ADD_TRANSACTION",
        payload: {
          type: "expense",
          amount: parsedData.extractedData.amount,
          category: parsedData.extractedData.category || "📱 মোবাইল খরচ",
          note: parsedData.extractedData.note || prompt,
          paymentMethod: parsedData.extractedData.paymentMethod || "Bkash",
          date: parsedData.extractedData.date || new Date().toISOString().split("T")[0],
        },
      };
    } else if (parsedData.intent === "INCOME" && parsedData.extractedData?.amount) {
      structuredAction = {
        type: "ADD_TRANSACTION",
        payload: {
          type: "income",
          amount: parsedData.extractedData.amount,
          category: parsedData.extractedData.category || "অন্যান্য আয়",
          note: parsedData.extractedData.note || prompt,
          paymentMethod: parsedData.extractedData.paymentMethod || "Bkash",
          date: parsedData.extractedData.date || new Date().toISOString().split("T")[0],
        },
      };
    } else if ((parsedData.intent === "PAWNA" || parsedData.intent === "DENA") && parsedData.extractedData?.amount) {
      structuredAction = {
        type: "ADD_DEBT",
        payload: {
          type: parsedData.intent === "PAWNA" ? "pawna" : "dena",
          personName: parsedData.extractedData.personName || "অজ্ঞাত",
          amount: parsedData.extractedData.amount,
          notes: parsedData.extractedData.note || prompt,
          dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
          date: parsedData.extractedData.date || new Date().toISOString().split("T")[0],
        },
      };
    }

    return res.status(200).json({
      ...parsedData,
      structuredAction,
    });
  } catch (err: any) {
    console.error("Vercel Function Error:", err);
    return res.status(500).json({
      error: "Failed to parse input",
      aiReplyMessage: "দুঃখিত, সার্ভিস রেসপন্ড করেনি। লোকাল এআই মেমোরি মোড ব্যবহার করা হচ্ছে।",
    });
  }
}
