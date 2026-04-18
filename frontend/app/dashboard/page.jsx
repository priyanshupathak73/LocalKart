'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiBell,
  FiBox,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiEdit2,
  FiGrid,
  FiHome,
  FiImage,
  FiMenu,
  FiPackage,
  FiPlus,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiTrash2,
  FiTruck,
  FiX,
} from 'react-icons/fi';
import { Providers } from '../providers';

const initialProducts = [
  {
    id: 'P-101',
    name: 'Fresh Tomatoes (1kg)',
    category: 'Vegetables',
    price: 48,
    stock: 42,
    sold: 128,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=700',
  },
  {
    id: 'P-102',
    name: 'A2 Cow Milk (1L)',
    category: 'Dairy',
    price: 62,
    stock: 8,
    sold: 214,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=700',
  },
  {
    id: 'P-103',
    name: 'Basmati Rice (5kg)',
    category: 'Grains',
    price: 410,
    stock: 0,
    sold: 96,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700',
  },
  {
    id: 'P-104',
    name: 'Brown Bread',
    category: 'Bakery',
    price: 40,
    stock: 24,
    sold: 174,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700',
  },
  {
    id: 'P-105',
    name: 'Banana (1 dozen)',
    category: 'Fruits',
    price: 68,
    stock: 5,
    sold: 153,
    imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=700',
  },
];

const initialOrders = [
  {
    id: 'LK-9001',
    customer: 'Ravi Kumar',
    items: 5,
    total: 620,
    time: '10:12 AM',
    status: 'Pending',
    address: 'Gyan Vihar Colony, Ara',
  },
  {
    id: 'LK-9002',
    customer: 'Shreya Singh',
    items: 3,
    total: 280,
    time: '11:03 AM',
    status: 'Packed',
    address: 'Mahla Road, Ara',
  },
  {
    id: 'LK-9003',
    customer: 'Ankit Verma',
    items: 7,
    total: 1295,
    time: '12:45 PM',
    status: 'Delivered',
    address: 'Main Road, Ara',
  },
  {
    id: 'LK-9004',
    customer: 'Nisha Patel',
    items: 2,
    total: 158,
    time: '01:10 PM',
    status: 'Pending',
    address: 'Central Market, Ara',
  },
];

const dailySales = [450, 680, 590, 720, 810, 740, 950];
const weeklySales = [3920, 4380, 4090, 4510, 4780, 4620, 5010];

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function statusBadge(status) {
  if (status === 'Pending') {
    return 'bg-amber-100 text-amber-700 border border-amber-300';
  }
  if (status === 'Packed') {
    return 'bg-blue-100 text-blue-700 border border-blue-300';
  }
  if (status === 'Delivered') {
    return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
  }
  return 'bg-rose-100 text-rose-700 border border-rose-300';
}

