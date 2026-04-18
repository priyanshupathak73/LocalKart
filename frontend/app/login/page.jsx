'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiMail, FiLock, FiEye, FiEyeOff, FiKey, FiShield, FiRefreshCw } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AUTH_API_BASE_URL from '@/utils/authApi';

const redirectByRole = (role) => (role === 'shopkeeper' ? '/dashboard' : '/');

export default function LoginPage() {
  const { theme } = useTheme();
  const [mode, setMode] = useState('otp');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const persistSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = redirectByRole(data.user?.role);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.email.trim()) {
      setMessage('❌ Please enter your email');
      return;
    }

    setSendingOtp(true);

    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setCooldown(60);
        setMessage('✓ OTP sent to your email');
      } else {
        setMessage(`❌ ${data.message || 'Could not send OTP'}`);
      }
    } catch (error) {
      setMessage('❌ Connection error. Is the auth worker running?');
      console.error('Send OTP error:', error);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.email.trim() || !formData.otp.trim()) {
      setMessage('❌ Please enter your email and OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✓ OTP verified! Logging you in...');
        persistSession(data);
      } else {
        setMessage(`❌ ${data.message || 'OTP verification failed'}`);
      }
    } catch (error) {
      setMessage('❌ Connection error. Is the auth worker running?');
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setMessage('❌ Please enter your email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✓ Login successful! Redirecting...');
        persistSession(data);
      } else {
        setMessage(`❌ ${data.message || 'Login failed'}`);
      }
    } catch (error) {
      setMessage('❌ Connection error. Is the auth worker running?');
      console.error('Password login error:', error);
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

  const tabClass = (active) =>
    active
      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
      : theme === 'dark'
      ? 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/70'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

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
              <h1 className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Login to LocalKart
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Use OTP for quick access or password for direct login
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode('otp')}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all ${tabClass(mode === 'otp')}`}
              >
                OTP Login
              </button>
              <button
                type="button"
                onClick={() => setMode('password')}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all ${tabClass(mode === 'password')}`}
              >
                Password Login
              </button>
            </div>

            {mode === 'otp' ? (
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 focus-within:border-purple-500'
                      : 'bg-gray-50 border-gray-200 focus-within:border-purple-400'
                  }`}>
                    <FiMail className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
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
                </div>

                {otpSent && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Enter OTP
                    </label>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 focus-within:border-purple-500'
                        : 'bg-gray-50 border-gray-200 focus-within:border-purple-400'
                    }`}>
                      <FiShield className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        name="otp"
                        inputMode="numeric"
                        maxLength={6}
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="123456"
                        className={`flex-1 bg-transparent outline-none tracking-[0.5em] text-center font-semibold ${
                          theme === 'dark'
                            ? 'text-white placeholder-gray-600'
                            : 'text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Did not receive code? Request a new OTP.'}
                    </p>
                  </motion.div>
                )}

                {message && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg text-sm font-medium text-center ${
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

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={sendingOtp || loading || (!otpSent && cooldown > 0)}
                  className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {otpSent ? (loading ? 'Verifying...' : 'Verify OTP') : sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                </motion.button>

                {otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={cooldown > 0 || sendingOtp}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-purple-200 px-4 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 disabled:opacity-50"
                  >
                    <FiRefreshCw className="h-4 w-4" />
                    Resend OTP
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-5">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 focus-within:border-purple-500'
                      : 'bg-gray-50 border-gray-200 focus-within:border-purple-400'
                  }`}>
                    <FiMail className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
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
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 focus-within:border-purple-500'
                      : 'bg-gray-50 border-gray-200 focus-within:border-purple-400'
                  }`}>
                    <FiLock className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
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
                      className={`${theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg text-sm font-medium text-center ${
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

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </motion.button>
              </form>
            )}

            <div className={`my-6 flex items-center gap-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
              <div className="flex-1 h-px bg-current"></div>
              <span className="text-sm">New to LocalKart?</span>
              <div className="flex-1 h-px bg-current"></div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Don't have an account?{' '}
                <Link href="/signup" className="text-purple-500 hover:text-purple-600 font-bold">
                  Create one
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
