import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddEditProduct from './pages/AddEditProduct';
import Enquiries from './pages/Enquiries';
import MultiEnquiries from './pages/MultiEnquiries';
import ContactMessages from './pages/ContactMessages';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Categories from './pages/Categories';

import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="flex-grow flex flex-col h-full"
  >
    {children}
  </motion.div>
);

// Admin layout wrapper
const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-darkbg-900 transition-colors duration-300">
      {/* Sidebar Component */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Frame */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden relative">
        <Header onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-darkbg-900 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function AppContent() {
  const location = useLocation();

  return (
    <>
      {/* Global toast notification system */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-darkbg-800 dark:text-white border dark:border-darkbg-700 font-medium text-sm rounded-xl',
          duration: 4000,
          success: {
            iconTheme: {
              primary: '#1a7a4c',
              secondary: '#fff',
            },
          },
        }}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Recovery/Auth Routes */}
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/verify-otp" element={<PageTransition><VerifyOTP /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

          {/* Protected Management Panel Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="analytics" element={<PageTransition><Analytics /></PageTransition>} />
            <Route path="products" element={<PageTransition><Products /></PageTransition>} />
            <Route path="products/add" element={<PageTransition><AddEditProduct /></PageTransition>} />
            <Route path="products/edit/:id" element={<PageTransition><AddEditProduct /></PageTransition>} />
            <Route path="categories" element={<PageTransition><Categories /></PageTransition>} />
            <Route path="enquiries" element={<PageTransition><Enquiries /></PageTransition>} />
            <Route path="multi-enquiries" element={<PageTransition><MultiEnquiries /></PageTransition>} />
            <Route path="contact" element={<PageTransition><ContactMessages /></PageTransition>} />
            <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
