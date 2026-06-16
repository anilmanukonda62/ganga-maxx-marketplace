import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CATEGORY_COLORS = {
  'cleaning-chemicals': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    hoverBg: 'hover:bg-emerald-100/50 dark:hover:bg-emerald-950/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40'
  },
  'cleaning-tools-equipment': {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-100 dark:border-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    hoverBg: 'hover:bg-blue-100/50 dark:hover:bg-blue-950/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40'
  },
  'mechanical-equipment': {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-100 dark:border-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    hoverBg: 'hover:bg-amber-100/50 dark:hover:bg-amber-950/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40'
  },
  'washroom-supplies': {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-100 dark:border-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
    hoverBg: 'hover:bg-purple-100/50 dark:hover:bg-purple-950/30',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40'
  },
  'eco-friendly-products': {
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    border: 'border-teal-100 dark:border-teal-900/30',
    text: 'text-teal-700 dark:text-teal-400',
    hoverBg: 'hover:bg-teal-100/50 dark:hover:bg-teal-950/30',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40'
  }
};

export const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const theme = CATEGORY_COLORS[category.id] || CATEGORY_COLORS['cleaning-chemicals'];

  const handleCardClick = () => {
    navigate(`/products?category=${category.id}`);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className={`group cursor-pointer flex flex-col justify-between p-6 rounded-2xl border ${theme.bg} ${theme.border} ${theme.hoverBg} shadow-sm hover:shadow-lg transition-all duration-300`}
    >
      <div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${theme.iconBg}`}>
          {category.icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
          {category.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
          {category.description}
        </p>
      </div>

      <div className={`flex items-center gap-1.5 text-sm font-semibold ${theme.text}`}>
        Explore Category
        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </motion.div>
  );
};
