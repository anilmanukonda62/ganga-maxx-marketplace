import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import { ArrowLeft, Plus, Trash2, Save, X, ImageIcon, AlertCircle } from 'lucide-react';

const AddEditProduct = () => {
  const { id } = useParams(); // Numeric ID for edit mode
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Form Fields State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('cleaning-chemicals');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [priceLabel, setPriceLabel] = useState('Price per unit');
  const [stockStatus, setStockStatus] = useState('in_stock');
  const [stockCount, setStockCount] = useState('');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState([{ label: '', price: '' }]);

  // Validation States
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchProductDetails = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/products/${id}`);
          if (response.data.success) {
            const prod = response.data.data;
            setName(prod.name || '');
            setCategory(prod.category || 'cleaning-chemicals');
            setImage(prod.image || '');
            setPrice(prod.price !== undefined ? prod.price : '');
            setPriceLabel(prod.priceLabel || 'Price per unit');
            setStockStatus(prod.stock?.status || 'in_stock');
            setStockCount(prod.stock?.count !== undefined ? prod.stock.count : '');
            setDescription(prod.description || '');
            setVariants(prod.variants?.length ? prod.variants : [{ label: '', price: '' }]);
          }
        } catch (error) {
          toast.error('Product not found or failed to load');
          navigate('/products');
        } finally {
          setLoading(false);
        }
      };

      fetchProductDetails();
    }
  }, [id, isEditMode, navigate]);

  // Handle variants array updates
  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariantRow = () => {
    setVariants([...variants, { label: '', price: '' }]);
  };

  const removeVariantRow = (index) => {
    if (variants.length <= 1) {
      toast.error('At least one product variant is required');
      return;
    }
    const updated = variants.filter((_, idx) => idx !== index);
    setVariants(updated);
  };

  // Live image URL update
  const handleImageUrlChange = (val) => {
    setImage(val);
    setImageError(false);
  };

  // Perform form validations
  const validateForm = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Product name is required';
    if (!image.trim()) tempErrors.image = 'Image URL is required';
    
    if (price === '' || isNaN(price) || Number(price) < 0) {
      tempErrors.price = 'Valid price is required';
    }

    if (stockStatus === 'low_stock' && (stockCount === '' || isNaN(stockCount) || Number(stockCount) < 0)) {
      tempErrors.stockCount = 'Valid stock count is required for low stock alert';
    }

    if (!description.trim()) tempErrors.description = 'Product description is required';

    // Validate variants
    const variantErrors = [];
    variants.forEach((v, idx) => {
      const vErr = {};
      if (!v.label.trim()) vErr.label = 'Label required';
      if (v.price === '' || isNaN(v.price) || Number(v.price) < 0) vErr.price = 'Valid price required';
      if (Object.keys(vErr).length > 0) {
        variantErrors[idx] = vErr;
      }
    });

    if (variantErrors.length > 0) {
      tempErrors.variants = variantErrors;
    }

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
        category,
        image,
        price: Number(price),
        priceLabel,
        description,
        stock: {
          status: stockStatus,
          count: stockStatus === 'low_stock' ? Number(stockCount) : stockStatus === 'in_stock' ? 50 : 0
        },
        variants: variants.map((v) => ({ label: v.label, price: Number(v.price) }))
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/products/${id}`, payload);
      } else {
        response = await api.post('/products', payload);
      }

      if (response.data.success) {
        toast.success(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error occurred while saving product');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <DetailSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header and Back Button */}
      <div className="flex items-center gap-3">
        <Link
          to="/products"
          className="p-2 rounded-xl bg-white dark:bg-darkbg-800 border border-slate-200 dark:border-darkbg-700 text-slate-500 hover:text-slate-700 dark:hover:text-white transition shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isEditMode ? 'Modify catalog metadata details and variant options.' : 'Create a brand new catalog entry.'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ganga Maxx Floor Cleaner Super"
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-darkbg-900 border ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-darkbg-700 focus:ring-primary-500'
              } text-slate-900 dark:text-white rounded-xl outline-none text-sm transition`}
            />
            {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name}</p>}
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 text-slate-900 dark:text-white rounded-xl outline-none text-sm cursor-pointer"
            >
              <option value="cleaning-chemicals">Cleaning Chemicals</option>
              <option value="cleaning-tools-equipment">Cleaning Tools & Equipment</option>
              <option value="mechanical-equipment">Mechanical Equipment</option>
              <option value="washroom-supplies">Washroom Supplies</option>
              <option value="eco-friendly-products">Eco-Friendly Products</option>
            </select>
          </div>

          {/* Base Price */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Base Price (₹) *</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 1499"
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-darkbg-900 border ${
                errors.price ? 'border-red-500' : 'border-slate-200 dark:border-darkbg-700 focus:ring-primary-500'
              } text-slate-900 dark:text-white rounded-xl outline-none text-sm`}
            />
            {errors.price && <p className="text-xs font-semibold text-red-500">{errors.price}</p>}
          </div>

          {/* Price Label */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Price Label</label>
            <input
              type="text"
              value={priceLabel}
              onChange={(e) => setPriceLabel(e.target.value)}
              placeholder="e.g. Price per unit or Price per 5L"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 text-slate-900 dark:text-white rounded-xl outline-none text-sm"
            />
          </div>

          {/* Stock Status Dropdown */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stock Status *</label>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 text-slate-900 dark:text-white rounded-xl outline-none text-sm cursor-pointer"
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Stock Count (Conditional) */}
          {stockStatus === 'low_stock' && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stock Count *</label>
              <input
                type="text"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                placeholder="e.g. 5"
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-darkbg-900 border ${
                  errors.stockCount ? 'border-red-500' : 'border-slate-200 dark:border-darkbg-700'
                } text-slate-900 dark:text-white rounded-xl outline-none text-sm`}
              />
              {errors.stockCount && <p className="text-xs font-semibold text-red-500">{errors.stockCount}</p>}
            </div>
          )}
        </div>

        {/* Image URL Input & Preview */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Image URL *</label>
            <input
              type="text"
              value={image}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="e.g. https://res.cloudinary.com/... or image link"
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-darkbg-900 border ${
                errors.image ? 'border-red-500' : 'border-slate-200 dark:border-darkbg-700'
              } text-slate-900 dark:text-white rounded-xl outline-none text-sm`}
            />
            {errors.image && <p className="text-xs font-semibold text-red-500">{errors.image}</p>}
          </div>

          {/* LIVE PREVIEW BOX */}
          <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-2xl bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700">
            <div className="w-24 h-24 rounded-xl border border-slate-200 dark:border-darkbg-750 bg-white flex items-center justify-center shrink-0 overflow-hidden relative">
              {image && !imageError ? (
                <img
                  src={image}
                  alt="Live Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                  <ImageIcon className="w-8 h-8" />
                  <span>No image</span>
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Live Image Preview</span>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[400px]">
                {imageError ? (
                  <span className="text-red-500 font-semibold inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Invalid image URL. Please paste a valid web-hosted image URL.
                  </span>
                ) : (
                  'Image preview loads in real-time as you paste a Cloudinary or other secure asset URL.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="space-y-3 border-t border-slate-100 dark:border-darkbg-700 pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Product Variants</h3>
              <p className="text-xs text-slate-400">Provide at least 1 pricing variant (e.g. "5 Litres Cannister" / "500").</p>
            </div>
            <button
              type="button"
              onClick={addVariantRow}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-primary-200 dark:border-primary-900 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20 font-bold text-xs rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add Variant
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, index) => (
              <div key={index} className="flex gap-4 items-center">
                {/* Variant Label */}
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={v.label}
                    onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                    placeholder="e.g. 5 Litre Can or 1 Unit"
                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-darkbg-900 border ${
                      errors.variants?.[index]?.label ? 'border-red-500' : 'border-slate-200 dark:border-darkbg-700'
                    } text-slate-900 dark:text-white rounded-xl outline-none text-xs`}
                  />
                  {errors.variants?.[index]?.label && (
                    <p className="text-[10px] font-semibold text-red-500">{errors.variants[index].label}</p>
                  )}
                </div>

                {/* Variant Price */}
                <div className="w-36 space-y-1">
                  <input
                    type="text"
                    value={v.price}
                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                    placeholder="Price (₹)"
                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-darkbg-900 border ${
                      errors.variants?.[index]?.price ? 'border-red-500' : 'border-slate-200 dark:border-darkbg-700'
                    } text-slate-900 dark:text-white rounded-xl outline-none text-xs`}
                  />
                  {errors.variants?.[index]?.price && (
                    <p className="text-[10px] font-semibold text-red-500">{errors.variants[index].price}</p>
                  )}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeVariantRow(index)}
                  disabled={variants.length <= 1}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-30 transition"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Description textarea */}
        <div className="space-y-1.5 border-t border-slate-100 dark:border-darkbg-700 pt-6">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description *</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed description of the product chemical formulation, application, safety warnings etc."
            className={`w-full px-4 py-3 bg-slate-50 dark:bg-darkbg-900 border ${
              errors.description ? 'border-red-500' : 'border-slate-200 dark:border-darkbg-700'
            } text-slate-900 dark:text-white rounded-xl outline-none text-sm`}
          />
          {errors.description && <p className="text-xs font-semibold text-red-500">{errors.description}</p>}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-darkbg-700 pt-6">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-5 py-2.5 border border-slate-200 dark:border-darkbg-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-darkbg-700 transition font-bold text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition shadow-md shadow-primary-500/10 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;
