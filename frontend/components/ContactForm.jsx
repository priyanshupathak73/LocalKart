'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 3000);
    }, 500);
  };

  const services = [
    'Custom Cakes',
    'Fresh Pastries',
    'Dessert Platters',
    'Artisan Bread',
    'Seasonal Specials',
    'Wedding Catering',
  ];

  return (
    <section
      id="contact"
      className="py-20 bg-gray-50 dark:bg-dark-secondary"
    >
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Get In Touch
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Have questions? We'd love to hear from you.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-dark-bg rounded-2xl p-8 md:p-12 card-shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <motion.div whileHover={{ y: -2 }}>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-dark-secondary focus:border-accent-purple focus:outline-none transition-colors"
                placeholder="John Doe"
              />
            </motion.div>

            {/* Email */}
            <motion.div whileHover={{ y: -2 }}>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-dark-secondary focus:border-accent-purple focus:outline-none transition-colors"
                placeholder="john@example.com"
              />
            </motion.div>

            {/* Phone */}
            <motion.div whileHover={{ y: -2 }}>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-dark-secondary focus:border-accent-purple focus:outline-none transition-colors"
                placeholder="+91 98765 43210"
              />
            </motion.div>

            {/* Service */}
            <motion.div whileHover={{ y: -2 }}>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Service Interested
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-dark-secondary focus:border-accent-purple focus:outline-none transition-colors"
              >
                <option value="">Select a service...</option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>

          {/* Message */}
          <motion.div whileHover={{ y: -2 }}>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-dark-secondary focus:border-accent-purple focus:outline-none transition-colors resize-none"
              placeholder="Tell us about your requirements..."
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="mt-8 w-full py-4 bg-gradient-purple text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Send Message
          </motion.button>

          {/* Success Message */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-center font-semibold"
            >
              ✓ Thank you! We'll get back to you soon.
            </motion.div>
          )}
        </motion.form>
      </div>
    </section>
  );
}
