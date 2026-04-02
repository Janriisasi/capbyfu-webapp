import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ImageViewerModal
 * Props:
 *   url    {string|null}  — image URL to display; null = closed
 *   title  {string}       — label shown in the header (e.g. "Proof of Payment")
 *   onClose {function}    — called to close the modal
 */
const ImageViewerModal = ({ url, title = "Image", onClose }) => {
  return (
    <AnimatePresence>
      {url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#010101]/85 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C5C5C5]/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C5C5C5]/10 rounded-lg text-[#C5C5C5]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-[#F1F1F1] text-sm leading-none">
                    {title}
                  </h3>
                  <p className="text-[#C5C5C5]/40 text-xs mt-0.5">
                    Click outside or close to dismiss
                  </p>
                </div>
              </div>
            </div>

            {/* Image */}
            <div
              className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#010101]/30
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-[#0A1614]
            [&::-webkit-scrollbar-thumb]:bg-[#0A1614]
            [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              <img
                src={url}
                alt={title}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-xl"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              {/* Fallback if image fails */}
              <div className="hidden flex-col items-center gap-3 text-[#C5C5C5]/40 py-12">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <p className="text-sm font-bold">Unable to load image</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#C5C5C5] underline hover:text-[#F1F1F1]"
                >
                  Open directly
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#C5C5C5]/10 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full py-2 border border-[#C5C5C5]/15 rounded-xl text-[#C5C5C5] font-bold text-sm hover:bg-[#C5C5C5]/5 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageViewerModal;
