import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import StatCard from '../components/StatCard';
import { formatDate, formatPrice, exportToCSV } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';
import {
  Package,
  ClipboardList,
  Mail,
  AlertTriangle,
  FileText,
  TrendingUp,
  RefreshCw,
  Edit2,
  Plus,
  MessageSquare,
  Download,
  Globe
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const MotionLink = motion(Link);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStockId, setUpdatingStockId] = useState(null);

  const { theme } = useTheme();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 300, damping: 25 } 
    }
  };

  const tableContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.2 } 
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, enquiriesRes, productsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/enquiries'),
        api.get('/products')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (enquiriesRes.data.success) setEnquiries(enquiriesRes.data.data);
      if (productsRes.data.success) setProducts(productsRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard metrics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Stock Status Inline
  const handleStockUpdate = async (productId, currentProduct, newStatus) => {
    setUpdatingStockId(productId);
    try {
      const payload = {
        name: currentProduct.name,
        category: currentProduct.category,
        image: currentProduct.image,
        price: currentProduct.price,
        description: currentProduct.description,
        stock: {
          status: newStatus,
          count: newStatus === 'low_stock' ? 5 : newStatus === 'in_stock' ? 50 : 0
        }
      };

      const response = await api.put(`/products/${productId}`, payload);
      if (response.data.success) {
        toast.success(`Stock status updated to ${newStatus.replace('_', ' ')}`);
        // Refresh data
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update stock status');
      console.error(error);
    } finally {
      setUpdatingStockId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <CardSkeleton count={8} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white dark:bg-darkbg-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-white dark:bg-darkbg-800 rounded-2xl animate-pulse" />
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  // Aggregate Enquiry Data for Bar Chart
  const enquiriesCount = { New: 0, Contacted: 0, Closed: 0 };
  enquiries.forEach((e) => {
    if (enquiriesCount[e.status] !== undefined) {
      enquiriesCount[e.status]++;
    }
  });

  const chartEnquiriesData = [
    { name: 'New', count: enquiriesCount.New, fill: '#ef4444' },
    { name: 'Contacted', count: enquiriesCount.Contacted, fill: '#f59e0b' },
    { name: 'Closed', count: enquiriesCount.Closed, fill: '#10b981' }
  ];

  // Aggregate Product Data for Donut Chart
  const categoryCounts = {};
  const categoryNames = {
    'cleaning-chemicals': 'Cleaning Chemicals',
    'cleaning-tools-equipment': 'Cleaning Tools',
    'mechanical-equipment': 'Mechanical Equipment',
    'washroom-supplies': 'Washroom Supplies',
    'eco-friendly-products': 'Eco-Friendly',
  };

  products.forEach((p) => {
    const catLabel = categoryNames[p.category] || p.category;
    categoryCounts[catLabel] = (categoryCounts[catLabel] || 0) + 1;
  });

  const chartProductsData = Object.keys(categoryCounts).map((catName) => ({
    name: catName,
    value: categoryCounts[catName]
  }));

  const COLORS = ['#1a7a4c', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

  // Low or Out of Stock Alerts
  const stockAlerts = products.filter(
    (p) => p.stock?.status === 'low_stock' || p.stock?.status === 'out_of_stock'
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome to the Ganga Maxx Marketplace admin command center.</p>
        </div>
        <motion.button
          onClick={fetchData}
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 rounded-xl hover:bg-slate-50 dark:hover:bg-darkbg-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Stats
        </motion.button>
      </div>

      {/* 8 StatCards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={Package}
            color="blue"
            link="/products"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Enquiries"
            value={stats?.totalEnquiries || 0}
            icon={ClipboardList}
            color="purple"
            link="/enquiries"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="New Enquiries"
            value={stats?.newEnquiries || 0}
            icon={ClipboardList}
            color="red"
            link="/enquiries?status=New"
            highlight={stats?.newEnquiries > 0}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Multi Enquiries"
            value={stats?.totalMultiEnquiries || 0}
            icon={ClipboardList}
            color="purple"
            link="/multi-enquiries"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="New Multi Enquiries"
            value={stats?.newMultiEnquiries || 0}
            icon={ClipboardList}
            color="red"
            link="/multi-enquiries?status=New"
            highlight={stats?.newMultiEnquiries > 0}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Low Stock Products"
            value={stats?.lowStockProducts || 0}
            icon={AlertTriangle}
            color="orange"
            link="/products?stock=low_stock"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Out of Stock Products"
            value={stats?.outOfStockProducts || 0}
            icon={AlertTriangle}
            color="red"
            link="/products?stock=out_of_stock"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="New Contact Messages"
            value={stats?.newContactMessages || 0}
            icon={Mail}
            color="teal"
            link="/contact"
          />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enquiries Overview Bar Chart */}
        <motion.div 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)' }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm"
        >
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Enquiries Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartEnquiriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartEnquiriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Products by Category Donut Chart */}
        <motion.div 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)' }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm"
        >
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Products by Category</h3>
          <div className="h-72 flex flex-col justify-center">
            {chartProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartProductsData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartProductsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 py-12 text-sm">No category distribution data.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Enquiries Table */}
        <motion.div 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)' }}
          transition={{ duration: 0.3 }}
          className="xl:col-span-2 bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Enquiries</h3>
              <MotionLink
                to="/enquiries"
                whileHover={{ scale: 1.02 }}
                className="text-xs font-bold text-primary-500 hover:text-primary-600 transition inline-block cursor-pointer"
              >
                View All
              </MotionLink>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-darkbg-700 text-xs font-bold text-slate-400 uppercase">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Product</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <motion.tbody 
                  variants={tableContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-slate-50 dark:divide-darkbg-700/50 text-sm"
                >
                  {enquiries.slice(0, 5).map((enq) => (
                    <motion.tr 
                      key={enq._id} 
                      variants={tableRowVariants}
                      className="hover:bg-slate-50/50 dark:hover:bg-darkbg-900/30"
                    >
                      <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {formatDate(enq.createdAt)}
                      </td>
                      <td className="py-3 font-semibold text-slate-700 dark:text-slate-200">
                        {enq.fullName}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">
                        {enq.companyName}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                        {enq.productInterested || 'N/A'}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            enq.status === 'New'
                              ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                              : enq.status === 'Contacted'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                              : 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                          }`}
                        >
                          {enq.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {enquiries.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        No recent enquiries found.
                      </td>
                    </tr>
                  )}
                </motion.tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Stock Alerts Section */}
        <motion.div 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)' }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm"
        >
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Stock Alerts</h3>
          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
            {stockAlerts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 dark:border-darkbg-700 bg-slate-50/50 dark:bg-darkbg-900/10 hover:border-slate-200 dark:hover:border-darkbg-600 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 bg-white border border-slate-100 dark:border-darkbg-700"
                    onError={(e) => {
                      e.target.src = 'https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{prod.name}</p>
                    <p className="text-[11px] text-slate-400 capitalize">{prod.category.replace(/-/g, ' ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      prod.stock?.status === 'out_of_stock'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                        : 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400'
                    }`}
                  >
                    {prod.stock?.status === 'out_of_stock' ? 'Out' : 'Low'}
                  </span>

                  {/* Stock Quick Update Dropdown */}
                  <select
                    disabled={updatingStockId === prod.id}
                    value={prod.stock?.status}
                    onChange={(e) => handleStockUpdate(prod.id, prod, e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-750 text-slate-600 dark:text-slate-300 rounded-lg p-1 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-darkbg-600"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            ))}
            {stockAlerts.length === 0 && (
              <div className="text-center text-slate-400 py-12 text-sm">
                All products are fully in stock! 🎉
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Grid Section */}
      <motion.div 
        whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)' }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm"
      >
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Quick Admin Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Action 1: Add Product */}
          <MotionLink
            to="/products/add"
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-darkbg-700 hover:border-primary-200 dark:hover:border-primary-950 bg-slate-50/50 dark:bg-darkbg-900/10 hover:bg-slate-100/50 dark:hover:bg-darkbg-900/30 transition duration-300 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 group-hover:scale-110 transition duration-300">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Add Product</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Insert catalog items</p>
            </div>
          </MotionLink>

          {/* Action 2: View New Enquiries */}
          <MotionLink
            to="/enquiries?status=New"
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-darkbg-700 hover:border-primary-200 dark:hover:border-primary-950 bg-slate-50/50 dark:bg-darkbg-900/10 hover:bg-slate-100/50 dark:hover:bg-darkbg-900/30 transition duration-300 group relative cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 group-hover:scale-110 transition duration-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">New Enquiries</p>
                {stats?.newEnquiries > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-red-500 text-white leading-none">
                    {stats.newEnquiries}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">View fresh sales leads</p>
            </div>
          </MotionLink>

          {/* Action 4: Preview Website */}
          <motion.a
            onClick={() => window.open(import.meta.env.DEV ? 'http://localhost:5174' : 'https://ganga-maxx-marketplace.vercel.app', '_blank')}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-darkbg-700 hover:border-primary-200 dark:hover:border-primary-950 bg-slate-50/50 dark:bg-darkbg-900/10 hover:bg-slate-100/50 dark:hover:bg-darkbg-900/30 transition duration-300 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 group-hover:scale-110 transition duration-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">View Website</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Preview public layout</p>
            </div>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
