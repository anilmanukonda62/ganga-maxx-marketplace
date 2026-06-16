import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import { formatPrice } from '../utils/helpers';
import { Search, Plus, Edit2, Trash2, SlidersHorizontal, AlertCircle, Printer } from 'lucide-react';

const MotionLink = motion(Link);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Categories mapping
  const categoryNames = {
    'cleaning-chemicals': 'Cleaning Chemicals',
    'cleaning-tools-equipment': 'Cleaning Tools & Equipment',
    'mechanical-equipment': 'Mechanical Equipment',
    'washroom-supplies': 'Washroom Supplies',
    'eco-friendly-products': 'Eco-Friendly Products',
  };

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStock, setSelectedStock] = useState('All');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [updatingStockId, setUpdatingStockId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

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

  // Parse stock pre-filter query & search query parameter on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const stockParam = params.get('stock');
    if (stockParam) {
      setSelectedStock(stockParam);
    } else {
      setSelectedStock('All');
    }

    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to retrieve products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Inline Stock Update
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
        // Refresh local state without reloading everything
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: response.data.data.stock } : p))
        );
      }
    } catch (error) {
      toast.error('Failed to update stock status');
      console.error(error);
    } finally {
      setUpdatingStockId(null);
    }
  };

  // Delete confirmation handlers
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const response = await api.delete(`/products/${productToDelete.id}`);
      if (response.data.success) {
        toast.success('Product deleted successfully');
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
      console.error(error);
    } finally {
      closeDeleteModal();
    }
  };

  // Client-side search and filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    
    const matchesStock = selectedStock === 'All' || p.stock?.status === selectedStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Printable Report Header */}
      <div className="hidden print:block print-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ganga Maxx Marketplace</h1>
            <p className="text-xs text-slate-500">Official Product Catalog Admin System</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-primary-600">Products Catalog Inventory</p>
            <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
            <p>Category Filter: {selectedCategory}</p>
            <p>Stock Filter: {selectedStock}</p>
          </div>
        </div>
      </div>

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Products Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add, edit, update, or remove marketplace catalog products.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <motion.button
            onClick={() => window.print()}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 rounded-xl hover:bg-slate-50 dark:hover:bg-darkbg-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition shadow-xs cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            Export PDF
          </motion.button>
          <MotionLink
            to="/products/add"
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm transition shadow-md shadow-primary-500/15 cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </MotionLink>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center print:hidden">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center w-5 h-5 text-slate-400 my-auto pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-white rounded-xl outline-none text-sm transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap w-full md:w-auto gap-4 items-center shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
            Filters:
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 text-slate-700 dark:text-slate-250 text-sm font-semibold rounded-xl px-3 py-2.5 outline-none hover:border-slate-350 dark:hover:border-darkbg-600 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {Object.keys(categoryNames).map((key) => (
              <option key={key} value={key}>
                {categoryNames[key]}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 text-slate-700 dark:text-slate-250 text-sm font-semibold rounded-xl px-3 py-2.5 outline-none hover:border-slate-350 dark:hover:border-darkbg-600 cursor-pointer"
          >
            <option value="All">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : (
        <div className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-darkbg-900/30 border-b border-slate-100 dark:border-darkbg-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4 w-16 print:hidden">Image</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={tableContainerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-100 dark:divide-darkbg-700/50 text-sm"
              >
                {filteredProducts.map((p, idx) => (
                  <motion.tr 
                    key={p.id} 
                    variants={tableRowVariants}
                    className="hover:bg-slate-50/50 dark:hover:bg-darkbg-900/10"
                  >
                    <td className="p-4 text-center text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="p-4 print:hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-100 dark:border-darkbg-700 shadow-xs"
                        onError={(e) => {
                          e.target.src = 'https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png';
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={p.name}>
                        {p.name}
                      </div>
                      {p.priceLabel && (
                        <div className="text-[11px] text-slate-400">{p.priceLabel}</div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 capitalize">
                      {categoryNames[p.category] || p.category}
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                      {formatPrice(p.price)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                            p.stock?.status === 'in_stock'
                              ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                              : p.stock?.status === 'low_stock'
                              ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400'
                              : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                          }`}
                        >
                          {p.stock?.status === 'in_stock'
                            ? 'In Stock'
                            : p.stock?.status === 'low_stock'
                            ? 'Low Stock'
                            : 'Out of Stock'}
                        </span>

                        {/* Inline Stock Update Dropdown */}
                        <select
                          disabled={updatingStockId === p.id}
                          value={p.stock?.status || 'in_stock'}
                          onChange={(e) => handleStockUpdate(p.id, p, e.target.value)}
                          className="text-xs bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 text-slate-500 rounded-md p-1 outline-none hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer print:hidden"
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="low_stock">Low Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 text-center print:hidden">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <motion.button
                          onClick={() => navigate(`/products/edit/${p.id}`)}
                          whileHover={{ scale: 1.02 }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-darkbg-700 text-slate-500 hover:text-primary-500 hover:border-primary-200 dark:hover:border-primary-950 hover:bg-slate-50 dark:hover:bg-darkbg-900 transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        {/* Delete Button */}
                        <motion.button
                          onClick={() => openDeleteModal(p)}
                          whileHover={{ scale: 1.02 }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-darkbg-700 text-slate-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-950 hover:bg-red-50 dark:hover:bg-darkbg-900 transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <AlertCircle className="w-8 h-8" />
                        <span>No products found matching filters or search query.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This catalog entry will be permanently removed.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default Products;
