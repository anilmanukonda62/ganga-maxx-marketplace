import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Sun, Moon, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: '', color: 'bg-slate-200' });

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const username = location.state?.username;
  const resetToken = location.state?.resetToken;

  // Redirect if params are missing
  useEffect(() => {
    if (!username || !resetToken) {
      toast.error('Invalid session. Please start password reset again.');
      navigate('/forgot-password');
    }
  }, [username, resetToken, navigate]);

  // Password strength check
  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, label: '', color: 'bg-slate-200' });
      return;
    }
    if (password.length < 8) {
      setStrength({ score: 1, label: 'Too Short (Min 8 characters)', color: 'bg-red-500' });
      return;
    }

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (hasLetters && hasNumbers && hasSpecial) {
      setStrength({ score: 3, label: 'Strong password', color: 'bg-green-500 w-full' });
    } else if (hasLetters && hasNumbers) {
      setStrength({ score: 2, label: 'Medium strength', color: 'bg-amber-400 w-2/3' });
    } else {
      setStrength({ score: 1, label: 'Weak password', color: 'bg-red-500 w-1/3' });
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Please enter and confirm your new password');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/admin/reset-password', {
        username,
        resetToken,
        newPassword: password,
      });
      if (response.data.success) {
        toast.success('Password reset successful! Please sign in.');
        navigate('/login');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error resetting password';
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Reset Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Please choose a secure new password for admin account: <strong className="text-slate-800 dark:text-white">{username}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 8 chars)"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl outline-none transition"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Strength Bar */}
            {password && (
              <div className="space-y-1.5 pt-1">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-darkbg-900 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} />
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Strength:</span>
                  <span className="font-semibold text-slate-700 dark:text-white">{strength.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl outline-none transition"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold tracking-wide transition shadow-lg shadow-primary-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            disabled={isLoading || password.length < 8 || password !== confirmPassword}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
