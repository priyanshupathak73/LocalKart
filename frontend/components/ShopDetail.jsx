'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiClock, FiPhone, FiMapPin, FiMail } from 'react-icons/fi';

const CATEGORY_FALLBACKS = {
  Bakery:   'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900',
  Medical:  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=900',
  Salon:    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900',
  Grocery:  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900',
  Coaching: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900',
};

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=900';

export default function ShopDetail({ business }) {
  const { theme } = useTheme();
  const [heroError, setHeroError] = useState(false);

  if (!business) {
    return (
      <div className={`text-center py-20 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Business not found
      </div>
    );
  }

  useEffect(() => {
    console.log(business.name, business.imageUrl || business.thumbnail || business.image || null);
  }, [business]);

  // Resolve hero image — same logic as ShopCard
  const resolveHeroImage = () => {
    if (heroError) return CATEGORY_FALLBACKS[business.category] || DEFAULT_PLACEHOLDER;
    if (business.imageUrl) return business.imageUrl;
    if (business.thumbnail) return business.thumbnail;
    if (business.image && business.image.startsWith('http')) return business.image;
    return CATEGORY_FALLBACKS[business.category] || DEFAULT_PLACEHOLDER;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative h-96 rounded-2xl overflow-hidden">
        <img
          src={resolveHeroImage()}
          alt={business.name}
          onError={() => setHeroError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-4xl">{business.categoryIcon}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              theme === 'dark'
                ? 'bg-purple-500 text-white'
                : 'bg-purple-400 text-white'
            }`}>
              {business.category}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{business.name}</h1>
          <p className="text-lg text-gray-200">{business.tagline}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className={`rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20'
              : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              About
            </h2>
            <p className={`text-base leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {business.description}
            </p>
          </div>

          {/* Services */}
          <div className={`rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20'
              : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {business.services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-purple-800/20 border-purple-500/30 hover:border-purple-500'
                      : 'bg-white border-purple-200 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{service.icon}</span>
                    <div>
                      <h3 className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {service.name}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          {business.testimonials && business.testimonials.length > 0 && (
            <div className={`rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20'
                : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Testimonials
              </h2>
              <div className="space-y-4">
                {business.testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-purple-800/20 border border-purple-500/30'
                        : 'bg-white border border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-400">★</span>
                      <span className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {testimonial.name}
                      </span>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        • {testimonial.role}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {testimonial.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Contact Card */}
          <div className={`rounded-2xl p-6 sticky top-24 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20'
              : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Contact Information
            </h3>

            {/* Rating */}
            <div className="mb-4 pb-4 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Rating
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">★</span>
                  <span className="text-lg font-bold text-yellow-500">{business.rating}</span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    ({business.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Phone */}
            <a
              href={`tel:${business.phone}`}
              className={`flex items-center gap-3 mb-3 p-3 rounded-lg transition-all hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-purple-800/20 hover:bg-purple-700/30'
                  : 'bg-white hover:bg-purple-100'
              }`}
            >
              <FiPhone className="w-5 h-5 text-purple-500" />
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Phone
                </p>
                <p className={`font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {business.phone}
                </p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${business.email}`}
              className={`flex items-center gap-3 mb-3 p-3 rounded-lg transition-all hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-purple-800/20 hover:bg-purple-700/30'
                  : 'bg-white hover:bg-purple-100'
              }`}
            >
              <FiMail className="w-5 h-5 text-blue-500" />
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Email
                </p>
                <p className={`font-semibold truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {business.email}
                </p>
              </div>
            </a>

            {/* Address */}
            <div className={`flex items-start gap-3 p-3 rounded-lg ${
              theme === 'dark'
                ? 'bg-purple-800/20'
                : 'bg-white'
            }`}>
              <FiMapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Address
                </p>
                <p className={`font-semibold text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {business.address}
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className={`mt-4 pt-4 border-t border-purple-500/20 flex items-start gap-3 p-3 rounded-lg ${
              theme === 'dark'
                ? 'bg-purple-800/20'
                : 'bg-white'
            }`}>
              <FiClock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <p className={`text-xs font-semibold ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Opening Hours
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Weekdays: {business.openingHours.weekdays}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Weekends: {business.openingHours.weekends}
                </p>
              </div>
            </div>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-4 py-3 rounded-lg font-bold transition-all hover:scale-105 text-center bg-green-500 text-white hover:bg-green-600"
            >
              💬 Contact on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
