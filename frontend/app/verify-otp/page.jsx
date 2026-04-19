'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiShield, FiChevronLeft } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AUTH_API_BASE_URL from '@/utils/authApi';

const redirectByRole = (role) => (role === 'shopkeeper' ? '/dashboard' : '/');

export default function VerifyOtpPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedEmail = sessionStorage.getItem('login_email');
    if (!storedEmail) {
      setMessage('❌ Session expired. Please login again.');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

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
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const persistSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    sessionStorage.removeItem('login_email');
    window.location.href = redirectByRole(data.user?.role);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!otp || otp.length !== 6) {
      setMessage('❌ Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
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
      setMessage('❌ Connection error. Please try again.');
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setCooldown(60);
        setMessage('✓ OTP sent to your email');
        setOtp('');
      } else {
        setMessage(`❌ ${data.message || 'Could not send OTP'}`);
      }
    } catch (error) {
      setMessage('❌ Connection error. Please try again.');
      console.error('Resend OTP error:', error);
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

  if (!mounted || !email) {
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
          <div className="max-w-md mx-auto px-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`p-8 rounded-2xl backdrop-blur-md text-center ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border border-purple-500/30'
                  : 'bg-white/80 border border-purple-200'
              }`}
            >
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Loading...
              </p>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

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
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  theme === 'dark'
                    ? 'bg-purple-500/20'
                    : 'bg-purple-100'
                }`}
              >
                <FiShield
                  className={`w-8 h-8 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`}
                />
              </div>
              <h1
                className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Verify OTP
              </h1>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                We've sent a 6-digit OTP to<br />
                <span className="font-semibold">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* OTP Input */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={otp}
                  onChange={handleChange}
                  placeholder="000000"
                  className={`w-full px-4 py-4 rounded-lg border-2 text-center text-2xl font-bold tracking-[0.5em] transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 focus:border-purple-500 text-white placeholder-gray-600'
                      : 'bg-gray-50 border-gray-200 focus:border-purple-400 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Message Display */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-sm ${
                    message.includes('✓')
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

              {/* Verify Button */}
              <motion.button
                type="submit"
                disabled={loading || otp.length !== 6}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  loading || otp.length !== 6
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg hover:shadow-purple-500/50'
                } bg-gradient-to-r from-purple-500 to-blue-500 text-white`}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </motion.button>

              {/* Resend OTP */}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  cooldown > 0 || loading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-purple-50'
                } border-2 border-purple-300 text-purple-600`}
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('login_email');
                  router.push('/login');
                }}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                <FiChevronLeft className="w-4 h-4" />
                Back to Login
              </button>
            </form>

            <p
              className={`mt-6 text-center text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              OTP expires in 5 minutes. For security, do not share this code.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
