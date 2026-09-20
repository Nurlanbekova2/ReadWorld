import { useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md animate-bounce-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-border transition"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
