'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SignupPage() {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('❌ Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✓ Account created! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        setMessage(`❌ ${data.message || 'Signup failed'}`);
      }
    } catch (error) {
      setMessage('❌ Connection error. Is the server running?');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <>
      <Navbar />
      <main className={`min-h-screen pt-32 pb-20 transition-colors ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950'
          : 'bg-gradient-to-br from-white via-purple-50 to-blue-50'
      }`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl"
          />
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"
          />
        </div>

        <div className="max-w-md mx-auto px-4 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`p-8 rounded-2xl backdrop-blur-md ${
              theme === 'dark'
                ? 'bg-gray-900/50 border border-purple-500/30'
                : 'bg-white/80 border border-purple-200'
            }`}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Create Account
              </h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Join Ara Local and discover local businesses
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-x-5">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-5"
              >
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 focus-within:border-purple-500'
                    : 'bg-gray-50 border-gray-200 focus-within:border-purple-400'
                }`}>
                  <FiUser className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`flex-1 bg-transparent outline-none ${
                      theme === 'dark'
                        ? 'text-white placeholder-gray-600'
                        : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-5"
              >
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 focus-within:border-purple-500'
                    : 'bg-gray-50 border-gray-200 focus-within:border-purple-400'
                }`}>
                  <FiMail className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`flex-1 bg-transparent outline-none ${
                      theme === 'dark'
                        ? 'text-white placeholder-gray-600'
                        : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-5"
              >
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 focus-within:border-purple-500'
                    : 'bg-gray-50 border-gray-200 focus-within:border-purple-400'
                }`}>
                  <FiLock className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`flex-1 bg-transparent outline-none ${
                      theme === 'dark'
                        ? 'text-white placeholder-gray-600'
                        : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`${
                      theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-5"
              >
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Confirm Password
                </label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 focus-within:border-purple-500'
                    : 'bg-gray-50 border-gray-200 focus-within:border-purple-400'
                }`}>
                  <FiLock className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`flex-1 bg-transparent outline-none ${
                      theme === 'dark'
                        ? 'text-white placeholder-gray-600'
                        : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`${
                      theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </motion.div>

              {/* Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 rounded-lg text-sm font-medium text-center mb-5 ${
                    message.includes('✓')
                      ? theme === 'dark'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-green-100 text-green-700'
                      : theme === 'dark'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {message}
                </motion.div>
              )}

              {/* Signup Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </form>

            {/* Divider */}
            <div className={`my-6 flex items-center gap-3 ${
              theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              <div className="flex-1 h-px bg-current"></div>
              <span className="text-sm">Already have an account?</span>
              <div className="flex-1 h-px bg-current"></div>
            </div>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Have an account?{' '}
                <Link href="/login" className="text-purple-500 hover:text-purple-600 font-bold">
                  Login here
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
