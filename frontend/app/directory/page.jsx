'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { filterBusinesses, sortBusinesses } from '@/utils/filteringLogic';
import API_BASE_URL from '@/utils/api';
import fallbackBusinesses from '@/data/businesses';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ShopGrid from '@/components/ShopGrid';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default function DirectoryPage() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'All');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'All');
  }, [categoryFromUrl]);

  // ── Fetch businesses from backend ─────────────────────────
  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/businesses`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const apiBusinesses = Array.isArray(data) ? data : [];
      console.log('[Directory] API response:', data);

      if (apiBusinesses.length > 0) {
        console.log(`[Directory] Fetched ${apiBusinesses.length} businesses from API`);
        setBusinesses(apiBusinesses);
      } else {
        console.warn('[Directory] API returned empty list. Falling back to local data source used by landing page.');
        setBusinesses(fallbackBusinesses);
      }
    } catch (err) {
      console.error('[Directory] API fetch failed:', err.message);
      console.warn('[Directory] Using fallback local data because API request failed.');
      setBusinesses(fallbackBusinesses);
      setError(`API error: ${err.message}. Showing fallback directory data.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // ── Filter & sort ──────────────────────────────────────────
  const filteredBusinesses = useMemo(() => {
    let filtered = filterBusinesses(businesses, searchQuery, selectedCategory);
    filtered = sortBusinesses(filtered, sortBy, 'desc');
    console.log('[Directory] Filtered data:', {
      receivedCount: businesses.length,
      selectedCategory,
      searchQuery,
      sortBy,
      filteredCount: filtered.length,
      filteredIds: filtered.map((b) => b.id),
    });
    return filtered;
  }, [businesses, searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    console.log('[Directory] Final rendered list:', {
      renderedCount: filteredBusinesses.length,
      renderedIds: filteredBusinesses.map((b) => b.id),
    });
  }, [filteredBusinesses]);

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
          <SearchBar onSearch={handleSearch} placeholder="Search by name, category, or service..." />
          <CategoryFilter
            onCategoryChange={handleCategoryChange}
            selectedCategory={selectedCategory}
            businesses={businesses}
          />

          {/* Sort Options */}
          <div className="flex gap-3 flex-wrap">
            {[
              { value: 'rating',  label: '⭐ Top Rated' },
              { value: 'reviews', label: '💬 Most Reviewed' },
              { value: 'name',    label: '🔤 Name (A-Z)' },
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

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-8 p-6 rounded-2xl text-center ${
              theme === 'dark'
                ? 'bg-red-900/20 border border-red-500/30'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <FiAlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
            <h3 className={`text-lg font-semibold mb-1 ${
              theme === 'dark' ? 'text-red-300' : 'text-red-800'
            }`}>
              Could not load businesses
            </h3>
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              {error}
            </p>
            <button
              onClick={fetchBusinesses}
              className="inline-flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Retry
            </button>
          </motion.div>
        )}

        {/* Shop Grid */}
        <ShopGrid
          businesses={filteredBusinesses}
          totalBusinesses={businesses.length}
          searchQuery={searchQuery}
          categoryFilter={selectedCategory}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}
