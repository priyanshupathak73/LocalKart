'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import ShopCard from './ShopCard';
import { FiSearch } from 'react-icons/fi';

export default function ShopGrid({ businesses, isLoading = false, searchQuery = '', categoryFilter = 'All' }) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ShopCard key={`skeleton-${i}`} business={null} index={i} />
        ))}
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`py-20 text-center rounded-2xl ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-purple-500/20'
            : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
        }`}
      >
        <FiSearch className="w-16 h-16 mx-auto mb-4 opacity-50 text-purple-500" />
        <h3 className={`text-xl font-bold mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          No businesses found
        </h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {searchQuery
            ? `No results for "${searchQuery}" in ${categoryFilter === 'All' ? 'all categories' : categoryFilter}`
            : 'Try adjusting your filters'}
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`mb-6 text-sm font-medium ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        Found {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
        {categoryFilter !== 'All' && ` in ${categoryFilter}`}
        {searchQuery && ` matching "${searchQuery}"`}
      </motion.div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {businesses.map((business, index) => (
          <ShopCard key={business.id} business={business} index={index} />
        ))}
      </motion.div>
    </div>
  );
}
