import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BarChart2,
  Package,
  ClipboardList,
  Mail,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  ListChecks,
  Layers
} from 'lucide-react';

const MotionNavLink = motion(NavLink);

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  
  // Desktop collapse state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', isCollapsed);
  }, [isCollapsed]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Enquiries', path: '/enquiries', icon: ClipboardList },
    { name: 'Multi-Product Enquiries', path: '/multi-enquiries', icon: ListChecks },
    { name: 'Contact Messages', path: '/contact', icon: Mail },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarVariants = {
    expanded: { width: 240, transition: { duration: 0.3, ease: 'easeInOut' } },
    collapsed: { width: 70, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Sidebar Header */}
      <div className={`flex items-center p-4 border-b border-slate-800 shrink-0 h-[73px] ${(!isCollapsed || mobile) ? 'justify-between' : 'justify-center'}`}>
        {(!isCollapsed || mobile) ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png"
              alt="Ganga Maxx Logo"
              className="h-8 rounded"
            />
            <span className="font-bold text-white tracking-wider text-base whitespace-nowrap">
              Ganga Maxx
            </span>
          </div>
        ) : (
          <img
            src="https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png"
            alt="Ganga Maxx Logo"
            className="h-8 rounded shrink-0"
          />
        )}

        {/* Mobile close button */}
        {mobile && (
          <motion.button
            onClick={() => setIsMobileOpen(false)}
            whileHover={{ scale: 1.02 }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <MotionNavLink
              key={item.path}
              to={item.path}
              onClick={() => mobile && setIsMobileOpen(false)}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition duration-200 group relative ${
                  isActive
                    ? 'bg-primary-500 text-white font-semibold shadow-md shadow-primary-500/10'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {(!isCollapsed || mobile) ? (
                <span className="text-sm font-medium whitespace-nowrap truncate duration-200">
                  {item.name}
                </span>
              ) : (
                /* Hover tooltip for collapsed state */
                <span className="absolute left-16 bg-slate-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg border border-slate-800">
                  {item.name}
                </span>
              )}
            </MotionNavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-900/50">
        {(!isCollapsed || mobile) ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/40">
            <div className="overflow-hidden min-w-0">
              <p className="text-xs text-slate-500 font-semibold uppercase">Logged in as</p>
              <p className="text-sm font-bold text-white truncate">{user?.username || 'admin'}</p>
            </div>
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.02 }}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-center w-full py-3 rounded-xl hover:bg-red-950/20 text-slate-400 hover:text-red-400 transition group relative cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="absolute left-16 bg-slate-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg border border-slate-800">
              Logout
            </span>
          </motion.button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={isCollapsed ? 'collapsed' : 'expanded'}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        className="hidden lg:block h-screen shrink-0 sticky top-0 left-0 relative z-30 shadow-xl"
      >
        <SidebarContent />
        
        {/* Collapse toggle handle */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.02 }}
          className="absolute top-[20px] -right-3.5 bg-slate-900 hover:bg-primary-500 border border-slate-800 hover:border-primary-400 text-slate-400 hover:text-white p-1 rounded-full shadow-lg transition duration-200 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </motion.div>

      {/* Mobile Drawer (with backdrop) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            {/* Slide-in sidebar container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-60 h-full shadow-2xl z-10"
            >
              <SidebarContent mobile={true} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
