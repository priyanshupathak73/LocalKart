'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiMapPin, FiPhone, FiStar, FiArrowRight } from 'react-icons/fi';

export default function ShopCard({ business, index = 0 }) {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
      },
    },
    hover: {
      y: -10,
      boxShadow: theme === 'dark'
        ? '0 20px 40px rgba(168, 85, 247, 0.3)'
        : '0 20px 40px rgba(147, 51, 234, 0.2)',
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
          className={`h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20 hover:border-purple-500/50'
              : 'bg-white border border-gray-200 hover:border-purple-300'
          }`}
        >
          {/* Image Container */}
          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500">
            <Image
              src={business.image}
              alt={business.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Category Badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="text-lg">{business.categoryIcon}</span>
              <span className="text-xs font-semibold text-gray-900">{business.category}</span>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-3 right-3 bg-yellow-400 rounded-full p-2 flex items-center gap-1">
              <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-600" />
              <span className="text-xs font-bold text-yellow-900">{business.rating}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col h-40 justify-between">
            {/* Header */}
            <div>
              <h3 className={`text-lg font-bold mb-1 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {business.name}
              </h3>
              <p className={`text-sm line-clamp-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {business.tagline}
              </p>
            </div>

            {/* Footer */}
            <div className="space-y-2">
              {/* Location */}
              <div className={`flex items-center gap-2 text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <FiMapPin className="w-4 h-4 flex-shrink-0" />
                <span className="line-clamp-1">{business.address}</span>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between">
                <div className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {business.reviews} reviews
                </div>
                <div className="flex items-center gap-1 text-purple-500 group-hover:translate-x-2 transition-transform">
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
