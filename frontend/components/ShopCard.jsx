'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiMapPin, FiStar, FiArrowRight } from 'react-icons/fi';

// ── Fallback images per category (guaranteed working URLs) ──
const CATEGORY_FALLBACKS = {
  Bakery:   'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
  Medical:  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600',
  Salon:    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
  Grocery:  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
  Coaching: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600',
};

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600';

export default function ShopCard({ business, index = 0 }) {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ── Loading skeleton ──────────────────────────────────────
  if (!business) {
    return (
      <div className="h-full rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-48 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer" />
        <div className="p-4 flex flex-col h-40">
          <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
          <div className="mt-auto h-4 w-full bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
    );
  }

  // ── Resolve image URL ─────────────────────────────────────
  // Priority: backend's imageUrl → business.image (if valid URL) → category fallback → default
  const resolveImageSrc = () => {
    if (imageError) {
      return CATEGORY_FALLBACKS[business.category] || DEFAULT_PLACEHOLDER;
    }

    // Backend now sends `imageUrl` which is always a full, valid URL
    if (business.imageUrl) return business.imageUrl;

    // Fallback: check if `image` field is a valid external URL
    if (business.image && (business.image.startsWith('http://') || business.image.startsWith('https://'))) {
      return business.image;
    }

    // If it's a local path like /images/bakery.png (which doesn't exist), skip it
    return CATEGORY_FALLBACKS[business.category] || DEFAULT_PLACEHOLDER;
  };

  const imageSrc = resolveImageSrc();
  const fallbackSrc = CATEGORY_FALLBACKS[business.category] || DEFAULT_PLACEHOLDER;

  // ── Animation variants ────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: index * 0.1 },
    },
    hover: {
      y: -8,
      boxShadow: theme === 'dark'
        ? '0 20px 40px rgba(168, 85, 247, 0.3)'
        : '0 20px 40px rgba(147, 51, 234, 0.15)',
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true }}
      className="h-full"
    >
      <Link href={`/shop/${business.id}`}>
        <div
          id={`shop-card-${business.id}`}
          className={`h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20 hover:border-purple-500/50'
              : 'bg-white border border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-lg'
          }`}
        >
          {/* ── Image Container ─────────────────────────────── */}
          <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            {/* Shimmer loader behind image */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
            )}

            <img
              src={imageSrc}
              alt={business.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                // Swap to fallback on error — prevent infinite loop
                if (!imageError) {
                  setImageError(true);
                  e.target.src = fallbackSrc;
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              className="transition-transform duration-500 hover:scale-110"
            />

            {/* Category Badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
              <span className="text-lg">{business.categoryIcon || '🏪'}</span>
              <span className="text-xs font-semibold text-gray-900">{business.category || 'Shop'}</span>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-3 right-3 bg-yellow-400 rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
              <FiStar className="w-3.5 h-3.5 fill-yellow-600 text-yellow-700" />
              <span className="text-xs font-bold text-yellow-900">{business.rating || 'New'}</span>
            </div>
          </div>

          {/* ── Content ─────────────────────────────────────── */}
          <div className="p-4 flex flex-col h-40 justify-between">
            {/* Header */}
            <div>
              <h3 className={`text-lg font-bold mb-1 transition-colors line-clamp-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {business.name}
              </h3>
              <p className={`text-sm line-clamp-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {business.tagline || business.description || 'Visit our store today!'}
              </p>
            </div>

            {/* Footer */}
            <div className="space-y-2">
              {/* Address */}
              <div className={`flex items-center gap-2 text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <FiMapPin className="w-4 h-4 flex-shrink-0" />
                <span className="line-clamp-1">{business.address || 'Location on map'}</span>
              </div>

              {/* Reviews & CTA */}
              <div className="flex items-center justify-between">
                <div className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {business.reviews ? `${business.reviews} reviews` : 'No reviews yet'}
                </div>
                <div className="flex items-center gap-1 text-purple-500 transition-transform">
                  <span className="text-xs font-semibold">View</span>
                  <FiArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
