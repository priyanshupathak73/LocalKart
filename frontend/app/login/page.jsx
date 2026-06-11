'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiLock, FiEye, FiEyeOff, FiMapPin, FiArrowRight, FiCheck } from 'react-icons/fi';
import AUTH_API_BASE_URL from '@/utils/authApi';

const redirectByRole = (role) => {
  if (role === 'shopkeeper') return '/dashboard';
  if (role === 'delivery')   return '/delivery-dashboard';
  return '/customer-dashboard';
};

/** Reusable input row */
function InputField({ icon: Icon, label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all bg-gray-50 ${
        error ? 'border-red-300 focus-within:border-red-400' : 'border-gray-200 focus-within:border-green-500 focus-within:bg-white focus-within:shadow-sm focus-within:shadow-green-500/10'
      }`}>
        {Icon && <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        {children}
      </div>
      {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = 'flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 placeholder-gray-400';

export default function LoginPage() {
  const [selectedRole,  setSelectedRole]  = useState('customer');
  const [showPassword,  setShowPassword]  = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [message,       setMessage]       = useState('');
  const [messageType,   setMessageType]   = useState(''); // 'error' | 'success'
  const [formData,      setFormData]      = useState({ identifier: '', password: '' });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage('');
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { identifier, password } = formData;

    if (!identifier.trim() || !password.trim()) {
      setMessage('Please fill in all fields.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^[0-9]{10,15}$/.test(identifier.replace(/\D/g, ''));
    if (!isEmail && !isPhone) {
      setMessage('Enter a valid email or phone number.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const res  = await fetch(`${AUTH_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password, role: selectedRole }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage(data.message || 'Login failed. Please check your credentials.');
        setMessageType('error');
        return;
      }

      const role = data.role || data.user?.role;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setMessage(`Signed in successfully! Redirecting…`);
      setMessageType('success');
      setTimeout(() => { window.location.href = redirectByRole(role); }, 800);
    } catch {
      setMessage('Connection error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // ── Left panel perks ──────────────────────────────────────────────────────
  const perks = [
    { emoji: '⚡', text: 'Same-hour delivery from local shops' },
    { emoji: '🏪', text: '50+ shops in Ara, Bihar' },
    { emoji: '🚀', text: 'Free delivery for limited time' },
    { emoji: '💳', text: 'Cash on delivery & UPI accepted' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col bg-gradient-to-br from-[#0f4c2a] via-[#166534] to-[#14532d] relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-300/10 rounded-full blur-3xl" />
        {/* Floating emojis */}
        {['🛒','🥦','🍞','🥛','💊','🧅'].map((e, i) => (
          <span key={i} className="absolute text-2xl opacity-10 animate-bounce select-none"
            style={{ left:`${8+i*15}%`, top:`${20+(i%3)*20}%`, animationDelay:`${i*0.5}s`, animationDuration:`${2.5+i*0.3}s` }}>
            {e}
          </span>
        ))}

        <div className="relative flex flex-col h-full px-10 py-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-auto">
            <span className="text-3xl">🏪</span>
            <span className="text-2xl font-black text-white tracking-tight">
              Local<span className="text-green-300">Kart</span>
            </span>
          </Link>

          {/* Main copy */}
          <div className="my-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-xs font-extrabold text-green-200 mb-6">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Serving Ara, Bihar
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-3">
              Order Local,<br />
              <span className="text-green-300">Delivered Fast ⚡</span>
            </h1>
            <p className="text-green-100/80 text-base font-medium mb-8">
              Sign in to access your orders, track deliveries, and discover shops near you.
            </p>

            {/* Perks */}
            <div className="space-y-3">
              {perks.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-green-100/90 text-sm font-medium">{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex gap-8 mt-auto pt-8 border-t border-white/10">
            {[['5,000+','Happy Customers'],['50+','Local Shops'],['60 min','Avg Delivery']].map(([val, lab]) => (
              <div key={lab}>
                <p className="text-xl font-black text-white">{val}</p>
                <p className="text-green-300 text-xs font-bold">{lab}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50 min-h-screen">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🏪</span>
            <span className="text-2xl font-black tracking-tight">Local<span className="text-green-600">Kart</span></span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-7">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back! 👋</h2>
            <p className="text-gray-400 text-sm font-medium mt-1">Sign in to your LocalKart account</p>
          </div>

          {/* Role toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            {[
              { val: 'customer',   label: '🛒 Customer'   },
              { val: 'shopkeeper', label: '🏪 Shopkeeper' },
              { val: 'delivery',   label: '🚚 Delivery'   },
            ].map(r => (
              <button
                key={r.val}
                type="button"
                onClick={() => { setSelectedRole(r.val); setMessage(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedRole === r.val
                    ? 'bg-[#166534] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <InputField icon={FiMail} label="Email or Phone" id="lk-id">
              <input
                id="lk-id"
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter email or phone"
                className={inputCls}
                autoComplete="username"
              />
            </InputField>

            <InputField icon={FiLock} label="Password" id="lk-pw">
              <input
                id="lk-pw"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={inputCls}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
                {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </InputField>

            {/* Message */}
            {message && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${
                messageType === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                {messageType === 'success' ? <FiCheck size={14} /> : '⚠'}
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-extrabold text-sm bg-[#166534] hover:bg-green-800 text-white shadow-lg shadow-green-800/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign in as {selectedRole === 'shopkeeper' ? 'Shopkeeper' : selectedRole === 'delivery' ? 'Delivery Agent' : 'Customer'} <FiArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 font-medium mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-green-700 font-extrabold hover:text-green-800 transition">
              Create one free →
            </Link>
          </p>

          {/* Trust chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['🔒 Secure Login', '📍 Ara, Bihar', '⚡ Instant Access'].map(chip => (
              <span key={chip} className="text-[11px] font-extrabold text-gray-400 bg-white border border-gray-100 px-3 py-1 rounded-full shadow-sm">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
