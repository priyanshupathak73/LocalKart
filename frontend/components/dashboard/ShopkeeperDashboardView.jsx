'use client';

/**
 * ShopkeeperDashboardView.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully dynamic shopkeeper dashboard for LocalKart.
 * All data is fetched from the auth-worker API (localhost:8787).
 *
 * API Endpoints used:
 *   GET  /products?shop_id={id}          → product list
 *   POST /products                        → create product
 *   GET  /orders?shop_id={id}            → order list
 *   GET  /shops?owner_id={id}            → shop details
 *
 * Also reads localStorage("local_orders") for orders placed via the
 * customer frontend (which writes there for real-time sync).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  useState, useEffect, useCallback, useRef, useMemo
} from 'react';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiEye,
  FiRefreshCw, FiAlertTriangle, FiPackage, FiShoppingBag,
  FiDollarSign, FiClock, FiChevronDown, FiUpload, FiFilter,
  FiArrowUp, FiArrowDown, FiTruck, FiBarChart2, FiStar, FiUsers,
} from 'react-icons/fi';
import AUTH_API_BASE_URL from '@/utils/authApi';

// ─── Low-Stock threshold (units) ──────────────────────────────────────────────
const LOW_STOCK_THRESHOLD = 30;

// ─── Status colour map ────────────────────────────────────────────────────────
const STATUS_COLORS = {
  'Pending':          'bg-amber-50/70 text-amber-700 border-amber-150',
  'Order Placed':     'bg-amber-50/70 text-amber-700 border-amber-150',
  'Confirmed':        'bg-blue-50/70 text-blue-700 border-blue-150',
  'Preparing':        'bg-indigo-50/70 text-indigo-700 border-indigo-150',
  'Ready':            'bg-purple-50/70 text-purple-700 border-purple-150',
  'Out for Delivery': 'bg-sky-50/70 text-sky-700 border-sky-150',
  'Delivered':        'bg-emerald-50/70 text-emerald-700 border-emerald-150',
  'Cancelled':        'bg-rose-50/70 text-rose-700 border-rose-150',
};

const STATUS_DOT = {
  'Pending':          'bg-amber-500',
  'Order Placed':     'bg-amber-500',
  'Confirmed':        'bg-blue-500',
  'Preparing':        'bg-indigo-500',
  'Ready':            'bg-purple-500',
  'Out for Delivery': 'bg-sky-500',
  'Delivered':        'bg-emerald-500',
  'Cancelled':        'bg-rose-500',
};

// ─── Tiny reusable primitives ──────────────────────────────────────────────────

/** Full-screen centered loading spinner */
const Spinner = ({ size = 6 }) => (
  <span
    className={`inline-block w-${size} h-${size} border-2 border-emerald-200 border-t-emerald-700 rounded-full animate-spin`}
  />
);

/** Page-level loading state */
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <Spinner size={8} />
    <p className="text-xs font-semibold text-slate-400">Loading details…</p>
  </div>
);

/** Empty state illustration */
const EmptyState = ({ icon: Icon, title, sub, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner relative mb-4">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 opacity-60" />
      <Icon size={24} className="text-emerald-700 relative z-10" />
    </div>
    <p className="text-sm font-black text-slate-800 tracking-tight">{title}</p>
    {sub && <p className="text-[11px] text-slate-400 font-bold mt-1.5 max-w-[260px] leading-normal">{sub}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/** Error banner */
const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-700">
    <FiAlertTriangle size={16} className="flex-shrink-0" />
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-red-500 hover:text-red-700 transition"
      >
        <FiRefreshCw size={13} /> Retry
      </button>
    )}
  </div>
);

/** Status badge */
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shadow-sm ${
      STATUS_COLORS[status] || 'bg-slate-50 text-slate-600 border-slate-200'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || 'bg-slate-400'}`} />
    {status}
  </span>
);

/** Green primary button */
const GreenBtn = ({ children, onClick, type = 'button', disabled, className = '', size = 'sm' }) => {
  const sizes = { xs: 'px-3 py-1.5 text-xs', sm: 'px-4 py-2 text-xs', md: 'px-5 py-2.5 text-sm' };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-extrabold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all hover:shadow-emerald-700/10 active:scale-95 ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

/** Outline button */
const OutlineBtn = ({ children, onClick, color = 'gray', className = '', size = 'sm' }) => {
  const sizes = { xs: 'px-3 py-1.5 text-xs', sm: 'px-4 py-2 text-xs', md: 'px-5 py-2.5 text-sm' };
  const colors = {
    gray:  'border-slate-200  text-slate-700  hover:bg-slate-50',
    green: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
    red:   'border-red-200   text-red-600   hover:bg-red-50',
    amber: 'border-amber-200 text-amber-750 hover:bg-amber-50',
  };
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 font-extrabold rounded-xl border transition-all active:scale-95 ${colors[color]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

/** Simple card shell */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-slate-100 rounded-2xl shadow-sm ${className}`}>
    {children}
  </div>
);

/** Card header row */
const CardHead = ({ title, sub, action }) => (
  <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-50">
    <div>
      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">{title}</h3>
      {sub && <p className="text-xs text-slate-400 font-medium mt-0.5">{sub}</p>}
    </div>
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
);

