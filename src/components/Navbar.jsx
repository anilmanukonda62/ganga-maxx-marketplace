import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import productsData from '../data/products.json';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Listen to scroll to apply sticky styles (shadow + backdrop blur)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on path change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Enquiry', path: '/enquiry' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 w-full ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-950/95 shadow-md shadow-slate-100/30 dark:shadow-black/20 backdrop-blur-md py-3'
          : 'bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/50 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={productsData.logo}
              alt="Ganga Maxx Marketplace Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg border border-slate-100 dark:border-slate-800 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">
                Ganga Maxx
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-semibold tracking-wide transition-colors relative py-1 ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Action buttons (Theme Toggle, Enquiry CTAs) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200"
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Enquire Now CTA */}
            <button
              onClick={() => navigate('/enquiry')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 rounded-xl shadow-md shadow-brand-600/10 active:scale-95 transition-all duration-200"
            >
              <Send size={14} />
              Enquire Now
            </button>
          </div>

          {/* Mobile Actions: Hamburger Menu & Theme Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200"
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200"
              aria-label="Open menu drawer"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-In Navigation Drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`fixed top-0 bottom-0 right-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-out transform ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Navigation</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-base font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 font-bold'
                        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/enquiry');
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 rounded-xl shadow-lg shadow-brand-600/10 transition-all duration-200"
            >
              <Send size={15} />
              Enquire Now
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
