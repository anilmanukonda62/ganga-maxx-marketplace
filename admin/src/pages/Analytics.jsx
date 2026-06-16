import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import { formatDate } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart2,
  Calendar,
  TrendingUp,
  Percent,
  ShoppingBag,
  ClipboardList,
  MessageSquare,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [timeFilter, setTimeFilter] = useState('7days'); // '7days' or '30days'

  const { theme } = useTheme();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [enquiriesRes, contactRes, productsRes] = await Promise.all([
        api.get('/enquiries'),
        api.get('/contact'),
        api.get('/products')
      ]);

      if (enquiriesRes.data.success) setEnquiries(enquiriesRes.data.data);
      if (contactRes.data.success) setContactMessages(contactRes.data.data);
      if (productsRes.data.success) setProducts(productsRes.data.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-12 w-48 bg-slate-200 dark:bg-darkbg-800 rounded-xl animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-darkbg-800 rounded-xl animate-pulse" />
        </div>
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white dark:bg-darkbg-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-white dark:bg-darkbg-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // --- STATS COMPUTATIONS ---
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  // Filter helper for last N days
  const getItemsInLastDays = (items, days) => {
    const cutoff = now.getTime() - days * oneDay;
    return items.filter(item => new Date(item.createdAt).getTime() >= cutoff);
  };

  const enquiries7Days = getItemsInLastDays(enquiries, 7);
  const enquiries30Days = getItemsInLastDays(enquiries, 30);

  // Conversion rate calculation: (Closed / Total) * 100
  const totalEnquiries = enquiries.length;
  const closedEnquiries = enquiries.filter(e => e.status === 'Closed').length;
  const conversionRate = totalEnquiries > 0 ? ((closedEnquiries / totalEnquiries) * 100).toFixed(1) : '0.0';

  // Most Enquired Product
  const productCounts = {};
  enquiries.forEach(e => {
    if (e.productInterested) {
      productCounts[e.productInterested] = (productCounts[e.productInterested] || 0) + 1;
    }
  });
  let mostEnquiredProduct = 'N/A';
  let maxEnquiriesCount = 0;
  Object.keys(productCounts).forEach(prod => {
    if (productCounts[prod] > maxEnquiriesCount) {
      maxEnquiriesCount = productCounts[prod];
      mostEnquiredProduct = prod;
    }
  });

  // --- CHART 1: Enquiries Over Time (last 7 or 30 days) ---
  const daysToGenerate = timeFilter === '7days' ? 7 : 30;
  const dailyDataMap = {};
  
  // Initialize map with zeroes for all days in range
  for (let i = daysToGenerate - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * oneDay);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyDataMap[dateStr] = { date: dateStr, New: 0, Closed: 0, Total: 0 };
  }

  // Populate data
  const relevantEnquiries = timeFilter === '7days' ? enquiries7Days : enquiries30Days;
  relevantEnquiries.forEach(e => {
    const dateStr = new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dailyDataMap[dateStr]) {
      dailyDataMap[dateStr].Total++;
      if (e.status === 'New') {
        dailyDataMap[dateStr].New++;
      } else if (e.status === 'Closed') {
        dailyDataMap[dateStr].Closed++;
      }
    }
  });
  const enquiriesOverTimeData = Object.values(dailyDataMap);

  // --- CHART 2: Status Breakdown ---
  const statusCounts = { New: 0, Contacted: 0, Closed: 0 };
  enquiries.forEach(e => {
    if (statusCounts[e.status] !== undefined) {
      statusCounts[e.status]++;
    }
  });
  const statusBreakdownData = [
    { name: 'New Lead', value: statusCounts.New, color: '#ef4444' },
    { name: 'Contacted', value: statusCounts.Contacted, color: '#f59e0b' },
    { name: 'Closed', value: statusCounts.Closed, color: '#10b981' }
  ].filter(item => item.value > 0);

  // --- CHART 3: Top 5 Enquired Products ---
  const topProductsData = Object.keys(productCounts)
    .map(name => ({ name, count: productCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- CHART 4: Category Wise Enquiries ---
  // Create product-to-category mapping
  const productToCategoryMap = {};
  products.forEach(p => {
    productToCategoryMap[p.name.toLowerCase().trim()] = p.category;
  });

  const categoryNames = {
    'cleaning-chemicals': 'Chemicals',
    'cleaning-tools-equipment': 'Tools',
    'mechanical-equipment': 'Mechanical',
    'washroom-supplies': 'Washroom',
    'eco-friendly-products': 'Eco-Friendly',
  };

  const categoryCounts = {
    'Chemicals': 0,
    'Tools': 0,
    'Mechanical': 0,
    'Washroom': 0,
    'Eco-Friendly': 0,
    'Uncategorized': 0
  };

  enquiries.forEach(e => {
    if (e.productInterested) {
      const prodKey = e.productInterested.toLowerCase().trim();
      const rawCategory = productToCategoryMap[prodKey];
      const friendlyCategory = categoryNames[rawCategory] || (rawCategory ? rawCategory.replace(/-/g, ' ') : 'Uncategorized');
      categoryCounts[friendlyCategory] = (categoryCounts[friendlyCategory] || 0) + 1;
    } else {
      categoryCounts['Uncategorized']++;
    }
  });

  const categoryWiseData = Object.keys(categoryCounts)
    .map(cat => ({ name: cat, count: categoryCounts[cat] }))
    .filter(item => item.count > 0);

  // --- TIMELINE: Combined recent activity ---
  const combinedActivity = [
    ...enquiries.map(e => ({
      id: e._id,
      type: 'enquiry',
      title: 'New Enquiry Lead',
      description: `${e.fullName} enquired about ${e.productInterested || 'a product'}`,
      date: new Date(e.createdAt),
      status: e.status
    })),
    ...contactMessages.map(m => ({
      id: m._id,
      type: 'message',
      title: 'Contact Feedback',
      description: `${m.name} submitted: "${m.subject}"`,
      date: new Date(m.createdAt),
      status: m.status
    }))
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  // Recharts custom tooltips / options based on theme
  const gridColor = theme === 'dark' ? '#334155' : '#f1f5f9';
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <div className="p-6 space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary-500" />
            Performance & Insights
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Deep-dive reports and analytical breakdown of Ganga Maxx catalog interaction.</p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto select-none">
          {/* Timeframe selector toggle */}
          <div className="flex bg-slate-100 dark:bg-darkbg-900 p-1 rounded-xl border border-slate-200/40 dark:border-darkbg-750">
            <button
              onClick={() => setTimeFilter('7days')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeFilter === '7days'
                  ? 'bg-white dark:bg-darkbg-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeFilter('30days')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeFilter === '30days'
                  ? 'bg-white dark:bg-darkbg-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 rounded-xl hover:bg-slate-50 dark:hover:bg-darkbg-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition shadow-xs"
            title="Refresh Analytics Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats row cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Enquiries This Week */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-xs flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Leads (Last 7D)</p>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{enquiries7Days.length}</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Total across products</p>
          </div>
        </motion.div>

        {/* Stat 2: Enquiries This Month */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-xs flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-purple-500 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Leads (Last 30D)</p>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{enquiries30Days.length}</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Monthly interaction count</p>
          </div>
        </motion.div>

        {/* Stat 3: Conversion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-xs flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Conversion Rate</p>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{conversionRate}%</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Closed leads vs total</p>
          </div>
        </motion.div>

        {/* Stat 4: Most Enquired Product */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-xs flex items-center gap-5 min-w-0"
        >
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Product</p>
            <h4 className="text-base font-bold text-slate-800 dark:text-white mt-1 truncate" title={mostEnquiredProduct}>
              {mostEnquiredProduct}
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {maxEnquiriesCount > 0 ? `${maxEnquiriesCount} active enquiries` : 'No lead records'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Row 1 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Enquiries Over Time Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Enquiries Over Time</h3>
              <p className="text-xs text-slate-400">Daily breakdown of newly submitted and closed leads.</p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enquiriesOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="date" stroke={textColor} fontSize={11} tickLine={false} />
                <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', background: theme === 'dark' ? '#1e293b' : '#fff', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="New" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Closed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Donut Chart */}
        <div className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Status Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Percentage allocation of enquiries progress states.</p>
          <div className="h-64 flex flex-col justify-center">
            {statusBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdownData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', background: theme === 'dark' ? '#1e293b' : '#fff', border: 'none' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 py-12 text-sm">No status data to represent.</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Enquired Products horizontal Bar Chart */}
        <div className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Top 5 Enquired Products</h3>
          <p className="text-xs text-slate-400 mb-4">Clicking on any product redirects to product search filters.</p>
          
          <div className="space-y-4">
            {topProductsData.map((prod, index) => {
              const percentages = maxEnquiriesCount > 0 ? (prod.count / maxEnquiriesCount) * 100 : 0;
              return (
                <div
                  key={prod.name}
                  onClick={() => navigate(`/products?search=${encodeURIComponent(prod.name)}`)}
                  className="group cursor-pointer p-3 rounded-2xl border border-slate-50 dark:border-darkbg-900 bg-slate-50/40 dark:bg-darkbg-900/10 hover:border-primary-100 dark:hover:border-primary-950 transition duration-200"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary-500 transition truncate max-w-[80%]">
                      {index + 1}. {prod.name}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      {prod.count} leads
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-darkbg-750 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentages}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="bg-primary-500 h-full rounded-full group-hover:bg-primary-400 transition"
                    />
                  </div>
                </div>
              );
            })}
            {topProductsData.length === 0 && (
              <div className="text-center text-slate-400 py-12 text-sm">No enquiry records.</div>
            )}
          </div>
        </div>

        {/* Category Wise Enquiries Chart */}
        <div className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Enquiries by Category</h3>
          <p className="text-xs text-slate-400 mb-4">Volume breakdown according to product category mappings.</p>
          <div className="h-64">
            {categoryWiseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryWiseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} />
                  <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', background: theme === 'dark' ? '#1e293b' : '#fff', border: 'none' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 py-12 text-sm">No category distribution data.</div>
            )}
          </div>
        </div>
      </div>

      {/* Combined Activity Timeline */}
      <div className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-450" />
          Recent Activity Feed
        </h3>
        <p className="text-xs text-slate-400 mb-6">Real-time chronicle combining client enquiries and contact feedback submissions.</p>

        <div className="relative pl-6 border-l border-slate-150 dark:border-darkbg-700 space-y-6">
          {combinedActivity.map((activity, idx) => {
            const isEnquiry = activity.type === 'enquiry';
            return (
              <div key={activity.id} className="relative">
                {/* Timeline Dot Indicator */}
                <div
                  className={`absolute -left-[31px] p-1.5 rounded-full border border-white dark:border-darkbg-800 text-white shadow-xs ${
                    isEnquiry ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                >
                  {isEnquiry ? (
                    <ClipboardList className="w-3 h-3" />
                  ) : (
                    <MessageSquare className="w-3 h-3" />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {activity.title}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase shrink-0">
                    {formatDate(activity.date)}
                  </span>
                </div>
              </div>
            );
          })}
          {combinedActivity.length === 0 && (
            <div className="text-center text-slate-400 py-12 text-sm pl-0">
              No recent notifications or activities logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
