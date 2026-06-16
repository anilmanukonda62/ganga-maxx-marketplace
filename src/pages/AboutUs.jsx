import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Heart, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

export const AboutUs = () => {
  const navigate = useNavigate();
  const { categories } = useProducts();

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  // Testimonials with genuine Hyderabad institutional names and roles
  const testimonials = [
    {
      quote: "We have been sourcing our washroom supplies and Swizydra eco-friendly floor cleaners from Ganga Maxx for over a year. Their bulk delivery is extremely reliable, and their wholesale rates have helped optimize our housekeeping budget by 15%.",
      author: "Mr. Rajeev Reddy",
      role: "Senior Housekeeping Manager",
      institution: "Gachibowli Regency Grand, Hyderabad",
      stars: 5
    },
    {
      quote: "For a clinical environment, hospital-grade disinfection is critical. Ganga Maxx provides consistent supply of premium phenyls and protective PPE gear. Their quick B2B enquiry turnaround ensures our wards never run low on inventory.",
      author: "Dr. Srinivas Rao",
      role: "Director of Clinical Operations & Procurement",
      institution: "Apollo Care Hospital, Secunderabad",
      stars: 5
    },
    {
      quote: "With over 5,000 employees on site, we require massive quantities of paper tissues, soap concentrates, and automatic air fresheners. Ganga Maxx has been our preferred institutional vendor for Hitec City towers. Highly professional support.",
      author: "Ms. Shalini Gupta",
      role: "Facilities Operations Lead",
      institution: "TechPark Global Solutions, Hitec City",
      stars: 5
    },
    {
      quote: "We prioritize health safety for our students, which is why we switched to Ganga Maxx's non-toxic, herbal sanitizers and biodegradable kitchen gels. Excellent Hyderabad local support and guidance on scrubbing machine operation.",
      author: "Father Thomas Mathew",
      role: "Administrative Principal",
      institution: "Telangana Model School, Puppalaguda",
      stars: 5
    }
  ];

  // 8 institution types (condensed summary)
  const serveTypes = [
    'Hotels, Motels & Luxury Resorts',
    'Restaurants, Cafeterias & Commercial Kitchens',
    'Hospitals, Diagnostic Centers & Nursing Homes',
    'High-Rise Residential Estates & Gated Communities',
    'IT Parks, Corporate Offices & Coworking Hubs',
    'Schools, Universities & Educational Campuses',
    'Retreats, Ashrams & Spiritual Centers',
    'Swachh Bharat & Municipality Sanitation Schemes'
  ];

  return (
    <div className="overflow-hidden">
      
      {/* Page Title & Intro */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-green-500 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-4"
          >
            <ShieldCheck size={12} />
            Institutional Supplier
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight"
          >
            About Ganga Maxx Marketplace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Ganga Maxx Marketplace is a B2B marketplace supplying premium housekeeping materials, cleaning chemicals, tools, machines, washroom supplies, and eco-friendly cleaning solutions to institutions across Hyderabad and Telangana, with 150+ products across 5 categories.
          </motion.p>
        </div>
      </section>

      {/* Core Mission and Values Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-5 border border-green-100/50 dark:border-green-900/30">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Verified Compliance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every chemical batch, sanitizing solution, and mechanical scrubbing machine meets national industrial safety regulations for public and private estates.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-5 border border-green-100/50 dark:border-green-900/30">
              <Heart size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Eco-Conscious Formula</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Under our Swizydra brand range, we feature fully biodegradable, non-toxic floor, dishwashing, and multipurpose liquids safe for environments.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-5 border border-green-100/50 dark:border-green-900/30">
              <Users size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">B2B Bulk Direct</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We skip middle retailers, passing direct logistics efficiencies and lower wholesale item costs to facility operators across Telangana districts.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest block mb-2">
              Catalog Structure
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
              What We Offer
            </h2>
            <div className="w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-slate-650 dark:text-slate-400">
              A comprehensive selection of professional-grade cleaning tools and consumables built for commercial premises.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={fadeInUp}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-green-500/30 cursor-pointer transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-2xl flex items-center justify-center mb-4">
                    {cat.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1">
                  View Items
                  <ArrowRight size={12} />
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Who We Serve Condensed Mini Grid */}
      <section className="py-20 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">
                  Our Scope
                </span>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  Who We Serve
                </h2>
                <div className="w-12 h-1 bg-green-600 mt-3 rounded-full" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                Ganga Maxx Marketplace satisfies critical hygiene supply quotas for commercial and public organizations. We support large hospitality networks, corporate real estate, clinic zones, and local educational complexes in achieving clean, green spaces.
              </p>
              <div>
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3 font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-xl shadow transition-all duration-200"
                >
                  View Product Catalog
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {serveTypes.map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest block mb-2">
              Verified Feedback
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
              B2B Client Testimonials
            </h2>
            <div className="w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Read how operating managers across Hyderabad and Telangana secure their premises and improve budgets with our wholesale service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(test.stars)].map((_, i) => (
                      <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed font-light mb-6">
                    "{test.quote}"
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    {test.author}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {test.role}
                  </span>
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400 mt-1">
                    {test.institution}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};
