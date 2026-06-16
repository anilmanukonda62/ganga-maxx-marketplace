import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Sun, Moon, Eye, EyeOff, Lock, User, Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/admin/login', { username, password });
      if (response.data.success) {
        login(response.data.token, response.data.admin);
        toast.success('Welcome back, Admin!');
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Invalid username or password';
      toast.error(message);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 500);
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

      {/* Login Card */}
      <div
        className={`w-full max-w-md bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-8 shadow-xl transition-all duration-300 z-10 ${
          shouldShake ? 'animate-shake' : ''
        }`}
      >
        <div className="text-center mb-8">
          <img
            src="https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png"
            alt="Ganga Maxx Logo"
            className="h-14 mx-auto mb-4 rounded-lg object-contain"
          />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Ganga Maxx</h2>
          <p className="text-sm font-semibold text-primary-500 mt-1 uppercase tracking-wider">Admin Panel</p>
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

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-primary-500 hover:text-primary-600 transition"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
