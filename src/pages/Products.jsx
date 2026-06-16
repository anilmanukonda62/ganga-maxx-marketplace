import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, RotateCcw, X, Filter } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

export const Products = () => {
  const { products, categories, loading, error, getPriceRange, retryFetch } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  // Price range boundaries from product dataset
  const { min: limitMin, max: limitMax } = useMemo(() => getPriceRange(), [products]);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceMax, setPriceMax] = useState(limitMax);
  const [priceMin, setPriceMin] = useState(limitMin);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // featured, price-asc, price-desc
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle

  // Intermediate string input states to allow typing/deleting without instant clamping
  const [minInput, setMinInput] = useState(String(limitMin));
  const [maxInput, setMaxInput] = useState(String(limitMax));

  // Sync state with URL category query parameter
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      const exists = categories.some(cat => cat.id === urlCategory);
      setSelectedCategory(exists ? urlCategory : 'all');
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams, categories]);

  // Keep price limits updated when dataset loads
  useEffect(() => {
    setPriceMin(limitMin);
    setPriceMax(limitMax);
    setMinInput(String(limitMin));
    setMaxInput(String(limitMax));
  }, [limitMin, limitMax]);

  // Sync inputs if priceMin or priceMax state changes (e.g. from slider dragging)
  useEffect(() => {
    setMinInput(String(priceMin));
  }, [priceMin]);

  useEffect(() => {
    setMaxInput(String(priceMax));
  }, [priceMax]);

  // Category change handler (updates URL and state)
  const handleCategoryChange = (catId) => {
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
    setSelectedCategory(catId);
  };

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setInStockOnly(false);
    setPriceMin(limitMin);
    setPriceMax(limitMax);
    setMinInput(String(limitMin));
    setMaxInput(String(limitMax));
    setSortBy('featured');
    handleCategoryChange('all');
  };

  // Price input change & blur handlers
  const handleMinInputChange = (val) => {
    setMinInput(val);
    const num = Number(val);
    if (!isNaN(num) && val.trim() !== '') {
      // If valid number and in-bounds, update the filter state immediately
      if (num >= limitMin && num <= priceMax) {
        setPriceMin(num);
      }
    }
  };

  const handleMinInputBlur = () => {
    let num = Number(minInput);
    if (isNaN(num) || minInput.trim() === '') {
      num = limitMin;
    }
    // Clamp to valid range: [limitMin, priceMax]
    const clamped = Math.max(limitMin, Math.min(priceMax, num));
    setPriceMin(clamped);
    setMinInput(String(clamped));
  };

  const handleMaxInputChange = (val) => {
    setMaxInput(val);
    const num = Number(val);
    if (!isNaN(num) && val.trim() !== '') {
      // If valid number and in-bounds, update the filter state immediately
      if (num >= priceMin && num <= limitMax) {
        setPriceMax(num);
      }
    }
  };

  const handleMaxInputBlur = () => {
    let num = Number(maxInput);
    if (isNaN(num) || maxInput.trim() === '') {
      num = limitMax;
    }
    // Clamp to valid range: [priceMin, limitMax]
    const clamped = Math.max(priceMin, Math.min(limitMax, num));
    setPriceMax(clamped);
    setMaxInput(String(clamped));
  };

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // In Stock Only Filter
    if (inStockOnly) {
      result = result.filter(p => p.stock.status !== 'out_of_stock');
    }

    // Price Filter
    result = result.filter(p => {
      // Find starting price for the product (taking variants into account)
      const hasMultipleVariants = p.variants && p.variants.length > 1;
      const minPrice = hasMultipleVariants
        ? Math.min(...p.variants.map(v => v.price))
        : p.price;
      
      const effectiveMin = priceMin !== undefined ? priceMin : limitMin;
      const effectiveMax = priceMax || limitMax;
      
      return minPrice >= effectiveMin && minPrice <= effectiveMax;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const pA = a.variants && a.variants.length > 1 ? Math.min(...a.variants.map(v => v.price)) : a.price;
        const pB = b.variants && b.variants.length > 1 ? Math.min(...b.variants.map(v => v.price)) : b.price;
        return pA - pB;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const pA = a.variants && a.variants.length > 1 ? Math.min(...a.variants.map(v => v.price)) : a.price;
        const pB = b.variants && b.variants.length > 1 ? Math.min(...b.variants.map(v => v.price)) : b.price;
        return pB - pA;
      });
    }
    // 'featured' leaves items in original database order

    return result;
  }, [products, selectedCategory, searchQuery, inStockOnly, priceMin, priceMax, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading Ganga Maxx Products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center text-3xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Failed to Load Products</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">There was a connection issue loading the products: {error}</p>
        <button
          onClick={retryFetch}
          className="mt-6 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition shadow-lg shadow-brand-600/20 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header and Counters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Our Products
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Showing <span className="font-bold text-brand-600 dark:text-brand-400">{filteredProducts.length}</span> of {products.length} products
          </p>
        </div>

        {/* Sort and Filters toggle */}
        <div className="flex items-center gap-3 self-start md:self-end w-full md:w-auto">
          {/* Search Bar on Desktop/Tablet */}
          <div className="relative flex-grow md:max-w-xs md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50 cursor-pointer text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex items-center gap-1.5 md:hidden px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar no-transition">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'bg-brand-600 text-white dark:bg-brand-700 shadow-md shadow-brand-600/10'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-brand-600 text-white dark:bg-brand-700 shadow-md shadow-brand-600/10'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Grid Layout (Filters Sidebar + Product Grid) */}
      <div className="flex gap-8 items-start">
        
        {/* Left Sidebar Filter (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 sticky top-28 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <Filter size={16} className="text-brand-600" />
              Refine Results
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>

          <div className="space-y-6">
            {/* Stock status filter */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Availability
              </h4>
              <label className="flex items-center gap-2.5 cursor-pointer group text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="group-hover:text-slate-900 dark:group-hover:text-white">
                  In stock only
                </span>
              </label>
            </div>

            {/* Categories filter list */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Category
              </h4>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`text-left text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'text-brand-600 dark:text-brand-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Categories ({products.length})
                </button>
                {categories.map((cat) => {
                  const count = products.filter(p => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`text-left text-sm font-medium transition-colors flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? 'text-brand-600 dark:text-brand-400 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="truncate">
                        {cat.icon} {cat.name}
                      </span>
                      <span className="text-xs text-slate-400">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price range dual inputs + Max Price slider */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Max Price (₹)
              </h4>
              <div className="space-y-4">
                <input
                  type="range"
                  min={limitMin}
                  max={limitMax}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-brand-600 dark:accent-brand-500 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
                
                {/* Numeric Input Boxes */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Min (₹)</label>
                    <input
                      type="text"
                      value={minInput}
                      onChange={(e) => handleMinInputChange(e.target.value)}
                      onBlur={handleMinInputBlur}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Max (₹)</label>
                    <input
                      type="text"
                      value={maxInput}
                      onChange={(e) => handleMaxInputChange(e.target.value)}
                      onBlur={handleMaxInputBlur}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <main className="flex-grow">
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-8"
            >
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                No Products Found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                No items match your search queries or selected filters. Try broadening your parameters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-6 py-2.5 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all duration-200"
              >
                Reset All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filter Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 right-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 z-50 p-6 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                    <Filter size={16} className="text-green-600" />
                    Filters
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-slate-400 hover:text-green-600 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="p-1 text-slate-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] pr-2 custom-scrollbar">
                  {/* Availability */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                      Availability
                    </h4>
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <span>In stock only</span>
                    </label>
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                      Category
                    </h4>
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => {
                          handleCategoryChange('all');
                          setShowSidebar(false);
                        }}
                        className={`text-left text-sm font-medium ${
                          selectedCategory === 'all'
                            ? 'text-brand-600 dark:text-brand-400 font-bold'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            handleCategoryChange(cat.id);
                            setShowSidebar(false);
                          }}
                          className={`text-left text-sm font-medium flex items-center justify-between ${
                            selectedCategory === cat.id
                              ? 'text-brand-600 dark:text-brand-400 font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>{cat.icon} {cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                      Max Price (₹)
                    </h4>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min={limitMin}
                        max={limitMax}
                        value={priceMax}
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                        className="w-full accent-brand-600 dark:accent-brand-500 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">Min (₹)</label>
                          <input
                            type="text"
                            value={minInput}
                            onChange={(e) => handleMinInputChange(e.target.value)}
                            onBlur={handleMinInputBlur}
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Max (₹)</label>
                          <input
                            type="text"
                            value={maxInput}
                            onChange={(e) => handleMaxInputChange(e.target.value)}
                            onBlur={handleMaxInputBlur}
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                <button
                  onClick={() => setShowSidebar(false)}
                  className="w-full py-3.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
