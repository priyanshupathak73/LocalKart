'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AUTH_API_BASE_URL from '@/utils/authApi';

const redirectByRole = (role) => (role === 'shopkeeper' ? '/dashboard' : '/');

export default function LoginPage() {
  const { theme } = useTheme();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error' or 'success'
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    const identifier = formData.identifier.trim();
    const password = formData.password.trim();

    if (!identifier || !password) {
      setMessage('Please enter your email or phone number and password');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^[0-9]{10,15}$/.test(identifier.replace(/\D/g, ''));

    if (!isEmail && !isPhone) {
      setMessage('Please enter a valid email or phone number');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier,
          password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || 'Login failed');
        setMessageType('error');
        return;
      }

      const role = data.role || data.user?.role;
      const user = data.user || {
        id: data.user?.id,
        name: data.user?.name,
        email: data.user?.email,
        role,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));

      setMessage(`✓ Login successful as ${role === 'shopkeeper' ? 'Seller' : 'Customer'}`);
      setMessageType('success');

      window.location.href = redirectByRole(role);
    } catch (error) {
      setMessage('Connection error. Please try again.');
      setMessageType('error');
      console.error('Login error', error);
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
      <main
        className={`min-h-screen pt-32 pb-20 transition-colors ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950'
            : 'bg-gradient-to-br from-white via-purple-50 to-blue-50'
        }`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
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
            <div className="text-center mb-8">
              <h1
                className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Login to LocalKart
              </h1>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Choose your role to get started
              </p>
            </div>

            {/* Role Toggle */}
            <div className="mb-8 flex gap-3">
              <motion.button
                type="button"
                onClick={() => setSelectedRole('customer')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  selectedRole === 'customer'
                    ? theme === 'dark'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-purple-500 text-white shadow-lg shadow-purple-400/50'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-400 border border-gray-700'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                Customer
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setSelectedRole('shopkeeper')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  selectedRole === 'shopkeeper'
                    ? theme === 'dark'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-purple-500 text-white shadow-lg shadow-purple-400/50'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-400 border border-gray-700'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                Shopkeeper
              </motion.button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Email or Phone Number
                </label>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 focus-within:border-purple-500'
                      : 'bg-gray-50 border-gray-200 focus-within:border-purple-400'
                  }`}
                >
                  <FiMail
                    className={`w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Enter email or phone number"
                    className={`flex-1 bg-transparent outline-none ${
                      theme === 'dark'
                        ? 'text-white placeholder-gray-600'
                        : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Password
                </label>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 focus-within:border-purple-500'
                      : 'bg-gray-50 border-gray-200 focus-within:border-purple-400'
                  }`}
                >
                  <FiLock
                    className={`w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`flex-1 bg-transparent outline-none ${
                      theme === 'dark'
                        ? 'text-white placeholder-gray-600'
                        : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`p-1 transition-colors ${
                      theme === 'dark'
                        ? 'hover:text-purple-400'
                        : 'hover:text-purple-600'
                    }`}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-sm ${
                    messageType === 'success'
                      ? theme === 'dark'
                        ? 'bg-green-900/30 text-green-300 border border-green-700/50'
                        : 'bg-green-50 text-green-700 border border-green-200'
                      : theme === 'dark'
                      ? 'bg-red-900/30 text-red-300 border border-red-700/50'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {message}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  loading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg hover:shadow-purple-500/50'
                } bg-gradient-to-r from-purple-500 to-blue-500 text-white`}
              >
                {loading 
                  ? 'Signing in...' 
                  : `Sign in as ${selectedRole === 'shopkeeper' ? 'Shopkeeper' : 'Customer'}`
                }
              </motion.button>

              <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-purple-500 hover:text-purple-600 font-bold">
                  Create one
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
