import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, AlertCircle, Plus, Check } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useEnquiryList } from '../context/EnquiryListContext';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { categories } = useProducts();
  const { enquiryItems, addToEnquiryList, removeFromEnquiryList } = useEnquiryList();

  const categoryObj = categories.find((c) => c.id === product.category);
  const isOutOfStock = product.stock.status === 'out_of_stock';
  const isLowStock = product.stock.status === 'low_stock';
  const stockCount = product.stock.count;

  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const firstVariantLabel = firstVariant ? firstVariant.label : 'Default';

  const isInList = enquiryItems.some(
    (item) => item.productId === product.id && item.selectedVariant === firstVariantLabel
  );

  // Determine starting price from variants if multiple exist
  const hasMultipleVariants = product.variants && product.variants.length > 1;
  const displayPrice = hasMultipleVariants
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Image Container with Out of Stock overlay */}
      <div className="relative aspect-[4/3] bg-white dark:bg-slate-900/45 flex items-center justify-center border-b border-slate-100/80 dark:border-slate-800/60 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Floating Add-to-Enquiry Button */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isInList) {
                removeFromEnquiryList(product.id, firstVariantLabel);
              } else {
                addToEnquiryList(product, firstVariant, 1);
              }
            }}
            className={`absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 z-10 cursor-pointer ${
              isInList
                ? 'bg-brand-600 hover:bg-brand-700 text-white'
                : 'bg-white/90 hover:bg-white text-slate-700 hover:text-brand-600 border border-slate-100'
            }`}
            title={isInList ? 'Remove from Enquiry List' : 'Add to Enquiry List'}
          >
            {isInList ? <Check size={16} /> : <Plus size={16} />}
          </button>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-sm font-semibold tracking-wider uppercase px-4 py-2 rounded-full shadow-md animate-pulse">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-grow p-5">
        {/* Badges on the same line */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {categoryObj && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-350 rounded-lg border border-brand-100 dark:border-brand-900/30">
              <span className="text-sm">{categoryObj.icon}</span>
              {categoryObj.name}
            </span>
          )}
          {isLowStock && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-350 rounded-lg border border-amber-100 dark:border-amber-900/30">
              <AlertCircle size={12} className="text-amber-600" />
              Only {stockCount} left
            </span>
          )}
          {!isOutOfStock && !isLowStock && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-350 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
              In Stock
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-2 min-h-[3rem] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Description Snippet */}
        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 mt-1.5 flex-grow font-normal leading-relaxed">
          {product.description}
        </p>

        {/* Variant Pills */}
        {product.variants && (
          <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
            {product.variants.map((variant, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full border border-slate-200 dark:border-slate-700/60"
              >
                {variant.label}
              </span>
            ))}
          </div>
        )}

        {/* Price and Details button */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              {product.priceLabel || 'Price per unit'}
            </span>
            <span className="text-lg font-black text-brand-700 dark:text-brand-400">
              {hasMultipleVariants ? 'From ' : ''}₹{displayPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="inline-flex items-center justify-center px-4.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 rounded-xl shadow-md shadow-brand-600/10 hover:shadow-brand-600/25 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};
