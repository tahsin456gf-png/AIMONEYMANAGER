import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-900/40 via-indigo-900/40 to-slate-900 border border-emerald-500/30 text-white shadow-lg backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-emerald-400 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> সরাসরি অ্যাপস হিসেবে ব্যবহার করুন
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            ক্রোম ব্রাউজার ছাড়াই সরাসরি মোবাইলে অ্যাপস ইনস্টল করে চালান!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={handleInstallClick}
          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md active:scale-95"
        >
          <Download className="w-4 h-4" /> ইনস্টল করুন (Install App)
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition"
          title="বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
