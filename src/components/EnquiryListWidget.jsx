import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnquiryList } from '../context/EnquiryListContext';
import { ClipboardCheck, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EnquiryListWidget = () => {
  const { enquiryItems, updateQuantity, removeFromEnquiryList } = useEnquiryList();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const totalItems = enquiryItems.reduce((acc, item) => acc + item.quantity, 0);

  if (enquiryItems.length === 0) return null;

  return (
    <>
      {/* Floating Button (Bottom-Left) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 h-14 px-5 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-3 shadow-xl cursor-pointer z-[9998] border border-brand-500/30 transition-colors duration-200"
            title="View Enquiry List"
          >
            <ClipboardCheck size={20} className="animate-pulse" />
            <span className="text-sm font-bold tracking-wide">Enquiry List</span>
            <span className="flex items-center justify-center bg-white text-brand-700 text-xs font-black h-6 min-w-6 px-1.5 rounded-full">
              {totalItems}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide-In Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-start">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            {/* Drawer Content (Slide-in from Left) */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col justify-between z-10 border-r border-slate-100 dark:border-slate-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={22} className="text-brand-600 dark:text-brand-400" />
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Your Enquiry List</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {enquiryItems.length} products
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin">
                {enquiryItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.selectedVariant}`}
                    className="flex gap-4 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20"
                  >
                    <div className="h-16 w-16 rounded-xl bg-white border border-slate-100 dark:border-slate-800 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.productName} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.productName}</h4>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Variant: {item.selectedVariant}</p>
                      </div>
                      
                      {/* Quantity Selector and Delete */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariant)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromEnquiryList(item.productId, item.selectedVariant)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                          title="Remove product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/multi-enquiry');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/10 transition-all duration-200 cursor-pointer"
                >
                  Proceed to Multi-Product Enquiry
                  <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default EnquiryListWidget;
