'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiHeart, FiMessageSquare, FiCompass, FiSettings, FiTrash2, FiMapPin, FiStar } from 'react-icons/fi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CustomerDashboardView from '@/components/dashboard/CustomerDashboardView';
import API_BASE_URL from '@/utils/api';
import fallbackBusinesses from '@/data/businesses';

// Self-contained high quality SVG icons for sidebar links
const Icons = {
  Home: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Categories: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  Orders: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Wishlist: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Support: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Addresses: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

export default function CustomerDashboardPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileMessageType, setProfileMessageType] = useState(''); // 'success' or 'error'

  const [user, setUser] = useState(null);
  const [savedShopIds, setSavedShopIds] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [searchValue, setSearchValue] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

  // Calculate cart count from localStorage
  const updateCartCount = () => {
    const storedCart = localStorage.getItem('local_cart');
    if (storedCart) {
      try {
        const cartItems = JSON.parse(storedCart);
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } catch (e) {
        console.error(e);
      }
    } else {
      setCartCount(0);
    }
  };

  // Load basic session on mount
  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'customer') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    setProfileForm({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      phoneNumber: parsedUser.phoneNumber || parsedUser.phone_number || '',
    });

    // Load saved shops list
    const savedIds = JSON.parse(localStorage.getItem('savedShops') || '[]');
    setSavedShopIds(savedIds);

    // Initialize mock inquiries if none exist
    const storedInquiries = localStorage.getItem('customerInquiries');
    if (storedInquiries) {
      setInquiries(JSON.parse(storedInquiries));
    } else {
      const defaultInquiries = [
        {
          id: 'inq-1',
          shopName: 'Divine Bakery',
          shopId: 'divine-bakery',
          subject: 'Order for Birthday Cake',
          message: 'Hi, do you provide customized eggless chocolate truffle cakes for birthdays? Need it by tomorrow evening.',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: 'Replied',
          reply: 'Yes, we specialize in customized cakes! Please call us or share your details so we can discuss the design.'
        },
        {
          id: 'inq-2',
          shopName: 'Sanjeevani Medico',
          shopId: 'sanjeevani-medico',
          subject: 'Medicine Availability Query',
          message: 'Hello, is the medicine "Taxim-O 200" available in stock right now?',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: 'Read',
          reply: null
        }
      ];
      localStorage.setItem('customerInquiries', JSON.stringify(defaultInquiries));
      setInquiries(defaultInquiries);
    }

    // Initialize cart count
    updateCartCount();

    // Read tab parameter from URL query params
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }

    // Listen for storage cart updates
    window.addEventListener('local_cart_updated', updateCartCount);
    return () => {
      window.removeEventListener('local_cart_updated', updateCartCount);
    };
  }, [router]);

  // Fetch shops data (try backend api first, fall back to local data)
  useEffect(() => {
    if (!mounted) return;

    const fetchShops = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/businesses`);
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : [];
          if (list.length > 0) {
            setAllShops(list);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch businesses from API, falling back to local data', error);
      }
      setAllShops(fallbackBusinesses);
      setLoading(false);
    };

    fetchShops();
  }, [mounted]);

  // Compute saved shops details
  const savedShops = useMemo(() => {
    return allShops.filter((shop) => savedShopIds.includes(shop.id));
  }, [allShops, savedShopIds]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileMessageType('');

    if (!profileForm.name.trim()) {
      setProfileMessage('Name cannot be empty');
      setProfileMessageType('error');
      return;
    }

    const updatedUser = {
      ...user,
      name: profileForm.name.trim(),
      phoneNumber: profileForm.phoneNumber.trim(),
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setProfileMessage('✓ Profile updated successfully!');
    setProfileMessageType('success');

    // Trigger storage event so navbar and other components update immediately
    window.dispatchEvent(new Event('storage'));
  };

  const handleRemoveSavedShop = (shopId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedIds = savedShopIds.filter((id) => id !== shopId);
    setSavedShopIds(updatedIds);
    localStorage.setItem('savedShops', JSON.stringify(updatedIds));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'logout') {
      handleLogout();
      return;
    }
    setActiveTab(tabId);
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-sm font-semibold">Redirecting to login...</p>
      </div>
    );
  }

  // Sidebar items mapped with Icons
  const sidebarItems = [
    { id: 'home', label: 'Home', icon: <Icons.Home /> },
    { id: 'categories', label: 'Browse Products', icon: <Icons.Categories /> },
    { id: 'orders', label: 'My Orders', icon: <Icons.Orders /> },
    { id: 'wishlist', label: 'Saved Shops', icon: <Icons.Wishlist /> },
    { id: 'addresses', label: 'Addresses', icon: <Icons.Addresses /> },
    { id: 'support', label: 'Inquiries', icon: <Icons.Support /> },
    { id: 'settings', label: 'Profile Settings', icon: <Icons.Settings /> },
    { id: 'logout', label: 'Logout', icon: <Icons.Logout /> },
  ];

  const profileData = {
    name: user.name,
    meta: `Customer #${user.id ? user.id.slice(0, 6).toUpperCase() : 'CUST789'}`,
    avatarUrl: null
  };

  return (
    <DashboardLayout
      role="customer"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      profile={profileData}
      cartCount={cartCount}
      onCartClick={() => setActiveTab('cart')}
      onSearchChange={setSearchValue}
      searchValue={searchValue}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          <CustomerDashboardView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchValue={searchValue}
          />
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
