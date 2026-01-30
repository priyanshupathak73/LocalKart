'use client';

import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiArrowLeft, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { getBusinessById, getRelatedBusinesses } from '@/data/businesses';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function ShopPage({ params }) {
  const { id } = params;
  const { theme } = useTheme();
  const business = getBusinessById(id);
  const relatedBusinesses = getRelatedBusinesses(id, 3);

  if (!business) {
    notFound();
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <Navbar />
      <main className={`min-h-screen pt-20 pb-20 transition-colors ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950'
          : 'bg-gradient-to-br from-white via-purple-50 to-blue-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 pt-12"
          >
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-800/50'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Home
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* HERO SECTION */}
            <motion.div
              variants={itemVariants}
              className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
            >
              {business.heroImage && (
                <Image
                  src={business.heroImage}
                  alt={business.name}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <span className="text-5xl">{business.categoryIcon}</span>
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-purple-500/90 text-white backdrop-blur">
                    {business.category}
                  </span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                >
                  {business.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-gray-200"
                >
                  {business.tagline}
                </motion.p>
              </div>
            </motion.div>

            {/* DESCRIPTION */}
            <motion.div
              variants={itemVariants}
              className={`p-6 rounded-2xl ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border border-purple-500/30'
                  : 'bg-white/80 border border-purple-200'
              }`}
            >
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
            </motion.div>

            {/* SERVICES WITH IMAGES */}
            {business.services && business.services.length > 0 && (
              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-800/30 border border-purple-500/20'
                    : 'bg-gray-50/50 border border-gray-200'
                }`}
              >
                <h2 className={`text-2xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Services
                </h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {business.services.map((service, idx) => (
                    <motion.div
                      key={service.id || idx}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className={`rounded-xl overflow-hidden ${
                        theme === 'dark'
                          ? 'bg-gray-900/50 border border-purple-500/20 hover:border-purple-500'
                          : 'bg-white border border-gray-200 hover:border-purple-400'
                      } transition-all`}
                    >
                      {/* Service Image */}
                      {service.image && (
                        <div className="relative w-full h-40 overflow-hidden bg-gray-200 dark:bg-gray-800">
                          <Image
                            src={service.image}
                            alt={service.title || service.name}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                      )}

                      {/* Service Content */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {service.icon && <span className="text-2xl">{service.icon}</span>}
                        </div>
                        <h3 className={`font-bold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {service.title || service.name}
                        </h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {service.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* GALLERY */}
            {business.galleryImages && business.galleryImages.length > 0 && (
              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border border-purple-500/30'
                    : 'bg-white/80 border border-purple-200'
                }`}
              >
                <h2 className={`text-2xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Gallery
                </h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {business.galleryImages.map((image, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      className="relative h-48 rounded-lg overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={image}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* STATS */}
            {business.stats && business.stats.length > 0 && (
              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-800/30 border border-purple-500/20'
                    : 'bg-gray-50/50 border border-gray-200'
                }`}
              >
                <h2 className={`text-2xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Our Achievements
                </h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {business.stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className={`p-4 rounded-lg text-center ${
                        theme === 'dark'
                          ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20'
                          : 'bg-gradient-to-br from-purple-100 to-blue-100'
                      }`}
                    >
                      <p className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                      }`}>
                        {stat.value}
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* TESTIMONIALS */}
            {business.testimonials && business.testimonials.length > 0 && (
              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border border-purple-500/30'
                    : 'bg-white/80 border border-purple-200'
                }`}
              >
                <h2 className={`text-2xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Customer Reviews
                </h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {business.testimonials.slice(0, 3).map((testimonial, idx) => (
                    <motion.div
                      key={testimonial.id || idx}
                      variants={itemVariants}
                      className={`p-4 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border border-purple-500/20'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{testimonial.avatar}</span>
                        <div>
                          <p className={`font-bold text-sm ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {testimonial.name}
                          </p>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-400'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <p className={`text-sm italic ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        "{testimonial.content}"
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* CONTACT SECTION */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Contact Info */}
              <div className="space-y-4">
                {business.phone && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    href={`tel:${business.phone}`}
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border border-purple-500/20 hover:border-purple-500'
                        : 'bg-white/80 border border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      <FiPhone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Phone
                      </p>
                      <p className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {business.phone}
                      </p>
                    </div>
                  </motion.a>
                )}

                {business.email && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    href={`mailto:${business.email}`}
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border border-purple-500/20 hover:border-purple-500'
                        : 'bg-white/80 border border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <FiMail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Email
                      </p>
                      <p className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {business.email}
                      </p>
                    </div>
                  </motion.a>
                )}

                {business.address && (
                  <div className={`flex items-center gap-4 p-4 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-900/50 border border-purple-500/20'
                      : 'bg-white/80 border border-purple-200'
                  }`}>
                    <div className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <FiMapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Address
                      </p>
                      <p className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {business.address}
                      </p>
                    </div>
                  </div>
                )}

                {business.openingHours && (
                  <div className={`flex items-center gap-4 p-4 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-900/50 border border-purple-500/20'
                      : 'bg-white/80 border border-purple-200'
                  }`}>
                    <div className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      <FiClock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Hours
                      </p>
                      <div className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <p className="text-sm">{business.openingHours.weekdays}</p>
                        <p className="text-xs text-gray-500">Weekdays</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Google Map */}
              {business.coordinates && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg overflow-hidden h-96 lg:h-auto"
                >
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3622.2945467193263!2d${business.coordinates.lng}!3d${business.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${business.coordinates.lat}%2C${business.coordinates.lng}!5e0!3m2!1sen!2sin!4v1234567890`}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </motion.div>
              )}
            </motion.div>

            {/* RELATED SHOPS */}
            {relatedBusinesses && relatedBusinesses.length > 0 && (
              <motion.div
                variants={itemVariants}
                className={`p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border border-purple-500/30'
                    : 'bg-white/80 border border-purple-200'
                }`}
              >
                <h2 className={`text-2xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Similar Shops
                </h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {relatedBusinesses.map((shop, idx) => (
                    <Link key={shop.id} href={`/shop/${shop.id}`}>
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border border-purple-500/20 hover:border-purple-500'
                            : 'bg-gray-50 border border-gray-200 hover:border-purple-400'
                        }`}
                      >
                        <p className={`text-sm font-bold mb-2 ${
                          theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                        }`}>
                          {shop.category}
                        </p>
                        <h3 className={`font-bold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {shop.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400">★ {shop.rating}</span>
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            →
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton whatsappNumber={business.whatsapp} />
    </>
  );
}
