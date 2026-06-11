'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiSearch, FiShoppingCart, FiMapPin, FiChevronDown, FiArrowRight,
  FiStar, FiClock, FiPlus, FiCheck, FiMenu, FiX, FiZap,
  FiTruck, FiShield, FiSmile, FiPhone, FiUser, FiInfo, FiTag, FiHeart, FiMinus
} from 'react-icons/fi';
import axios from 'axios';
import API_BASE_URL from '@/utils/api';

// ─── STATIC IMAGES & DATA ───────────────────────────────────────────────────

const SIDEBAR_CATEGORIES = [
  { id: 'vegetables', label: 'Vegetables', icon: '🥬', count: '12 Items' },
  { id: 'fruits', label: 'Fruits', icon: '🍎', count: '8 Items' },
  { id: 'dairy', label: 'Dairy & Eggs', icon: '🥚', count: '15 Items' },
  { id: 'meat', label: 'Meat & Fish', icon: '🥩', count: '6 Items' },
  { id: 'bread', label: 'Fresh Bread', icon: '🍞', count: '9 Items' },
  { id: 'snacks', label: 'Snacks', icon: '🍿', count: '20 Items' },
  { id: 'beverages', label: 'Beverages', icon: '🥤', count: '14 Items' },
  { id: 'personal', label: 'Personal Care', icon: '🧴', count: '18 Items' },
  { id: 'home', label: 'Home Care', icon: '🧹', count: '22 Items' },
  { id: 'organics', label: 'Organics', icon: '🌿', count: '10 Items' },
];

