import React, { useState, useEffect, useRef } from 'react';
import { useMoney } from '../context/MoneyContext';
import { MessageSquare, Send, X, Shield, Sparkles, User, CheckCheck } from 'lucide-react';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, supportMessages, sendSupportMessage } = useMoney();
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for current user
  const myUserId = currentUser?.id || '01700000001';
  const myMessages = supportMessages.filter((m) => m.userId === myUserId || m.userPhone === currentUser?.phone);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, myMessages.length]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSubmitting(true);
    await sendSupportMessage(inputText.trim());
    setInputText('');
    setIsSubmitting(false);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[82vh] max-h-[580px] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">মেইন এডমিন সাপোর্ট (Live Chat)</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">মেইন এডমিনের সাথে সরাসরি যোগাযোগ করুন</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>যেকোনো সমস্যা, পরামর্শ বা হেল্পের জন্য মেসেজ লিখুন। মেইন এডমিন লাইভ উত্তর দিবেন।</span>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
          {myMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300">এখনো কোনো সাপোর্ট মেসেজ পাঠানো হয়নি</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  নিচে আপনার সমস্যা বা প্রশ্নের বিস্তারিত লিখে পাঠিয়ে দিন।
                </p>
              </div>
            </div>
          ) : (
            myMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      {isUser ? (
                        <>
                          <span>আপনি ({msg.userName})</span>
                          <User className="w-3 h-3 text-emerald-400" />
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-400 font-extrabold">মেইন এডমিন</span>
                        </>
                      )}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="আপনার বার্তা বা প্রশ্ন লিখুন..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !inputText.trim()}
            className="p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
