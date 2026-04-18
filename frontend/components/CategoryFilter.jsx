'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { getCategories, getCategoryIcon } from '../data/businesses';

export default function CategoryFilter({ onCategoryChange, selectedCategory = 'All', businesses = [] }) {
  const [categories, setCategories] = useState(['All']);
  const { theme } = useTheme();

  useEffect(() => {
    const dynamicCategories = [...new Set((businesses || [])
      .map((business) => business.category || business.type)
      .filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

    const cats = dynamicCategories.length > 0 ? dynamicCategories : getCategories();
    setCategories(['All', ...cats]);
  }, [businesses]);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max px-1">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const icon = category === 'All' ? '🏪' : getCategoryIcon(category);

          return (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap text-sm ${
                isSelected
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : theme === 'dark'
                  ? 'bg-purple-900/30 text-gray-300 hover:bg-purple-800/50 border border-purple-500/30'
                  : 'bg-purple-100 text-gray-700 hover:bg-purple-200 border border-purple-300'
              }`}
            >
              <span className="text-base">{icon}</span>
              <span>{category}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
