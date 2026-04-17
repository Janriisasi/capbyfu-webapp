import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      
      // Check if user has previously dismissed it recently in session storage
      const hasDismissed = sessionStorage.getItem("pwaDismissed");
      if (!hasDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwaDismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-[9999] w-[350px] max-w-[calc(100vw-32px)]"
        >
          <div className="bg-[#121A20] border border-[rgba(255,255,255,0.1)] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-white/5 flex items-center justify-center p-1 border border-white/10">
                <img
                  src="/assets/logo.png"
                  alt="CapBYFU Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="pt-1">
                <h3 className="text-white font-bold text-base leading-tight mb-1">
                  Install CapBYFU App
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Add to your home screen for fast access and offline support.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
              >
                <Download size={16} />
                INSTALL NOW
              </button>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
