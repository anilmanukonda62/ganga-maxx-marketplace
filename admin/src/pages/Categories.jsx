/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import AddEditCategoryModal from '../components/AddEditCategoryModal';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

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
      const [categoriesRes, productsRes] = await Promise.all([
        api.get('/categories/all'),
        api.get('/products')
      ]);

      if (categoriesRes.data.success) {
        // Sort by displayOrder ascending
        const sorted = categoriesRes.data.data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setCategories(sorted);
      }
      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load categories catalog');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Soft-hide toggle isActive
  const handleToggleActive = async (cat) => {
    setActionInProgress(cat.id);
    try {
      const response = await api.put(`/categories/${cat.id}/toggle-active`);
      if (response.data.success) {
        toast.success(`Category "${cat.name}" is now ${response.data.data.isActive ? 'active' : 'hidden'}`);
        setCategories(prev =>
          prev.map(c => c.id === cat.id ? { ...c, isActive: response.data.data.isActive } : c)
        );
      }
    } catch (error) {
      toast.error('Failed to toggle category status');
      console.error(error);
    } finally {
      setActionInProgress(null);
    }
  };

  // Reorder sequencer
  const handleMoveOrder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const catA = { ...categories[index] };
    const catB = { ...categories[targetIndex] };

    const tempOrder = catA.displayOrder;
    catA.displayOrder = catB.displayOrder;
    catB.displayOrder = tempOrder;

    // Optimistic UI update
    const updated = [...categories];
    updated[index] = catB;
    updated[targetIndex] = catA;
    setCategories(updated);

    try {
      // Save swap to DB
      await Promise.all([
        api.put(`/categories/${catA.id}`, { displayOrder: catA.displayOrder }),
        api.put(`/categories/${catB.id}`, { displayOrder: catB.displayOrder })
      ]);
      toast.success('Sequence order updated!');
    } catch (error) {
      toast.error('Failed to save order sequencing');
      console.error(error);
      fetchData(); // rollback
    }
  };

  // Delete Category handlers
  const openDeleteModal = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCategoryToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const response = await api.delete(`/categories/${categoryToDelete.id}`);
      if (response.data.success) {
        toast.success('Category deleted successfully!');
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      }
    } catch (error) {
      // Show descriptive assigned products error from backend
      toast.error(error.response?.data?.message || 'Failed to delete category');
      console.error(error);
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Category Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-darkbg-700 text-slate-600 dark:text-slate-300">
              {categories.length} categories
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage B2B catalog categories, icons, search mapping, and display sequences.</p>
        </div>
        <motion.button
          onClick={() => {
            setSelectedCategory(null);
            setModalOpen(true);
          }}
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Category
        </motion.button>
      </div>

      {/* Table Content */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <div className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-darkbg-900/30 border-b border-slate-100 dark:border-darkbg-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 w-16 text-center">Order</th>
                  <th className="p-4 w-16 text-center">Icon</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-center">Associated Products</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={tableContainerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-100 dark:divide-darkbg-700/50 text-sm"
              >
                {categories.map((cat, idx) => {
                  const productCount = products.filter(p => p.category === cat.id).length;
                  return (
                    <motion.tr
                      key={cat._id}
                      variants={tableRowVariants}
                      className="hover:bg-slate-50/50 dark:hover:bg-darkbg-900/10"
                    >
                      {/* Move Order arrows */}
                      <td className="p-4">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <button
                            onClick={() => handleMoveOrder(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 text-slate-400 hover:text-slate-650 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(idx, 'down')}
                            disabled={idx === categories.length - 1}
                            className="p-0.5 text-slate-400 hover:text-slate-650 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      {/* Emoji Icon */}
                      <td className="p-4 text-center text-2xl font-sans">
                        {cat.icon}
                      </td>
                      {/* Name */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{cat.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</div>
                      </td>
                      {/* Description */}
                      <td className="p-4 text-slate-500 dark:text-slate-400 max-w-sm truncate" title={cat.description}>
                        {cat.description}
                      </td>
                      {/* Product Count */}
                      <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {productCount}
                      </td>
                      {/* Active Status Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          disabled={actionInProgress === cat.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none cursor-pointer transition ${
                            cat.isActive
                              ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                              : 'bg-slate-100 text-slate-400 dark:bg-darkbg-700 dark:text-slate-500'
                          }`}
                          title="Toggle active status"
                        >
                          {cat.isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Hidden
                            </>
                          )}
                        </button>
                      </td>
                      {/* Edit / Delete Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            onClick={() => {
                              setSelectedCategory(cat);
                              setModalOpen(true);
                            }}
                            whileHover={{ scale: 1.05 }}
                            className="p-1.5 rounded-lg border border-slate-250 dark:border-darkbg-700 text-slate-550 hover:text-primary-500 hover:bg-slate-50 dark:hover:bg-darkbg-900 transition cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => openDeleteModal(cat)}
                            whileHover={{ scale: 1.05 }}
                            className="p-1.5 rounded-lg border border-slate-250 dark:border-darkbg-700 text-slate-550 hover:text-red-500 hover:bg-red-50 dark:hover:bg-darkbg-900 transition cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <AlertCircle className="w-8 h-8" />
                        <span>No categories found in the database.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit/Add Category Modal */}
      <AddEditCategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSaved={fetchData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to permanently delete category "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default Categories;
