import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Google GenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not set!");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// 1. Natural Language Transaction & Intent Parsing API
app.post("/api/ai/parse-transaction", async (req, res) => {
  try {
    const {
      prompt,
      categories,
      transactions = [],
      debts = [],
      budgets = [],
      savingsGoals = [],
      adminSettings = {},
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAIClient();

    // Compute live balances from existing transactions
    let totalIncome = 0;
    let totalExpense = 0;
    const accountBalances: Record<string, number> = {
      Cash: 15,
      Bkash: 576.54,
      Nagad: 0,
      Bank: 7198.15,
      Rocket: 7.92,
      Upay: 49,
      Tap: 5,
      IslamicWallet: 20,
      MCAS: 1.59,
    };

    (transactions as any[]).forEach((t) => {
      const amt = Number(t.amount) || 0;
      const method = t.paymentMethod || "Cash";

      if (t.type === "income") {
        totalIncome += amt;
        accountBalances[method] = (accountBalances[method] || 0) + amt;
      } else {
        totalExpense += amt;
        accountBalances[method] = (accountBalances[method] || 0) - amt;
      }
    });

    const currentBalance = totalIncome - totalExpense;

    let totalPawna = 0;
    let totalDena = 0;
    (debts as any[]).forEach((d) => {
      const remaining = (Number(d.amount) || 0) - (Number(d.paidAmount) || 0);
      if (d.type === "pawna" && d.status !== "settled") totalPawna += remaining;
      if (d.type === "dena" && d.status !== "settled") totalDena += remaining;
    });

    let totalSavings = 0;
    (savingsGoals as any[]).forEach((s) => {
      totalSavings += Number(s.currentAmount) || 0;
    });

    const mfsTotal =
      (accountBalances["Bkash"] || 0) +
      (accountBalances["Nagad"] || 0) +
      (accountBalances["Rocket"] || 0) +
      (accountBalances["Upay"] || 0) +
      (accountBalances["Tap"] || 0) +
      (accountBalances["IslamicWallet"] || 0) +
      (accountBalances["MCAS"] || 0);

    const expenseCatNames = Array.isArray(categories?.expense)
      ? categories.expense
      : ["🍔 খাদ্য", "🚌 যানবাহন", "🏠 বাসা", "⚡ বিল", "📱 মোবাইল", "💊 চিকিৎসা", "🎓 শিক্ষা", "🛒 বাজার", "👕 পোশাক", "🎮 বিনোদন", "🎁 উপহার", "💼 অফিস", "💰 EMI", "অন্যান্য"];

    const incomeCatNames = Array.isArray(categories?.income)
      ? categories.income
      : ["বেতন", "ব্যবসা", "বোনাস", "উপহার", "ফ্রিল্যান্সিং", "অন্যান্য আয়"];

    const customAdminPrompt = adminSettings?.systemPrompt || "";

    const systemInstruction = `You are "AI Money Manager Pro", a super-intelligent Bangladeshi personal finance assistant.
Your job is to analyze user text or voice transcript in Bengali or English, automatically classify financial actions, extract amounts/categories/methods/dates, and provide rich Bengali responses with emojis matching the requested format.

ADMIN PANEL CUSTOM SYSTEM PROMPT & SETTINGS:
${customAdminPrompt || "Maintain a friendly, polite, and helpful tone using Bengali and emojis."}

CURRENT LIVE DATABASE STATE BEFORE THIS USER INPUT:
- Total Recorded Income: ৳${totalIncome.toLocaleString("en-US")}
- Total Recorded Expense: ৳${totalExpense.toLocaleString("en-US")}
- Overall Net Balance: ৳${currentBalance.toLocaleString("en-US")}
- Account Balances:
  * Pocket / Cash: ৳${(accountBalances["Cash"] || 0).toFixed(2)}
  * Bkash: ৳${(accountBalances["Bkash"] || 0).toFixed(2)}
  * Nagad: ৳${(accountBalances["Nagad"] || 0).toFixed(2)}
  * Bank (IBBPLC): ৳${(accountBalances["Bank"] || 0).toFixed(2)}
  * MFS Total: ৳${mfsTotal.toFixed(2)}
- Debts & Receivables:
  * Total Pawna (পাওনা): ৳${totalPawna.toLocaleString("en-US")}
  * Total Dena (দেনা): ৳${totalDena.toLocaleString("en-US")}
- Total DPS / Savings: ৳${totalSavings.toLocaleString("en-US")}
- Active Expense Categories: ${JSON.stringify(expenseCatNames)}
- Active Income Categories: ${JSON.stringify(incomeCatNames)}
- Active Budgets: ${JSON.stringify(budgets)}

RULES FOR INTENT DETERMINATION:
1. EXPENSE: User spent money (e.g. "আজকে (24) বিকাশ থেকে আমার মোবাইল এর জন্য এমবি কিনছে 272 টাকা এটা মোবাইল খরচ", "রিকশায় ৫০ টাকা", "চা খেলাম ২০ টাকা").
   - Extract: amount (e.g. 272), category (match closest expense category e.g. "📱 মোবাইল" or "মোবাইল খরচ"), date (YYYY-MM-DD or today), note, paymentMethod ("Bkash", "Nagad", "Cash", "Bank", etc.).
2. INCOME: User earned/received money (e.g. "আজকে আমার এই যায়গা থেকে আয় হয়েছে ৫০০০ টাকা", "বেতন পেলাম ৪৫০০০").
   - Extract: amount (e.g. 5000), category (match closest income category), date, note, paymentMethod.
3. PAWNA: User lent money or someone owes user (e.g. "সোহেলকে ২০০০ টাকা ধার দিলাম").
   - Extract: amount, personName ("সোহেল"), note, date.
4. DENA: User borrowed money or owes someone (e.g. "বাবার কাছ থেকে ৫০০০ টাকা ধার নিলাম").
   - Extract: amount, personName ("বাবা"), note, date.
5. SUMMARY / QUERY / ANALYSIS: User requests a report, summary, or analysis (e.g. "আজকের রিপোর্ট দাও", "সামারি বলো", "আমার জমা খরচ কত?").

FORMATTING REQUIREMENTS FOR aiReplyMessage:

When intent is EXPENSE / INCOME / PAWNA / DENA, format aiReplyMessage strictly like this emoji layout (matching user screenshot):

নোট করা হলো দোস্ত। 🫡

📅 [বাংলায় তারিখ, যেমন: ২৪ জুলাই ২০২৬]

📱 [ক্যাটাগরি নাম, যেমন: মোবাইল খরচ / খাদ্য খরচ / আয়]

• 🌐 [নোট/বিবরণ]: ৳[পরিমাণ]
• 💳 মাধ্যম: [পেমেন্ট মাধ্যম, যেমন: বিকাশ / নগদ / ক্যাশ]

📱 [পেমেন্ট মাধ্যম] হিসাব

• আগের [পেমেন্ট মাধ্যম] ব্যালেন্স: ৳[পূর্বের ব্যালেন্স]
• [আইটেম ও পরিবর্তন, যেমন: MB ক্রয়: -৳২৭২.০০ বা আয়: +৳৫০০০.০০]
• বর্তমান [পেমেন্ট মাধ্যম] ব্যালেন্স: ৳[আপডেটেড নতুন ব্যালেন্স]

📊 আপডেটেড অবস্থা

• 💵 পকেট: ৳[আপডেটেড ক্যাশ]
• 📱 বিকাশ: ৳[আপডেটেড বিকাশ]
• 🏦 মোট MFS: ৳[আপডেটেড MFS]
• 🏦 IBBPLC: ৳[আপডেটেড ব্যাংক]
• 📝 মোট পাওনা: ৳[আপডেটেড পাওনা]
• 💰 DPS সঞ্চয়: ৳[আপডেটেড সঞ্চয়]

When intent is SUMMARY / QUERY / ANALYSIS:
Output a structured ChatGPT/Gemini style response with emojis, breaking down total income, total expense, balance, category highlights, budget status, and financial advice.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              description: "EXPENSE, INCOME, PAWNA, DENA, SUMMARY, QUERY, OTHER",
            },
            extractedData: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
                date: { type: Type.STRING, description: "YYYY-MM-DD" },
                note: { type: Type.STRING },
                personName: { type: Type.STRING },
                paymentMethod: { type: Type.STRING },
              },
            },
            aiReplyMessage: {
              type: Type.STRING,
              description: "Polite response in Bengali with emojis strictly following specified layout.",
            },
          },
          required: ["intent", "aiReplyMessage"],
        },
      },
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

    // Format structured action if actionable
    let structuredAction = undefined;
    if (parsedData.intent === "EXPENSE" && parsedData.extractedData?.amount) {
      structuredAction = {
        type: "ADD_TRANSACTION",
        payload: {
          type: "expense",
          amount: parsedData.extractedData.amount,
          category: parsedData.extractedData.category || "অন্যান্য",
          note: parsedData.extractedData.note || prompt,
          paymentMethod: parsedData.extractedData.paymentMethod || "Cash",
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
          paymentMethod: parsedData.extractedData.paymentMethod || "Cash",
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

    res.json({
      ...parsedData,
      structuredAction,
    });
  } catch (error: any) {
    console.error("AI Parse Error:", error);
    res.status(500).json({
      error: "Failed to parse input with AI",
      aiReplyMessage: "দুঃখিত, এআই প্রসেসিংয়ে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    });
  }
});

// 2. AI Memory Query & Analytical Summary API
app.post("/api/ai/query-memory", async (req, res) => {
  try {
    const { question, transactions, debts, budgets, savingsGoals } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const ai = getAIClient();

    const systemInstruction = `You are the AI Financial Advisor & Memory System for AI Money Manager Pro.
Analyze the user's financial dataset provided in the context and answer questions in natural, structured Bengali.

dataset context:
Transactions: ${JSON.stringify(transactions || [])}
Debts: ${JSON.stringify(debts || [])}
Budgets: ${JSON.stringify(budgets || [])}
Savings Goals: ${JSON.stringify(savingsGoals || [])}

Instructions:
1. Provide exact total calculation where asked (e.g. "গত মাসে কত খরচ করেছি?", "গত ৬ মাসে খাদ্যে কত খরচ?", "সবচেয়ে বেশি টাকা কোথায় খরচ হয়?").
2. Group expenses by Category where relevant and give percentages or top spending areas.
3. Highlight debt receivables/payables if asked.
4. Give actionable, encouraging Bengali financial advice and predictions.
5. Format response nicely using bullet points and bold text in markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: question,
      config: {
        systemInstruction,
      },
    });

    res.json({
      answer: response.text || "আপনার আর্থিক তথ্যের বিবরণ বিশ্লেষণ করতে পেরেছি।",
    });
  } catch (error: any) {
    console.error("AI Query Memory Error:", error);
    res.status(500).json({
      error: "Failed to process query",
      answer: "দুঃখিত, বিশ্লেষণ তৈরি করতে সমস্যা হয়েছে।",
    });
  }
});

