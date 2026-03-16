"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Custom event to trigger install prompt manually
export const triggerInstallPrompt = () => {
  console.log('triggerInstallPrompt: Dispatching showInstallPrompt event');
  window.dispatchEvent(new CustomEvent('showInstallPrompt'));
};

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('InstallPrompt: Initialization', { dismissed, isInstalled });
    
    const handler = (e: Event) => {
      e.preventDefault();
      console.log('InstallPrompt: beforeinstallprompt event captured');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show automatically if not dismissed and not installed
      if (!dismissed && !isInstalled) {
        setTimeout(() => {
          console.log('InstallPrompt: Showing prompt automatically');
          setShowPrompt(true);
        }, 3000);
      } else {
        console.log('InstallPrompt: Not showing - dismissed or installed');
      }
    };

    // Listen for manual trigger (from settings or other UI)
    const manualTrigger = () => {
      console.log('InstallPrompt: Manual trigger received');
      // Manual trigger always shows, even if dismissed before
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("showInstallPrompt", manualTrigger);
    
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("showInstallPrompt", manualTrigger);
    };
  }, []);

  const handleInstall = async () => {
    console.log('InstallPrompt: handleInstall called');
    
    if (!deferredPrompt) {
      console.log('InstallPrompt: No deferred prompt available');
      // Don't close - show message that it will work in production
      alert('PWA installation will work when deployed to production with HTTPS.\n\nFor now, you can:\n• Use Chrome\'s install icon in the address bar\n• Or deploy to production to test');
      return;
    }

    try {
      console.log('InstallPrompt: Calling prompt()');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('InstallPrompt: User choice:', outcome);

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
    } catch (error) {
      console.error('InstallPrompt: Error:', error);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Remember that user dismissed it
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm md:max-w-md lg:w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-3 sm:p-4 z-50 animate-slide-up">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Close install prompt"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-white font-black text-xl sm:text-2xl">K</span>
        </div>
        <div className="flex-1 pr-6">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5">
            Install KanbanFlow
          </h3>
          <p className="text-xs text-gray-600 mb-2.5">
            Install our app for quick access and offline use
          </p>
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-95"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
