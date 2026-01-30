'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import businesses, { searchBusinesses, getCategories } from '@/data/businesses';

export default function DiscoveryHeroSection() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = getCategories();

  // Filter businesses based on search and category
  const filteredBusinesses = (() => {
    let filtered = selectedCategory === 'All' 
      ? businesses 
      : businesses.filter(b => b.category === selectedCategory);
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.slice(0, 6);
  })();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className={`pt-32 pb-20 transition-colors ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950'
        : 'bg-gradient-to-br from-white via-purple-50 to-blue-50'
    }`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-block text-6xl">🔍</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className={`text-5xl md:text-6xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Discover Local Businesses
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className={`text-xl md:text-2xl mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Find the best services in Ara, Bihar
          </motion.p>

          <motion.p
            variants={itemVariants}
            className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Search across bakeries, medical centers, salons, grocery stores, and coaching institutes
          </motion.p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all ${
            theme === 'dark'
              ? 'bg-gray-900/50 border-purple-500/50 focus-within:border-purple-500'
              : 'bg-white border-purple-200 focus-within:border-purple-400'
          }`}>
            <FiSearch className={`w-5 h-5 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search by business name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${
                theme === 'dark' 
                  ? 'text-white placeholder-gray-500' 
                  : 'text-gray-900 placeholder-gray-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {['All', ...categories].map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                  : theme === 'dark'
                  ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Results Count */}
        <motion.p
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className={`text-center mb-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Found {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? 'es' : ''} {searchQuery && `matching "${searchQuery}"`}
        </motion.p>

        {/* Suggested Shops Grid */}
        {filteredBusinesses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {filteredBusinesses.map((business, index) => (
              <Link key={business.id} href={`/shop/${business.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`h-full p-6 rounded-2xl cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-purple-500/30 hover:border-purple-500'
                      : 'bg-white border border-gray-200 hover:border-purple-400'
                  }`}
                >
                  {/* Image */}
                  <div className={`w-full h-40 rounded-lg mb-4 overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <img
                      src={business.image || business.heroImage}
                      alt={business.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{business.categoryIcon}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      theme === 'dark'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {business.category}
                    </span>
                  </div>

                  <h3 className={`font-bold text-lg mb-2 line-clamp-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {business.name}
                  </h3>

                  <p className={`text-sm mb-4 line-clamp-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {business.description}
                  </p>

                  {/* Rating and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 text-lg">★</span>
                      <div>
                        <p className="font-bold">{business.rating}</p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {business.reviews} reviews
                        </p>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className="text-purple-500 text-xl"
                    >
                      <FiArrowRight />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <p className="text-lg">No businesses found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className={`mt-4 px-6 py-2 rounded-full font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* CTA to Full Directory */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/directory">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2"
            >
              View Full Directory with Advanced Filters
              <FiArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
