import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, transactions, debts, budgets, savingsGoals } = req.body || {};
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the AI Financial Advisor & Memory System for AI Money Manager Pro.
Analyze the user's financial dataset provided in the context and answer questions in natural, structured Bengali.

dataset context:
Transactions: ${JSON.stringify(transactions || [])}
Debts: ${JSON.stringify(debts || [])}
Budgets: ${JSON.stringify(budgets || [])}
Savings Goals: ${JSON.stringify(savingsGoals || [])}

Instructions:
1. Provide exact total calculation where asked (e.g. "গত মাসে কত খরচ করেছি?", "গত ৬ মাসে খাদ্যে কত খরচ?", "সবচেয়ে বেশি টাকা কোথায় খরচ হয়?").
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

    return res.status(200).json({
      answer: response.text || "আপনার আর্থিক তথ্যের বিবরণ বিশ্লেষণ করতে পেরেছি।",
    });
  } catch (error: any) {
    console.error("AI Query Memory Error:", error);
    return res.status(500).json({
      error: "Failed to process query",
      answer: "দুঃখিত, বিশ্লেষণ তৈরি করতে সমস্যা হয়েছে।",
    });
  }
}
