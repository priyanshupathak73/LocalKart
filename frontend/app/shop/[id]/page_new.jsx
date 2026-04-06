'use client';

import { getBusinessById, getRecommendations } from '@/data/businesses';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';

export default function ShopPage({ params }) {
  const { id } = params;
  const shop = getBusinessById(id);
  const recommendations = getRecommendations(id, 3);

  if (!shop) {
    notFound();
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <main className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-96 pt-20 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={shop.heroImage}
            alt={shop.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 flex flex-col justify-end h-96">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={itemVariants} className="text-6xl mb-4 inline-block">
              {shop.categoryIcon}
            </motion.span>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
              {shop.name}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-2xl text-gray-100 mb-2">
              {shop.tagline}
            </motion.p>
            <motion.p variants={itemVariants} className="text-lg text-gray-300 max-w-2xl">
              {shop.description}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50 dark:bg-dark-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Our Services
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover the premium services and offerings we provide
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {shop.services.map((service) => (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(167, 139, 250, 0.2)' }}
                className="group bg-white dark:bg-dark-bg rounded-2xl overflow-hidden card-shadow hover:shadow-2xl transition-all"
              >
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-400 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Gallery
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Take a look at our work and facilities
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {shop.galleryImages.slice(0, 4).map((image, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="relative h-64 rounded-2xl overflow-hidden card-shadow cursor-pointer group"
              >
                <Image
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-dark-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {shop.stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-dark-bg rounded-2xl p-8 text-center card-shadow hover:shadow-xl transition-all"
              >
                <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      {shop.testimonials && shop.testimonials.length > 0 && (
        <section className="py-20 bg-white dark:bg-dark-bg">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                Customer Testimonials
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                What our happy customers say about us
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {shop.testimonials.slice(0, 3).map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="bg-gray-50 dark:bg-dark-secondary rounded-2xl p-8 card-shadow hover:shadow-xl transition-all"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{testimonial.avatar}</span>
                    <div>
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{testimonial.content}"
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 bg-gray-50 dark:bg-dark-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Get In Touch
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Contact us for more information or to place an order
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <motion.a
                href={`tel:${shop.phone}`}
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4 p-6 rounded-xl bg-white dark:bg-dark-bg hover:bg-gradient-purple hover:text-white transition-all cursor-pointer group"
              >
                <FiPhone className="text-3xl mt-2 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Phone</h3>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-white/90">
                    {shop.phone}
                  </p>
                </div>
              </motion.a>

              <motion.a
                href={`mailto:${shop.email}`}
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4 p-6 rounded-xl bg-white dark:bg-dark-bg hover:bg-gradient-purple hover:text-white transition-all cursor-pointer group"
              >
                <FiMail className="text-3xl mt-2 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-white/90">
                    {shop.email}
                  </p>
                </div>
              </motion.a>

              <motion.div
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4 p-6 rounded-xl bg-white dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-secondary transition-all"
              >
                <FiMapPin className="text-3xl mt-2 flex-shrink-0 text-accent-purple" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Address</h3>
                  <p className="text-gray-600 dark:text-gray-400">{shop.address}</p>
                  <p className="text-gray-600 dark:text-gray-400">{shop.location}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4 p-6 rounded-xl bg-white dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-secondary transition-all"
              >
                <FiClock className="text-3xl mt-2 flex-shrink-0 text-accent-blue" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Hours</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Weekdays:</strong> {shop.openingHours?.weekdays || 'Contact for hours'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Weekends:</strong> {shop.openingHours?.weekends || 'Contact for hours'}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Map and CTA */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden card-shadow">
                {shop.coordinates && (
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.123456789!2d${shop.coordinates.lng}!3d${shop.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </div>

              <motion.a
                href={`https://wa.me/${shop.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="block w-full py-4 px-6 bg-gradient-purple text-white font-bold rounded-lg text-center hover:shadow-lg transition-all text-lg"
              >
                💬 Contact on WhatsApp
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Similar Shops Section */}
      {recommendations && recommendations.length > 0 && (
        <section className="py-20 bg-white dark:bg-dark-bg">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                Similar {shop.category} Shops
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Explore other excellent options in the same category
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {recommendations.map((rec) => (
                <motion.a
                  key={rec.id}
                  href={`/shop/${rec.id}`}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group bg-gray-50 dark:bg-dark-secondary rounded-2xl overflow-hidden card-shadow hover:shadow-2xl transition-all"
                >
                  <div className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-400 overflow-hidden">
                    <Image
                      src={rec.heroImage}
                      alt={rec.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-3xl mb-2 block">{rec.categoryIcon}</span>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-accent-purple transition-colors">
                      {rec.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {rec.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400">★ {rec.rating}</span>
                      <span className="text-accent-purple group-hover:translate-x-2 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
