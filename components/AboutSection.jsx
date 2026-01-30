'use client';

import { motion } from 'framer-motion';
import businessData from '@/data/business';

export default function AboutSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  return (
    <section
      id="about"
      className="py-20 bg-white dark:bg-dark-bg"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold mb-6 gradient-text"
            >
              {businessData.about.title}
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 dark:text-gray-400 mb-4"
            >
              {businessData.about.intro}
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed"
            >
              {businessData.about.story}
            </motion.p>

            <motion.div variants={itemVariants} className="space-y-4 mb-8">
              <div>
                <h4 className="text-lg font-semibold text-accent-purple mb-2">
                  Our Mission
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {businessData.about.mission}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-accent-blue mb-2">
                  Our Vision
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {businessData.about.vision}
                </p>
              </div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-purple text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Get in Touch
            </motion.button>
          </motion.div>

          {/* Right Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            {businessData.about.achievements.map((achievement, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-2xl p-8 text-center card-shadow"
              >
                <motion.p
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="text-4xl md:text-5xl font-bold gradient-text mb-2"
                >
                  {achievement.value}
                </motion.p>
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                  {achievement.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