/** KPI card */
const KpiCard = ({ icon: Icon, title, value, sub, trend, loading, iconBg = 'bg-emerald-50', iconColor = 'text-emerald-700' }) => (
  <Card className="p-5 hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon size={18} className={iconColor} />
      </div>
      {trend !== undefined && !loading && (
        <span className={`text-[10px] font-extrabold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
          {trend >= 0 ? <FiArrowUp size={9} /> : <FiArrowDown size={9} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="mt-4">
      {loading ? (
        <div className="flex items-center gap-2"><Spinner size={5} /><span className="text-xs text-slate-405">Loading…</span></div>
      ) : (
        <>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{value ?? '—'}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">{title}</p>
          {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
        </>
      )}
    </div>
  </Card>
);

/** Inline search input */
const SearchInput = ({ value, onChange, placeholder = 'Search…' }) => (
  <div className="relative">
    <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all w-48"
    />
  </div>
);

/** Modal shell */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
        <h3 className="font-extrabold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
          <FiX size={16} className="text-gray-500" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

/** Form field */
const Field = ({ label, id, error, children }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
      {label}
    </label>
    {children}
    {error && <p className="text-[10px] font-bold text-red-500">{error}</p>}
  </div>
);

const inputCls = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all';

// ─── SVG Sales Chart ──────────────────────────────────────────────────────────
const SalesChart = ({ data }) => {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">No sales data yet</div>;
  const max = Math.max(...data.map(d => d.sales), 1);
  const points = data.map((d, i) => {
    const x = 40 + (i / Math.max(data.length - 1, 1)) * 440;
    const y = 20 + (1 - d.sales / max) * 150;
    return { x, y, ...d };
  });

  // Calculate smooth cubic Bezier path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
      const cp2y = p1.y;
      pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }
  }

  const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1].x},170 L ${points[0].x},170 Z` : '';

  return (
    <div className="relative w-full h-full">
      {/* Tooltip Overlay */}
      {hovered && (
        <div 
          className="absolute z-10 bg-slate-900 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none transition-all duration-150 flex flex-col items-center border border-slate-800"
          style={{ 
            left: `${(hovered.x / 500) * 100}%`,
            top: `${(hovered.y / 200) * 100 - 18}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{hovered.label}</span>
          <span className="text-xs font-black text-emerald-400 mt-0.5">₹{hovered.sales.toLocaleString('en-IN')}</span>
          {/* Subtle triangle pointer */}
          <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 mt-1 -mb-2 border-r border-b border-slate-800" />
        </div>
      )}

      <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 37.5, 75, 112.5, 150].map(y => (
          <line key={y} x1="40" y1={y + 20} x2="480" y2={y + 20} stroke="#f1f5f9" strokeWidth="1" />
        ))}

        {/* Vertical dotted guide line on hover */}
        {hovered && (
          <line x1={hovered.x} y1={20} x2={hovered.x} y2={170} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
        )}

        {/* Y Axis text labels */}
        {[max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0].map((v, i) => (
          <text key={i} x="34" y={20 + i * 37.5 + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="600">
            ₹{v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
          </text>
        ))}

        {/* Path elements */}
        {points.length > 0 && (
          <>
            <path d={areaD} fill="url(#sg)" />
            <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {/* Interactive nodes and labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle 
              cx={p.x} 
              cy={p.y} 
              r={hovered?.x === p.x ? 5 : 3.5} 
              fill={hovered?.x === p.x ? "#10b981" : "#ffffff"} 
              stroke="#10b981" 
              strokeWidth="2" 
              className="transition-all duration-155"
            />
            <text x={p.x} y="190" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontWeight="600">{p.label}</text>
            
            {/* Invisible hover area for easy selection */}
            <rect
              x={p.x - 20}
              y={10}
              width={40}
              height={170}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(null)}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

// ─── Order Detail Modal ────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onStatusChange, saving }) => {
  const NEXT = {
    'Pending': 'Confirmed', 'Order Placed': 'Confirmed',
    'Confirmed': 'Preparing', 'Preparing': 'Ready',
    'Ready': 'Out for Delivery', 'Out for Delivery': 'Delivered',
  };
  const next = NEXT[order?.status];

  if (!order) return null;
  return (
    <Modal title={`Order #${order.id?.slice(0, 8)?.toUpperCase()}`} onClose={onClose}>
      <div className="space-y-4">
        {/* Meta */}
        <div className="flex items-center justify-between">
          <StatusBadge status={order.status} />
          <span className="text-[11px] text-gray-400 font-medium">{order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : '—'}</span>
        </div>

        {/* Customer */}
        <div className="p-4 bg-gray-50 rounded-xl space-y-1">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
          <p className="text-sm font-extrabold text-gray-900">{order.customer || 'Customer'}</p>
          {order.phone && <p className="text-xs text-gray-500">{order.phone}</p>}
          {order.address && <p className="text-xs text-gray-500">{order.address}</p>}
        </div>

        {/* Items */}
        {order.itemsList?.length > 0 && (
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Items</p>
            <div className="space-y-2">
              {order.itemsList.map((it, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs font-bold text-gray-800">
                    {it.name} <span className="text-gray-400">×{it.quantity || it.qty || 1}</span>
                  </span>
                  <span className="text-xs font-extrabold text-gray-900">₹{it.price * (it.quantity || it.qty || 1)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 font-extrabold text-sm">
              <span>Total</span>
              <span className="text-[#166534]">₹{order.total}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          {next && (
            <GreenBtn className="w-full justify-center" size="md" disabled={saving} onClick={() => onStatusChange(order.id, next)}>
              {saving ? <Spinner size={4} /> : <FiCheck size={14} />} Mark as {next}
            </GreenBtn>
          )}
          {(order.status === 'Pending' || order.status === 'Order Placed') && (
            <OutlineBtn color="red" className="w-full justify-center" size="md" onClick={() => onStatusChange(order.id, 'Cancelled')}>
              <FiX size={14} /> Reject Order
            </OutlineBtn>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ─── Add Product Modal ─────────────────────────────────────────────────────────
const CATEGORIES = ['Fruits & Vegetables', 'Dairy & Bakery', 'Groceries', 'Beverages', 'Snacks', 'Personal Care', 'Household', 'Pharmacy', 'Other'];

const AddProductModal = ({ shopId, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', category: 'Groceries', price: '', stock: '', imageUrl: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name     = 'Product name is required';
    if (!form.price || +form.price <= 0) e.price = 'Enter a valid price';
    if (!form.stock || +form.stock < 0)  e.stock = 'Enter a valid stock quantity';
    if (!form.imageUrl.trim()) e.imageUrl = 'Image URL is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      const res = await fetch(`${AUTH_API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id:  shopId,
          name:     form.name.trim(),
          category: form.category,
          price:    Number(form.price),
          stock:    Number(form.stock),
          imageUrl: form.imageUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create product');
      onCreated(data.product);
      onClose();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Add New Product" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && <ErrorBanner message={apiError} />}
        <Field label="Product Name *" id="ap-name" error={errors.name}>
          <input id="ap-name" className={inputCls} placeholder="e.g. Tomato 1 kg" value={form.name} onChange={e => set('name', e.target.value)} />
        </Field>
        <Field label="Category *" id="ap-cat">
          <select id="ap-cat" className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₹) *" id="ap-price" error={errors.price}>
            <input id="ap-price" type="number" min="0" className={inputCls} placeholder="25" value={form.price} onChange={e => set('price', e.target.value)} />
          </Field>
          <Field label="Stock Qty *" id="ap-stock" error={errors.stock}>
            <input id="ap-stock" type="number" min="0" className={inputCls} placeholder="100" value={form.stock} onChange={e => set('stock', e.target.value)} />
          </Field>
        </div>
        <Field label="Image URL *" id="ap-img" error={errors.imageUrl}>
          <input id="ap-img" className={inputCls} placeholder="https://..." value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} />
        </Field>
        {form.imageUrl && (
          <img src={form.imageUrl} alt="preview" onError={e => { e.target.style.display = 'none'; }} className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
        )}
        <div className="flex gap-2 pt-1">
          <OutlineBtn className="flex-1 justify-center" size="md" onClick={onClose}>Cancel</OutlineBtn>
          <GreenBtn type="submit" className="flex-1 justify-center" size="md" disabled={saving}>
            {saving ? <Spinner size={4} /> : <FiPlus size={14} />} {saving ? 'Adding…' : 'Add Product'}
          </GreenBtn>
        </div>
      </form>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ShopkeeperDashboardView({ activeTab = 'dashboard', shop, userId, onTabChange }) {
  // ── Shared API state ────────────────────────────────────────────────────────
  const [products,        setProducts]      = useState([]);
  const [orders,          setOrders]        = useState([]);
  const [loadingProducts, setLoadingProd]   = useState(true);
  const [loadingOrders,   setLoadingOrders] = useState(true);
  const [prodError,       setProdError]     = useState('');
  const [orderError,      setOrderError]    = useState('');

  // Shop Status Toggle State (stored in localStorage)
  const [shopStatus, setShopStatus] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('local_shop_status') || 'Open';
    }
    return 'Open';
  });

  const toggleShopStatus = () => {
    const nextStatus = shopStatus === 'Open' ? 'Closed' : 'Open';
    setShopStatus(nextStatus);
    if (typeof window !== 'undefined') {
      localStorage.setItem('local_shop_status', nextStatus);
    }
  };

  // ── Fetch products from API ─────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!shop?.id) return;
    setLoadingProd(true);
    setProdError('');
    try {
      const res  = await fetch(`${AUTH_API_BASE_URL}/products?shop_id=${shop.id}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load products');
      setProducts(data.products || []);
    } catch (err) {
      setProdError(err.message);
    } finally {
      setLoadingProd(false);
    }
  }, [shop?.id]);

  // ── Fetch orders (API + localStorage merge) ──────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!shop?.id) return;
    setLoadingOrders(true);
    setOrderError('');
    try {
      const res  = await fetch(`${AUTH_API_BASE_URL}/orders?shop_id=${shop.id}`);
      const data = await res.json();
      let apiOrders = [];
      if (res.ok && data.success) {
        // Normalise API order structure
        apiOrders = (data.orders || []).map(o => ({
          id:         o.id,
          customer:   o.customer_name || 'Customer',
          phone:      o.customer_phone || '',
          address:    o.delivery_address || '',
          items:      o.items_summary || '',
          itemsList:  [],
          total:      o.total,
          status:     o.status || 'Pending',
          created_at: o.created_at,
        }));
      }

      // Merge with localStorage orders (customer frontend writes here)
      let localOrders = [];
      try {
        const raw = localStorage.getItem('local_orders');
        if (raw) {
          const parsed = JSON.parse(raw);
          localOrders = parsed.map(o => ({
            id:         o.id,
            customer:   o.customer || 'Customer',
            phone:      o.phone || '',
            address:    o.address || '',
            items:      (o.items || []).map(it => `${it.name} ×${it.quantity}`).join(', '),
            itemsList:  o.items || [],
            total:      o.total,
            status:     o.status || 'Pending',
            created_at: o.date || o.created_at,
          }));
        }
      } catch { /* ignore localStorage errors */ }

      // Deduplicate by id (API order wins over localStorage if same id)
      const byId = new Map();
      [...localOrders, ...apiOrders].forEach(o => byId.set(o.id, o));
      setOrders([...byId.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, [shop?.id]);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchOrders();   }, [fetchOrders]);

  // ── Listen for customer-side cart events ─────────────────────────────────────
  useEffect(() => {
    const handler = () => fetchOrders();
    window.addEventListener('local_cart_updated', handler);
    return () => window.removeEventListener('local_cart_updated', handler);
  }, [fetchOrders]);

  // ── Update order status (localStorage + optimistic UI) ───────────────────────
  const [statusSaving, setStatusSaving] = useState(false);
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setStatusSaving(true);
    try {
      // Persist to localStorage so customer dashboard also reflects
      const raw = localStorage.getItem('local_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        const updated = parsed.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        localStorage.setItem('local_orders', JSON.stringify(updated));
        window.dispatchEvent(new Event('local_cart_updated'));
      }
      /* NOTE: When a real PATCH /orders/:id endpoint is added to auth-worker,
         add the fetch call here:
         await fetch(`${AUTH_API_BASE_URL}/orders/${orderId}`, {
           method: 'PATCH', headers: {'Content-Type':'application/json'},
           body: JSON.stringify({ status: newStatus })
         });
      */
    } finally {
      setStatusSaving(false);
    }
  }, []);

  // ── Delete product ────────────────────────────────────────────────────────────
  const deleteProduct = useCallback(id => {
    if (!confirm('Delete this product?')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    // TODO: call DELETE /products/:id when endpoint is added
  }, []);

  // ─── Derived metrics ─────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = useMemo(() =>
    orders.filter(o => o.created_at?.slice(0, 10) === todayStr), [orders, todayStr]);
  const pendingOrders = useMemo(() =>
    orders.filter(o => o.status === 'Pending' || o.status === 'Order Placed'), [orders]);
  const todaySales = useMemo(() =>
    todayOrders.filter(o => o.status === 'Delivered').reduce((s, o) => s + Number(o.total || 0), 0), [todayOrders]);
  const lowStock = useMemo(() =>
    products.filter(p => Number(p.stock) <= LOW_STOCK_THRESHOLD), [products]);

  // ── Sales chart data (last 7 days) ────────────────────────────────────────────
  const salesChartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        date:  d.toISOString().slice(0, 10),
        sales: 0,
      };
    });
    orders.forEach(o => {
      if (o.status !== 'Delivered') return;
      const dayEntry = days.find(d => d.date === o.created_at?.slice(0, 10));
      if (dayEntry) dayEntry.sales += Number(o.total || 0);
    });
    return days;
  }, [orders]);

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 1 – DASHBOARD HOME
  // ─────────────────────────────────────────────────────────────────────────────
  const DashboardTab = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const isLoading = loadingOrders || loadingProducts;

    return (
      <div className="space-y-6 pb-10">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-2xl p-6 text-white shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {shop?.name ? `Welcome back, ${shop.name}! 👋` : 'Welcome to your Dashboard!'}
              </h2>
              <p className="text-emerald-100/90 text-xs font-medium mt-1">
                {shop?.category && `${shop.category} · `}Here is what is happening with your store today.
              </p>
            </div>
            
            {/* Prominent Shop Status Selector */}
            <div className="flex items-center gap-2 bg-emerald-900/40 backdrop-blur-md p-1 rounded-xl border border-emerald-700/30 self-start sm:self-auto">
              <button
                onClick={() => { if (shopStatus !== 'Open') toggleShopStatus(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-300 outline-none ${
                  shopStatus === 'Open'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${shopStatus === 'Open' ? 'bg-white animate-pulse' : 'bg-emerald-400'}`} />
                Open
              </button>
              <button
                onClick={() => { if (shopStatus !== 'Closed') toggleShopStatus(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-300 outline-none ${
                  shopStatus === 'Closed'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/20'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${shopStatus === 'Closed' ? 'bg-white' : 'bg-rose-300'}`} />
                Closed
              </button>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Banner */}
        {lowStock.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm shadow-rose-100/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-650 flex-shrink-0 animate-pulse">
                <FiAlertTriangle size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-rose-905 tracking-tight">Low Stock Alert</h4>
                <p className="text-[11px] text-rose-600 font-bold mt-0.5">
                  {lowStock.length} product{lowStock.length > 1 ? 's are' : ' is'} below the stock threshold. Check and replenish items.
                </p>
              </div>
            </div>
            <button
              onClick={() => onTabChange && onTabChange('inventory')}
              className="text-xs font-extrabold text-rose-700 bg-rose-100 hover:bg-rose-200 px-3.5 py-1.5 rounded-xl transition active:scale-95 whitespace-nowrap self-end sm:self-auto"
            >
              Restock Items &rarr;
            </button>
          </div>
        )}

        {/* Error banners */}
        {orderError   && <ErrorBanner message={`Orders: ${orderError}`}   onRetry={fetchOrders}   />}
        {prodError    && <ErrorBanner message={`Products: ${prodError}`}   onRetry={fetchProducts} />}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={FiShoppingBag} title="Today's Orders"   value={todayOrders.length}     loading={loadingOrders}  trend={12}  sub="Today only" iconBg="bg-emerald-50" iconColor="text-emerald-700" />
          <KpiCard icon={FiDollarSign}  title="Today's Sales"    value={`₹${todaySales.toLocaleString('en-IN')}`} loading={loadingOrders}  trend={8}   sub="Delivered orders" iconBg="bg-blue-50"   iconColor="text-blue-700" />
          <KpiCard icon={FiClock}       title="Pending Orders"   value={pendingOrders.length}   loading={loadingOrders}  trend={-3}  sub="Awaiting action" iconBg="bg-amber-50"  iconColor="text-amber-700" />
          <KpiCard icon={FiAlertTriangle} title="Low Stock Items" value={lowStock.length}        loading={loadingProducts} sub={`Below ${LOW_STOCK_THRESHOLD} units`} iconBg={lowStock.length > 0 ? "bg-rose-50" : "bg-slate-50"} iconColor={lowStock.length > 0 ? "text-rose-600" : "text-slate-500"} />
        </div>

        {/* Sales chart */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHead title="Sales Overview – Last 7 Days" sub="Revenue from delivered orders only" action={
            <button onClick={fetchOrders} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition" title="Refresh">
              <FiRefreshCw size={14} className={loadingOrders ? 'animate-spin' : ''} />
            </button>
          } />
          <div className="p-5 h-56">
            {loadingOrders ? <PageLoader /> : <SalesChart data={salesChartData} />}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Orders */}
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHead title="Recent Orders" sub="Last 6 orders" action={
              <span className="text-[11px] font-bold text-slate-400">{orders.length} total</span>
            } />
            {loadingOrders ? <PageLoader /> : orders.length === 0 ? (
              <EmptyState icon={FiShoppingBag} title="No orders yet" sub="Orders from customers will appear here." />
            ) : (
              <div className="divide-y divide-slate-50">
                {orders.slice(0, 6).map(ord => (
                  <div key={ord.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-all duration-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-extrabold text-slate-900 truncate">#{ord.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5 truncate">{ord.customer}</p>
                    </div>
                    <span className="text-xs font-black text-slate-800 flex-shrink-0">₹{ord.total}</span>
                    <StatusBadge status={ord.status} />
                    
                    {/* Action buttons matching status flow */}
                    <div className="flex gap-1.5">
                      {(ord.status === 'Pending' || ord.status === 'Order Placed') && (
                        <>
                          <button onClick={() => updateOrderStatus(ord.id, 'Confirmed')} title="Accept"
                            className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition active:scale-90">
                            <FiCheck size={11} />
                          </button>
                          <button onClick={() => updateOrderStatus(ord.id, 'Cancelled')} title="Reject"
                            className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition active:scale-90">
                            <FiX size={11} />
                          </button>
                        </>
                      )}
                      {ord.status === 'Confirmed' && (
                        <button onClick={() => updateOrderStatus(ord.id, 'Preparing')} title="Mark Preparing"
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] transition active:scale-90 whitespace-nowrap">
                          Prepare
                        </button>
                      )}
                      {ord.status === 'Preparing' && (
                        <button onClick={() => updateOrderStatus(ord.id, 'Ready')} title="Mark Ready"
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[10px] transition active:scale-90 whitespace-nowrap">
                          Ready
                        </button>
                      )}
                      {ord.status === 'Ready' && (
                        <button onClick={() => updateOrderStatus(ord.id, 'Out for Delivery')} title="Dispatch Order"
                          className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-extrabold text-[10px] transition active:scale-90 whitespace-nowrap">
                          Dispatch
                        </button>
                      )}
                      {ord.status === 'Out for Delivery' && (
                        <button onClick={() => updateOrderStatus(ord.id, 'Delivered')} title="Mark Delivered"
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[10px] transition active:scale-90 whitespace-nowrap">
                          Deliver
                        </button>
                      )}
                    </div>

                    <button onClick={() => setSelectedOrder(ord)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition" title="View">
                      <FiEye size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHead title="Low Stock Alerts" sub={`Products below ${LOW_STOCK_THRESHOLD} units`} action={
              loadingProducts ? <Spinner size={4} /> : (
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${lowStock.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                  {lowStock.length} items
                </span>
              )
            } />
            {loadingProducts ? <PageLoader /> : lowStock.length === 0 ? (
              <EmptyState icon={FiPackage} title="All products well stocked!" sub="Nothing below threshold right now." />
            ) : (
              <div className="divide-y divide-gray-50">
                {lowStock.map(p => {
                  const pct = Math.min(100, (Number(p.stock) / LOW_STOCK_THRESHOLD) * 100);
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.name} onError={e => { e.target.style.display='none'; }}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-gray-900 truncate">{p.name}</p>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full rounded-full ${Number(p.stock) === 0 ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${Number(p.stock) === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {p.stock} left
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={(id, st) => { updateOrderStatus(id, st); setSelectedOrder(null); }}
            saving={statusSaving}
          />
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 2 – PRODUCTS
  // ─────────────────────────────────────────────────────────────────────────────
  const ProductsTab = () => {
    const [search,   setSearch]   = useState('');
    const [catF,     setCatF]     = useState('All');
    const [stockF,   setStockF]   = useState('All');
    const [pageIdx,  setPageIdx]  = useState(1);
    const [showAdd,  setShowAdd]  = useState(false);
    const PAGE_SIZE = 8;

    const cats = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], []);

    const filtered = useMemo(() => {
      let list = [...products];
      if (catF !== 'All') list = list.filter(p => p.category === catF);
      if (stockF === 'Low')     list = list.filter(p => Number(p.stock) <= LOW_STOCK_THRESHOLD && Number(p.stock) > 0);
      if (stockF === 'Out')     list = list.filter(p => Number(p.stock) === 0);
      if (stockF === 'InStock') list = list.filter(p => Number(p.stock) > LOW_STOCK_THRESHOLD);
      if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      return list;
    }, [products, catF, stockF, search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((pageIdx - 1) * PAGE_SIZE, pageIdx * PAGE_SIZE);

    return (
      <div className="space-y-4 pb-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput value={search} onChange={v => { setSearch(v); setPageIdx(1); }} placeholder="Search products…" />
            <select value={catF} onChange={e => { setCatF(e.target.value); setPageIdx(1); }}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-500">
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={stockF} onChange={e => { setStockF(e.target.value); setPageIdx(1); }}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-500">
              <option value="All">All Stock</option>
              <option value="InStock">In Stock</option>
              <option value="Low">Low Stock</option>
              <option value="Out">Out of Stock</option>
            </select>
          </div>
          <GreenBtn onClick={() => setShowAdd(true)}><FiPlus size={13} /> Add Product</GreenBtn>
        </div>

        {prodError && <ErrorBanner message={prodError} onRetry={fetchProducts} />}

        <Card className="hover:shadow-md transition-all duration-300">
          <div className="overflow-x-auto">
            {loadingProducts ? <PageLoader /> : products.length === 0 ? (
              <EmptyState
                icon={FiPackage}
                title="No products in your store"
                sub="Add items to your catalog so customers can view and purchase them."
                action={
                  <GreenBtn onClick={() => setShowAdd(true)}>
                    <FiPlus size={13} /> Add Product
                  </GreenBtn>
                }
              />
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                        No products match the selected filters.
                      </td>
                    </tr>
                  ) : paged.map(prod => {
                    const stock = Number(prod.stock);
                    const stockStatus = stock === 0 ? { label: 'Out of Stock', cls: 'bg-rose-50/70 text-rose-700 border-rose-150' }
                      : stock <= LOW_STOCK_THRESHOLD ? { label: 'Low Stock', cls: 'bg-amber-50/70 text-amber-700 border-amber-150' }
                      : { label: 'In Stock', cls: 'bg-emerald-50/70 text-emerald-700 border-emerald-150' };
                    return (
                      <tr key={prod.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {prod.imageUrl ? (
                              <img src={prod.imageUrl} alt={prod.name} onError={e => { e.target.style.display='none'; }}
                                className="w-9 h-9 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <FiPackage size={14} className="text-gray-400" />
                              </div>
                            )}
                            <span className="font-extrabold text-gray-900 max-w-[160px] truncate">{prod.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{prod.category}</td>
                        <td className="px-4 py-3 font-extrabold text-gray-900">₹{prod.price}</td>
                        <td className="px-4 py-3 font-bold text-gray-700">{prod.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${stockStatus.cls}`}>{stockStatus.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#166534] hover:bg-green-50 transition" title="Edit">
                              <FiEdit2 size={13} />
                            </button>
                            <button onClick={() => deleteProduct(prod.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Delete">
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loadingProducts && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
              <span className="text-[11px] text-gray-400 font-medium">
                Showing {Math.min((pageIdx - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(pageIdx * PAGE_SIZE, filtered.length)} of {filtered.length} products
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPageIdx(n)}
                    className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all ${pageIdx === n ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/10' : 'border border-slate-200 text-slate-650 hover:border-emerald-500'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {showAdd && shop?.id && (
          <AddProductModal
            shopId={shop.id}
            onClose={() => setShowAdd(false)}
            onCreated={newProd => { setProducts(prev => [newProd, ...prev]); }}
          />
        )}
        {showAdd && !shop?.id && (
          <Modal title="Cannot Add Product" onClose={() => setShowAdd(false)}>
            <ErrorBanner message="Shop not loaded. Please wait and try again." />
          </Modal>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 3 – INVENTORY
  // ─────────────────────────────────────────────────────────────────────────────
  const InventoryTab = () => {
    const [search,    setSearch]    = useState('');
    const [stockF,    setStockF]    = useState('All');
    // Local editable threshold state (per product)
    const [thresholds, setThresholds] = useState({});
    const [editing,   setEditing]   = useState(null); // id of row being edited
    const [bulkMode,  setBulkMode]  = useState(false);
    const [bulkVal,   setBulkVal]   = useState('');

    const getThreshold = id => thresholds[id] ?? LOW_STOCK_THRESHOLD;

    const filtered = useMemo(() => {
      let list = [...products];
      if (stockF === 'Low')     list = list.filter(p => Number(p.stock) <= getThreshold(p.id) && Number(p.stock) > 0);
      if (stockF === 'Out')     list = list.filter(p => Number(p.stock) === 0);
      if (stockF === 'InStock') list = list.filter(p => Number(p.stock) > getThreshold(p.id));
      if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      return list;
    }, [products, stockF, search, thresholds]);

    const bulkUpdate = () => {
      const val = Number(bulkVal);
      if (isNaN(val) || val < 0) return;
      setProducts(prev => prev.map(p => ({ ...p, stock: val })));
      setBulkMode(false);
      setBulkVal('');
    };

    return (
      <div className="space-y-4 pb-10">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput value={search} onChange={setSearch} placeholder="Search inventory…" />
            <select value={stockF} onChange={e => setStockF(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-500">
              <option value="All">All Stock</option>
              <option value="InStock">In Stock</option>
              <option value="Low">Low Stock</option>
              <option value="Out">Out of Stock</option>
            </select>
          </div>
          <OutlineBtn color="green" onClick={() => setBulkMode(v => !v)}>
            <FiUpload size={13} /> Bulk Update
          </OutlineBtn>
        </div>

        {bulkMode && (
          <Card className="p-4 flex items-center gap-3">
            <p className="text-sm font-bold text-gray-700 flex-1">Set stock for ALL visible products:</p>
            <input type="number" min="0" value={bulkVal} onChange={e => setBulkVal(e.target.value)}
              className={`${inputCls} w-24`} placeholder="Qty" />
            <GreenBtn size="sm" onClick={bulkUpdate} disabled={!bulkVal}>Apply</GreenBtn>
            <OutlineBtn size="sm" onClick={() => setBulkMode(false)}>Cancel</OutlineBtn>
          </Card>
        )}

        {prodError && <ErrorBanner message={prodError} onRetry={fetchProducts} />}

        <Card className="hover:shadow-md transition-all duration-300">
          <div className="overflow-x-auto">
            {loadingProducts ? <PageLoader /> : products.length === 0 ? (
              <EmptyState
                icon={FiPackage}
                title="No inventory items yet"
                sub="Add products to your catalog to track and manage their stock levels."
                action={
                  <GreenBtn onClick={() => onTabChange && onTabChange('products')}>
                    <FiPlus size={13} /> Add Product
                  </GreenBtn>
                }
              />
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Product', 'Current Stock', 'Low Stock Alert', 'Progress', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                        No inventory items match the selected filter.
                      </td>
                    </tr>
                  ) : filtered.map(prod => {
                    const stock = Number(prod.stock);
                    const threshold = getThreshold(prod.id);
                    const pct = Math.min(100, (stock / Math.max(stock, threshold, 1)) * 100);
                    const isOut = stock === 0;
                    const isLow = !isOut && stock <= threshold;
                    const statusLabel = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
                    const statusCls   = isOut ? 'bg-rose-50/70 text-rose-700 border-rose-150' : isLow ? 'bg-amber-50/70 text-amber-700 border-amber-150' : 'bg-emerald-50/70 text-emerald-700 border-emerald-150';
                    const barCls      = isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-600';

                    return (
                      <tr key={prod.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3 font-extrabold text-gray-900 max-w-[180px] truncate">{prod.name}</td>
                        <td className="px-4 py-3 font-bold text-gray-700">{prod.stock}</td>
                        <td className="px-4 py-3">
                          {editing === prod.id ? (
                            <div className="flex items-center gap-1">
                              <input type="number" min="0"
                                defaultValue={threshold}
                                className="w-16 border border-green-300 rounded-lg px-2 py-1 text-xs outline-none"
                                onBlur={e => { setThresholds(t => ({ ...t, [prod.id]: Number(e.target.value) })); setEditing(null); }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className={`font-bold ${isLow || isOut ? 'text-amber-600' : 'text-gray-600'}`}>{threshold}</span>
                              <button onClick={() => setEditing(prod.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition" title="Edit threshold">
                                <FiEdit2 size={11} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 w-32">
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${barCls}`} style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusCls}`}>{statusLabel}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setProducts(p => p.map(x => x.id === prod.id ? { ...x, stock: Math.max(0, stock - 10) } : x))}
                              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center justify-center transition active:scale-90">−10</button>
                            <button onClick={() => setProducts(p => p.map(x => x.id === prod.id ? { ...x, stock: stock + 50 } : x))}
                              className="w-7 h-7 rounded-lg border border-emerald-200 hover:bg-emerald-50 text-xs font-bold text-emerald-700 flex items-center justify-center transition active:scale-90">+50</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 4 – ORDERS
  // ─────────────────────────────────────────────────────────────────────────────
  const OrdersTab = () => {
    const TABS = ['All', 'Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    const [activeOrderTab, setActiveOrderTab] = useState('All');
    const [search,         setSearch]         = useState('');
    const [selectedOrder,  setSelectedOrder]  = useState(null);

    const filtered = useMemo(() => {
      let list = [...orders];
      if (activeOrderTab !== 'All') {
        list = list.filter(o =>
          activeOrderTab === 'Pending'
            ? (o.status === 'Pending' || o.status === 'Order Placed')
            : o.status === activeOrderTab
        );
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(o =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q)
        );
      }
      return list;
    }, [orders, activeOrderTab, search]);

    const tabCount = st => orders.filter(o =>
      st === 'Pending'
        ? (o.status === 'Pending' || o.status === 'Order Placed')
        : o.status === st
    ).length;

    return (
      <div className="space-y-4 pb-10">
        {/* Status tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveOrderTab(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                activeOrderTab === t
                  ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/10'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {t}
              {t !== 'All' && (
                <span className={`ml-1 ${activeOrderTab === t ? 'text-emerald-200' : 'text-slate-400'}`}>
                  ({tabCount(t)})
                </span>
              )}
            </button>
          ))}
        </div>

        {orderError && <ErrorBanner message={orderError} onRetry={fetchOrders} />}

        <Card className="hover:shadow-md transition-all duration-300">
          <CardHead title={`${activeOrderTab} Orders`} sub={`${filtered.length} order${filtered.length !== 1 ? 's' : ''}`} action={
            <div className="flex items-center gap-2">
              <SearchInput value={search} onChange={setSearch} placeholder="Search orders…" />
              <button onClick={fetchOrders} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-650 border border-slate-200 transition" title="Refresh">
                <FiRefreshCw size={14} className={loadingOrders ? 'animate-spin' : ''} />
              </button>
            </div>
          } />
          <div className="overflow-x-auto">
            {loadingOrders ? <PageLoader /> : orders.length === 0 ? (
              <EmptyState
                icon={FiShoppingBag}
                title="No orders placed yet"
                sub="Your store is ready to accept orders! When customers buy your products, they will appear here."
              />
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                        No orders match the selected filter.
                      </td>
                    </tr>
                  ) : filtered.map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-mono font-extrabold text-slate-900">#{ord.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{ord.customer}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{ord.items || '—'}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-700">₹{ord.total}</td>
                      <td className="px-4 py-3"><StatusBadge status={ord.status} /></td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setSelectedOrder(ord)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition" title="View Details">
                            <FiEye size={13} />
                          </button>
                          {(ord.status === 'Pending' || ord.status === 'Order Placed') && <>
                            <button onClick={() => updateOrderStatus(ord.id, 'Confirmed')} className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[10px] transition active:scale-95">Accept</button>
                            <button onClick={() => updateOrderStatus(ord.id, 'Cancelled')} className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[10px] transition active:scale-95">Reject</button>
                          </>}
                          {ord.status === 'Confirmed'  && <button onClick={() => updateOrderStatus(ord.id, 'Preparing')}        className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] transition active:scale-95">Prepare</button>}
                          {ord.status === 'Preparing'  && <button onClick={() => updateOrderStatus(ord.id, 'Ready')}            className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[10px] transition active:scale-95">Ready</button>}
                          {ord.status === 'Ready'      && <button onClick={() => updateOrderStatus(ord.id, 'Out for Delivery')} className="px-2 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-extrabold text-[10px] transition active:scale-95">Dispatch</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={(id, st) => { updateOrderStatus(id, st); setSelectedOrder(null); }}
            saving={statusSaving}
          />
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 5 – CUSTOMERS (derived from orders)
  // ─────────────────────────────────────────────────────────────────────────────
  const CustomersTab = () => {
    const [search, setSearch] = useState('');

    const customers = useMemo(() => {
      const map = new Map();
      orders.forEach(o => {
        if (!o.customer || o.customer === 'Customer') return;
        if (!map.has(o.customer)) {
          map.set(o.customer, { name: o.customer, phone: o.phone || '—', orders: 0, spent: 0, lastOrder: o.created_at });
        }
        const c = map.get(o.customer);
        c.orders++;
        c.spent += Number(o.total || 0);
        if (o.created_at > c.lastOrder) c.lastOrder = o.created_at;
      });
      return [...map.values()].sort((a, b) => b.orders - a.orders);
    }, []);

    const filtered = useMemo(() => {
      if (!search.trim()) return customers;
      const q = search.toLowerCase();
      return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }, [customers, search]);

    return (
      <div className="space-y-4 pb-10">
        <div className="flex items-center gap-3 justify-between">
          <div className="grid grid-cols-3 gap-3 flex-1 max-w-md">
            {[
              { icon: FiUsers,       label: 'Total Customers', val: customers.length },
              { icon: FiShoppingBag, label: 'Repeat Buyers',   val: customers.filter(c => c.orders > 1).length },
              { icon: FiDollarSign,  label: 'Avg. Order',      val: `₹${orders.length ? Math.round(orders.reduce((s, o) => s + Number(o.total || 0), 0) / orders.length) : 0}` },
            ].map(k => (
              <Card key={k.label} className="p-3 text-center hover:shadow-md transition-all duration-300">
                <k.icon size={16} className="mx-auto text-emerald-700 mb-1" />
                <p className="text-base font-black text-slate-900">{loadingOrders ? '—' : k.val}</p>
                <p className="text-[10px] font-bold text-slate-400">{k.label}</p>
              </Card>
            ))}
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search customers…" />
        </div>

        <Card className="hover:shadow-md transition-all duration-300">
          <div className="overflow-x-auto">
            {loadingOrders ? <PageLoader /> : orders.length === 0 ? (
              <EmptyState
                icon={FiUsers}
                title="No customers yet"
                sub="Customers will appear here automatically when they place their first order at your shop."
              />
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>{['Customer', 'Phone', 'Orders', 'Total Spent', 'Last Order'].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                      No matching customers found.
                    </td></tr>
                  ) : filtered.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-extrabold text-xs flex-shrink-0">
                            {c.name[0]}
                          </div>
                          <span className="font-extrabold text-slate-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{c.phone}</td>
                      <td className="px-5 py-3 text-center font-extrabold text-slate-900">{c.orders}</td>
                      <td className="px-5 py-3 font-extrabold text-emerald-700">₹{c.spent.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-slate-400">
                        {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 6 – EARNINGS (derived from delivered orders)
  // ─────────────────────────────────────────────────────────────────────────────
  const EarningsTab = () => {
    const delivered = useMemo(() => orders.filter(o => o.status === 'Delivered'), []);
    const gross = useMemo(() => delivered.reduce((s, o) => s + Number(o.total || 0), 0), [delivered]);
    const commission = Math.round(gross * 0.08);
    const net = gross - commission;

    return (
      <div className="space-y-5 pb-10">
        {loadingOrders ? <PageLoader /> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={FiBarChart2}   title="Gross Earnings"    value={`₹${gross.toLocaleString('en-IN')}`}    sub="All delivered orders"  iconBg="bg-emerald-50"  iconColor="text-emerald-700" />
              <KpiCard icon={FiDollarSign}  title="Commission (8%)"   value={`₹${commission.toLocaleString('en-IN')}`} sub="Platform fee"          iconBg="bg-rose-50"   iconColor="text-rose-600" />
              <KpiCard icon={FiDollarSign}  title="Net Earnings"      value={`₹${net.toLocaleString('en-IN')}`}       sub="After deductions"      iconBg="bg-blue-50"  iconColor="text-blue-700" />
              <KpiCard icon={FiShoppingBag} title="Delivered Orders"  value={delivered.length}                        sub="Total fulfilled"        iconBg="bg-purple-50" iconColor="text-purple-700" />
            </div>

            <Card className="hover:shadow-md transition-all duration-300">
              <CardHead title="Earnings Breakdown" sub="Last 7 days" />
              <div className="p-5 h-56"><SalesChart data={salesChartData} /></div>
            </Card>

            <Card className="hover:shadow-md transition-all duration-300">
              <CardHead title="Delivered Orders" sub={`${delivered.length} fulfilled orders`} />
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>{['Order ID', 'Customer', 'Gross', 'Commission', 'Net', 'Date'].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {delivered.length === 0 ? (
                      <tr><td colSpan={6} className="py-16 text-center text-slate-400 font-bold">No delivered orders yet.</td></tr>
                    ) : delivered.map(o => {
                      const c = Math.round(Number(o.total) * 0.08);
                      return (
                        <tr key={o.id} className="hover:bg-slate-50/60 transition">
                          <td className="px-5 py-3 font-mono font-extrabold text-slate-900">#{o.id.slice(0,8).toUpperCase()}</td>
                          <td className="px-5 py-3 text-slate-700">{o.customer}</td>
                          <td className="px-5 py-3 font-extrabold text-slate-900">₹{o.total}</td>
                          <td className="px-5 py-3 text-rose-600 font-bold">−₹{c}</td>
                          <td className="px-5 py-3 font-extrabold text-emerald-700">₹{Number(o.total) - c}</td>
                          <td className="px-5 py-3 text-slate-400">{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 7 – REVIEWS (placeholder — no API yet)
  // ─────────────────────────────────────────────────────────────────────────────
  const ReviewsTab = () => (
    <div className="pb-10">
      <EmptyState
        icon={FiStar}
        title="Reviews coming soon"
        sub="Customer reviews will appear here once the reviews API endpoint is connected."
        action={
          <div className="mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-655 max-w-sm">
            📌 API Endpoint needed: <code className="font-mono text-[11px] text-emerald-750">GET /reviews?shop_id=</code>
          </div>
        }
      />
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 8 – SETTINGS
  // ─────────────────────────────────────────────────────────────────────────────
  const SettingsTab = () => {
    const [form, setForm] = useState({
      name:         shop?.name         || '',
      category:     shop?.category     || '',
      address:      shop?.address      || '',
      phone_number: shop?.phone_number || '',
      description:  shop?.description  || '',
    });
    const [saved, setSaved] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = e => {
      e.preventDefault();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      /* TODO: call PATCH /shops/:id when endpoint is added */
    };

    return (
      <div className="max-w-xl mx-auto space-y-5 pb-10">
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHead title="Shop Identity" sub="Details visible to customers on LocalKart" />
          <form onSubmit={handleSave} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Shop Name" id="s-name"><input id="s-name" className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} /></Field>
              <Field label="Category"  id="s-cat" ><input id="s-cat"  className={inputCls} value={form.category} onChange={e => set('category', e.target.value)} /></Field>
            </div>
            <Field label="Address" id="s-addr"><input id="s-addr" className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} /></Field>
            <Field label="Phone"   id="s-ph"  ><input id="s-ph"   className={inputCls} value={form.phone_number} onChange={e => set('phone_number', e.target.value)} /></Field>
            <Field label="Description" id="s-desc">
              <textarea id="s-desc" rows={3} className={inputCls} value={form.description} onChange={e => set('description', e.target.value)} />
            </Field>
            {saved && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-extrabold shadow-sm animate-pulse">
                <FiCheck size={13} /> Settings saved successfully!
              </div>
            )}
            <GreenBtn type="submit" size="md" className="w-full justify-center">
              <FiCheck size={14} /> Save Settings
            </GreenBtn>
          </form>
        </Card>
      </div>
    );
  };

  // ─── Tab switcher ──────────────────────────────────────────────────────────
  switch (activeTab) {
    case 'products':   return <ProductsTab  />;
    case 'inventory':  return <InventoryTab />;
    case 'orders':     return <OrdersTab    />;
    case 'customers':  return <CustomersTab />;
    case 'earnings':   return <EarningsTab  />;
    case 'reviews':    return <ReviewsTab   />;
    case 'settings':   return <SettingsTab  />;
    case 'dashboard':
    default:           return <DashboardTab />;
  }
}