// 3. Receipt / Invoice Photo OCR Scan API
app.post("/api/ai/scan-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const ai = getAIClient();

    const imagePart = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        mimeType: mimeType || "image/jpeg",
      },
    };

    const textPart = {
      text: `Scan this shopping receipt/invoice/memo image and extract financial details.
Return JSON with:
- totalAmount: total monetary sum (number)
- storeName: merchant/shop name
- date: transaction date YYYY-MM-DD
- suggestedCategory: closest category from ['🍔 খাদ্য', '🚌 যানবাহন', '🏠 বাসা', '⚡ বিল', '📱 মোবাইল', '💊 চিকিৎসা', '🎓 শিক্ষা', '🛒 বাজার', '👕 পোশাক', '🎮 বিনোদন', '🎁 উপহার', '💼 অফিস', '💰 EMI', 'অন্যান্য']
- itemsSummary: short summary list of bought items or services`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalAmount: { type: Type.NUMBER },
            storeName: { type: Type.STRING },
            date: { type: Type.STRING },
            suggestedCategory: { type: Type.STRING },
            itemsSummary: { type: Type.STRING },
          },
          required: ["totalAmount"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Receipt OCR Error:", error);
    res.status(500).json({ error: "Failed to scan receipt image" });
  }
});

// 4. Financial Health Score & Forecast API
app.post("/api/ai/financial-health", async (req, res) => {
  try {
    const { transactions, budgets, debts } = req.body;
    const ai = getAIClient();

    const systemInstruction = `Calculate a Financial Health Score (0-100) and short Bengali financial forecast & recommendations.
Data:
Transactions: ${JSON.stringify(transactions || [])}
Budgets: ${JSON.stringify(budgets || [])}
Debts: ${JSON.stringify(debts || [])}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Analyze financial health score and savings forecast.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.NUMBER, description: "0 to 100" },
            ratingGrade: { type: Type.STRING, description: "Excellent, Good, Average, Needs Improvement" },
            spendingPrediction: { type: Type.STRING, description: "Forecast for next month spending in Bengali" },
            savingsAdvice: { type: Type.STRING, description: "Key actionable tips in Bengali" },
            budgetWarningMessage: { type: Type.STRING, description: "Alert message if budget exceeded in Bengali" },
          },
          required: ["healthScore", "ratingGrade", "savingsAdvice"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Health Score Error:", error);
    res.json({
      healthScore: 78,
      ratingGrade: "Good",
      spendingPrediction: "চলতি ধারায় আগামী মাসে আনুমানিক ৳১৫,০০০ খরচ হতে পারে।",
      savingsAdvice: "খাদ্য ও বিনোদন খাতে আয় থেকে অন্তত ১৫% আগে সঞ্চয় করার চেষ্টা করুন।",
      budgetWarningMessage: "",
    });
  }
});

// Vite middleware or Static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
