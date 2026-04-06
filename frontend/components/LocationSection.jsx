'use client';

import { motion } from 'framer-motion';
import businessData from '@/data/business';

export default function LocationSection() {
  return (
    <section
      id="location"
      className="py-20 bg-white dark:bg-dark-bg"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Find Us Here
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Visit our bakery in the heart of Mathura
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              whileHover={{ x: 10 }}
              className="flex items-start space-x-4 p-6 rounded-xl bg-gray-50 dark:bg-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
            >
              <span className="text-4xl mt-2">📍</span>
              <div>
                <h3 className="text-xl font-semibold mb-2">Address</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {businessData.address}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {businessData.location}
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 10 }}
              className="flex items-start space-x-4 p-6 rounded-xl bg-gray-50 dark:bg-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
            >
              <span className="text-4xl mt-2">📞</span>
              <div>
                <h3 className="text-xl font-semibold mb-2">Phone</h3>
                <a
                  href={`tel:${businessData.phone}`}
                  className="text-accent-purple hover:text-accent-blue transition-colors"
                >
                  {businessData.phone}
                </a>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 10 }}
              className="flex items-start space-x-4 p-6 rounded-xl bg-gray-50 dark:bg-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
            >
              <span className="text-4xl mt-2">✉️</span>
              <div>
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <a
                  href={`mailto:${businessData.email}`}
                  className="text-accent-purple hover:text-accent-blue transition-colors"
                >
                  {businessData.email}
                </a>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 10 }}
              className="flex items-start space-x-4 p-6 rounded-xl bg-gray-50 dark:bg-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
            >
              <span className="text-4xl mt-2">🕐</span>
              <div>
                <h3 className="text-xl font-semibold mb-2">Opening Hours</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Weekdays:</strong> {businessData.openingHours.weekdays}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Weekends:</strong> {businessData.openingHours.weekends}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden card-shadow h-96"
          >
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3552.5260876920546!2d${businessData.mapCoordinates.lng}!3d${businessData.mapCoordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDMwJzMxLjciTiA3N8KwNDEnMjAuMCJF!5e0!3m2!1sen!2sin!4v1234567890`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
