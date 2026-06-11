'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CustomerDashboardView from '@/components/dashboard/CustomerDashboardView';
import ShopkeeperDashboardView from '@/components/dashboard/ShopkeeperDashboardView';
import DeliveryAgentDashboardView from '@/components/dashboard/DeliveryAgentDashboardView';

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
  Stores: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Offers: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
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
  Addresses: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Support: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Products: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Inventory: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Customers: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Earnings: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Reviews: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.89a1 1 0 00-1.176 0l-3.976 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.773-.567-.374-1.81.587-1.81h4.907a1 1 0 00.95-.69l1.52-4.674z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Profile: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

// Sidebar lists for each role
const roleSidebars = {
  customer: [
    { id: 'home', label: 'Home', icon: <Icons.Home /> },
    { id: 'categories', label: 'Categories', icon: <Icons.Categories /> },
    { id: 'stores', label: 'Stores', icon: <Icons.Stores /> },
    { id: 'offers', label: 'Offers', icon: <Icons.Offers /> },
    { id: 'orders', label: 'My Orders', icon: <Icons.Orders /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Icons.Wishlist /> },
    { id: 'addresses', label: 'Addresses', icon: <Icons.Addresses /> },
    { id: 'support', label: 'Support', icon: <Icons.Support /> },
    { id: 'logout', label: 'Logout', icon: <Icons.Logout /> },
  ],
  shopkeeper: [
    { id: 'dashboard', label: 'Dashboard', icon: <Icons.Home /> },
    { id: 'products', label: 'Products', icon: <Icons.Products /> },
    { id: 'orders', label: 'Orders', icon: <Icons.Orders /> },
    { id: 'inventory', label: 'Inventory', icon: <Icons.Inventory /> },
    { id: 'customers', label: 'Customers', icon: <Icons.Customers /> },
    { id: 'earnings', label: 'Earnings', icon: <Icons.Earnings /> },
    { id: 'reviews', label: 'Reviews', icon: <Icons.Reviews /> },
    { id: 'settings', label: 'Settings', icon: <Icons.Settings /> },
    { id: 'logout', label: 'Logout', icon: <Icons.Logout /> },
  ],
  delivery: [
    { id: 'dashboard', label: 'Dashboard', icon: <Icons.Home /> },
    { id: 'deliveries', label: 'My Deliveries', icon: <Icons.Orders /> },
    { id: 'earnings', label: 'Earnings', icon: <Icons.Earnings /> },
    { id: 'profile', label: 'Profile', icon: <Icons.Profile /> },
    { id: 'settings', label: 'Settings', icon: <Icons.Settings /> },
    { id: 'logout', label: 'Logout', icon: <Icons.Logout /> },
  ],
};

const roleProfiles = {
  customer: {
    name: 'Priyanshu Pathak',
    meta: 'Customer #CUST789',
    avatarUrl: null,
  },
  shopkeeper: {
    name: 'Fresh Mart',
    meta: 'Shop ID: SHP123',
    avatarUrl: null,
  },
  delivery: {
    name: 'Rohit Sharma',
    meta: 'Agent ID: AGT123',
    avatarUrl: null,
  },
};

export default function DashboardDemoPage() {
  const [role, setRole] = useState('customer'); // 'customer' | 'shopkeeper' | 'delivery'
  const [activeTab, setActiveTab] = useState('home');
  const [searchValue, setSearchValue] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Sync cart count
  useEffect(() => {
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

    updateCartCount();
    window.addEventListener('local_cart_updated', updateCartCount);
    return () => {
      window.removeEventListener('local_cart_updated', updateCartCount);
    };
  }, []);

  // Load role from URL parameters if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole && ['customer', 'shopkeeper', 'delivery'].includes(urlRole)) {
        setRole(urlRole);
        setActiveTab(urlRole === 'customer' ? 'home' : 'dashboard');
      }
    }
  }, []);

  const handleTabChange = (tabId) => {
    if (tabId === 'logout') {
      alert('Logout clicked! In production, this clears auth state.');
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div className="relative min-h-screen">
      {/* Render the core DashboardLayout */}
      <DashboardLayout
        role={role}
        sidebarItems={roleSidebars[role]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        profile={roleProfiles[role]}
        cartCount={cartCount}
        onCartClick={() => setActiveTab('cart')}
        onSearchChange={setSearchValue}
        searchValue={searchValue}
      >
        {role === 'customer' && (
          <CustomerDashboardView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchValue={searchValue}
          />
        )}
        {role === 'shopkeeper' && (
          <ShopkeeperDashboardView activeTab={activeTab} />
        )}
        {role === 'delivery' && (
          <DeliveryAgentDashboardView activeTab={activeTab} />
        )}
      </DashboardLayout>
    </div>
  );
}
