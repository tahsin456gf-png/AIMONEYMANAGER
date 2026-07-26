import React, { useState, useRef, useEffect } from 'react';
import { useMoney } from '../context/MoneyContext';
import { parseTransactionWithAI, toBnDateStr, toBnDigits } from '../lib/aiService';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Camera,
  Trash2,
  CheckCircle2,
  Calendar,
  X,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AIAssistantView: React.FC = () => {
  const {
    chatHistory,
    addChatMessage,
    clearChatHistory,
    incomeCategories,
    expenseCategories,
    addTransaction,
    addDebt,
    transactions,
    debts,
    budgets,
    savingsGoals,
    adminSettings,
  } = useMoney();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Calendar Modal State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedFilterDate, setSelectedFilterDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // Web Speech Recognition setup
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট করে না। টাইপ করুন।');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD'; // Bengali
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputPrompt(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (!isTtsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
    utterance.lang = 'bn-BD';
    window.speechSynthesis.speak(utterance);
  };

  // Handle Send Text or Image OCR to Server API
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() && !receiptImage) return;

    setInputPrompt('');
    const userText = receiptImage ? `[মেমো ছবিসহ] ${text || 'রসিদ স্ক্যান করো'}` : text;

    // Add User Message
    addChatMessage({
      sender: 'user',
      text: userText,
    });

    setIsLoading(true);

    try {
      if (receiptImage) {
        // Receipt OCR API Call
        const response = await fetch('/api/ai/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: receiptImage,
          }),
        });
        const ocrResult = await response.json();
        setReceiptImage(null);

        if (ocrResult.totalAmount) {
          const aiText = `রসিদ স্ক্যান করা হয়েছে! দোকান: ${ocrResult.storeName || 'অজ্ঞাত'}, মোট পরিমাণ: ৳${ocrResult.totalAmount}, ক্যাটাগরি: ${ocrResult.suggestedCategory || '🛒 বাজার'}`;

          addChatMessage({
            sender: 'ai',
            text: aiText,
            structuredAction: {
              type: 'ADD_TRANSACTION',
              payload: {
                type: 'expense',
                amount: ocrResult.totalAmount,
                category: ocrResult.suggestedCategory || '🛒 বাজার',
                note: `রসিদ স্ক্যান: ${ocrResult.itemsSummary || ocrResult.storeName || 'মার্কেট মেমো'}`,
                paymentMethod: 'Cash',
                date: ocrResult.date || new Date().toISOString().split('T')[0],
              },
            },
          });
          speakText(aiText);
        } else {
          addChatMessage({
            sender: 'ai',
            text: 'রসিদ থেকে হিসাব ঠিকমতো স্পষ্ট হয়নি। অনুগ্রহ করে স্পষ্ট ছবি দিন।',
          });
        }
      } else {
        // Send to AI Parse & Action API with full multi-tier fallback
        const parseResult = await parseTransactionWithAI({
          prompt: text,
          categories: {
            income: incomeCategories.map((c) => c.nameBn),
            expense: expenseCategories.map((c) => c.nameBn),
          },
          transactions,
          debts,
          budgets,
          savingsGoals,
          adminSettings,
        });

        // If AI suggested an action, automatically execute it live to update database & state!
        if (parseResult.structuredAction) {
          if (parseResult.structuredAction.type === 'ADD_TRANSACTION') {
            await addTransaction(parseResult.structuredAction.payload);
          } else if (parseResult.structuredAction.type === 'ADD_DEBT') {
            await addDebt(parseResult.structuredAction.payload);
          }
        }

        addChatMessage({
          sender: 'ai',
          text: parseResult.aiReplyMessage || 'সংরক্ষণ করা হয়েছে!',
          structuredAction: parseResult.structuredAction,
          actionDone: true,
        });

        speakText(parseResult.aiReplyMessage);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      addChatMessage({
        sender: 'ai',
        text: 'দুঃখিত, সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Preset Bangladeshi prompts matching prompt & screenshot
  const presetPrompts = [
    'আজকে (24) বিকাশ থেকে আমার মোবাইল এর জন্য এমবি কিনছে 272 টাকা',
    'আজকে ৫০০০ টাকা আয় হয়েছে',
    'সামারি দাও',
    'আজকে বাজারে ৪৮০ টাকা খরচ করেছি',
    'সোহেলকে ২০০০ টাকা ধার দিলাম',
    'আমার আর্থিক অবস্থা কেমন?',
  ];

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Filter transactions for calendar date
  const filteredDateTransactions = transactions.filter((t) => t.date === selectedFilterDate);
  const filterDateIncome = filteredDateTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const filterDateExpense = filteredDateTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-3 pb-20 relative">
      {/* AI Assistant Header Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-xl shrink-0 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 p-[1.5px] shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>ChatGPT / Gemini AI Assistant</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </h2>
            <p className="text-[10px] text-slate-400">অটোমেটিক সেভিং ও লাইভ সামারি রিপোর্ট</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Calendar Date Picker Modal Trigger */}
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all text-xs flex items-center gap-1 font-semibold"
            title="ক্যালেন্ডার ও লাইভ তারিখ ফিল্টার"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline text-[11px]">{toBnDateStr(selectedFilterDate)}</span>
          </button>

          <button
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              isTtsEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="ভয়েস আউটপুট টগল"
          >
            {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={clearChatHistory}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all text-xs"
            title="চ্যাট হিস্ট্রি রিসেট"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Feed Area */}
      <div className="flex-1 overflow-y-auto space-y-3 p-1">
        {chatHistory.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[78%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-lg shadow-emerald-900/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-xl'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mb-1">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Money Assistant</span>
                </div>
              )}

              <div className="whitespace-pre-line font-mono text-[12px] sm:text-[13px] leading-relaxed">
                {msg.text}
              </div>

              {/* Action Confirmation Card */}
              {msg.structuredAction && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">স্বয়ংক্রিয়ভাবে ডাটাবেজে সেভ হয়েছে!</span>
                      <span className="text-[11px] text-slate-400">
                        {msg.structuredAction.type === 'ADD_TRANSACTION'
                          ? `${msg.structuredAction.payload.category}: ৳${toBnDigits(msg.structuredAction.payload.amount)}`
                          : `${msg.structuredAction.payload.personName}: ৳${toBnDigits(msg.structuredAction.payload.amount)}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <span className="text-[9px] text-slate-400/80 block text-right mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-xs text-slate-400">
              <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>এআই আপনার ইনপুট এনালাইসিস ও সামারি তৈরি করছে...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Preset Prompt Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none shrink-0">
        {presetPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-full text-xs text-slate-300 hover:text-emerald-400 transition-all shrink-0"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Image Preview Thumbnail if attaching receipt */}
      {receiptImage && (
        <div className="relative inline-block bg-slate-900 p-2 rounded-2xl border border-slate-800 shrink-0 w-28">
          <img src={receiptImage} alt="Receipt" className="w-full h-16 object-cover rounded-xl" />
          <button
            onClick={() => setReceiptImage(null)}
            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Chat Input Bar with Voice & Image Upload Controls */}
      <div className="relative flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-2xl shrink-0">
        {/* Receipt Image Scan Trigger */}
        <label className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 cursor-pointer transition-all shrink-0">
          <Camera className="w-5 h-5" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {/* Text Input Box */}
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="যেমন: আজকে বিকাশ থেকে মোবাইল এমবি ২৫০ টাকা..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-2"
        />

        {/* Bengali Voice Speech Recognition Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-2.5 rounded-xl transition-all shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white animate-bounce shadow-lg shadow-rose-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400'
          }`}
          title="ভয়েস ইনপুট (বাংলা)"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isLoading || (!inputPrompt.trim() && !receiptImage)}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-40 shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Date Picker Modal Popup */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>লাইভ তারিখ ফিল্টার ও সামারি</span>
                </div>
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium block">
                  তারিখ নির্বাচন করুন:
                </label>
                <input
                  type="date"
                  value={selectedFilterDate}
                  onChange={(e) => setSelectedFilterDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>📅 নির্বাচিত তারিখ:</span>
                  <span className="text-emerald-400">{toBnDateStr(selectedFilterDate)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-900">
                  <div className="bg-slate-900 p-2 rounded-xl text-emerald-400 border border-emerald-500/20">
                    <span className="block text-[10px] text-slate-400">দিনটি আয়</span>
                    <span className="font-bold text-sm">৳{toBnDigits(filterDateIncome)}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl text-rose-400 border border-rose-500/20">
                    <span className="block text-[10px] text-slate-400">দিনটি খরচ</span>
                    <span className="font-bold text-sm">৳{toBnDigits(filterDateExpense)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-1">
                  মোট লেনদেন সংখ্যা: <strong className="text-white">{toBnDigits(filteredDateTransactions.length)}টি</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsCalendarOpen(false);
                    handleSendMessage(`${toBnDateStr(selectedFilterDate)} তারিখের হিসাব সামারি দাও`);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-900/30"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>এই তারিখের AI রিপোর্ট চাও</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
