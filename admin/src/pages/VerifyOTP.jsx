import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Sun, Moon, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const username = location.state?.username;

  // Redirect if username is missing
  useEffect(() => {
    if (!username) {
      toast.error('Session expired. Please start over.');
      navigate('/forgot-password');
    }
  }, [username, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take only the last character if user typed over
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit if complete
    const otpValue = newOtp.join('');
    if (otpValue.length === 6 && newOtp.every((v) => v !== '')) {
      handleSubmit(null, otpValue);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Clear previous and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error('Please paste a 6-digit OTP code');
      return;
    }

    const pastedDigits = pastedData.split('');
    setOtp(pastedDigits);
    
    // Focus last input
    inputRefs.current[5].focus();

    // Submit pasted OTP
    handleSubmit(null, pastedData);
  };

  const handleSubmit = async (e, otpCode = null) => {
    if (e) e.preventDefault();
    
    const finalOtp = otpCode || otp.join('');
    if (finalOtp.length !== 6) {
      toast.error('Please enter a 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/admin/verify-otp', {
        username,
        otp: finalOtp
      });
      if (response.data.success) {
        toast.success('OTP verified successfully!');
        // Navigate to reset password and pass resetToken + username
        navigate('/reset-password', {
          state: {
            username,
            resetToken: response.data.resetToken
          }
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid or expired OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await api.post('/api/admin/forgot-password', { username });
      if (response.data.success) {
        toast.success('A new OTP has been sent!');
        setOtp(['', '', '', '', '', '']);
        setTimer(600); // Reset countdown
        inputRefs.current[0].focus();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error resending OTP';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg-900 px-4 transition-colors duration-300 relative overflow-hidden">
      {/* Background visual blobs */}
      <div className="absolute w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -top-10 -left-10" />
      <div className="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -bottom-10 -right-10" />

      {/* Theme Toggle (Top Right) */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl bg-white dark:bg-darkbg-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-darkbg-700 hover:bg-slate-100 dark:hover:bg-darkbg-700 transition duration-300 shadow-sm"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
      </button>

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-8 shadow-xl transition-all duration-300 z-10">
        <div className="mb-6">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Enter OTP</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            A 6-digit OTP code has been sent to the recovery email. Please enter it below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Digit Input Boxes */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-xl font-bold bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-white rounded-xl outline-none transition"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Timer & Resend */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {timer > 0 ? (
                <>
                  OTP expires in: <span className="font-mono font-semibold text-slate-700 dark:text-white">{formatTime(timer)}</span>
                </>
              ) : (
                <span className="text-red-500 font-medium">OTP has expired</span>
              )}
            </span>

            {timer === 0 && (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-1 font-bold text-primary-500 hover:text-primary-600 transition disabled:opacity-50"
                disabled={isResending}
              >
                {isResending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Resend OTP
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold tracking-wide transition shadow-lg shadow-primary-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            disabled={isLoading || otp.join('').length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
