import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, link, highlight = false }) => {
  // Map color names to classes
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      border: 'border-blue-100 dark:border-blue-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      border: 'border-purple-100 dark:border-purple-900/30'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      text: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      border: 'border-red-100 dark:border-red-900/30'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      text: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/40',
      border: 'border-orange-100 dark:border-orange-900/30'
    },
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-950/20',
      text: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-100 dark:bg-teal-900/40',
      border: 'border-teal-100 dark:border-teal-900/30'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      text: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      border: 'border-green-100 dark:border-green-900/30'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  const cardContent = (
    <div className={`p-6 rounded-2xl border transition-all duration-300 ${scheme.bg} ${scheme.border} h-full flex items-center justify-between`}>
      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block">{title}</span>
        <span className={`text-3xl font-bold tracking-tight ${scheme.text} ${highlight ? 'animate-pulse' : ''}`}>{value}</span>
      </div>
      <div className={`p-4 rounded-xl ${scheme.iconBg} ${scheme.text}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <motion.div
      whileHover={{ 
        y: -4, 
        scale: 1.01,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)'
      }}
      transition={{ duration: 0.2 }}
      className="h-full rounded-2xl"
    >
      {link ? (
        <Link to={link} className="block h-full cursor-pointer">
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </motion.div>
  );
};

export default StatCard;
