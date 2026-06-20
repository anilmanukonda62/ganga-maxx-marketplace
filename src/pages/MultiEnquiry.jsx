import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Phone, Mail, CheckCircle, AlertCircle, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useEnquiryList } from '../context/EnquiryListContext';

export const MultiEnquiry = () => {
  const { enquiryItems, updateQuantity, removeFromEnquiryList, clearEnquiryList } = useEnquiryList();
  const navigate = useNavigate();

  // Form inputs state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    message: ''
  });

  // Validation & feedback states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error message when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Indian mobile number validation helper (10 digits starting with 6-9)
  const validatePhone = (number) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(number);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Mandatory Field checks
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company/Institution Name is required';
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!validatePhone(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number (starts with 6-9)';
    }

    if (enquiryItems.length === 0) {
      alert('Your Enquiry List is empty. Please select products to enquire.');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Map products to correct payload structure
      const productsPayload = enquiryItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        variant: item.selectedVariant,
        unitPrice: item.unitPrice,
        quantity: item.quantity
      }));

      // Structure the submit data
      const enquiryPayload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        companyName: formData.companyName,
        message: formData.message || undefined,
        products: productsPayload
      };

      const API_URL = import.meta.env.DEV 
        ? '/api' 
        : 'https://ganga-maxx-marketplace-ct25.onrender.com/api';
      const response = await fetch(`${API_URL}/multi-enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enquiryPayload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Server returned an error');
      }

      // Trigger success indicators
      setSubmitSuccess(true);
      setIsSubmitting(false);

      // Reset form & Clear context enquiry items
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        companyName: '',
        message: ''
      });
      clearEnquiryList();

      // Redirect or show message, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Hide success notification after 7 seconds
      setTimeout(() => setSubmitSuccess(false), 7000);

    } catch (error) {
      console.error('Multi-Enquiry submission failed:', error);
      alert(`Failed to submit enquiry: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Back to Products */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-green-600 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl mb-8 transition-colors duration-200 w-auto self-start"
      >
        <ArrowLeft size={16} />
        Back to Catalog
      </Link>

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
          Multi-Product Enquiry
        </h1>
        <div className="w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Review your selection list and submit details below to receive a comprehensive supply quotation from our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & Selection Review */}
        <div className="lg:col-span-7 space-y-8">
          {/* Selected Products Review */}
          <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-l-4 border-green-600 pl-3 mb-6">
              Review Selected Products
            </h3>

            {enquiryItems.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Your Enquiry List is empty.</p>
                <Link to="/products" className="mt-4 inline-block text-xs font-bold text-green-600 dark:text-green-400 hover:underline">
                  Browse catalog to add products
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {enquiryItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.selectedVariant}`}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="h-14 w-14 rounded-lg bg-white border border-slate-100 dark:border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.productName} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.productName}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Variant: {item.selectedVariant}</p>
                        </div>
                        <button
                          onClick={() => removeFromEnquiryList(item.productId, item.selectedVariant)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant)}
                            className="p-1 hover:bg-white dark:hover:bg-slate-850 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariant)}
                            className="p-1 hover:bg-white dark:hover:bg-slate-850 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                          ₹{item.unitPrice.toLocaleString('en-IN')} / unit
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enquiry Form */}
          <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-l-4 border-green-600 pl-3 mb-6">
              B2B Contact Information
            </h3>

            {/* Success notice */}
            <AnimatePresence>
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3 text-emerald-800 dark:text-emerald-400 text-sm overflow-hidden"
                >
                  <CheckCircle size={18} className="shrink-0 text-emerald-500 mt-0.5" />
                  <div>
                    <span className="font-bold">Thank you!</span> Our team has received your B2B multi-product enquiry and will contact you within 24 hours with a custom proposal.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: Name and Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="fullName" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border ${
                      errors.fullName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white`}
                    placeholder="e.g. Anil Kumar"
                  />
                  {errors.fullName && (
                    <span className="text-red-500 text-xs mt-1 block flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.fullName}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="companyName" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Company / Institution Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border ${
                      errors.companyName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white`}
                    placeholder="e.g. Gachibowli Regency Grand"
                  />
                  {errors.companyName && (
                    <span className="text-red-500 text-xs mt-1 block flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.companyName}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Phone and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Phone Number * (10-Digit Mobile)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border ${
                      errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white`}
                    placeholder="e.g. 9876543210"
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-xs mt-1 block flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.phone}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white"
                    placeholder="e.g. admin@regency.com"
                  />
                </div>
              </div>

              {/* Row 3: Message */}
              <div>
                <label htmlFor="message" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Detailed Message / Requirements
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white resize-none"
                  placeholder="Tell us about your specific schedule, frequency, delivery address, or packing size preferences..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || enquiryItems.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-xl shadow-md transition-all duration-200 disabled:bg-slate-400 cursor-pointer"
              >
                <Send size={15} />
                {isSubmitting ? 'Sending Enquiry...' : 'Send Enquiry'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Info Card & WhatsApp */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-l-4 border-green-600 pl-3">
              Direct Contact
            </h3>

            <ul className="space-y-4 text-xs">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-green-600 mt-0.5 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Sri Ram Nagar Colony, Puppalaguda, Hyderabad, 500089
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={15} className="text-green-600 mt-0.5 shrink-0" />
                <div className="flex flex-col text-slate-700 dark:text-slate-300">
                  <a href="tel:+919110306090">+91 91103 06090</a>
                  <a href="tel:+919110714545">+91 91107 14545</a>
                  <a href="tel:+918801214584">+91 88012 14584</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-green-600 shrink-0" />
                <a href="mailto:Gangamaxxmarketplace@gmail.com" className="text-slate-700 dark:text-slate-300 truncate">
                  Gangamaxxmarketplace@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
export default MultiEnquiry;
