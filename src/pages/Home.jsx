import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  CheckCircle,
  Hotel,
  Utensils,
  Activity,
  Building2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Leaf,
  ShieldCheck,
  Zap,
  Package,
  Truck,
  FileText,
  Headphones,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';

export const Home = () => {
  const navigate = useNavigate();
  const { categories, products, loading, error, retryFetch } = useProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading Ganga Maxx Catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center text-3xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Failed to Load Catalog</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">There was a connection issue loading the catalog data: {error}</p>
        <button
          onClick={retryFetch}
          className="mt-6 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg shadow-green-600/20 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Animation constants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // 8 industries we serve
  const industries = [
    { name: 'Hotels & Resorts', icon: Hotel, desc: 'Luxury linens, eco-safe amenities, and guest bathroom sanitization.' },
    { name: 'Restaurants & Cafés', icon: Utensils, desc: 'Food-grade sanitizers, kitchen cleaners, and heavy-duty napkins.' },
    { name: 'Hospitals & Clinics', icon: Activity, desc: 'High-level disinfectant phenyls, protective gloves, and PPE kits.' },
    { name: 'High Rises & Apartments', icon: Building2, desc: 'Bulk soap oils, floor scrubbers, and community waste management bins.' },
    { name: 'IT Parks & Corporates', icon: Briefcase, desc: 'Automatic washroom air fresheners, dispensers, and desk cleaners.' },
    { name: 'Schools & Colleges', icon: GraduationCap, desc: 'Child-safe herbal sanitizers, multipurpose sprays, and janitorial gear.' },
    { name: 'Retreats & Ashrams', icon: Sparkles, desc: 'Eco-conscious Swizydra cleaners and quiet, efficient vacuum equipment.' },
    { name: 'Swachh Bharat Initiatives', icon: Leaf, desc: 'Large manual/pedal waste containers and biodegradable floor care.' }
  ];

  // Features list
  const features = [
    { title: '150+ Products, One Place', desc: 'From heavy-duty floor scrubber machines to delicate paper tissues, satisfy all housekeeping needs.', icon: Package },
    { title: 'Built for B2B', desc: 'Wholesale pricing, commercial billing options, and scalable packaging sizes for institutional demand.', icon: FileText },
    { title: 'Eco-Friendly Range', desc: 'Biodegradable, non-toxic Swizydra cleaners that are completely safe for humans, animals, and surfaces.', icon: Leaf },
    { title: 'Pan-Telangana Delivery', desc: 'Reliable and safe transportation of large shipments and bulk concentrates directly to your doorstep.', icon: Truck },
    { title: 'Easy Enquiry Process', desc: 'Review items, select specific sizes, and request customized bulk estimates within 24 hours.', icon: Zap },
    { title: 'Dedicated Support', desc: 'Expert customer service assisting in equipment selection, operating manuals, and order tracking.', icon: Headphones }
  ];

  // Checkmark lists
  const checkmarks = [
    'Eco-friendly & sustainable formulations',
    'Non-toxic & non-hazardous chemicals',
    'Safe for humans, animals, and delicate surfaces',
    '100% biodegradable organic ingredients',
    'Cost-effective concentrated forms for long-lasting use'
  ];

  return (
    <div className="overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-950 via-slate-900 to-slate-950 text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradients & Accents */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-6"
          >
            <ShieldCheck size={14} />
            Trusted B2B Supplier
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl"
          >
            Your One-Stop B2B Cleaning & <br />
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              Hygiene Supplies Partner
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl leading-relaxed font-light"
          >
            B2B Cleaning & Hygiene Supplies for Institutions across Hyderabad & Telangana. Serving premium hospitality, healthcare, corporate, and educational estates.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => navigate('/products')}
              className="px-8 py-4 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 active:scale-95 transition-all duration-300 flex items-center gap-2 group"
            >
              Explore Products
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 font-semibold text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl active:scale-95 transition-all duration-300"
            >
              Contact Representative
            </button>
          </motion.div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-transparent">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
            Shop by Category
          </h2>
          <div className="w-16 h-1 bg-brand-600 mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Browse our core categories to discover high-grade sanitizers, heavy cleaning equipment, washroom disposables, and green items.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </motion.div>
      </section>

      {/* Featured Products by Category */}
      <section className="py-20 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
              Featured Products
            </h2>
            <div className="w-16 h-1 bg-brand-600 mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Browse our handpicked institutional hygiene products, compiled directly from our verified warehouse catalog.
            </p>
          </div>

          {categories.map((category) => {
            const categoryProducts = products.filter((p) => p.category === category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.id} className="mb-20 last:mb-0">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-8">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl shrink-0">
                      {category.icon}
                    </span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/products?category=${category.id}`)}
                    className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-sm font-bold text-brand-700 dark:text-brand-400 hover:text-brand-600"
                  >
                    View All {categoryProducts.length} Items
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* Products Grid */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-100px' }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                  {categoryProducts.map((product) => (
                    <motion.div key={product.id} variants={fadeInUp}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            );
          })}

        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest block mb-2">
              B2B Target Sectors
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
              Who We Serve
            </h2>
            <div className="w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              We design specialized bulk delivery packages and supply programs for diverse institutional properties throughout Hyderabad & Telangana.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((ind, idx) => {
              const Icon = ind.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5 border border-brand-100/30 dark:border-brand-900/20">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {ind.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {ind.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 px-8 py-3.5 font-bold text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 rounded-xl shadow-md transition-all duration-200"
            >
              Explore Our Full Product Catalog
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* Why Choose Ganga Maxx */}
      <section className="py-20 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Eco-benefits highlights */}
            <div className="lg:col-span-5 space-y-8 bg-slate-50 dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                  Compliance & Quality
                </span>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  Product Safety Standards
                </h3>
              </div>

              <div className="space-y-4">
                {checkmarks.map((text, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5 border border-brand-200/50 dark:border-brand-900/20">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our products comply with strict hospitality and commercial health regulations. MSDS data sheets are available upon institutional request.
                </p>
              </div>
            </div>

            {/* Right Column: Feature Blocks */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                  Corporate Strengths
                </span>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  Why Choose Ganga Maxx?
                </h2>
                <div className="w-12 h-1 bg-brand-600 mt-3 rounded-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-100/30 dark:border-brand-900/20">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {feat.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3 font-bold text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 rounded-xl shadow-md transition-all duration-200"
                >
                  View Products
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Brief Contact Us Preview Section */}
      <section className="bg-slate-900 dark:bg-slate-950 py-16 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-900/30 to-slate-800/30 border border-green-900/30 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                Quick Connect
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to Order or Have Questions?
              </h3>
              <p className="text-sm text-slate-300 max-w-2xl font-light">
                Submit an enquiry online or talk to our Hyderabad-based commercial sales team directly for special institutional contract rates.
              </p>
              
              {/* Short Data Display */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-green-400" />
                  Puppalaguda, Hyderabad
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-green-400" />
                  +91 9110306090
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-green-400" />
                  Gangamaxxmarketplace@gmail.com
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/contact')}
                className="w-full sm:w-auto px-8 py-4 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md transition-all duration-200 text-center"
              >
                Contact Us
              </button>
              <button
                onClick={() => navigate('/enquiry')}
                className="w-full sm:w-auto px-8 py-4 font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-xl shadow-md transition-all duration-200 text-center"
              >
                Submit Enquiry
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
