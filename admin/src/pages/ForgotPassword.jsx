import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Sun, Moon, ArrowLeft, User, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      toast.error('Please enter your admin username');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/admin/forgot-password', { username });
      if (response.data.success) {
        toast.success(response.data.message || 'OTP sent successfully!');
        // Pass username through router state to use it in verify OTP
        navigate('/verify-otp', { state: { username } });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error sending OTP. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
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
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Forgot Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Enter your admin username and we'll send a 6-digit OTP to the registered recovery email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl outline-none transition"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold tracking-wide transition shadow-lg shadow-primary-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