function stockBadge(stock) {
  if (stock <= 0) {
    return {
      label: 'Out of stock',
      classes: 'bg-rose-100 text-rose-700 border border-rose-300',
    };
  }
  if (stock <= 10) {
    return {
      label: 'Low stock',
      classes: 'bg-amber-100 text-amber-700 border border-amber-300',
    };
  }
  return {
    label: 'In stock',
    classes: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
  };
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/40 p-5 backdrop-blur-md">
      <div className="mb-3 h-4 w-28 animate-pulse rounded bg-purple-100" />
      <div className="h-9 w-20 animate-pulse rounded bg-purple-200" />
      <div className="mt-4 h-3 w-36 animate-pulse rounded bg-purple-100" />
    </div>
  );
}

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-2xl border border-dashed border-purple-300 bg-white/45 p-10 text-center backdrop-blur-md">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
        <FiPackage className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function SalesChart({ mode }) {
  const data = mode === 'weekly' ? weeklySales : dailySales;
  const maxValue = Math.max(...data, 1);

  return (
    <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
          {mode === 'weekly' ? 'Weekly' : 'Daily'}
        </span>
      </div>
      <div className="flex h-48 items-end gap-2">
        {data.map((value, idx) => {
          const heightPercent = (value / maxValue) * 100;
          return (
            <div key={`${mode}-${idx}`} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-xl bg-gradient-to-t from-purple-500 to-blue-400 transition-all duration-300 hover:from-purple-600 hover:to-blue-500" style={{ height: `${Math.max(8, heightPercent)}%` }} />
              <span className="text-[10px] font-medium text-gray-500">{idx + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopNavbar({ onOpenSidebar, shopName, notificationCount, onToggleNotifications }) {
  return (
    <div className="sticky top-0 z-20 mb-6 rounded-2xl border border-white/60 bg-white/45 p-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-xl border border-purple-200 p-2 text-purple-700 transition hover:bg-purple-100 lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-medium text-gray-500">Welcome back</p>
            <h1 className="text-base font-semibold text-gray-900 sm:text-lg">{shopName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleNotifications}
            className="relative rounded-xl border border-purple-200 p-2 text-purple-700 transition hover:bg-purple-100"
            aria-label="Notifications"
          >
            <FiBell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                {notificationCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/65 px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-xs font-bold text-white">
              SK
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-900">Shopkeeper</p>
              <p className="text-[11px] text-gray-500">LocalKart Seller</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPageContent() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);

  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  const [analyticsMode, setAnalyticsMode] = useState('daily');

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
  });

  const [selectedOrder, setSelectedOrder] = useState(null);

  const navItems = [
    { label: 'Dashboard', icon: FiHome },
    { label: 'Products', icon: FiBox },
    { label: 'Orders', icon: FiShoppingBag },
    { label: 'Analytics', icon: FiBarChart2 },
    { label: 'Settings', icon: FiSettings },
  ];

  useEffect(() => {
    const overviewTimer = setTimeout(() => setIsLoadingOverview(false), 900);
    const analyticsTimer = setTimeout(() => setIsLoadingAnalytics(false), 1300);

    return () => {
      clearTimeout(overviewTimer);
      clearTimeout(analyticsTimer);
    };
  }, []);

  const lowStockProducts = useMemo(() => products.filter((item) => item.stock > 0 && item.stock <= 10), [products]);

  const outOfStockProducts = useMemo(() => products.filter((item) => item.stock <= 0), [products]);

  const pendingOrders = useMemo(() => orders.filter((order) => order.status === 'Pending').length, [orders]);

  const totalOrders = orders.length;
  const totalProducts = products.length;
  const todaysSales = orders.reduce((sum, order) => sum + order.total, 0);

  const topSellingProducts = useMemo(() => {
    return [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);
  }, [products]);

  const notifications = useMemo(() => {
    const orderAlerts = orders
      .filter((order) => order.status === 'Pending')
      .map((order) => ({
        id: `order-${order.id}`,
        text: `New order ${order.id} from ${order.customer}`,
        type: 'order',
      }));

    const stockAlerts = products
      .filter((product) => product.stock <= 10)
      .map((product) => ({
        id: `stock-${product.id}`,
        text: `${product.name} is ${product.stock === 0 ? 'out of stock' : 'low on stock'} (${product.stock})`,
        type: 'stock',
      }));

    return [...orderAlerts, ...stockAlerts].slice(0, 8);
  }, [orders, products]);

  const notificationCount = notifications.length;

  const openCreateProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      category: '',
      price: '',
      stock: '',
      imageUrl: '',
    });
    setShowProductForm(true);
  };

  const openEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl,
    });
    setShowProductForm(true);
  };

  const submitProductForm = (e) => {
    e.preventDefault();

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      price: Number(productForm.price) || 0,
      stock: Number(productForm.stock) || 0,
      imageUrl:
        productForm.imageUrl.trim() ||
        `https://source.unsplash.com/700x500/?${encodeURIComponent(productForm.category || 'grocery')}`,
    };

    if (!payload.name || !payload.category) {
      return;
    }

    if (editingProductId) {
      setProducts((prev) => prev.map((p) => (p.id === editingProductId ? { ...p, ...payload } : p)));
    } else {
      setProducts((prev) => [
        {
          id: `P-${Date.now()}`,
          sold: 0,
          ...payload,
        },
        ...prev,
      ]);
    }

    setShowProductForm(false);
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
  };

  const salesModeLabel = analyticsMode === 'daily' ? 'Daily Sales' : 'Weekly Sales';

  const shellBg =
    theme === 'dark'
      ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-gray-100'
      : 'bg-gradient-to-br from-purple-50 via-white to-blue-50 text-gray-900';

  const sidebarClasses =
    theme === 'dark'
      ? 'border-white/10 bg-white/5'
      : 'border-white/70 bg-white/40';

  return (
    <main className={cn('min-h-screen px-3 py-4 sm:px-5', shellBg)}>
      <div className="mx-auto max-w-[1440px]">
        <div className="flex gap-4">
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-40 w-72 transform rounded-r-3xl border p-5 backdrop-blur-xl transition duration-300 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:translate-x-0 lg:rounded-3xl',
              sidebarClasses,
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-500">LocalKart</p>
                <h2 className="text-xl font-bold">Shopkeeper Panel</h2>
              </div>
              <button
                className="rounded-xl p-2 text-gray-500 hover:bg-purple-100 lg:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActiveTab(item.label);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition',
                      active
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : theme === 'dark'
                        ? 'text-gray-200 hover:bg-white/10'
                        : 'text-gray-700 hover:bg-purple-100'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
              <p className="text-xs font-medium opacity-90">Pro Tip</p>
              <p className="mt-1 text-sm">Keep low-stock threshold at 10 to avoid missed orders.</p>
            </div>
          </aside>

          {sidebarOpen && (
            <button
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] lg:hidden"
              aria-label="Close sidebar overlay"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <section className="min-w-0 flex-1 lg:pl-2">
            <TopNavbar
              onOpenSidebar={() => setSidebarOpen(true)}
              shopName="Priya Kirana Mart"
              notificationCount={notificationCount}
              onToggleNotifications={() => setShowNotifications((v) => !v)}
            />

            {showNotifications && (
              <div className="mb-6 rounded-2xl border border-white/60 bg-white/45 p-4 backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2">
                  <FiBell className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-600">No new alerts.</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((note) => (
                      <div key={note.id} className="rounded-xl border border-purple-100 bg-white/70 px-3 py-2 text-sm text-gray-700">
                        {note.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {isLoadingOverview ? (
                    <>
                      <CardSkeleton />
                      <CardSkeleton />
                      <CardSkeleton />
                      <CardSkeleton />
                      <CardSkeleton />
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-xl">
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{totalOrders}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-purple-700">
                          <FiShoppingBag className="h-3.5 w-3.5" /> +12% vs last week
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-xl">
                        <p className="text-sm text-gray-600">Today's Sales</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">Rs {todaysSales}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <FiDollarSign className="h-3.5 w-3.5" /> Revenue healthy
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-xl">
                        <p className="text-sm text-gray-600">Pending Orders</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{pendingOrders}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-700">
                          <FiClock className="h-3.5 w-3.5" /> Action required
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-xl">
                        <p className="text-sm text-gray-600">Total Products</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{totalProducts}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-700">
                          <FiBox className="h-3.5 w-3.5" /> Catalog active
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-xl">
                        <p className="text-sm text-gray-600">Low Stock Alerts</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{lowStockProducts.length + outOfStockProducts.length}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-rose-700">
                          <FiAlertTriangle className="h-3.5 w-3.5" /> Restock suggested
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Low Stock Warnings</h3>
                    {lowStockProducts.length + outOfStockProducts.length === 0 ? (
                      <p className="text-sm text-gray-600">Great! No low stock products right now.</p>
                    ) : (
                      <div className="space-y-3">
                        {[...outOfStockProducts, ...lowStockProducts].slice(0, 6).map((product) => {
                          const badge = stockBadge(product.stock);
                          return (
                            <div key={product.id} className="flex items-center justify-between rounded-xl border border-purple-100 bg-white/70 px-3 py-2">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                              </div>
                              <span className={cn('rounded-full px-2 py-1 text-[11px] font-semibold', badge.classes)}>{badge.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Orders Snapshot</h3>
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between rounded-xl border border-purple-100 bg-white/70 px-3 py-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                            <p className="text-xs text-gray-500">{order.customer} • Rs {order.total}</p>
                          </div>
                          <span className={cn('rounded-full px-2 py-1 text-[11px] font-semibold', statusBadge(order.status))}>{order.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Products' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Products</h2>
                  <button
                    onClick={openCreateProduct}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg"
                  >
                    <FiPlus className="h-4 w-4" /> Add Product
                  </button>
                </div>

                {showProductForm && (
                  <form onSubmit={submitProductForm} className="grid grid-cols-1 gap-3 rounded-2xl border border-white/60 bg-white/45 p-4 backdrop-blur-md md:grid-cols-2 xl:grid-cols-5">
                    <input
                      value={productForm.name}
                      onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Product name"
                      className="rounded-xl border border-purple-200 bg-white/80 px-3 py-2 text-sm outline-none ring-purple-300 focus:ring"
                      required
                    />
                    <input
                      value={productForm.category}
                      onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                      placeholder="Category"
                      className="rounded-xl border border-purple-200 bg-white/80 px-3 py-2 text-sm outline-none ring-purple-300 focus:ring"
                      required
                    />
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                      placeholder="Price"
                      className="rounded-xl border border-purple-200 bg-white/80 px-3 py-2 text-sm outline-none ring-purple-300 focus:ring"
                      min="0"
                      required
                    />
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))}
                      placeholder="Stock"
                      className="rounded-xl border border-purple-200 bg-white/80 px-3 py-2 text-sm outline-none ring-purple-300 focus:ring"
                      min="0"
                      required
                    />

                    <div className="flex items-center gap-2">
                      <label className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-purple-300 bg-white/80 text-xs font-semibold text-purple-700 transition hover:bg-purple-50">
                        <FiImage className="h-4 w-4" /> Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const objectUrl = URL.createObjectURL(file);
                            setProductForm((p) => ({ ...p, imageUrl: objectUrl }));
                          }}
                        />
                      </label>
                      <button
                        type="submit"
                        className="h-10 rounded-xl bg-purple-600 px-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                      >
                        {editingProductId ? 'Update' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowProductForm(false)}
                        className="h-10 rounded-xl border border-purple-200 px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {products.length === 0 ? (
                  <EmptyState
                    title="No products yet"
                    description="Start by adding your first product with image, stock and pricing details."
                    actionLabel="Add Product"
                    onAction={openCreateProduct}
                  />
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => {
                      const badge = stockBadge(product.stock);
                      return (
                        <div key={product.id} className="rounded-2xl border border-white/60 bg-white/45 p-3 backdrop-blur-md transition hover:shadow-lg">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                              <img src={product.imageUrl} alt={product.name} className="h-14 w-14 rounded-xl border border-purple-100 object-cover" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-700">Rs {product.price}</span>
                              <span className={cn('rounded-full px-2 py-1 font-semibold', badge.classes)}>{badge.label}</span>
                              <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">Stock: {product.stock}</span>

                              <button
                                onClick={() => openEditProduct(product)}
                                className="inline-flex items-center gap-1 rounded-lg border border-purple-200 px-2 py-1 font-semibold text-purple-700 transition hover:bg-purple-100"
                              >
                                <FiEdit2 className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 font-semibold text-rose-600 transition hover:bg-rose-100"
                              >
                                <FiTrash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Orders' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">{orders.length} total</span>
                </div>

                {orders.length === 0 ? (
                  <EmptyState
                    title="No orders yet"
                    description="Your incoming orders will appear here with status and customer details."
                  />
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-white/60 bg-white/45 p-4 backdrop-blur-md">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{order.id} • {order.customer}</p>
                            <p className="text-xs text-gray-600">{order.items} items • Rs {order.total} • {order.time}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('rounded-full px-2 py-1 text-xs font-semibold', statusBadge(order.status))}>{order.status}</span>

                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-lg border border-purple-200 px-2 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                            >
                              View Details
                            </button>

                            {order.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'Packed')}
                                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                  <FiCheck className="h-3.5 w-3.5" /> Accept
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'Rejected')}
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                >
                                  <FiX className="h-3.5 w-3.5" /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedOrder && (
                  <div className="rounded-2xl border border-white/60 bg-white/55 p-4 backdrop-blur-md">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Order Details • {selectedOrder.id}</h3>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="rounded-lg border border-purple-200 p-1 text-purple-700 transition hover:bg-purple-100"
                        aria-label="Close details"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 sm:grid-cols-2">
                      <p><span className="font-semibold">Customer:</span> {selectedOrder.customer}</p>
                      <p><span className="font-semibold">Status:</span> {selectedOrder.status}</p>
                      <p><span className="font-semibold">Address:</span> {selectedOrder.address}</p>
                      <p><span className="font-semibold">Amount:</span> Rs {selectedOrder.total}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Analytics' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
                  <div className="inline-flex rounded-xl border border-purple-200 bg-white/70 p-1">
                    <button
                      onClick={() => setAnalyticsMode('daily')}
                      className={cn(
                        'rounded-lg px-3 py-1 text-sm font-semibold transition',
                        analyticsMode === 'daily' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-purple-100'
                      )}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setAnalyticsMode('weekly')}
                      className={cn(
                        'rounded-lg px-3 py-1 text-sm font-semibold transition',
                        analyticsMode === 'weekly' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-purple-100'
                      )}
                    >
                      Weekly
                    </button>
                  </div>
                </div>

                {isLoadingAnalytics ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2"><CardSkeleton /></div>
                    <CardSkeleton />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <SalesChart mode={analyticsMode} />
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md">
                        <h3 className="mb-3 text-base font-semibold text-gray-900">Revenue Summary</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex items-center justify-between"><span>{salesModeLabel}</span><strong>Rs {analyticsMode === 'daily' ? 4940 : 31310}</strong></p>
                          <p className="flex items-center justify-between"><span>Avg order value</span><strong>Rs 588</strong></p>
                          <p className="flex items-center justify-between"><span>Conversion</span><strong>24.8%</strong></p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md">
                        <h3 className="mb-3 text-base font-semibold text-gray-900">Top Selling Products</h3>
                        <div className="space-y-2">
                          {topSellingProducts.map((item) => (
                            <div key={item.id} className="flex items-center justify-between rounded-lg bg-white/70 px-2 py-1.5 text-sm">
                              <span className="truncate pr-3 text-gray-700">{item.name}</span>
                              <span className="font-semibold text-purple-700">{item.sold} sold</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Settings' && (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">Store Settings</h3>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="font-semibold text-gray-800">Store Name</p>
                      <p className="text-gray-600">Priya Kirana Mart</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="font-semibold text-gray-800">Delivery Radius</p>
                      <p className="text-gray-600">6 KM</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="font-semibold text-gray-800">Business Hours</p>
                      <p className="text-gray-600">7:00 AM - 10:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">Quick Toggles</h3>
                  <div className="space-y-3">
                    <button className="flex w-full items-center justify-between rounded-xl bg-white/70 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-purple-50">
                      <span className="inline-flex items-center gap-2"><FiTruck className="h-4 w-4 text-purple-600" /> Auto-accept prepaid orders</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">ON</span>
                    </button>
                    <button className="flex w-full items-center justify-between rounded-xl bg-white/70 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-purple-50">
                      <span className="inline-flex items-center gap-2"><FiAlertTriangle className="h-4 w-4 text-amber-600" /> Low stock notifications</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">ON</span>
                    </button>
                    <button className="flex w-full items-center justify-between rounded-xl bg-white/70 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-purple-50">
                      <span className="inline-flex items-center gap-2"><FiActivity className="h-4 w-4 text-blue-600" /> Daily summary report</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">OFF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ShopkeeperDashboardPage() {
  return (
    <Providers>
      <DashboardPageContent />
    </Providers>
  );
}
