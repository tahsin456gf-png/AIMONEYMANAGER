import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

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
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('অ্যাপ ইনস্টল করতে আপনার ক্রোম ব্রাউজারের উপরে ডানদিকে থ্রি-ডট (⋮) মেনুতে চাপ দিয়ে "Install app" অথবা "Add to Home screen" নির্বাচন করুন।');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-cyan-500/40 text-white shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <img
          src="/icon-192.png"
          alt="AI Money Manager Logo"
          className="w-12 h-12 rounded-xl object-cover border border-cyan-400/50 shadow-md shrink-0"
        />
        <div>
          <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> AI Money Manager অ্যাপ ইনস্টল করুন
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            ক্রোম ব্রাউজার ছাড়াই এক ক্লিকে সরাসরি আপনার মোবাইলে লোগো সহ অ্যাপটি ইনস্টল করে চালান!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={handleInstallClick}
          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg active:scale-95"
        >
          <Download className="w-4 h-4" /> অ্যাপ ইনস্টল করুন
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
