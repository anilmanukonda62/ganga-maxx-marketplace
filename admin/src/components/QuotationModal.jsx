import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, AlertTriangle, FileText } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const QuotationModal = ({ isOpen, onClose, enquiry, type = 'single', onQuoted }) => {
  const [catalog, setCatalog] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [taxPercent, setTaxPercent] = useState(18);
  const [notes, setNotes] = useState('');
  const [validityDate, setValidityDate] = useState('');
  
  // Send statuses
  const [emailSent, setEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Close Warning Dialog State
  const [showWarning, setShowWarning] = useState(false);

  // Fetch catalog on mount to prefill prices
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await api.get('/products');
        if (response.data.success) {
          setCatalog(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch catalog', err);
      }
    };
    if (isOpen) {
      fetchCatalog();
    }
  }, [isOpen]);

  // Load enquiry details
  useEffect(() => {
    if (!enquiry || !isOpen) return;

    setEmailSent(enquiry.emailSent || false);

    // If there is an existing finalQuotation saved in the DB, load it
    if (enquiry.finalQuotation && enquiry.finalQuotation.products && enquiry.finalQuotation.products.length > 0) {
      setProductsList(enquiry.finalQuotation.products.map(p => ({
        productId: p.productId,
        productName: p.productName,
        variant: p.variant || 'Default',
        available: p.available !== undefined ? p.available : true,
        unitPrice: p.unitPrice || 0,
        quantity: p.quantity || 1,
        lineTotal: (p.quantity || 1) * (p.unitPrice || 0)
      })));
      setTaxPercent(enquiry.finalQuotation.taxPercent !== undefined ? enquiry.finalQuotation.taxPercent : 18);
      setNotes(enquiry.finalQuotation.notes || '');
      if (enquiry.finalQuotation.validityDate) {
        setValidityDate(new Date(enquiry.finalQuotation.validityDate).toISOString().split('T')[0]);
      }
      return;
    }

    // Default: generate list from enquiry selection
    const isMulti = type === 'multi' || !!enquiry.products;
    if (isMulti && enquiry.products) {
      setProductsList(enquiry.products.map(p => ({
        productId: p.productId,
        productName: p.productName,
        variant: p.variant || 'Default',
        available: true,
        unitPrice: p.unitPrice || 0,
        quantity: p.quantity || 1,
        lineTotal: (p.quantity || 1) * (p.unitPrice || 0)
      })));
    } else {
      // Prefill single product
      let matchedPrice = 0;
      let matchedId = null;
      let variantLabel = 'Default';

      if (catalog.length > 0) {
        const cleanedProduct = (enquiry.productInterested || '').toLowerCase().trim();
        const matched = catalog.find(p => 
          cleanedProduct.includes(p.name.toLowerCase().trim()) || 
          p.name.toLowerCase().trim().includes(cleanedProduct)
        );
        if (matched) {
          matchedId = matched.id;
          // Match variant details
          const variantMatch = cleanedProduct.match(/\(([^)]+)\)/);
          if (variantMatch && variantMatch[1] && matched.variants) {
            const vLabel = variantMatch[1].toLowerCase().trim();
            const matchedV = matched.variants.find(v => v.label.toLowerCase().trim() === vLabel);
            if (matchedV) {
              matchedPrice = matchedV.price;
              variantLabel = matchedV.label;
            } else {
              matchedPrice = matched.price;
            }
          } else {
            matchedPrice = matched.price;
          }
        }
      }

      setProductsList([{
        productId: matchedId,
        productName: enquiry.productInterested || 'N/A',
        variant: variantLabel,
        available: true,
        unitPrice: matchedPrice,
        quantity: parseInt(enquiry.quantity) || 1,
        lineTotal: (parseInt(enquiry.quantity) || 1) * matchedPrice
      }]);
    }

    // Default validity to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setValidityDate(defaultDate.toISOString().split('T')[0]);
    setTaxPercent(18);
    setNotes('');
  }, [enquiry, isOpen, catalog, type]);

  if (!isOpen || !enquiry) return null;

  // Row update handlers
  const handleRowChange = (index, field, value) => {
    const updated = [...productsList];
    if (field === 'available') {
      updated[index].available = value;
    } else if (field === 'quantity') {
      const val = Math.max(0, parseInt(value) || 0);
      updated[index].quantity = val;
      updated[index].lineTotal = val * updated[index].unitPrice;
    } else if (field === 'unitPrice') {
      const val = Math.max(0, parseFloat(value) || 0);
      updated[index].unitPrice = val;
      updated[index].lineTotal = updated[index].quantity * val;
    }
    setProductsList(updated);
  };

  // Calculations
  const availableItems = productsList.filter(p => p.available);
  const subtotal = availableItems.reduce((acc, p) => acc + p.lineTotal, 0);
  const taxAmount = parseFloat(((subtotal * taxPercent) / 100).toFixed(2));
  const grandTotal = subtotal + taxAmount;



  // Email Sender
  const handleSendEmail = async () => {
    if (!enquiry.email) {
      toast.error('No email address registered for this customer');
      return;
    }
    if (availableItems.length === 0) {
      toast.error('Cannot generate quote without available products');
      return;
    }

    setIsSendingEmail(true);
    try {
      const endpoint = type === 'multi'
        ? `/multi-enquiries/${enquiry._id}/send-quotation`
        : `/enquiries/${enquiry._id}/send-quotation`;

      const payload = {
        products: productsList, // Includes unavailable items as marked
        subtotal,
        taxPercent,
        taxAmount,
        grandTotal,
        validityDate,
        notes
      };

      const response = await api.post(endpoint, payload);
      if (response.data.success) {
        setEmailSent(true);
        toast.success('Professional HTML quotation emailed successfully!');
        if (onQuoted) onQuoted(response.data.data);
      }
    } catch (err) {
      console.error('Failed to send email quotation', err);
      toast.error(err.response?.data?.message || 'Failed to dispatch quotation email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const endpoint = type === 'multi'
        ? `/multi-enquiries/${enquiry._id}/quotation-draft`
        : `/enquiries/${enquiry._id}/quotation-draft`;

      const payload = {
        products: productsList,
        subtotal,
        taxPercent,
        taxAmount,
        grandTotal,
        validityDate,
        notes
      };

      const response = await api.put(endpoint, payload);
      if (response.data.success) {
        toast.success('Quotation draft saved successfully!');
        if (onQuoted) onQuoted(response.data.data);
      }
    } catch (err) {
      console.error('Failed to save quotation draft', err);
      toast.error('Failed to save draft details');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Close with Warn Safeguard
  const handleCloseAttempt = () => {
    const isSent = emailSent;
    if (!isSent) {
      setShowWarning(true);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99] flex items-center justify-center p-4">
        {/* Main Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseAttempt}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-2xl shadow-2xl z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleCloseAttempt}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkbg-700 transition cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-darkbg-700 shrink-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              B2B Quotation Builder
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review items, set commercial prices, and confirm dispatch delivery options.</p>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Customer Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-darkbg-900/40 border border-slate-100 dark:border-darkbg-750 p-4 rounded-xl text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Client Name</span>
                <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{enquiry.fullName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Company</span>
                <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{enquiry.companyName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone</span>
                <p className="font-semibold text-slate-800 dark:text-white mt-0.5 font-mono">{enquiry.phone}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email</span>
                <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{enquiry.email || 'N/A'}</p>
              </div>
            </div>

            {/* Products Table */}
            <div className="border border-slate-100 dark:border-darkbg-700 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-darkbg-900/60 border-b border-slate-100 dark:border-darkbg-700 font-bold text-slate-450 uppercase tracking-wider">
                    <th className="p-3 w-20 text-center">Available</th>
                    <th className="p-3">Product details</th>
                    <th className="p-3 w-28 text-center">Quantity</th>
                    <th className="p-3 w-32 text-right">Unit Price (₹)</th>
                    <th className="p-3 w-32 text-right">Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-darkbg-700/60 font-medium">
                  {productsList.map((p, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors duration-150 ${
                        !p.available ? 'opacity-40 bg-slate-50/20 dark:bg-darkbg-900/10' : 'bg-white dark:bg-darkbg-800'
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={p.available}
                          onChange={(e) => handleRowChange(idx, 'available', e.target.checked)}
                          className="rounded border-slate-300 dark:border-darkbg-700 text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-850 dark:text-white">{p.productName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Option/Variant: {p.variant}</div>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={p.quantity}
                          disabled={!p.available}
                          min="1"
                          onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 rounded-md text-center font-bold text-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={p.unitPrice}
                          disabled={!p.available}
                          min="0"
                          step="0.01"
                          onChange={(e) => handleRowChange(idx, 'unitPrice', e.target.value)}
                          className="w-28 px-2 py-1 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 rounded-md text-right font-bold text-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800 dark:text-slate-200">
                        ₹{p.lineTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Note, Validity & Calculations Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Note, Date Picker */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
                    Quotation Validity Date *
                  </label>
                  <input
                    type="date"
                    value={validityDate}
                    onChange={(e) => setValidityDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 rounded-xl text-slate-850 dark:text-white font-bold outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
                    Delivery Notes / Terms (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Free dispatch in Hyderabad. Handover standard commercial invoice copy on delivery."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 rounded-xl text-slate-850 dark:text-white outline-none text-xs resize-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Right Column: Pricing Calculations */}
              <div className="bg-slate-50 dark:bg-darkbg-900/30 border border-slate-100 dark:border-darkbg-750 rounded-xl p-5 text-sm space-y-3.5">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Subtotal:</span>
                  <strong className="text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span>GST (Tax):</span>
                    <input
                      type="number"
                      value={taxPercent}
                      min="0"
                      max="100"
                      onChange={(e) => setTaxPercent(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 px-1 py-0.5 bg-white dark:bg-darkbg-900 border border-slate-250 dark:border-darkbg-700 rounded text-center font-bold text-xs"
                    />
                    <span>%</span>
                  </div>
                  <strong className="text-slate-800 dark:text-slate-200">₹{taxAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="border-t border-slate-250 dark:border-darkbg-700 pt-3 flex justify-between items-center text-base">
                  <span className="font-bold text-primary-600 dark:text-primary-400">Grand Total:</span>
                  <strong className="font-black text-primary-600 dark:text-primary-400">₹{grandTotal.toLocaleString('en-IN')}</strong>
                </div>
              </div>

            </div>

            {/* Real-time sending status logs */}
            <div className="flex flex-wrap gap-4 items-center p-3 rounded-xl border border-slate-100 dark:border-darkbg-750 bg-slate-50/50 dark:bg-darkbg-900/10 text-xs font-semibold">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block mr-2">Channels Sent Status:</span>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                  emailSent 
                    ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-400 dark:bg-darkbg-700 dark:text-slate-500'
                }`}>
                  <Mail className="w-3.5 h-3.5" />
                  {emailSent ? 'Email: Sent ✓' : 'Email: Not Sent'}
                </span>
              </div>
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-darkbg-900/60 border-t border-slate-100 dark:border-darkbg-700 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="px-4.5 py-2.5 border border-slate-250 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 hover:bg-slate-100 dark:hover:bg-darkbg-750 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs transition active:scale-97 cursor-pointer disabled:opacity-50"
            >
              {isSavingDraft ? 'Saving Draft...' : 'Save as Draft'}
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail || !enquiry.email}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-350 dark:disabled:bg-darkbg-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-97 cursor-pointer"
                title={!enquiry.email ? 'Customer has no email address' : 'Send Quote PDF Email'}
              >
                {isSendingEmail ? (
                  <span>Sending Email...</span>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send via Email
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Warning confirmation overlay if closed without sending */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWarning(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.25 }}
              className="relative w-full max-w-md bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">⚠️ Quotation not sent yet!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    You haven't sent this quotation to the customer via Email. If you close now, this enquiry will remain in 'New' status and the customer will not receive the quote. Are you sure you want to close without sending?
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-darkbg-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-darkbg-700 transition cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  onClick={() => {
                    setShowWarning(false);
                    onClose();
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Close Anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
export default QuotationModal;
