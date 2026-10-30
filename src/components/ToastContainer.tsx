import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X, RotateCcw } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';

export const ToastContainer: React.FC = () => {
  const toasts = useDashboardStore((s) => s.toasts);
  const removeToast = useDashboardStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-md pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-card border backdrop-blur-md text-sm ${
              t.type === 'success'
                ? 'bg-white dark:bg-[#072A22] border-[#059669]/30 text-[#04281F] dark:text-[#E7F5EF]'
                : t.type === 'error'
                ? 'bg-white dark:bg-[#072A22] border-[#EF4444]/30 text-[#04281F] dark:text-[#E7F5EF]'
                : t.type === 'warning'
                ? 'bg-white dark:bg-[#072A22] border-[#F59E0B]/30 text-[#04281F] dark:text-[#E7F5EF]'
                : 'bg-white dark:bg-[#072A22] border-[#1F7A5C]/30 text-[#04281F] dark:text-[#E7F5EF]'
            }`}
          >
            <div className="flex items-center space-x-3 pr-2">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />}
              {t.type === 'error' && <XCircle className="w-5 h-5 text-[#EF4444] shrink-0" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-[#1F7A5C] shrink-0" />}
              <span className="font-medium text-xs sm:text-sm">{t.message}</span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {t.undoAction && (
                <button
                  onClick={() => {
                    t.undoAction?.();
                    removeToast(t.id);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#FF5A1F] hover:bg-[#e04e17] text-white rounded-lg flex items-center space-x-1 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              )}
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
