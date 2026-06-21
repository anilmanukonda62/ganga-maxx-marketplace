/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Sparkles } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PRESET_EMOJIS = ['🧴', '🧹', '⚙️', '🚻', '🌿', '📦', '🧽', '🧤', '🪣', '🧻', '🧼', '🚿'];

export const AddEditCategoryModal = ({ isOpen, onClose, category, onSaved }) => {
  const isEditMode = !!category;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setName(category.name || '');
        setIcon(category.icon || '📦');
        setDescription(category.description || '');
      } else {
        setName('');
        setIcon('📦');
        setDescription('');
      }
      setErrors({});
    }
  }, [isOpen, category, isEditMode]);

  if (!isOpen) return null;

  // Slug preview generator matching slugify helper on backend
  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Category name is required';
    if (!description.trim()) tempErrors.description = 'Category description is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        icon,
        description
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/categories/${category.id}`, payload);
      } else {
        response = await api.post('/categories', payload);
      }

      if (response.data.success) {
        toast.success(`Category ${isEditMode ? 'updated' : 'created'} successfully!`);
        if (onSaved) onSaved(response.data.data);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred while saving category');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-lg bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkbg-700 px-6 py-4 shrink-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-primary-500" />
              {isEditMode ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-darkbg-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
            {/* Category Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Washroom Supplies"
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-darkbg-900 border ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-darkbg-700 focus:ring-primary-500'
                } text-slate-900 dark:text-white rounded-xl outline-none text-sm transition`}
              />
              {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name}</p>}

              {/* Slug Preview */}
              {name.trim() && (
                <div className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 font-mono">
                  Slug ID preview: <span className="font-bold text-primary-600 dark:text-primary-400">/products?category={generateSlug(name)}</span>
                </div>
              )}
            </div>

            {/* Emoji Icon Picker */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category Icon (Emoji) *</label>
              <div className="flex gap-4 items-center">
                {/* Large Preview */}
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 flex items-center justify-center text-3xl shadow-sm shrink-0">
                  {icon}
                </div>
                {/* Emoji Selection List */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition ${
                        icon === emoji
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-darkbg-900 hover:bg-slate-100 dark:hover:bg-darkbg-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                  {/* Manual typing fallback */}
                  <input
                    type="text"
                    maxLength={2}
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Other"
                    className="w-12 h-8 px-1 text-center bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 rounded-lg text-xs font-semibold outline-none focus:border-primary-500"
                    title="Or type custom emoji"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description *</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief summary of the category products..."
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-darkbg-900 border ${
                  errors.description ? 'border-red-500' : 'border-slate-200 dark:border-darkbg-700'
                } text-slate-900 dark:text-white rounded-xl outline-none text-sm transition resize-none`}
              />
              {errors.description && <p className="text-xs font-semibold text-red-500">{errors.description}</p>}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-darkbg-700 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4.5 py-2 border border-slate-200 dark:border-darkbg-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-darkbg-700 transition font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddEditCategoryModal;
