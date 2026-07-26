import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, mimeType } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing" });
    }

    const ai = new GoogleGenAI({ apiKey });

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
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error("Receipt OCR Error:", error);
    return res.status(500).json({ error: "Failed to scan receipt image" });
  }
}
