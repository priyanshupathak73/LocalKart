import React, { useState } from 'react';

/**
 * DashboardLayout Component
 * A global responsive dashboard shell with a persistent sidebar and top navigation.
 * 
 * @param {Object} props
 * @param {string} props.role - Current role: 'customer' | 'shopkeeper' | 'delivery'
 * @param {Array<Object>} props.sidebarItems - List of sidebar items [{ label, icon, id, active }]
 * @param {string} props.activeTab - Active tab ID
 * @param {Function} props.onTabChange - Callback on tab click
 * @param {Object} props.profile - User profile metadata
 * @param {React.ReactNode} props.children - Dashboard main content
 */
export default function DashboardLayout({
  role = 'customer',
  sidebarItems = [],
  activeTab = '',
  onTabChange = () => {},
  profile = {},
  cartCount = 0,
  onCartClick = () => {},
  onSearchChange = () => {},
  searchValue = '',
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Styling matrices based on the role theme personalities
  const themeStyles = {
    customer: {
      accent: 'bg-blue-600 text-white',
      hover: 'hover:bg-blue-50 hover:text-blue-600',
      activeText: 'text-blue-600 bg-blue-50/80 font-bold border-r-4 border-blue-600',
      inactiveText: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
      sidebarBg: 'bg-white',
      topBannerBg: 'bg-blue-600 text-white',
      badge: 'bg-blue-100 text-blue-800',
      accentColor: 'blue',
    },
    shopkeeper: {
      accent: 'bg-emerald-700 text-white',
      hover: 'hover:bg-emerald-50 hover:text-emerald-700',
      activeText: 'text-white bg-emerald-700 font-semibold rounded-xl',
      inactiveText: 'text-gray-300 hover:bg-emerald-800/40 hover:text-white',
      sidebarBg: 'bg-emerald-950 text-white border-r border-emerald-900',
      topBannerBg: 'bg-emerald-700 text-white',
      badge: 'bg-emerald-100 text-emerald-800',
      accentColor: 'emerald',
    },
    delivery: {
      accent: 'bg-blue-600 text-white',
      hover: 'hover:bg-blue-50 hover:text-blue-600',
      activeText: 'text-white bg-[#166534] font-semibold rounded-xl',
      inactiveText: 'text-gray-300 hover:bg-green-800/40 hover:text-white',
      sidebarBg: 'bg-emerald-950 text-white border-r border-emerald-900',
      topBannerBg: 'bg-blue-600 text-white',
      badge: 'bg-blue-100 text-blue-800',
      accentColor: 'blue',
    },
  };

  const style = themeStyles[role] || themeStyles.customer;

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans flex flex-col">
      {/* Main Container */}
      <div className="flex-1 flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Sidebar Container */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 lg:static lg:translate-x-0 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${style.sidebarBg} ${
            role === 'customer' ? 'border-r border-gray-100 shadow-sm' : ''
          }`}
        >
          {/* Sidebar Brand Header */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-gray-100/10">
            <span className={`text-2xl font-black tracking-tight ${role === 'customer' ? 'text-blue-600' : 'text-white'}`}>
              Local<span className={role === 'customer' ? 'text-gray-900' : 'text-green-400'}>Kart</span>
            </span>
            {role === 'customer' && (
              <span className="text-[10px] text-gray-400 font-semibold leading-tight max-w-[80px]">
                Delivering Happiness Locally
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive ? style.activeText : style.inactiveText
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Content Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Bar */}
          <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-gray-100/20">
            <div className="flex items-center gap-4 flex-1">
              {/* Mobile Sidebar Hamburger Toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 lg:hidden"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {role === 'customer' ? (
                <>
                  {/* Brand Logo inside header */}
                  <div className="flex items-center gap-2 cursor-pointer mr-2" onClick={() => onTabChange('home')}>
                    <span className="text-xl font-bold tracking-tight text-blue-900">
                      Local<span className="text-emerald-600 font-extrabold">Kart</span>
                    </span>
                  </div>

                  {/* Location Selector */}
                  <div className="hidden md:flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-400">Deliver to</span>
                    <span className="text-blue-900 flex items-center gap-0.5">
                      Pune, Maharashtra
                      <svg className="w-3 h-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div className="hidden sm:flex flex-1 max-w-md mx-6 items-center bg-gray-50 border border-gray-250 rounded-lg px-3 py-1.5 focus-within:border-blue-400 focus-within:bg-white transition-all">
                    <input
                      type="text"
                      placeholder="Search product store..."
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="bg-transparent border-none text-xs outline-none w-full text-gray-800 placeholder-gray-400 font-medium"
                    />
                    <svg className="w-4 h-4 text-gray-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </>
              ) : (
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
              )}
            </div>

            {/* Header Content Right Side */}
            <div className="flex items-center gap-4">
              {role === 'customer' ? (
                <>
                  {/* Cart Icon with badge */}
                  <button
                    onClick={onCartClick}
                    className="p-2 text-gray-500 hover:text-gray-700 relative rounded-full hover:bg-gray-50 transition"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                // Notification Icon for shopkeeper / delivery
                <button className="p-2 text-gray-400 hover:text-gray-600 relative rounded-full hover:bg-gray-50 transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                </button>
              )}

              {/* Profile Block */}
              <div className="flex items-center gap-3 border-l border-gray-150 pl-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {profile.name || 'User Profile'}
                  </p>
                  {profile.meta && (
                    <p className="text-[10px] font-semibold text-gray-400 leading-none mt-0.5">
                      {profile.meta}
                    </p>
                  )}
                </div>
                
                {/* Avatar circle */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    // Default user silhouette
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Canvas */}
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
