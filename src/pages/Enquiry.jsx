import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Phone, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

export const Enquiry = () => {
  const location = useLocation();
  const { products } = useProducts();

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

  // Email OTP verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationToken, setVerificationToken] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef([]);

  // Prefill field if product details state exists
  useEffect(() => {
    if (prefilledProduct) {
      setFormData((prev) => ({ ...prev, productInterested: prefilledProduct }));
    }
  }, [prefilledProduct]);

  // OTP Countdown timer effect
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error message when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Reset email verification if email input is modified
    if (name === 'email') {
      setEmailVerified(false);
      setVerificationToken('');
      setOtpSent(false);
      setOtpError('');
    }
  };

  // Indian mobile number validation helper (10 digits starting with 6-9)
  const validatePhone = (number) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(number);
  };

  const handleSendOtp = async () => {
    if (!formData.email || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    setSendingOtp(true);
    setOtpError('');
    try {
      const API_URL = import.meta.env.DEV 
        ? '/api' 
        : 'https://ganga-maxx-marketplace-ct25.onrender.com/api';
      const response = await fetch(`${API_URL}/enquiries/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      setOtpTimer(300); // 5 minutes
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      
      // Auto-focus first input box
      setTimeout(() => {
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      }, 100);
    } catch (err) {
      setOtpError(err.message || 'Error sending OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e, customOtp = null) => {
    if (e) e.preventDefault();
    const finalOtp = customOtp || otp.join('');
    if (finalOtp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP code');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    try {
      const API_URL = import.meta.env.DEV 
        ? '/api' 
        : 'https://ganga-maxx-marketplace-ct25.onrender.com/api';
      const response = await fetch(`${API_URL}/enquiries/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email, otp: finalOtp })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid or expired OTP');
      }

      setEmailVerified(true);
      setVerificationToken(data.verificationToken);
      setOtpSent(false);
      setOtpError('');
      setErrors((prev) => ({ ...prev, email: '' }));
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      if (otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }
    }

    // Auto-submit if complete
    const otpValue = newOtp.join('');
    if (otpValue.length === 6 && newOtp.every((v) => v !== '')) {
      handleVerifyOtp(null, otpValue);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        if (otpInputRefs.current[index - 1]) {
          otpInputRefs.current[index - 1].focus();
        }
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      setOtpError('Please paste a 6-digit OTP code');
      return;
    }

    const pastedDigits = pastedData.split('');
    setOtp(pastedDigits);
    
    if (otpInputRefs.current[5]) {
      otpInputRefs.current[5].focus();
    }

    handleVerifyOtp(null, pastedData);
  };

  const handleResetEmail = () => {
    setEmailVerified(false);
    setVerificationToken('');
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setFormData((prev) => ({ ...prev, email: '' }));
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

    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!emailVerified) {
      newErrors.email = 'Please verify your email before submitting';
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
        email: formData.email,
        companyName: formData.companyName,
        productInterested: formData.productInterested || undefined,
        quantity: formData.quantity || undefined,
        message: formData.requirements || undefined,
        emailVerificationToken: verificationToken,
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
      setEmailVerified(false);
      setVerificationToken('');
      setOtpSent(false);
      setOtp(['', '', '', '', '', '']);

      // Hide success notification after 7 seconds
      setTimeout(() => setSubmitSuccess(false), 7000);

    } catch (error) {
      console.error('Enquiry submission failed:', error);
      alert(`Failed to submit enquiry: ${error.message}`);
      setIsSubmitting(false);
    }
  };

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
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={emailVerified}
                      className={`w-full pr-24 px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border ${
                        errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white ${
                        emailVerified ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-75' : ''
                      }`}
                      placeholder="e.g. admin@regency.com"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {emailVerified ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50">
                          Verified ✓
                        </span>
                      ) : (
                        formData.email && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(formData.email) && !otpSent && (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className="text-[10px] font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 px-2.5 py-1.5 rounded-lg shadow-sm transition-all disabled:bg-slate-400 cursor-pointer"
                          >
                            {sendingOtp ? 'Sending...' : 'Verify'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  {errors.email && (
                    <span className="text-red-500 text-xs mt-1 block flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.email}
                    </span>
                  )}
                  {emailVerified && (
                    <button
                      type="button"
                      onClick={handleResetEmail}
                      className="text-xs text-green-600 hover:text-green-700 font-bold mt-1.5 underline block cursor-pointer"
                    >
                      Change Email
                    </button>
                  )}

                  <AnimatePresence>
                    {otpSent && !emailVerified && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4"
                      >
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                          Enter the 6-digit verification code sent to your email:
                        </span>
                        
                        <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => (otpInputRefs.current[index] = el)}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(e.target.value, index)}
                              onKeyDown={(e) => handleOtpKeyDown(e, index)}
                              className="w-10 h-12 text-center text-lg font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-green-600 focus:ring-1 focus:ring-green-600 text-slate-900 dark:text-white rounded-lg outline-none transition"
                              disabled={verifyingOtp}
                            />
                          ))}
                        </div>

                        {otpError && (
                          <span className="text-red-500 text-xs mt-1 block flex items-center gap-1">
                            <AlertCircle size={12} /> {otpError}
                          </span>
                        )}

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-500 dark:text-slate-400">
                            {otpTimer > 0 ? (
                              <>
                                Code expires in: <span className="font-mono font-semibold text-slate-700 dark:text-white">{formatTime(otpTimer)}</span>
                              </>
                            ) : (
                              <span className="text-red-500 font-medium">Code has expired</span>
                            )}
                          </span>

                          {otpTimer === 0 ? (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={sendingOtp}
                              className="text-green-600 hover:text-green-700 font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              Resend OTP
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleVerifyOtp()}
                              disabled={verifyingOtp || otp.join('').length !== 6}
                              className="text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            >
                              {verifyingOtp ? 'Verifying...' : 'Verify'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Row 3: Product and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="productInterested" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Product Interested
                  </label>
                  <select
                    id="productInterested"
                    name="productInterested"
                    value={formData.productInterested}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="">Select a Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
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
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 text-slate-800 dark:text-white"
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

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !emailVerified}
                  className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-xl shadow-md transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send size={15} />
                  {isSubmitting ? 'Sending Enquiry...' : 'Send Enquiry'}
                </button>
                {!emailVerified && (
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Please verify your email to submit
                  </p>
                )}
              </div>
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