const MAIN_CATEGORIES = [
  { id: 'vegetables', label: 'Vegetables', bg: 'bg-[#EAF2EC]', text: 'text-[#0F3A1F]', img: 'https://images.unsplash.com/photo-1566385101042-1a010c12b585?w=200&fit=crop&q=80' },
  { id: 'fruits', label: 'Fruits', bg: 'bg-[#FFF2F2]', text: 'text-red-700', img: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=200&fit=crop&q=80' },
  { id: 'dairy', label: 'Dairy & Eggs', bg: 'bg-[#F2F7FF]', text: 'text-blue-700', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&fit=crop&q=80' },
  { id: 'meat', label: 'Meat & Fish', bg: 'bg-[#FFF7ED]', text: 'text-orange-700', img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&fit=crop&q=80' },
  { id: 'bread', label: 'Fresh Bread', bg: 'bg-[#FEFCE8]', text: 'text-yellow-700', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&fit=crop&q=80' },
  { id: 'snacks', label: 'Snacks', bg: 'bg-[#FAF5FF]', text: 'text-purple-700', img: 'https://images.unsplash.com/photo-1599490659213-e2b9527b0f76?w=200&fit=crop&q=80' },
  { id: 'beverages', label: 'Beverages', bg: 'bg-[#F0FDFA]', text: 'text-teal-700', img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&fit=crop&q=80' },
];

const POPULAR_PRODUCTS = [
  { id: 'prod1', name: 'Fresh Red Tomato', price: 25, mrp: 35, discount: 28, unit: '1 kg', img: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=350&fit=crop&q=80', rating: 4.8 },
  { id: 'prod2', name: 'Organic Green Broccoli', price: 60, mrp: 80, discount: 25, unit: '500 g', img: 'https://images.unsplash.com/photo-1456412684996-33903d73ad78?w=350&fit=crop&q=80', rating: 4.7 },
  { id: 'prod3', name: 'Fresh Russet Potatoes', price: 20, mrp: 25, discount: 20, unit: '1 kg', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=350&fit=crop&q=80', rating: 4.5 },
  { id: 'prod4', name: 'Vibrant Eggplant (Brinjal)', price: 30, mrp: 40, discount: 25, unit: '1 kg', img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=350&fit=crop&q=80', rating: 4.6 },
  { id: 'prod5', name: 'Sweet Fresh Strawberries', price: 120, mrp: 180, discount: 33, unit: '250 g', img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=350&fit=crop&q=80', rating: 4.9 },
  { id: 'prod6', name: 'Ripe Creamy Avocado', price: 80, mrp: 110, discount: 27, unit: '1 pc', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=350&fit=crop&q=80', rating: 4.8 },
  { id: 'prod7', name: 'Sweet Organic Carrots', price: 40, mrp: 50, discount: 20, unit: '1 kg', img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=350&fit=crop&q=80', rating: 4.4 },
  { id: 'prod8', name: 'Fresh English Cucumber', price: 28, mrp: 38, discount: 26, unit: '500 g', img: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=350&fit=crop&q=80', rating: 4.3 }
];

const TRENDING_PRODUCTS = [
  { id: 'trend1', name: 'Pure Orange Juice Bottle', price: 90, mrp: 130, discount: 30, unit: '1 L', img: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=350&fit=crop&q=80', rating: 4.8 },
  { id: 'trend2', name: 'Pressed Apple Juice', price: 105, mrp: 150, discount: 30, unit: '1 L', img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=350&fit=crop&q=80', rating: 4.7 },
  { id: 'trend3', name: 'Organic Pomegranate Juice', price: 120, mrp: 170, discount: 30, unit: '1 L', img: 'https://images.unsplash.com/photo-1622484211148-717498c8c50d?w=350&fit=crop&q=80', rating: 4.9 }
];

// Helper for fallbacks
function ImgWithFallback({ src, alt, className }) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={err ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' : src}
      alt={alt}
      className={className}
      onError={() => setErr(true)}
      loading="lazy"
    />
  );
}

export default function LocalKartHome() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [favorites, setFavorites] = useState({});
  
  // Timer State for Deals (4 hours 22 minutes 45 seconds countdown)
  const [timeLeft, setTimeLeft] = useState(15765); // in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 15765));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hrs.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  // Sync user details
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenu(false);
    setToastMessage('Successfully logged out!');
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleAddToCart = (product, e) => {
    if (e) e.preventDefault();
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    setToastMessage(`✓ Added ${product.name} to cart!`);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const decreaseQuantity = (productId, e) => {
    if (e) e.preventDefault();
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId]--;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const toggleFavorite = (prodId, name, e) => {
    if (e) e.preventDefault();
    setFavorites(prev => {
      const isFav = !prev[prodId];
      setToastMessage(isFav ? `❤️ Added ${name} to Favorites!` : `Removed ${name} from Favorites.`);
      setTimeout(() => setToastMessage(''), 2000);
      return { ...prev, [prodId]: isFav };
    });
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const time = formatTime(timeLeft);

  // Client-side search filters
  const filteredPopular = POPULAR_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTrending = TRENDING_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFB] font-sans text-gray-800 antialiased">
      
      {/* ─── TOAST NOTIFICATION ──────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0F3A1F] text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-2xl z-50 animate-bounce flex items-center gap-2 border border-green-700/30">
          <FiCheck className="text-green-400 stroke-[3] text-sm flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── DUAL ROW NAVBAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full shadow-sm bg-white border-b border-gray-100">
        
        {/* Row 1: Top Utility Strip (Dark Green Theme) */}
        <div className="w-full bg-[#0F3A1F] text-white py-2 px-4 sm:px-6 lg:px-8 text-[11px] font-black uppercase tracking-wider flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-green-950/20 select-none">
          <div className="flex items-center gap-2">
            <span className="bg-green-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded animate-pulse">⚡ Fast</span>
            <span>Same-Hour Delivery from local stores in 40 Mins!</span>
          </div>
          <div className="flex items-center gap-4 text-green-200/80">
            <a href="tel:+919876543210" className="hover:text-white transition-colors flex items-center gap-1.5">
              <FiPhone className="text-xs" />
              <span>Support: +91 98765 43210</span>
            </a>
            <span className="text-green-800">|</span>
            <Link href={user ? '/customer-dashboard?tab=orders' : '/login'} className="hover:text-white transition-colors">
              Track Order
            </Link>
            <span className="text-green-800">|</span>
            <Link href="/customer-dashboard" className="hover:text-white transition-colors">
              Shop Directory
            </Link>
          </div>
        </div>

        {/* Row 2: Main Header (Off-white / light gray canvas) */}
        <div className="w-full bg-[#F4F6F5] py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Logo, Divider and Location Selector */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center select-none mr-2">
                <img 
                  src="/logo.png" 
                  alt="e-LocalKart Logo" 
                  className="h-14 w-auto object-contain"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </Link>

              {/* Divider */}
              <div className="hidden sm:block h-9 w-[1.5px] bg-gray-300/60 mx-4"></div>

              {/* Location Marker */}
              <div className="hidden sm:flex items-center gap-2 text-left select-none">
                <div className="w-8 h-8 rounded-xl bg-green-100/60 flex items-center justify-center text-[#0F3A1F]">
                  <FiMapPin className="stroke-[2.5]" size={15} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider leading-none">Deliver To</p>
                  <p className="font-black text-gray-900 text-xs flex items-center gap-0.5 mt-0.5">
                    Ara, Bihar
                    <FiChevronDown className="text-gray-400 text-[10px]" />
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md items-center bg-white border border-gray-200 focus-within:border-[#0F3A1F] focus-within:ring-2 focus-within:ring-[#0F3A1F]/10 rounded-full px-4 py-2 gap-2 shadow-sm transition-all">
              <FiSearch className="text-gray-400 stroke-[2.5]" size={16} />
              <input
                type="text"
                placeholder="Search groceries, bakery, medicines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none flex-1 text-xs font-semibold placeholder-gray-400 text-gray-800"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                  <FiX size={14} className="stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Nav Menu Links (Clean text tags) */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-extrabold uppercase tracking-wider text-gray-500 select-none">
              <Link href="/" className="text-green-700 border-b-2 border-green-700 pb-0.5">Home</Link>
              <Link href="/customer-dashboard" className="hover:text-gray-900 transition-colors">Shop</Link>
              <Link href="/customer-dashboard" className="hover:text-gray-900 transition-colors">Products</Link>
              <Link href="/" className="hover:text-gray-900 transition-colors">Blog</Link>
              <Link href="/customer-dashboard" className="hover:text-gray-900 transition-colors">Contact</Link>
            </nav>

            {/* Right Side Actions: Profile and Cart */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* Account / Login & Sign Up Actions */}
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button className="px-4 py-2 border border-gray-300 hover:border-gray-400 rounded-xl transition-all text-gray-700 text-xs font-black uppercase tracking-wider">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 bg-[#0F3A1F] hover:bg-[#165a31] text-white rounded-xl transition-all text-xs font-black uppercase tracking-wider shadow-sm shadow-green-800/10">
                    Sign Up
                  </button>
                </Link>
                {user && (
                  <div className="flex items-center gap-2 bg-white/70 border border-gray-250/50 pl-2 pr-1.5 py-1.5 rounded-2xl shadow-sm ml-1 select-none">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-green-400 text-white font-black text-xs flex items-center justify-center shadow-sm uppercase">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                    <button onClick={handleLogout} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl transition ml-1" title="Logout">
                      <FiX size={14} className="stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Button with mint bg and red counter */}
              <Link href={user ? '/customer-dashboard' : '/login'}>
                <button className="h-10 px-4 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#0F3A1F] rounded-xl transition-all shadow-sm flex items-center gap-2 relative">
                  <FiShoppingCart size={16} className="stroke-[2.5]" />
                  <span className="text-xs font-black hidden sm:block uppercase tracking-wider">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* Mobile menu trigger */}
              <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                {mobileMenu ? <FiX size={18} className="stroke-[2.5]" /> : <FiMenu size={18} className="stroke-[2.5]" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-gray-100 bg-[#F4F6F5] py-4 px-4 space-y-4">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 gap-2">
              <FiSearch className="text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none flex-1 text-xs text-gray-800 font-semibold"
              />
            </div>
            
            {/* Mobile deliver to indicator */}
            <div className="flex items-center gap-2 p-2 bg-white/50 rounded-xl border border-gray-200/50">
              <FiMapPin className="text-[#0F3A1F]" size={14} />
              <div className="text-[11px] font-bold text-gray-700">
                Deliver to: <span className="font-black text-gray-900">Ara, Bihar</span>
              </div>
            </div>

            <nav className="flex flex-col gap-3.5 text-xs font-black uppercase tracking-wider text-gray-600 px-1">
              <Link href="/" onClick={() => setMobileMenu(false)} className="text-green-700">Home</Link>
              <Link href="/customer-dashboard" onClick={() => setMobileMenu(false)}>Shop Directory</Link>
              <Link href="/customer-dashboard" onClick={() => setMobileMenu(false)}>Products</Link>
              <Link href="/" onClick={() => setMobileMenu(false)}>Blog</Link>
              <Link href="/customer-dashboard" onClick={() => setMobileMenu(false)}>Contact</Link>
              {user && (
                <Link href={user.role === 'delivery' ? '/delivery-dashboard' : user.role === 'shopkeeper' ? '/dashboard' : '/customer-dashboard'} onClick={() => setMobileMenu(false)} className="text-indigo-600">
                  Dashboard 🚀
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ─── MAIN CONTAINER ──────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 2. HERO SECTION */}
        <section className="bg-white border border-gray-150/70 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row items-center relative min-h-[400px] mb-12">
          
          <div className="p-6 sm:p-10 md:p-12 md:w-1/2 space-y-4 z-10">
            <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3.5 py-1 text-[10px] font-black text-orange-700 uppercase tracking-wider shadow-sm animate-pulse">
              🍃 Purely Hyperlocal & Fresh
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] leading-tight tracking-tight">
              Fresh Groceries <br className="hidden lg:block" />
              Delivered to <br />
              Your Doorstep
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-gray-550 max-w-sm leading-relaxed">
              Buy your daily needs from Ara's top local stores. Farm-fresh vegetables, dairy, bakery, meat, and essentials shipped directly in under 40 minutes.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link href="/customer-dashboard">
                <button className="px-6 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 uppercase tracking-wider">
                  <span>Shop Now</span>
                  <FiArrowRight className="stroke-[2.5]" />
                </button>
              </Link>
              <a href="tel:+919876543210" className="px-5 py-3.5 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-black text-xs rounded-xl transition-all flex items-center gap-2 uppercase tracking-wider">
                <span>Call to Order</span>
              </a>
            </div>

            {/* Micro details */}
            <div className="pt-4 flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-1"><FiCheck className="text-green-600 stroke-[3]" /> 100% Quality Assurance</div>
              <div className="flex items-center gap-1"><FiCheck className="text-green-600 stroke-[3]" /> Cash on Delivery</div>
            </div>
          </div>

          {/* Big Groceries Image */}
          <div className="w-full md:w-1/2 h-64 md:h-full min-h-[360px] relative self-stretch bg-gray-100 overflow-hidden">
            <ImgWithFallback 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop&q=80"
              alt="Fresh Groceries Collection" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[6s] ease-out" 
            />
            {/* Visual gradient overlay on desktop */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent hidden md:block"></div>
            
            {/* Floating Badges */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-100 px-3 py-2 rounded-2xl shadow-md flex items-center gap-2 select-none animate-float">
              <span className="text-lg">🍇</span>
              <div className="leading-none text-left">
                <p className="text-[9px] text-gray-400 font-extrabold uppercase">100% Organic</p>
                <p className="text-xs font-black text-gray-800 mt-0.5">Farm Fresh</p>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-100 px-3 py-2 rounded-2xl shadow-md flex items-center gap-2 select-none animate-float" style={{ animationDelay: '1.5s' }}>
              <span className="text-lg">📍</span>
              <div className="leading-none text-left">
                <p className="text-[9px] text-gray-400 font-extrabold uppercase">Local Stores</p>
                <p className="text-xs font-black text-gray-800 mt-0.5">Ara Partners</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TWO COLUMN MAIN WRAPPER ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ── COLUMN 1: TOP CATEGORIES SIDEBAR (Left) ── */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm sticky top-28 select-none">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3.5 mb-4 flex items-center gap-2">
                <span>🥬</span> Top Categories
              </h3>
              
              <nav className="space-y-1">
                {SIDEBAR_CATEGORIES.map((cat) => (
                  <Link 
                    key={cat.id} 
                    href={`/customer-dashboard?search=${cat.label}`}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs font-extrabold text-gray-600 hover:text-[#0F3A1F] hover:bg-green-50/50 rounded-xl transition duration-150 group"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base group-hover:scale-110 transition-transform">{cat.icon}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">{cat.label}</span>
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md group-hover:bg-green-100/50 group-hover:text-[#0F3A1F] transition">
                      {cat.count}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="bg-amber-50/40 border border-amber-100/60 rounded-2xl p-4 mt-6 text-center">
                <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest flex items-center justify-center gap-1">
                  <span>🛡️</span> Trust Guarantee
                </p>
                <p className="text-[11px] text-amber-700/95 font-semibold mt-1.5 leading-relaxed">
                  Direct farm-to-door fresh supply chain within 60 mins. Fresh vegetables or money back guaranteed!
                </p>
              </div>
            </div>
          </aside>

          {/* ── COLUMN 2: MAIN CONTENT AREA (Right) ── */}
          <div className="lg:col-span-3 space-y-10">
            
            {/* 4. MAIN CATEGORIES GRID (Scrollable row) */}
            <section className="space-y-4 select-none">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                  Browse by Category
                </h3>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Swipe to scroll →</span>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {MAIN_CATEGORIES.map((cat) => (
                  <Link key={cat.id} href={`/customer-dashboard?search=${cat.label}`} className="shrink-0">
                    <div className="w-28 bg-white border border-gray-100 rounded-2xl p-3 text-center cursor-pointer hover:shadow-md hover:border-green-200 transition duration-200 flex flex-col items-center gap-2 group">
                      <div className={`w-14 h-14 rounded-full overflow-hidden ${cat.bg} flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner`}>
                        <ImgWithFallback src={cat.img} alt={cat.label} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <span className="text-[11px] font-extrabold text-gray-800 truncate w-full group-hover:text-green-700 transition">
                        {cat.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 5. PROMO BANNERS ROW (3 columns) */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Banner 1 */}
              <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl p-5 text-white flex flex-col justify-between min-h-[150px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <div>
                  <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Mega Sale</span>
                  <h4 className="text-lg font-black mt-2 leading-tight">Fresh Produce Sale</h4>
                  <p className="text-[10px] text-red-100 font-semibold mt-0.5">Top farm picks up to 50% Off</p>
                </div>
                <Link href="/customer-dashboard" className="z-10">
                  <button className="text-[10px] font-black uppercase text-white bg-black/20 hover:bg-black/30 px-3.5 py-1.5 rounded-lg w-max mt-4 transition flex items-center gap-1.5">
                    <span>Shop now</span>
                    <FiArrowRight />
                  </button>
                </Link>
              </div>

              {/* Banner 2 */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white flex flex-col justify-between min-h-[150px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <div>
                  <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">30% Flat Discount</span>
                  <h4 className="text-lg font-black mt-2 leading-tight">Organic Juices</h4>
                  <p className="text-[10px] text-green-100 font-semibold mt-0.5">Healthy organic essentials</p>
                </div>
                <Link href="/customer-dashboard" className="z-10">
                  <button className="text-[10px] font-black uppercase text-white bg-black/20 hover:bg-black/30 px-3.5 py-1.5 rounded-lg w-max mt-4 transition flex items-center gap-1.5">
                    <span>Shop now</span>
                    <FiArrowRight />
                  </button>
                </Link>
              </div>

              {/* Banner 3 */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white flex flex-col justify-between min-h-[150px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <div>
                  <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Free Delivery</span>
                  <h4 className="text-lg font-black mt-2 leading-tight">Same-Hour Shipping</h4>
                  <p className="text-[10px] text-blue-100 font-semibold mt-0.5">No shipping fee above ₹200</p>
                </div>
                <Link href="/customer-dashboard" className="z-10">
                  <button className="text-[10px] font-black uppercase text-white bg-black/20 hover:bg-black/30 px-3.5 py-1.5 rounded-lg w-max mt-4 transition flex items-center gap-1.5">
                    <span>Claim Free</span>
                    <FiArrowRight />
                  </button>
                </Link>
              </div>
            </section>

            {/* 6. POPULAR PRODUCTS GRID */}
            <section className="space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                    Popular Products
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">Ara's highest selling groceries today</p>
                </div>
                <Link href="/customer-dashboard" className="text-xs font-black text-[#0F3A1F] hover:underline uppercase tracking-wide flex items-center gap-1">
                  <span>See all products</span>
                  <FiArrowRight />
                </Link>
              </div>

              {filteredPopular.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-400">No popular products found matching "{search}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredPopular.map((prod) => {
                    const qty = cart[prod.id] || 0;
                    const isFav = favorites[prod.id] || false;
                    return (
                      <div 
                        key={prod.id} 
                        className="bg-white border border-gray-150/70 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
                      >
                        {/* Product image & Favorite */}
                        <div className="relative h-36 bg-gray-50/50 overflow-hidden select-none">
                          <ImgWithFallback src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          <span className="absolute top-2.5 left-2.5 bg-green-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                            {prod.discount}% OFF
                          </span>
                          
                          <button 
                            onClick={(e) => toggleFavorite(prod.id, prod.name, e)}
                            className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition shadow-sm border border-gray-100"
                          >
                            <FiHeart className={`text-xs ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                        </div>

                        {/* Info & Quantity controls */}
                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{prod.unit}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5">
                                <FiStar size={10} className="fill-current" /> {prod.rating}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 mt-1">{prod.name}</h4>
                          </div>

                          <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-gray-100 mt-auto">
                            <div>
                              <p className="text-xs sm:text-sm font-black text-gray-950">₹{prod.price}</p>
                              <p className="text-[10px] text-gray-400 line-through font-semibold leading-none mt-0.5">₹{prod.mrp}</p>
                            </div>

                            {qty > 0 ? (
                              <div className="flex items-center bg-[#0F3A1F] text-white text-xs font-black rounded-xl overflow-hidden shadow-sm border border-green-800">
                                <button onClick={(e) => decreaseQuantity(prod.id, e)} className="px-2.5 py-2 hover:bg-[#165a31] transition select-none">
                                  <FiMinus size={11} className="stroke-[3]" />
                                </button>
                                <span className="px-2.5 text-center min-w-5 select-none">{qty}</span>
                                <button onClick={(e) => handleAddToCart(prod, e)} className="px-2.5 py-2 hover:bg-[#165a31] transition select-none">
                                  <FiPlus size={11} className="stroke-[3]" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => handleAddToCart(prod, e)}
                                className="px-3.5 py-2 bg-[#0F3A1F] hover:bg-[#165a31] text-white font-black text-[11px] rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all select-none uppercase tracking-wide"
                              >
                                <FiPlus size={12} className="stroke-[3]" /> Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 7. TRENDING / DEALS SECTION */}
            <section className="bg-white border border-gray-150 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              
              {/* Highlight Juice Sale Banner */}
              <div className="bg-[#FAF8F5] border-2 border-dashed border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
                <div className="space-y-1.5 text-center md:text-left">
                  <span className="bg-[#0F3A1F] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Deal of the Day</span>
                  <h4 className="text-base font-black text-gray-900 leading-tight">
                    Mega Grocery Sale Live Now! <br className="hidden md:block"/>30% Flat Discount on all Juice Items!
                  </h4>
                </div>

                {/* Countdown clock boxes */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="bg-[#0F3A1F] text-white font-mono text-center px-3 py-2 rounded-xl shadow min-w-[50px]">
                    <span className="text-sm font-black block leading-none">{time.hours}</span>
                    <span className="text-[8px] font-bold uppercase text-green-300">Hrs</span>
                  </div>
                  <span className="text-[#0F3A1F] font-black">:</span>
                  <div className="bg-[#0F3A1F] text-white font-mono text-center px-3 py-2 rounded-xl shadow min-w-[50px]">
                    <span className="text-sm font-black block leading-none">{time.minutes}</span>
                    <span className="text-[8px] font-bold uppercase text-green-300">Mins</span>
                  </div>
                  <span className="text-[#0F3A1F] font-black">:</span>
                  <div className="bg-[#0F3A1F] text-white font-mono text-center px-3 py-2 rounded-xl shadow min-w-[50px]">
                    <span className="text-sm font-black block leading-none">{time.seconds}</span>
                    <span className="text-[8px] font-bold uppercase text-green-300">Secs</span>
                  </div>
                </div>
              </div>

              {/* Trending products subgrid */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FiTag className="text-[#0F3A1F]" /> Trending Beverages
                </h4>
                
                {filteredTrending.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-xs font-bold text-gray-400">No juices found matching "{search}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredTrending.map((prod) => {
                      const qty = cart[prod.id] || 0;
                      return (
                        <div 
                          key={prod.id} 
                          className="bg-white border border-gray-100 rounded-2xl p-3 flex gap-4 hover:shadow-md transition group"
                        >
                          <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 select-none">
                            <ImgWithFallback src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          </div>

                          <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <span className="inline-block text-[9px] font-black text-[#0F3A1F] bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider">Trending</span>
                                <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5">
                                  <FiStar size={10} className="fill-current" /> {prod.rating}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 line-clamp-1 mt-1">{prod.name}</h4>
                              <p className="text-[10px] text-gray-400 font-bold mt-0.5">{prod.unit}</p>
                            </div>

                            <div className="flex items-center justify-between gap-2 border-t border-gray-50 pt-2">
                              <div>
                                <p className="text-xs font-black text-gray-950">₹{prod.price}</p>
                                <p className="text-[9px] text-gray-400 line-through">₹{prod.mrp}</p>
                              </div>

                              {qty > 0 ? (
                                <div className="flex items-center bg-[#0F3A1F] text-white text-[10px] font-bold rounded-lg overflow-hidden border border-green-800">
                                  <button onClick={(e) => decreaseQuantity(prod.id, e)} className="px-2 py-1 hover:bg-[#165a31] transition select-none">−</button>
                                  <span className="px-2 min-w-4 text-center select-none">{qty}</span>
                                  <button onClick={(e) => handleAddToCart(prod, e)} className="px-2 py-1 hover:bg-[#165a31] transition select-none">+</button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => handleAddToCart(prod, e)}
                                  className="px-3 py-1.5 bg-[#0F3A1F] hover:bg-[#165a31] text-white font-black text-[10px] rounded-lg shadow-sm active:scale-95 transition select-none uppercase tracking-wider"
                                >
                                  + Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* 8. TRUST / DELIVERY SECTION */}
            <section className="bg-[#0F3A1F] text-white rounded-3xl p-6 shadow-sm overflow-hidden relative select-none">
              <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 z-10 relative text-center sm:text-left">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black flex items-center justify-center sm:justify-start gap-2">
                    <FiZap className="text-green-400 animate-bounce" /> Quick & Reliable Delivery
                  </h3>
                  <p className="text-xs text-green-200 font-medium">
                    We deliver to your doorstep within 60 minutes from shopkeeper partner checkout. Guaranteed freshness or cash back.
                  </p>
                </div>
                <div className="flex gap-4 items-center shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-green-300 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15">
                    <FiTruck size={16} /> Same-Hour
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-green-300 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15">
                    <FiShield size={16} /> Protected
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-white mt-20 border-t border-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl">🏪</span>
                <span className="text-lg font-black tracking-tight text-white">
                  Local<span className="text-green-400">Kart</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Hyperlocal grocery & essentials same-hour delivery from verified local shops in Ara, Bihar. Empowering local stores.
              </p>
              <div className="flex gap-2.5 pt-2 select-none">
                <span className="w-8 h-8 rounded-xl bg-white/5 hover:bg-[#0F3A1F] hover:text-white flex items-center justify-center text-xs font-extrabold cursor-pointer transition">FB</span>
                <span className="w-8 h-8 rounded-xl bg-white/5 hover:bg-[#0F3A1F] hover:text-white flex items-center justify-center text-xs font-extrabold cursor-pointer transition">IG</span>
                <span className="w-8 h-8 rounded-xl bg-white/5 hover:bg-[#0F3A1F] hover:text-white flex items-center justify-center text-xs font-extrabold cursor-pointer transition">TW</span>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-widest text-green-400 mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-xs font-semibold text-gray-400">
                <li><Link href="/customer-dashboard" className="hover:text-white transition">Shop Directory</Link></li>
                <li><Link href="/" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/" className="hover:text-white transition">Blog & News</Link></li>
                <li><Link href="/customer-dashboard" className="hover:text-white transition">Offers & Promos</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-widest text-green-400 mb-4">For Partners</h4>
              <ul className="space-y-2.5 text-xs font-semibold text-gray-400">
                <li><Link href="/signup" className="hover:text-white transition">Register as Shopkeeper</Link></li>
                <li><Link href="/signup" className="hover:text-white transition">Join as Delivery Agent</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Partner Dashboard Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-widest text-green-400 mb-4">Contact Info</h4>
              <div className="space-y-2.5 text-xs font-semibold text-gray-400">
                <p>📍 Ara, Bihar, India - 801101</p>
                <p>📞 +91 98765 43210</p>
                <p>📧 support@localkart.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] font-semibold text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} LocalKart Hyperlocal Marketplace. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
