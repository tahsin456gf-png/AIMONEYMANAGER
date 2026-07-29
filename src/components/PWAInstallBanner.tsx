import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, MoreVertical, Smartphone, CheckCircle2 } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setIsVisible(false);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setShowGuideModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsVisible(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  if (isInstalled || !isVisible) return null;

  return (
    <>
      <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/40 text-white shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
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
              ক্রোম ব্রাউজার ছাড়াই সরাসরি মোবাইলে লোগো সহ অ্যাপস ইনস্টল করে ব্যবহার করুন!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleInstallClick}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg active:scale-95"
          >
            <Download className="w-4 h-4" /> ইনস্টল করুন (Install App)
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

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2">
              <img
                src="/icon-512.png"
                alt="AI Money Manager Logo"
                className="w-20 h-20 rounded-2xl border-2 border-cyan-400/60 shadow-xl object-cover mb-1"
              />
              <h3 className="text-xl font-bold text-cyan-300">
                AI Money Manager অ্যাপ ইনস্টল গাইড
              </h3>
              <p className="text-xs text-slate-300">
                ব্রাউজারের থ্রি-ডট (⋮) মেনু থেকে ১-ক্লিকে আসল অ্যাপের মতো ইনস্টল করুন
              </p>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  ১
                </div>
                <div className="text-xs text-slate-200">
                  ক্রোম ব্রাউজারের উপরে ডানদিকে <strong>থ্রি-ডট (<MoreVertical className="w-3.5 h-3.5 inline text-cyan-400" />)</strong> মেনুতে ক্লিক করুন।
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  ২
                </div>
                <div className="text-xs text-slate-200">
                  মেনু তালিকায় থাকা <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">Install App</span> (অথবা <strong>Add to Home screen</strong>) অপশনে চাপ দিন।
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  ৩
                </div>
                <div className="text-xs text-slate-200">
                  আপনার ফোনের হোম স্ক্রিনে এই <strong>AI Money Manager</strong> এর 3D লোগো সহ মোবাইল অ্যাপ ইনস্টল হয়ে যাবে!
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4" /> পুনরায় সরাসরি চেষ্টা করুন
                </button>
              )}
              <button
                onClick={() => setShowGuideModal(false)}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl text-center"
              >
                বুঝতে পেরেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

