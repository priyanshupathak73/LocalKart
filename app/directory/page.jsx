'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import businesses from '@/data/businesses';
import { filterBusinesses, sortBusinesses } from '@/utils/filteringLogic';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ShopGrid from '@/components/ShopGrid';

export default function DirectoryPage() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const filteredBusinesses = useMemo(() => {
    let filtered = filterBusinesses(businesses, searchQuery, selectedCategory);
    filtered = sortBusinesses(filtered, sortBy, 'desc');
    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  return (
    <main className={`min-h-screen pt-24 pb-20 transition-colors ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950'
        : 'bg-gradient-to-br from-white via-purple-50 to-blue-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Local Business Directory
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Discover and explore trusted local businesses in Ara, Bihar. Find bakeries, medical centers, salons, groceries, and coaching institutes.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6 mb-12"
        >
          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} placeholder="Search by name, category, or service..." />

          {/* Category Filter */}
          <CategoryFilter onCategoryChange={handleCategoryChange} selectedCategory={selectedCategory} />

          {/* Sort Options */}
          <div className="flex gap-3 flex-wrap">
            {[
              { value: 'rating', label: '⭐ Top Rated' },
              { value: 'reviews', label: '💬 Most Reviewed' },
              { value: 'name', label: '🔤 Name (A-Z)' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sortBy === option.value
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : theme === 'dark'
                    ? 'bg-purple-900/30 text-gray-300 hover:bg-purple-800/50 border border-purple-500/30'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Shop Grid */}
        <ShopGrid
          businesses={filteredBusinesses}
          searchQuery={searchQuery}
          categoryFilter={selectedCategory}
        />
      </div>
    </main>
  );
}
