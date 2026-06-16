import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();

  // Wizard Steps: 1 = Verify Current, 2 = Verify OTP, 3 = Reset Password
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Current Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);

  // Step 2: OTP Entry
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [isResending, setIsResending] = useState(false);
  const otpInputRefs = useRef([]);

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [updateToken, setUpdateToken] = useState('');

  // Password rules validation states
  const rules = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    notSame: newPassword !== currentPassword && newPassword !== '',
  };

  const isPasswordValid = Object.values(rules).every(Boolean);

  // Strength Score Calculations
  const [strength, setStrength] = useState({ score: 0, label: '', color: 'bg-slate-200' });

  useEffect(() => {
    if (!newPassword) {
      setStrength({ score: 0, label: '', color: 'bg-slate-200' });
      return;
    }
    
    // Count satisfied rules (except notSame)
    const satisfiedRulesCount = [
      newPassword.length >= 8,
      /[A-Z]/.test(newPassword),
      /[a-z]/.test(newPassword),
      /[0-9]/.test(newPassword),
      /[^A-Za-z0-9]/.test(newPassword),
    ].filter(Boolean).length;

    if (satisfiedRulesCount <= 2) {
      setStrength({ score: 1, label: 'Weak Password', color: 'bg-red-500 w-1/3' });
    } else if (satisfiedRulesCount <= 4) {
      setStrength({ score: 2, label: 'Medium Strength', color: 'bg-amber-400 w-2/3' });
    } else {
      setStrength({ score: 3, label: 'Strong Password', color: 'bg-green-500 w-full' });
    }
  }, [newPassword]);

  // Step 2 timer effect
  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Step 1: Submit current password to request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/admin/change-password-otp', { currentPassword });
      if (response.data.success) {
        toast.success('Security code sent to recovery email!');
        setStep(2);
        setTimer(300); // 5 minutes
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed. Please check current password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: OTP input handlers
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }

    // Auto-submit OTP
    const fullOtp = newOtp.join('');
    if (fullOtp.length === 6 && newOtp.every((v) => v !== '')) {
      handleVerifyOtp(null, fullOtp);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').trim();
    if (!/^\d{6}$/.test(pasted)) {
      toast.error('Paste a 6-digit OTP code');
      return;
    }
    const digits = pasted.split('');
    setOtp(digits);
    if (otpInputRefs.current[5]) otpInputRefs.current[5].focus();
    handleVerifyOtp(null, pasted);
  };

  // Step 2: Submit OTP to verify
  const handleVerifyOtp = async (e, customOtp = null) => {
    if (e) e.preventDefault();
    const finalOtp = customOtp || otp.join('');
    if (finalOtp.length !== 6) {
      toast.error('Enter 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/admin/verify-change-otp', { otp: finalOtp });
      if (response.data.success) {
        toast.success('Identity verified!');
        setUpdateToken(response.data.updateToken);
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired security code');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await api.post('/admin/change-password-otp', { currentPassword });
      if (response.data.success) {
        toast.success('A new security code has been sent!');
        setOtp(['', '', '', '', '', '']);
        setTimer(300);
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Resend failed. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Step 3: Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error('New password does not satisfy security rules');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/admin/update-password', {
        newPassword,
        updateToken
      });

      if (response.data.success) {
        toast.success('Password updated successfully! Logging out for security...');
        setTimeout(() => {
          logout(); // Triggers session clear and login redirect
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -15 }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage admin credentials and session options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details (Left) */}
        <motion.div 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)' }}
          transition={{ duration: 0.3 }}
          className="md:col-span-1 bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm space-y-5 h-fit"
        >
          <div className="flex flex-col items-center text-center pb-4 border-b border-slate-150 dark:border-darkbg-700">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center font-bold text-2xl uppercase">
              {user?.username?.[0] || 'A'}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mt-3 text-base">{user?.username || 'Admin'}</h3>
            <span className="text-xs text-primary-500 font-semibold uppercase tracking-wider mt-0.5">Systems Administrator</span>
          </div>

          <div className="space-y-4 text-sm">
            {/* Username display */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Username</span>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold truncate">{user?.username || 'admin'}</span>
              </div>
            </div>

            {/* Recovery email display */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recovery Email</span>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold truncate">anilkumarmanukonda07@gmail.com</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Change Password Security Wizard (Right) */}
        <motion.div 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)' }}
          transition={{ duration: 0.3 }}
          className="md:col-span-2 bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col min-h-[420px] justify-between"
        >
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-darkbg-700 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Security & Password Update</h3>
              </div>
              <span className="text-xs font-bold bg-slate-100 dark:bg-darkbg-900 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400">
                Step {step} of 3
              </span>
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: VERIFY CURRENT PASSWORD */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onSubmit={handleRequestOtp}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    To update your password, first verify your current identity. We will generate and send a 6-digit confirmation security code to your recovery email.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Lock className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-white rounded-xl outline-none text-sm transition"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      >
                        {showCurrent ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      disabled={isLoading || !currentPassword}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition shadow-md shadow-primary-500/10 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send OTP Code
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* STEP 2: ENTER OTP CODE */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    A 6-digit security code has been sent to your email. Enter it below to verify your session.
                  </p>

                  {/* 6 Digit inputs */}
                  <div className="flex justify-between gap-2 max-w-xs mx-auto" onPaste={handleOtpPaste}>
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
                        className="w-10 h-12 text-center text-lg font-bold bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-white rounded-xl outline-none transition"
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs max-w-xs mx-auto">
                    <span className="text-slate-500 dark:text-slate-400">
                      {timer > 0 ? (
                        <>
                          Expires in:{' '}
                          <span className="font-mono font-semibold text-slate-700 dark:text-white">
                            {formatTime(timer)}
                          </span>
                        </>
                      ) : (
                        <span className="text-red-500 font-semibold">Code expired</span>
                      )}
                    </span>

                    {timer === 0 && (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="inline-flex items-center gap-1 font-bold text-primary-500 hover:text-primary-600 transition disabled:opacity-50"
                        disabled={isResending}
                      >
                        {isResending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <motion.button
                      type="button"
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.02 }}
                      className="px-4 py-2 border border-slate-205 dark:border-darkbg-700 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      disabled={isLoading || otp.join('').length !== 6}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition shadow-md shadow-primary-500/10 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify OTP
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: RESET PASSWORD */}
              {step === 3 && (
                <motion.form
                  key="step3"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onSubmit={handleUpdatePassword}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your identity has been verified. Choose a secure new password below.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-white rounded-xl outline-none text-xs transition"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-650"
                        >
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Strength indicator */}
                      {newPassword && (
                        <div className="space-y-1 pt-1">
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-darkbg-900 rounded-full overflow-hidden">
                            <div className={`h-full ${strength.color} transition-all duration-300`} />
                          </div>
                          <span className="text-[9px] font-bold text-slate-500">{strength.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-white rounded-xl outline-none text-xs transition"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Rules checklist */}
                  <div className="p-3 bg-slate-50 dark:bg-darkbg-900 rounded-2xl border border-slate-150 dark:border-darkbg-750 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      {rules.length ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      At least 8 characters
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rules.uppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      At least 1 uppercase letter
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rules.lowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      At least 1 lowercase letter
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rules.number ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      At least 1 number
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rules.special ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      At least 1 special character
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rules.notSame ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      Cannot be same as current
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      disabled={isLoading || !isPasswordValid || newPassword !== confirmNewPassword}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition shadow-md shadow-primary-500/10 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Update Password
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
