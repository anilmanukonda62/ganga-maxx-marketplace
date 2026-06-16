import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export const Enquiry = () => {
  const location = useLocation();

  // Initial pre-filled product from detail page state
  const prefilledProduct = location.state?.productName || '';

  // Form inputs state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    productInterested: '',
    quantity: '',
    requirements: ''
  });

  // Validation & feedback states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Prefill field if product details state exists
  useEffect(() => {
    if (prefilledProduct) {
      setFormData((prev) => ({ ...prev, productInterested: prefilledProduct }));
    }
  }, [prefilledProduct]);

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

  // Submit Handler structured as an async function for future API integration
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the top of the form or target first error
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Structure the submit data
      const enquiryPayload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        companyName: formData.companyName,
        productInterested: formData.productInterested || undefined,
        quantity: formData.quantity || undefined,
        message: formData.requirements || undefined
      };

      const API_URL = import.meta.env.DEV 
        ? '/api' 
        : 'https://ganga-maxx-marketplace-ct25.onrender.com/api';
      const response = await fetch(`${API_URL}/enquiries`, {
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

      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        companyName: '',
        productInterested: '',
        quantity: '',
        requirements: ''
      });

      // Hide success notification after 7 seconds
      setTimeout(() => setSubmitSuccess(false), 7000);

    } catch (error) {
      console.error('Enquiry submission failed:', error);
      alert(`Failed to submit enquiry: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  // WhatsApp Icon
  const WhatsAppIcon = () => (
    <svg
      className="w-5 h-5 fill-current"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.472 1.332 4.975L2 22l5.223-1.371a9.92 9.92 0 0 0 4.789 1.229H12c5.506 0 9.988-4.482 9.988-9.988 0-2.659-1.035-5.161-2.919-7.045A9.922 9.922 0 0 0 12.012 2zm0 1.637c2.233 0 4.331.87 5.906 2.445 1.576 1.576 2.444 3.673 2.444 5.906 0 4.603-3.743 8.347-8.347 8.347a8.307 8.307 0 0 1-4.237-1.15l-.304-.18-3.149.826.84-3.071-.197-.314a8.305 8.305 0 0 1-1.272-4.461c0-4.603 3.743-8.347 8.347-8.347v.002zm-3.666 4.31c-.2.001-.33.012-.48.064-.15.053-.29.13-.41.226-.37.3-.64.712-.76 1.189-.25.968.12 1.954.7 2.723 1.15 1.523 2.58 2.768 4.19 3.65.61.33 1.27.56 1.95.67.75.12 1.48-.12 1.93-.65.23-.27.35-.61.35-.96v-.27c0-.14-.08-.26-.21-.32-.34-.17-1.03-.51-1.19-.57-.16-.06-.28-.09-.4.09-.12.18-.46.57-.56.69-.1.12-.21.13-.37.05a5.13 5.13 0 0 1-1.42-.88c-.48-.42-.87-.93-1.15-1.5-.1-.17-.01-.26.07-.35l.4-.46c.09-.1.12-.21.06-.32-.06-.16-.57-1.37-.69-1.65-.12-.29-.25-.25-.37-.25h-.26z" />
    </svg>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
          Send us your Enquiry
        </h1>
        <div className="w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Interested in bulk supply rates? Populate the details below, and our Telangana commercial team will construct a tailored quotation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-l-4 border-green-600 pl-3 mb-6">
              B2B Enquiry Form
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
                    <span className="font-bold">Thank you!</span> Our team has received your B2B requirements and will contact you within 24 hours with a custom proposal.
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

              {/* Row 3: Product and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="productInterested" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Product Interested
                  </label>
                  <input
                    type="text"
                    id="productInterested"
                    name="productInterested"
                    value={formData.productInterested}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white"
                    placeholder="Product name / variant (e.g. Soap Oil - 5L)"
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Quantity Required (Optional)
                  </label>
                  <input
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-955 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white"
                    placeholder="e.g. 50 units / 5 canisters"
                  />
                </div>
              </div>

              {/* Row 4: Detailed Requirements */}
              <div>
                <label htmlFor="requirements" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Detailed Message / Requirements
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows="4"
                  value={formData.requirements}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white resize-none"
                  placeholder="Tell us about your specific schedule, frequency, delivery address, or packing size preferences..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-xl shadow-md transition-all duration-200 disabled:bg-slate-400"
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
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Skip forms entirely! Click the WhatsApp button below to speak directly with our Hyderabad sales desk. We support immediate dispatches and invoice generation.
            </p>

            <a
              href="https://wa.me/919110306090"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer"
            >
              <WhatsAppIcon />
              Chat on WhatsApp
            </a>

            <ul className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
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
