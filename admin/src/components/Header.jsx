import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Menu, User, Bell, ExternalLink, ClipboardList, Mail, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [newEnquiries, setNewEnquiries] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Determine page title dynamically based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/analytics') return 'Performance Analytics';
    if (path === '/products') return 'Products Management';
    if (path === '/products/add') return 'Add New Product';
    if (path.startsWith('/products/edit')) return 'Edit Product';
    if (path === '/enquiries') return 'Enquiries';
    if (path === '/contact') return 'Contact Messages';
    if (path === '/settings') return 'Settings';
    return 'Ganga Maxx Admin';
  };

  const fetchNotifications = async () => {
    try {
      const [enqRes, contactRes] = await Promise.all([
        api.get('/enquiries'),
        api.get('/contact')
      ]);
      if (enqRes.data.success) {
        const filteredEnq = enqRes.data.data.filter(e => e.status === 'New');
        setNewEnquiries(filteredEnq);
      }
      if (contactRes.data.success) {
        const filteredContact = contactRes.data.data.filter(c => c.status === 'New');
        setNewMessages(filteredContact);
      }
    } catch (error) {
      console.error('Failed to load notifications counts', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    if (newEnquiries.length === 0 && newMessages.length === 0) return;
    const toastId = toast.loading('Marking all notifications as read...');
    try {
      const enquiryPromises = newEnquiries.map(e => 
        api.put(`/enquiries/${e._id}/status`, { status: 'Contacted' })
      );
      const messagePromises = newMessages.map(m => 
        api.put(`/contact/${m._id}/status`, { status: 'Read' })
      );

      await Promise.all([...enquiryPromises, ...messagePromises]);
      toast.success('All notifications marked as read!', { id: toastId });
      setNewEnquiries([]);
      setNewMessages([]);
      setDropdownOpen(false);
    } catch (error) {
      toast.error('Failed to mark all notifications as read', { id: toastId });
      console.error(error);
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalCount = newEnquiries.length + newMessages.length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white dark:bg-darkbg-800 border-b border-slate-100 dark:border-darkbg-700 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <motion.button
          onClick={onMenuClick}
          whileHover={{ scale: 1.02 }}
          className="p-2 -ml-2 rounded-xl lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkbg-700 transition cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </motion.button>

        <h1 className="text-xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <motion.a
          onClick={() => window.open('http://localhost:5174', '_blank')}
          whileHover={{ scale: 1.02 }}
          className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-darkbg-700 hover:bg-slate-100 dark:hover:bg-darkbg-700 transition duration-300 shadow-sm group cursor-pointer"
          title="Preview Website"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="absolute top-12 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all origin-top bg-slate-950 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md whitespace-nowrap z-50 shadow-lg border border-slate-850">
            Preview Website
          </span>
        </motion.a>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            whileHover={{ scale: 1.02 }}
            className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-darkbg-700 hover:bg-slate-100 dark:hover:bg-darkbg-700 transition duration-300 shadow-sm cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white animate-pulse">
                {totalCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 mt-3.5 w-80 sm:w-96 bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl shadow-xl z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-darkbg-700 flex justify-between items-center bg-slate-50/50 dark:bg-darkbg-900/10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">Notifications</span>
                    {totalCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400">
                        {totalCount} New
                      </span>
                    )}
                  </div>
                  {totalCount > 0 && (
                    <motion.button
                      onClick={handleMarkAllRead}
                      whileHover={{ scale: 1.02 }}
                      className="text-xs font-bold text-primary-500 hover:text-primary-600 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all read
                    </motion.button>
                  )}
                </div>

                {/* Notifications Lists */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-darkbg-700/50">
                  {totalCount === 0 ? (
                    <div className="py-12 px-5 text-center flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-350 dark:text-slate-650" />
                      <span className="text-sm text-slate-400 font-medium">No new notifications</span>
                    </div>
                  ) : (
                    <>
                      {/* Section: New Enquiries */}
                      {newEnquiries.length > 0 && (
                        <div className="p-3">
                          <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
                            New Enquiries ({newEnquiries.length})
                          </div>
                          <div className="mt-1 space-y-1">
                            {newEnquiries.slice(0, 3).map((enq) => (
                              <div
                                key={enq._id}
                                onClick={() => {
                                  setDropdownOpen(false);
                                  navigate('/enquiries');
                                }}
                                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-darkbg-900/50 cursor-pointer transition text-left"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[70%]">
                                    {enq.fullName}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                                    {timeAgo(enq.createdAt)}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  Enquired about: <span className="font-semibold text-slate-600 dark:text-slate-300">{enq.productInterested || 'N/A'}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section: New Contact Messages */}
                      {newMessages.length > 0 && (
                        <div className="p-3">
                          <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-amber-500" />
                            New Messages ({newMessages.length})
                          </div>
                          <div className="mt-1 space-y-1">
                            {newMessages.slice(0, 3).map((msg) => (
                              <div
                                key={msg._id}
                                onClick={() => {
                                  setDropdownOpen(false);
                                  navigate('/contact');
                                }}
                                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-darkbg-900/50 cursor-pointer transition text-left"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[70%]">
                                    {msg.name}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                                    {timeAgo(msg.createdAt)}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  Subject: <span className="font-semibold text-slate-600 dark:text-slate-300">{msg.subject || 'N/A'}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer redirects */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-darkbg-900 border-t border-slate-100 dark:border-darkbg-700 grid grid-cols-2 divide-x divide-slate-100 dark:divide-darkbg-700 text-center text-xs font-bold text-slate-500 select-none">
                  <Link
                    to="/enquiries"
                    onClick={() => setDropdownOpen(false)}
                    className="hover:text-primary-500 transition cursor-pointer"
                  >
                    All Enquiries
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setDropdownOpen(false)}
                    className="hover:text-primary-500 transition cursor-pointer"
                  >
                    All Messages
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Light/Dark mode toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.02 }}
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-darkbg-700 hover:bg-slate-100 dark:hover:bg-darkbg-700 transition duration-300 shadow-sm cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </motion.button>

        {/* Profile indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-darkbg-900 border border-slate-100 dark:border-darkbg-700 transition duration-300 select-none">
          <div className="p-1 rounded-lg bg-primary-100 dark:bg-primary-950/40 text-primary-500">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {user?.username || 'Admin'}
          </span>
        </div>

        {/* Logout button */}
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.02 }}
          className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition duration-300 shadow-sm cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </div>
    </header>
  );
};

export default Header;
