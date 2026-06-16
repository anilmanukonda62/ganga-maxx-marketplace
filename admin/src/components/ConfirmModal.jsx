import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, confirmText = 'Delete', cancelText = 'Cancel', onConfirm, onCancel, type = 'danger' }) => {
  const typeConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-950/40',
      confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-950/40',
      confirmBtn: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white',
    },
    info: {
      icon: AlertTriangle, // could use Info icon, AlertTriangle is fine
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-950/40',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
    }
  };

  const config = typeConfig[type] || typeConfig.danger;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md overflow-hidden bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-2xl shadow-xl z-10"
          >
            {/* Close button */}
            <motion.button
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkbg-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${config.iconBg} ${config.iconColor} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 mt-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-6">{title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  type="button"
                  onClick={onCancel}
                  whileHover={{ scale: 1.02 }}
                  className="px-4 py-2 border border-slate-200 dark:border-darkbg-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-darkbg-700 transition font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 cursor-pointer"
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onConfirm}
                  whileHover={{ scale: 1.02 }}
                  className={`px-4 py-2 rounded-xl transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${config.confirmBtn}`}
                >
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
