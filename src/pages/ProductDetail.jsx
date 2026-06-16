import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, Info, Send, PhoneCall } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, getRelatedProducts, categories, loading, error, retryFetch } = useProducts();

  const product = getProductById(id);

  const categoryObj = categories.find((c) => c.id === product?.category);
  const relatedProducts = getRelatedProducts(product, 4);

  // Stock statuses
  const isOutOfStock = product?.stock?.status === 'out_of_stock';
  const isLowStock = product?.stock?.status === 'low_stock';
  const stockCount = product?.stock?.count;

  // Selected variant state (default to the first variant if available)
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading Product Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center text-3xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Failed to Load Details</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">There was a connection issue: {error}</p>
        <button
          onClick={retryFetch}
          className="mt-6 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg shadow-green-600/20 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If product not found
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Product Not Found</h2>
        <p className="text-slate-500 mt-2">The product you are trying to view does not exist in our catalog.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-200"
        >
          <ArrowLeft size={16} />
          Back to Catalog
        </Link>
      </div>
    );
  }



  // Determine active price
  const activePrice = selectedVariant ? selectedVariant.price : product.price;

  // Enquiry redirect helper
  const handleEnquiryRedirect = () => {
    const itemString = selectedVariant 
      ? `${product.name} (${selectedVariant.label})` 
      : product.name;
    navigate('/enquiry', { state: { productName: itemString } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back navigation button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-green-600 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl mb-8 transition-colors duration-200"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white dark:bg-slate-900/40 p-6 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm mb-16">
        
        {/* Left Column: Image Area */}
        <div className="lg:col-span-5">
          <div className="relative aspect-square w-full rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-8 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-600 text-white text-base font-bold tracking-wider uppercase px-6 py-3 rounded-full shadow-md animate-pulse">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Information & Options */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Breadcrumbs */}
            <nav className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Link to="/products" className="hover:text-brand-600">Products</Link>
              <span>/</span>
              {categoryObj && (
                <Link to={`/products?category=${categoryObj.id}`} className="hover:text-brand-600">
                  {categoryObj.name}
                </Link>
              )}
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 truncate">{product.name}</span>
            </nav>

            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-tight mb-4">
              {product.name}
            </h1>

            {/* Stock and Category line */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {categoryObj && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-brand-50 dark:bg-brand-950/20 text-brand-800 dark:text-brand-400 rounded-lg border border-brand-100/30 dark:border-brand-900/20">
                  <span>{categoryObj.icon}</span>
                  {categoryObj.name}
                </span>
              )}
              {isOutOfStock && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle size={14} className="text-red-500" />
                  Out of Stock
                </span>
              )}
              {isLowStock && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/20">
                  <AlertCircle size={14} className="text-amber-500" />
                  Only {stockCount} units left
                </span>
              )}
              {!isOutOfStock && !isLowStock && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                  <CheckCircle size={14} className="text-emerald-500" />
                  In Stock & Ready
                </span>
              )}
            </div>

            {/* Dynamic Price Display */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 mb-6">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                {product.priceLabel || 'Price per unit'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-brand-700 dark:text-brand-400">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                {selectedVariant && (
                  <span className="text-sm text-slate-400 dark:text-slate-400 font-medium">
                    (for {selectedVariant.label})
                  </span>
                )}
              </div>
            </div>

            {/* Select Size / Variant Pills */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Select Size / Option:
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v, idx) => {
                    const isSelected = selectedVariant?.label === v.label;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4.5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-brand-600 dark:bg-brand-700 border-brand-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {v.label} - ₹{v.price}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Description */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                Product Description:
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                {product.description}
              </p>
            </div>
          </div>

          {/* Action buttons area */}
          <div>
            {isOutOfStock ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs text-red-800 dark:text-red-400">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <span>
                    This product is currently out of stock. Please check B2B supply rates or submit an enquiry and our procurement team will notify you.
                  </span>
                </div>
                <button
                  onClick={handleEnquiryRedirect}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl shadow transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <PhoneCall size={16} />
                  Notify Me / Contact Us
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnquiryRedirect}
                className="w-full flex items-center justify-center gap-2 py-4 bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/10 hover:shadow-brand-600/25 transition-all duration-205 active:scale-95 cursor-pointer"
              >
                <Send size={16} />
                Enquire Now
              </button>
            )}
          </div>
        </div>

      </div>

      {/* More from Category */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-100 dark:border-slate-800/80 pt-16">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-8">
            More from {categoryObj ? categoryObj.name : 'this category'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
