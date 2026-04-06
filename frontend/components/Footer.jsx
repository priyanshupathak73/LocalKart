'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';
import businessData from '@/data/business';

export default function Footer() {
  const socialLinks = [
    { icon: FiMail, href: `mailto:${businessData.email}`, label: 'Email' },
    { icon: FiTwitter, href: businessData.socialMedia.twitter, label: 'Twitter' },
    { icon: FiLinkedin, href: businessData.socialMedia.facebook, label: 'LinkedIn' },
  ];

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="bg-gray-900 dark:bg-dark-bg text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              {businessData.name}
            </h3>
            <p className="text-gray-400 mb-4">
              {businessData.hero.description}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-gray-700 hover:bg-gradient-purple rounded-lg transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-accent-purple transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {businessData.services.slice(0, 4).map((service) => (
                <li key={service.id}>
                  <a href="#services" className="text-gray-400 hover:text-accent-purple transition-colors">
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-gray-400">
              <p>
                <span className="block text-accent-purple font-semibold">Phone</span>
                {businessData.phone}
              </p>
              <p>
                <span className="block text-accent-purple font-semibold">Email</span>
                {businessData.email}
              </p>
              <p>
                <span className="block text-accent-purple font-semibold">Address</span>
                {businessData.location}
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border-t border-gray-700 pt-8 text-center text-gray-400"
        >
          <p>
            © {new Date().getFullYear()} {businessData.name}. All rights reserved.
          </p>
          <p className="mt-2 text-sm">
            Designed with ❤️ for businesses that bake with passion.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
