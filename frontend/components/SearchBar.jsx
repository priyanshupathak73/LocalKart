'use client';

import { useState, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useTheme } from 'next-themes';

export default function SearchBar({ onSearch, placeholder = 'Search businesses...' }) {
  const [query, setQuery] = useState('');
  const { theme } = useTheme();

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="w-full">
      <div
        className={`relative flex items-center transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30'
            : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
        } border rounded-full px-4 py-3 focus-within:ring-2 focus-within:ring-purple-500`}
      >
        <FiSearch className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
        
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none text-sm transition-colors ${
            theme === 'dark'
              ? 'placeholder-gray-500 text-white'
              : 'placeholder-gray-400 text-gray-900'
          }`}
        />

        {query && (
          <button
            onClick={handleClear}
            className="ml-2 p-1 hover:bg-purple-500/20 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
