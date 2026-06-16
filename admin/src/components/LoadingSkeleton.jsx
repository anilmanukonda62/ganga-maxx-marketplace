import React from 'react';

/**
 * Reusable Card Loader Skeleton
 */
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-6 border border-slate-100 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 rounded-2xl animate-pulse flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-slate-200 dark:bg-darkbg-700 rounded w-2/3"></div>
            <div className="h-8 bg-slate-200 dark:bg-darkbg-700 rounded w-1/2"></div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-darkbg-700"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * Reusable Table Loader Skeleton
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full border border-slate-100 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 rounded-2xl overflow-hidden animate-pulse">
      {/* Table Header mock */}
      <div className="flex bg-slate-50 dark:bg-darkbg-900 border-b border-slate-100 dark:border-darkbg-700 p-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <div key={idx} className="flex-1 h-5 bg-slate-200 dark:bg-darkbg-700 rounded mx-2"></div>
        ))}
      </div>
      {/* Table Rows mock */}
      <div className="divide-y divide-slate-100 dark:divide-darkbg-700">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex p-4 items-center">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div key={colIdx} className="flex-1 h-4 bg-slate-200 dark:bg-darkbg-700 rounded mx-2"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Reusable Detail Mock Loader
 */
export const DetailSkeleton = () => {
  return (
    <div className="p-6 bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-2xl animate-pulse space-y-6">
      <div className="flex gap-4 items-center border-b border-slate-100 dark:border-darkbg-700 pb-4">
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-darkbg-700"></div>
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-slate-200 dark:bg-darkbg-700 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-darkbg-700 rounded w-1/4"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-darkbg-700 rounded w-1/4"></div>
          <div className="h-10 bg-slate-200 dark:bg-darkbg-700 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-darkbg-700 rounded w-1/3"></div>
          <div className="h-10 bg-slate-200 dark:bg-darkbg-700 rounded w-full"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-darkbg-700 rounded w-1/4"></div>
          <div className="h-24 bg-slate-200 dark:bg-darkbg-700 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
};
