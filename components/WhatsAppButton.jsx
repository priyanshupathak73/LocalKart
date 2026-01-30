'use client';

import { motion } from 'framer-motion';
import { FiMessageCircle } from 'react-icons/fi';
import businessData from '@/data/business';

export default function WhatsAppButton() {
  const handleWhatsApp = () => {
    const message = `Hello ${businessData.name}! I'd like to know more about your services.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${businessData.whatsapp}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleWhatsApp}
      className="fixed bottom-8 right-8 z-40 p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
      aria-label="Contact on WhatsApp"
    >
      <FiMessageCircle size={28} />
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"
      />
    </motion.button>
  );
}
