'use client';
import React, { useState, useEffect } from 'react';
import {
  FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiShield,
  FiMapPin, FiCreditCard, FiTruck, FiBell, FiTrash2, FiEdit2,
  FiCheck, FiLock, FiPlusCircle, FiLogOut, FiAlertTriangle,
  FiToggleLeft, FiToggleRight, FiX, FiHome, FiBriefcase,
  FiClock, FiSmartphone, FiEye, FiEyeOff, FiChevronDown,
  FiChevronRight, FiInfo, FiStar
} from 'react-icons/fi';

// ─── Tiny reusable UI pieces ─────────────────────────────────────────────────

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-50">
    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4.5 h-4.5 text-blue-600" size={18} />
    </div>
    <div>
      <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 font-medium mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const Badge = ({ children, color = 'green' }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
};

const Toggle = ({ checked, onChange, id }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    id={id}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
      checked ? 'bg-blue-600' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const InputField = ({
  label, id, type = 'text', value, onChange, disabled, placeholder,
  badge, rightElement, required, helper
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      {badge}
    </div>
    <div className="relative flex items-center">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition-all ${
          disabled
            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'border-gray-200 bg-white text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 hover:border-gray-300'
        } ${rightElement ? 'pr-10' : ''}`}
      />
      {rightElement && (
        <div className="absolute right-3">{rightElement}</div>
      )}
    </div>
    {helper && <p className="text-[11px] text-gray-400 font-medium">{helper}</p>}
  </div>
);

const ActionBtn = ({ onClick, variant = 'primary', size = 'sm', children, className = '', disabled, type = 'button' }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25',
    secondary: 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700',
    danger: 'bg-white border border-red-200 hover:bg-red-50 text-red-600',
    ghost: 'text-blue-600 hover:bg-blue-50',
  };
  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-bold rounded-xl transition-all ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// ─── Address Modal ─────────────────────────────────────────────────────────────
const AddressModal = ({ onClose, onSave, editingAddress = null }) => {
  const [form, setForm] = useState({
    tag: editingAddress?.tag || 'Home',
    flat: editingAddress?.flat || '',
    area: editingAddress?.area || '',
    city: editingAddress?.city || '',
    state: editingAddress?.state || '',
    pincode: editingAddress?.pincode || '',
    landmark: editingAddress?.landmark || '',
  });
  const [loadingPin, setLoadingPin] = useState(false);
  const [pinErr, setPinErr] = useState('');

  const tagOptions = [
    { value: 'Home', icon: '🏠' },
    { value: 'Office', icon: '💼' },
    { value: 'Other', icon: '📍' },
  ];

  const handlePincode = async (pin) => {
    setForm(f => ({ ...f, pincode: pin }));
    if (pin.length !== 6) return;
    setLoadingPin(true);
    setPinErr('');
    const local = {
      '411001': { city: 'Pune', state: 'Maharashtra', area: 'Camp' },
      '411057': { city: 'Pune', state: 'Maharashtra', area: 'Hinjewadi' },
      '802301': { city: 'Ara', state: 'Bihar', area: 'Ara Chowk' },
      '110001': { city: 'New Delhi', state: 'Delhi', area: 'Connaught Place' },
      '400001': { city: 'Mumbai', state: 'Maharashtra', area: 'Fort' },
    };
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      if (res.ok) {
        const data = await res.json();
        if (data[0]?.Status === 'Success') {
          const po = data[0].PostOffice[0];
          setForm(f => ({ ...f, city: po.District || po.Division, state: po.State, area: f.area || po.Name }));
          setLoadingPin(false); return;
        }
      }
    } catch {}
    const fb = local[pin];
    if (fb) setForm(f => ({ ...f, city: fb.city, state: fb.state, area: f.area || fb.area }));
    else setPinErr('Enter city & state manually.');
    setLoadingPin(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.flat || !form.city || !form.state) return;
    onSave({
      ...form,
      id: editingAddress?.id || `addr-${Date.now()}`,
      display: `${form.flat}${form.area ? ', ' + form.area : ''}${form.landmark ? ', near ' + form.landmark : ''}, ${form.city}, ${form.state}${form.pincode ? ' - ' + form.pincode : ''}`,
      isPrimary: editingAddress?.isPrimary || false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <FiX className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tag selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Address Type</label>
            <div className="flex gap-2">
              {tagOptions.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tag: t.value }))}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                    form.tag === t.value
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {t.icon} {t.value}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <InputField
                label="Flat / House No. / Building" id="modal-flat"
                value={form.flat} onChange={e => setForm(f => ({ ...f, flat: e.target.value }))}
                placeholder="e.g. A-202, Sunrise Apartments" required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <InputField
                label="Pincode" id="modal-pin"
                value={form.pincode}
                onChange={e => handlePincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit pincode"
                rightElement={loadingPin ? <span className="animate-spin text-blue-500 text-xs">⏳</span> : null}
              />
              {pinErr && <p className="text-[11px] text-amber-600 mt-1">{pinErr}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <InputField
                label="Area / Locality" id="modal-area"
                value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                placeholder="e.g. Hinjewadi Phase 1"
              />
            </div>
            <InputField
              label="City" id="modal-city"
              value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Pune" required
            />
            <InputField
              label="State" id="modal-state"
              value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              placeholder="e.g. Maharashtra" required
            />
            <div className="col-span-2">
              <InputField
                label="Landmark (Optional)" id="modal-landmark"
                value={form.landmark} onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))}
                placeholder="e.g. Near Big Bazaar"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <ActionBtn variant="secondary" className="flex-1" onClick={onClose}>Cancel</ActionBtn>
            <ActionBtn variant="primary" type="submit" className="flex-1">
              <FiCheck size={14} /> {editingAddress ? 'Update Address' : 'Save Address'}
            </ActionBtn>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Change Password Modal ────────────────────────────────────────────────────
const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPass.length < 8) { setMsg('New password must be at least 8 characters.'); setMsgType('error'); return; }
    if (form.newPass !== form.confirm) { setMsg('Passwords do not match.'); setMsgType('error'); return; }
    setLoading(true);
    setTimeout(() => {
      setMsg('Password changed successfully!'); setMsgType('success');
      setLoading(false);
      setTimeout(onClose, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900">Change Password</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <FiX className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {['current', 'newPass', 'confirm'].map((field) => {
            const labels = { current: 'Current Password', newPass: 'New Password', confirm: 'Confirm New Password' };
            return (
              <div key={field} className="space-y-1.5">
                <label htmlFor={`pwd-${field}`} className="text-xs font-bold text-gray-500 uppercase tracking-wide">{labels[field]}</label>
                <div className="relative flex items-center">
                  <input
                    id={`pwd-${field}`}
                    type={show[field] ? 'text' : 'password'}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    {show[field] ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>
            );
          })}
          {msg && (
            <div className={`p-3 rounded-xl text-xs font-bold ${
              msgType === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>{msg}</div>
          )}
          <div className="flex gap-3">
            <ActionBtn variant="secondary" className="flex-1" onClick={onClose}>Cancel</ActionBtn>
            <ActionBtn variant="primary" type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Update Password'}
            </ActionBtn>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Account Modal ─────────────────────────────────────────────────────
const DeleteAccountModal = ({ onClose, onConfirm }) => {
  const [typed, setTyped] = useState('');
  const CONFIRM_TEXT = 'DELETE';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-50">
          <h3 className="font-extrabold text-red-600 flex items-center gap-2">
            <FiAlertTriangle size={16} /> Delete Account
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <FiX className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-700 font-bold mb-1">⚠️ This action is irreversible</p>
            <p className="text-xs text-red-600 leading-relaxed">All your orders, saved shops, addresses, and account data will be permanently deleted. You cannot recover this data.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600">
              Type <span className="font-extrabold text-red-600 font-mono">{CONFIRM_TEXT}</span> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={e => setTyped(e.target.value.toUpperCase())}
              placeholder={`Type ${CONFIRM_TEXT}`}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono font-bold outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50"
            />
          </div>
          <div className="flex gap-3">
            <ActionBtn variant="secondary" className="flex-1" onClick={onClose}>Cancel</ActionBtn>
            <button
              disabled={typed !== CONFIRM_TEXT}
              onClick={onConfirm}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
                typed === CONFIRM_TEXT
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileSettingsView({ setActiveTab }) {
  // ── User / profile state ──────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phoneNumber: '', dob: '', gender: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileMsgType, setProfileMsgType] = useState('');
  const [profileDirty, setProfileDirty] = useState(false);

  // ── Address state ─────────────────────────────────────────────────────────
  const [addresses, setAddresses] = useState([
    { id: 'addr-1', tag: 'Home', display: '123, Green Street, Camp, Pune, Maharashtra - 411001', isPrimary: true },
    { id: 'addr-2', tag: 'Office', display: '45, Tech Park, Hinjewadi Phase 1, Pune, Maharashtra - 411057', isPrimary: false },
  ]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // ── Security state ────────────────────────────────────────────────────────
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const loginHistory = [
    { device: 'Chrome on Windows', location: 'Pune, Maharashtra', time: '3 Jun 2026, 5:10 PM', current: true },
    { device: 'Safari on iPhone', location: 'Mumbai, Maharashtra', time: '1 Jun 2026, 11:30 AM', current: false },
    { device: 'Chrome on Android', location: 'Pune, Maharashtra', time: '28 May 2026, 9:00 PM', current: false },
  ];

  // ── Payment methods state ─────────────────────────────────────────────────
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'pm-1', type: 'upi', label: 'priyanshu@okaxis', icon: '📱' },
    { id: 'pm-2', type: 'card', label: 'HDFC •••• 4521', icon: '💳', expiry: '09/27' },
  ]);

  // ── Delivery preferences state ────────────────────────────────────────────
  const [deliveryPrefs, setDeliveryPrefs] = useState({
    instructions: 'Leave at door',
    preferredTime: 'Morning',
    contactless: true,
  });

  // ── Notification preferences state ───────────────────────────────────────
  const [notifPrefs, setNotifPrefs] = useState({
    orderSMS: true, orderEmail: true, orderPush: true,
    promoSMS: false, promoEmail: true, promoPush: false,
    nearbyPush: true, nearbyEmail: false,
  });

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPaymentInput, setNewPaymentInput] = useState('');

  // ── Load user on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setProfileForm({
        name: u.name || '',
        email: u.email || '',
        phoneNumber: u.phoneNumber || u.phone_number || '',
        dob: u.dob || '',
        gender: u.gender || '',
      });
    } else {
      const seedUser = { id: 'CUST789', name: 'Priyanshu Pathak', email: 'priyanshu@example.com', phoneNumber: '9876543210', role: 'customer' };
      localStorage.setItem('user', JSON.stringify(seedUser));
      setUser(seedUser);
      setProfileForm({ name: seedUser.name, email: seedUser.email, phoneNumber: seedUser.phoneNumber, dob: '', gender: '' });
    }
    const storedAddrs = localStorage.getItem('customerAddresses');
    if (storedAddrs) setAddresses(JSON.parse(storedAddrs));
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const saveAddressesToStorage = (addrs) => {
    setAddresses(addrs);
    localStorage.setItem('customerAddresses', JSON.stringify(addrs));
  };

  const handleProfileChange = (field) => (e) => {
    setProfileForm(f => ({ ...f, [field]: e.target.value }));
    setProfileDirty(true);
    setProfileMsg('');
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { setProfileMsg('Name cannot be empty.'); setProfileMsgType('error'); return; }
    const updated = { ...user, ...profileForm, name: profileForm.name.trim(), phoneNumber: profileForm.phoneNumber.trim() };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setProfileMsg('Profile saved successfully!');
    setProfileMsgType('success');
    setProfileDirty(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveAddress = (addr) => {
    const exists = addresses.find(a => a.id === addr.id);
    const updated = exists
      ? addresses.map(a => a.id === addr.id ? addr : a)
      : [...addresses, addr];
    saveAddressesToStorage(updated);
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleRemoveAddress = (id) => saveAddressesToStorage(addresses.filter(a => a.id !== id));
  const handleSetPrimary = (id) => saveAddressesToStorage(addresses.map(a => ({ ...a, isPrimary: a.id === id })));

  const handleAddPayment = () => {
    if (!newPaymentInput.trim()) return;
    const isUpi = newPaymentInput.includes('@');
    setPaymentMethods(pm => [...pm, {
      id: `pm-${Date.now()}`,
      type: isUpi ? 'upi' : 'card',
      label: newPaymentInput.trim(),
      icon: isUpi ? '📱' : '💳',
    }]);
    setNewPaymentInput('');
    setShowAddPayment(false);
  };

  const handleRemovePayment = (id) => setPaymentMethods(pm => pm.filter(m => m.id !== id));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const deliveryTimeOptions = ['Morning (7 AM – 12 PM)', 'Afternoon (12 PM – 5 PM)', 'Evening (5 PM – 10 PM)', 'Any Time'];
  const deliveryInstructionOptions = [
    'Leave at door', 'Call before delivery', 'Ring doorbell', 'Leave with security', 'Do not disturb'
  ];

  // ── Notification rows helper ──────────────────────────────────────────────
  const notifRows = [
    {
      key: 'order', label: 'Order Updates', desc: 'Placed, dispatched, delivered alerts',
      channels: ['SMS', 'Email', 'Push'],
    },
    {
      key: 'promo', label: 'Promotional Offers', desc: 'Deals, coupons and flash sales',
      channels: ['SMS', 'Email', 'Push'],
    },
    {
      key: 'nearby', label: 'New Shops Nearby', desc: 'When a new local store joins LocalKart',
      channels: ['Push', 'Email'],
    },
  ];

  // ── Avatar initials ───────────────────────────────────────────────────────
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Modals */}
      {showAddressModal && (
        <AddressModal
          editingAddress={editingAddress}
          onClose={() => { setShowAddressModal(false); setEditingAddress(null); }}
          onSave={handleSaveAddress}
        />
      )}
      {showChangePwdModal && <ChangePasswordModal onClose={() => setShowChangePwdModal(false)} />}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}

      {/* Page */}
      <div className="max-w-2xl mx-auto pb-16 space-y-5">

        {/* ── Page Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 pb-1">
          <button
            onClick={() => setActiveTab && setActiveTab('home')}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Profile Settings</h1>
            <p className="text-xs text-gray-400 font-medium">Manage your account information and preferences</p>
          </div>
        </div>

        {/* ── Profile Summary Card (avatar + name) ───────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-blue-600/20">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-2 border-white/30">
            <span className="text-xl font-extrabold text-white">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold text-white truncate">{user?.name || '—'}</h2>
            <p className="text-xs text-blue-100 font-medium truncate">{user?.email || '—'}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge color="blue">
                <FiCheck size={9} /> Verified Customer
              </Badge>
              <span className="text-[10px] text-blue-200 font-bold">
                ID #{(user?.id || 'CUST789').toString().slice(-6).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            1. PERSONAL INFORMATION
        ───────────────────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={FiUser}
            title="Personal Information"
            subtitle="Update your name, phone number and personal details"
          />
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            {/* Full Name */}
            <InputField
              label="Full Name" id="prof-name" required
              value={profileForm.name}
              onChange={handleProfileChange('name')}
              placeholder="Enter your full name"
            />

            {/* Email (locked) */}
            <InputField
              label="Email Address" id="prof-email"
              value={profileForm.email} disabled
              badge={<Badge color="green"><FiCheck size={9} /> Verified</Badge>}
              rightElement={<FiLock size={14} className="text-gray-300" />}
              helper="Email cannot be changed. Contact support if needed."
            />

            {/* Phone */}
            <InputField
              label="Phone Number" id="prof-phone"
              value={profileForm.phoneNumber}
              onChange={handleProfileChange('phoneNumber')}
              placeholder="e.g. 9876543210"
              badge={<Badge color="green"><FiCheck size={9} /> Verified</Badge>}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label htmlFor="prof-dob" className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  Date of Birth
                  <span className="text-gray-300 font-normal normal-case">(optional)</span>
                </label>
                <input
                  id="prof-dob"
                  type="date"
                  value={profileForm.dob}
                  onChange={handleProfileChange('dob')}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 hover:border-gray-300 transition-all"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label htmlFor="prof-gender" className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  Gender
                  <span className="text-gray-300 font-normal normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    id="prof-gender"
                    value={profileForm.gender}
                    onChange={handleProfileChange('gender')}
                    className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 hover:border-gray-300 bg-white transition-all pr-8"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Feedback Message */}
            {profileMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${
                profileMsgType === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {profileMsgType === 'success' ? <FiCheck size={13} /> : <FiAlertTriangle size={13} />}
                {profileMsg}
              </div>
            )}

            <ActionBtn
              type="submit"
              variant="primary"
              size="md"
              disabled={!profileDirty}
              className={`w-full justify-center ${!profileDirty ? 'opacity-50' : ''}`}
            >
              <FiCheck size={14} /> Save Personal Information
            </ActionBtn>
          </form>
        </SectionCard>

        {/* ─────────────────────────────────────────────────────────────────────
            2. SAVED ADDRESSES
        ───────────────────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={FiMapPin}
            title="Saved Addresses"
            subtitle="Manage your delivery addresses"
          />
          <div className="p-6 space-y-3">
            {addresses.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                <FiMapPin size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-400">No saved addresses yet</p>
                <p className="text-xs text-gray-300 mt-1">Add an address to speed up checkout</p>
              </div>
            )}

            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative p-4 rounded-xl border transition-all ${
                  addr.isPrimary
                    ? 'border-blue-200 bg-blue-50/40 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    addr.tag === 'Home' ? 'bg-emerald-50' : addr.tag === 'Office' ? 'bg-purple-50' : 'bg-gray-50'
                  }`}>
                    {addr.tag === 'Home' ? <FiHome size={15} className="text-emerald-600" />
                      : addr.tag === 'Office' ? <FiBriefcase size={15} className="text-purple-600" />
                      : <FiMapPin size={15} className="text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-extrabold text-gray-800">{addr.tag}</span>
                      {addr.isPrimary && <Badge color="blue">Default</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{addr.display}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  {!addr.isPrimary && (
                    <ActionBtn
                      variant="ghost"
                      size="xs"
                      onClick={() => handleSetPrimary(addr.id)}
                    >
                      <FiCheck size={12} /> Set as Default
                    </ActionBtn>
                  )}
                  <ActionBtn
                    variant="ghost"
                    size="xs"
                    onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }}
                  >
                    <FiEdit2 size={12} /> Edit
                  </ActionBtn>
                  {!addr.isPrimary && (
                    <ActionBtn
                      variant="danger"
                      size="xs"
                      onClick={() => handleRemoveAddress(addr.id)}
                    >
                      <FiTrash2 size={12} /> Remove
                    </ActionBtn>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-extrabold text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
            >
              <FiPlusCircle size={15} /> Add New Address
            </button>
          </div>
        </SectionCard>

        {/* ─────────────────────────────────────────────────────────────────────
            3. SECURITY
        ───────────────────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={FiShield}
            title="Security"
            subtitle="Protect your account with strong security settings"
          />
          <div className="p-6 space-y-5">
            {/* Change Password */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <FiLock size={15} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Password</p>
                  <p className="text-xs text-gray-400 font-medium">Last changed 30 days ago</p>
                </div>
              </div>
              <ActionBtn variant="secondary" size="xs" onClick={() => setShowChangePwdModal(true)}>
                Change
              </ActionBtn>
            </div>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <FiSmartphone size={15} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-400 font-medium">OTP sent to your registered phone</p>
                </div>
              </div>
              <Toggle checked={twoFAEnabled} onChange={() => setTwoFAEnabled(v => !v)} id="2fa-toggle" />
            </div>

            {/* Login History */}
            <div>
              <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-3">Recent Login Activity</p>
              <div className="space-y-2">
                {loginHistory.map((entry, i) => (
                  <div key={i} className={`flex items-start justify-between p-3 rounded-xl ${
                    entry.current ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <FiSmartphone size={13} className={entry.current ? 'text-blue-600 mt-0.5' : 'text-gray-400 mt-0.5'} />
                      <div>
                        <p className="text-xs font-bold text-gray-800 flex items-center gap-2">
                          {entry.device}
                          {entry.current && <Badge color="blue">Current</Badge>}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{entry.location} · {entry.time}</p>
                      </div>
                    </div>
                    {!entry.current && (
                      <ActionBtn variant="danger" size="xs">Remove</ActionBtn>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─────────────────────────────────────────────────────────────────────
            4. PAYMENT METHODS
        ───────────────────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={FiCreditCard}
            title="Payment Methods"
            subtitle="Your saved UPI IDs and cards"
          />
          <div className="p-6 space-y-3">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{pm.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{pm.label}</p>
                    {pm.expiry && <p className="text-[11px] text-gray-400 font-medium">Expires {pm.expiry}</p>}
                    <Badge color="gray">{pm.type === 'upi' ? 'UPI' : 'Card'}</Badge>
                  </div>
                </div>
                <ActionBtn variant="danger" size="xs" onClick={() => handleRemovePayment(pm.id)}>
                  <FiTrash2 size={12} />
                </ActionBtn>
              </div>
            ))}

            {showAddPayment ? (
              <div className="p-4 border border-blue-100 rounded-xl bg-blue-50/30 space-y-3">
                <p className="text-xs font-extrabold text-gray-700">Add UPI ID or Card Number</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPaymentInput}
                    onChange={e => setNewPaymentInput(e.target.value)}
                    placeholder="e.g. name@upi or card number"
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
                  />
                  <ActionBtn variant="primary" size="xs" onClick={handleAddPayment}>Add</ActionBtn>
                  <ActionBtn variant="secondary" size="xs" onClick={() => setShowAddPayment(false)}>Cancel</ActionBtn>
                </div>
                <p className="text-[11px] text-gray-400">
                  <FiInfo size={11} className="inline mr-1" />
                  Your payment info is stored locally and used for faster checkout.
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowAddPayment(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-extrabold text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
              >
                <FiPlusCircle size={15} /> Add Payment Method
              </button>
            )}
          </div>
        </SectionCard>

        {/* ─────────────────────────────────────────────────────────────────────
            5. DELIVERY PREFERENCES
        ───────────────────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={FiTruck}
            title="Delivery Preferences"
            subtitle="Customize how and when you receive deliveries"
          />
          <div className="p-6 space-y-5">
            {/* Delivery Instructions */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Default Delivery Instructions</label>
              <div className="flex flex-wrap gap-2">
                {deliveryInstructionOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDeliveryPrefs(p => ({ ...p, instructions: opt }))}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      deliveryPrefs.instructions === opt
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Preferred Delivery Time</label>
              <div className="grid grid-cols-2 gap-2">
                {deliveryTimeOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDeliveryPrefs(p => ({ ...p, preferredTime: opt.split(' ')[0] }))}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                      deliveryPrefs.preferredTime === opt.split(' ')[0]
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <FiClock size={12} className="inline mr-1.5" />
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Contactless */}
            <div className="flex items-center justify-between py-3 border-t border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-800">Contactless Delivery</p>
                <p className="text-xs text-gray-400 font-medium">Agent leaves parcel outside your door</p>
              </div>
              <Toggle
                checked={deliveryPrefs.contactless}
                onChange={() => setDeliveryPrefs(p => ({ ...p, contactless: !p.contactless }))}
                id="contactless-toggle"
              />
            </div>

            <ActionBtn variant="primary" size="sm" className="w-full justify-center">
              <FiCheck size={13} /> Save Delivery Preferences
            </ActionBtn>
          </div>
        </SectionCard>

        {/* ─────────────────────────────────────────────────────────────────────
            6. NOTIFICATION PREFERENCES
        ───────────────────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={FiBell}
            title="Notification Preferences"
            subtitle="Control what alerts you receive and how"
          />
          <div className="p-6">
            {/* Channel header row */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center mb-3 px-1">
              <span />
              {['SMS', 'Email', 'Push'].map(ch => (
                <span key={ch} className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider w-10 text-center">{ch}</span>
              ))}
            </div>

            <div className="divide-y divide-gray-50">
              {notifRows.map(row => (
                <div key={row.key} className="py-4">
                  <div className="mb-3">
                    <p className="text-sm font-bold text-gray-800">{row.label}</p>
                    <p className="text-xs text-gray-400 font-medium">{row.desc}</p>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center px-1">
                    <span />
                    {['SMS', 'Email', 'Push'].map(ch => {
                      const lch = ch.toLowerCase();
                      const key = `${row.key}${ch}`;
                      const available = row.channels.includes(ch);
                      return (
                        <div key={ch} className="w-10 flex justify-center">
                          {available ? (
                            <Toggle
                              checked={notifPrefs[key] ?? false}
                              onChange={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                              id={`notif-${key}`}
                            />
                          ) : (
                            <span className="text-gray-200 text-base select-none" title="Not available">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ─────────────────────────────────────────────────────────────────────
            7. ACCOUNT MANAGEMENT
        ───────────────────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={FiUser}
            title="Account Management"
            subtitle="Session and account lifecycle controls"
          />
          <div className="p-6 space-y-3">
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition">
                <FiLogOut size={16} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Sign Out</p>
                <p className="text-xs text-gray-400 font-medium">You can sign back in at any time</p>
              </div>
              <FiChevronRight size={16} className="text-gray-300 ml-auto" />
            </button>

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-100 bg-white hover:bg-red-50 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition">
                <FiTrash2 size={16} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-600">Delete Account</p>
                <p className="text-xs text-red-400 font-medium">Permanently remove all your data</p>
              </div>
              <FiChevronRight size={16} className="text-red-200 ml-auto" />
            </button>
          </div>
        </SectionCard>

        {/* Bottom safe space */}
        <p className="text-center text-[11px] text-gray-300 font-medium pt-4">
          LocalKart · Customer Account Settings · v1.0
        </p>
      </div>
    </>
  );
}
