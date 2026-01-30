'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiArrowRight } from 'react-icons/fi';
import businesses, { getCategories, getCategoryIcon } from '@/data/businesses';

export default function DirectoryPreviewSection() {
  const { theme } = useTheme();
  const categories = getCategories();
  const featuredBusinesses = businesses.slice(0, 3);

  return (
    <section className={`py-20 transition-colors ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20'
        : 'bg-gradient-to-br from-purple-50 to-blue-50'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Explore Local Businesses
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Discover trusted local businesses in Ara, Bihar across multiple categories
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12"
        >
          {categories.map((category) => (
            <Link key={category} href={`/directory?category=${encodeURIComponent(category)}`}>
              <motion.div
                whileHover={{ scale: 1.05, translateY: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`p-6 rounded-2xl text-center cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/30 border border-purple-500/30 hover:border-purple-500'
                    : 'bg-white border border-purple-200 hover:border-purple-400'
                }`}
              >
                <div className="text-4xl mb-3">{getCategoryIcon(category)}</div>
                <h3 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {category}
                </h3>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Featured Businesses */}
        <div className="mb-12">
          <h3 className={`text-2xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Featured Businesses
          </h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {featuredBusinesses.map((business, index) => (
              <Link key={business.id} href={`/shop/${business.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className={`p-6 rounded-2xl cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/20 border border-purple-500/30 hover:border-purple-500'
                      : 'bg-white border border-purple-200 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{business.categoryIcon}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      theme === 'dark'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {business.category}
                    </span>
                  </div>
                  <h4 className={`font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {business.name}
                  </h4>
                  <p className={`text-sm mb-3 line-clamp-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {business.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-bold">{business.rating}</span>
                    </div>
                    <span className="text-purple-500 group-hover:translate-x-2 transition-transform">
                      →
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
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
              Browse All Businesses
              <FiArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
