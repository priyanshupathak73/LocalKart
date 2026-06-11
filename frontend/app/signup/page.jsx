'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff,
  FiArrowRight, FiCheck, FiShield, FiUpload, FiTrash2, FiFileText, FiAlertCircle
} from 'react-icons/fi';
import AUTH_API_BASE_URL from '@/utils/authApi';

/** Reusable Input Field component */
function InputField({ icon: Icon, label, id, error, children, optional }) {
  return (
    <div className="space-y-1.5 flex-1 min-w-[200px]">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-wider select-none">
        {label}
        {optional && <span className="text-[10px] font-semibold text-gray-300 normal-case tracking-normal">(optional)</span>}
      </label>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all bg-gray-50/50 focus-within:bg-white focus-within:shadow-sm focus-within:shadow-green-500/5 ${
        error
          ? 'border-red-300 focus-within:border-red-400'
          : 'border-gray-250/70 focus-within:border-[#166534]'
      }`}>
        {Icon && <Icon className="w-4.5 h-4.5 text-gray-400 flex-shrink-0" />}
        {children}
      </div>
      {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = 'flex-1 bg-transparent outline-none text-sm font-semibold text-gray-800 placeholder-gray-400 w-full';

/** File upload area slot with drag & drop support, preview thumbnails, and PDF states */
function DocumentUploadSlot({
  label,
  id,
  file,
  onFileChange,
  onFileRemove,
  error,
  placeholder = "Upload PDF, JPG or PNG (max 5MB)"
}) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (uploadedFile) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(uploadedFile.type)) {
      alert("Invalid file type! Please upload a JPG, PNG, or PDF file.");
      return;
    }
    if (uploadedFile.size > maxSize) {
      alert("File is too large! Maximum file size is 5MB.");
      return;
    }

    let previewUrl = "";
    if (uploadedFile.type.startsWith('image/')) {
      try {
        previewUrl = URL.createObjectURL(uploadedFile);
      } catch (e) {
        console.error(e);
      }
    }

    onFileChange({
      name: uploadedFile.name,
      size: (uploadedFile.size / (1024 * 1024)).toFixed(2) + " MB",
      type: uploadedFile.type,
      previewUrl: previewUrl
    });
  };

  return (
    <div className="space-y-1.5 flex-1 min-w-[220px]">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
        {label}
      </label>
      
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[120px] relative group ${
            dragActive
              ? 'border-[#166534] bg-green-50/30'
              : error
                ? 'border-red-300 bg-red-50/10'
                : 'border-gray-250/70 bg-gray-50/50 hover:bg-white hover:border-green-600'
          }`}
        >
          <input
            id={id}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <FiUpload className="text-gray-400 group-hover:scale-110 transition-transform mb-1.5" size={18} />
          <p className="text-[11px] font-extrabold text-gray-650 leading-snug">Drag & drop or Click</p>
          <p className="text-[9px] text-gray-400 font-bold mt-0.5">{placeholder}</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-2xl p-3 bg-white flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {file.type.startsWith('image/') ? (
              <img
                src={file.previewUrl}
                alt={label}
                className="w-14 h-11 rounded-lg object-cover shadow-sm flex-shrink-0 bg-gray-50 border border-gray-100"
              />
            ) : (
              <div className="w-14 h-11 rounded-lg bg-red-50 text-red-650 flex flex-col items-center justify-center flex-shrink-0 border border-red-100 select-none">
                <FiFileText size={16} />
                <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">PDF</span>
              </div>
            )}
            <div className="leading-tight overflow-hidden text-left">
              <p className="text-xs font-black text-gray-800 truncate max-w-[120px]" title={file.name}>
                {file.name}
              </p>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                {file.size}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFileRemove}
            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition flex-shrink-0"
            title="Remove File"
          >
            <FiTrash2 size={13} className="stroke-[2.5]" />
          </button>
        </div>
      )}
      {error && <p className="text-[10px] font-bold text-red-500">{error}</p>}
    </div>
  );
}

/** Password strength bar */
function StrengthBar({ password }) {
  const score = !password ? 0
    : [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/]
        .filter(r => r.test(password)).length;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];

  if (!password) return null;
  return (
    <div className="flex items-center gap-2 mt-1.5 px-1">
      <div className="flex gap-1 flex-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <span className={`text-[10px] font-black ${
        score < 2 ? 'text-red-500' : score < 3 ? 'text-amber-500' : score < 4 ? 'text-blue-500' : 'text-green-700'
      }`}>{labels[score]}</span>
    </div>
  );
}

export default function SignupPage() {
  const [showPw,    setShowPw]    = useState(false);
  const [showCpw,   setShowCpw]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState('');
  const [msgType,   setMsgType]   = useState(''); // 'error' | 'success'
  const [errors,    setErrors]    = useState({});
  const [formData,  setFormData]  = useState({
    role: 'customer', name: '', email: '', phoneNumber: '', password: '', confirmPassword: '',
  });

  // Business document upload states for shopkeepers
  const [docs, setDocs] = useState({
    aadhaarNumber: '',
    aadhaarFront: null,
    aadhaarBack: null,
    panNumber: '',
    panFile: null,
    gstin: '',
    gstFile: null,
    fssaiNumber: '',
    fssaiFile: null,
    udyamNumber: '',
    udyamFile: null,
    shopPhoto: null,
  });

  const set = (k, v) => { 
    setFormData(p => ({ ...p, [k]: v })); 
    setErrors(e => ({ ...e, [k]: '' })); 
    setMessage(''); 
  };

  const setDocVal = (k, v) => {
    setDocs(p => ({ ...p, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setMessage('');
  };

  // Validate form
  const validate = () => {
    const e = {};
    if (!formData.name.trim())     e.name  = 'Full name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email address';
    
    // Phone number required for shopkeeper / delivery, optional for customer
    if (formData.role !== 'customer') {
      if (!formData.phoneNumber.trim()) {
        e.phoneNumber = 'Phone number is required for partners';
      } else if (!/^[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
        e.phoneNumber = 'Enter a valid 10-digit phone number';
      }
    } else {
      if (formData.phoneNumber && !/^[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
        e.phoneNumber = 'Enter a valid 10-digit phone number';
      }
    }

    if (formData.password.length < 6)  e.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';

    // Verify documents for shopkeepers
    if (formData.role === 'shopkeeper') {
      // Aadhaar
      const cleanAadhaar = docs.aadhaarNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        e.aadhaarNumber = 'Aadhaar Card Number must be exactly 12 digits';
      }
      if (!docs.aadhaarFront) {
        e.aadhaarFront = 'Front page upload is required';
      }
      if (!docs.aadhaarBack) {
        e.aadhaarBack = 'Back page upload is required';
      }

      // PAN
      const panClean = docs.panNumber.trim().toUpperCase();
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(panClean)) {
        e.panNumber = 'Enter a valid 10-character PAN (e.g. ABCDE1234F)';
      }
      if (!docs.panFile) {
        e.panFile = 'PAN Certificate upload is required';
      }

      // GSTIN checks (optional)
      if (docs.gstin.trim() && !docs.gstFile) {
        e.gstFile = 'Please upload GST Certificate for this GSTIN';
      }
      if (docs.gstFile && !docs.gstin.trim()) {
        e.gstin = 'GSTIN is required if certificate is uploaded';
      }

      // FSSAI checks (optional)
      if (docs.fssaiNumber.trim()) {
        const cleanFssai = docs.fssaiNumber.replace(/\D/g, '');
        if (cleanFssai.length !== 14) {
          e.fssaiNumber = 'FSSAI License Number must be 14 digits';
        }
        if (!docs.fssaiFile) {
          e.fssaiFile = 'Please upload FSSAI Certificate';
        }
      }
      if (docs.fssaiFile && !docs.fssaiNumber.trim()) {
        e.fssaiNumber = 'License Number is required if certificate is uploaded';
      }

      // Udyam checks (optional)
      if (docs.udyamNumber.trim() && !docs.udyamFile) {
        e.udyamFile = 'Please upload Udyam Registration Certificate';
      }
      if (docs.udyamFile && !docs.udyamNumber.trim()) {
        e.udyamNumber = 'Registration Number is required if certificate is uploaded';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) {
      setMessage('Please resolve the validation errors before submitting.');
      setMsgType('error');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res  = await fetch(`${AUTH_API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role:        formData.role,
          name:        formData.name.trim(),
          email:       formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          password:    formData.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Save uploaded document metadata in localStorage to simulate manual verification status in the dashboard
        if (formData.role === 'shopkeeper') {
          const docMetadata = {
            aadhaarNumber: docs.aadhaarNumber,
            aadhaarFrontName: docs.aadhaarFront?.name || '',
            aadhaarBackName: docs.aadhaarBack?.name || '',
            panNumber: docs.panNumber,
            panFileName: docs.panFile?.name || '',
            gstin: docs.gstin,
            gstFileName: docs.gstFile?.name || '',
            fssaiNumber: docs.fssaiNumber,
            fssaiFileName: docs.fssaiFile?.name || '',
            udyamNumber: docs.udyamNumber,
            udyamFileName: docs.udyamFile?.name || '',
            shopPhotoName: docs.shopPhoto?.name || '',
            status: 'pending_verification',
            uploadedAt: new Date().toISOString()
          };
          localStorage.setItem('shopkeeper_verification_docs', JSON.stringify(docMetadata));
        }

        setMessage('Account created! Verification details submitted successfully…');
        setMsgType('success');
        const redirect = data.user?.role === 'shopkeeper' ? '/create-shop' : data.user?.role === 'delivery' ? '/delivery-dashboard' : '/';
        setTimeout(() => { window.location.href = redirect; }, 1200);
      } else {
        setMessage(data.message || 'Signup failed. Please try again.');
        setMsgType('error');
      }
    } catch {
      setMessage('Connection error. Is the server running?');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  // Left panel points
  const leftPoints = {
    customer: [
      { emoji: '🛒', text: 'Shop from 50+ local stores' },
      { emoji: '⚡', text: 'Same-hour delivery guaranteed' },
      { emoji: '🚀', text: 'Free delivery — no minimums now' },
      { emoji: '📍', text: 'Hyperlocal — Ara, Bihar' },
    ],
    shopkeeper: [
      { emoji: '🏪', text: 'List your shop in minutes' },
      { emoji: '📦', text: 'Manage orders & inventory easily' },
      { emoji: '💰', text: 'Grow sales with local customers' },
      { emoji: '📊', text: 'Real-time dashboard & analytics' },
    ],
    delivery: [
      { emoji: '🚚', text: 'Earn on every successful delivery' },
      { emoji: '📍', text: 'Live map routing & navigation' },
      { emoji: '💰', text: 'Flexible hours — be your own boss' },
      { emoji: '⚡', text: 'Deliver in Ara, Bihar area' },
    ],
  };

  return (
    <div className="min-h-screen flex transition-all duration-300">
      
      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[38%] flex-col bg-[#0F3A1F] relative overflow-hidden shrink-0 select-none">
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-250/10 rounded-full blur-3xl" />
        
        {/* Floating emojis */}
        {['🎉','🛒','⚡','🏪','📦','🎁'].map((em, i) => (
          <span key={i} className="absolute text-2xl opacity-10 animate-bounce"
            style={{ left:`${5+i*16}%`, top:`${15+(i%3)*22}%`, animationDelay:`${i*0.4}s`, animationDuration:`${2+i*0.3}s` }}>
            {em}
          </span>
        ))}

        <div className="relative flex flex-col h-full px-10 py-12">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center bg-white rounded-2xl p-2 mb-auto shadow-md self-start">
            <img 
              src="/logo.png" 
              alt="e-LocalKart Logo" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="my-auto">
            {/* Role-based headline */}
            {formData.role === 'customer' ? (
              <>
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-black text-green-200 mb-5">
                  🛒 Join as Customer
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-3">
                  Your Neighbourhood,<br />
                  <span className="text-green-400">Delivered! ⚡</span>
                </h1>
                <p className="text-green-100/80 text-xs font-bold mb-6">
                  Create a free account and start ordering from local shops in Ara, Bihar in minutes.
                </p>
              </>
            ) : formData.role === 'shopkeeper' ? (
              <>
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-black text-green-200 mb-5">
                  🏪 Join as Shopkeeper
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-3">
                  Grow Your Shop<br />
                  <span className="text-green-400">with LocalKart 🚀</span>
                </h1>
                <p className="text-green-100/80 text-xs font-bold mb-6">
                  Register your shop, submit documents, and reach hundreds of local customers through same-hour delivery.
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-black text-green-200 mb-5">
                  🚚 Join as Delivery Agent
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-3">
                  Deliver & Earn<br />
                  <span className="text-green-400">with LocalKart 💰</span>
                </h1>
                <p className="text-green-100/80 text-xs font-bold mb-6">
                  Become a delivery agent, track routes live, and earn commission on every successful delivery.
                </p>
              </>
            )}

            {/* Points */}
            <div className="space-y-3">
              {leftPoints[formData.role].map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{p.emoji}</span>
                  <span className="text-green-100/90 text-xs font-bold">{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom trust */}
          <div className="mt-auto pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-green-200 text-xs font-bold">
              <FiShield size={14} />
              Your data is safe & encrypted. We never share it.
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-10 py-10 bg-gray-50 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-6 text-center select-none">
          <Link href="/" className="inline-flex items-center">
            <img 
              src="/logo.png" 
              alt="e-LocalKart Logo" 
              className="h-12 w-auto object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </Link>
        </div>

        {/* Dynamic Widened Container */}
        <div className={`w-full transition-all duration-300 ${
          formData.role === 'shopkeeper' ? 'max-w-2xl' : 'max-w-md'
        }`}>
          <div className="mb-7">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create your account ✨</h2>
            <p className="text-gray-400 text-sm font-semibold mt-1">Join thousands of users in Ara, Bihar</p>
          </div>

          {/* Role selector buttons */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-250/70 rounded-2xl select-none">
            {[
              { val: 'customer',   label: '🛒 Customer'   },
              { val: 'shopkeeper', label: '🏪 Shopkeeper' },
              { val: 'delivery',   label: '🚚 Delivery'   },
            ].map(r => (
              <button
                key={r.val}
                type="button"
                onClick={() => set('role', r.val)}
                className={`flex-1 py-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all ${
                  formData.role === r.val
                    ? 'bg-[#166534] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Information banners based on role */}
          {formData.role === 'customer' && (
            <div className="flex items-center gap-2 p-3.5 bg-green-50 border border-green-200/60 rounded-2xl mb-5 text-[11px] font-bold text-green-700">
              <span>💡</span> Order fresh groceries and track delivery agents in real-time.
            </div>
          )}
          {formData.role === 'delivery' && (
            <div className="flex items-center gap-2 p-3.5 bg-green-50 border border-green-200/60 rounded-2xl mb-5 text-[11px] font-bold text-green-700">
              <span>💡</span> Verification coordinates and vehicle details will be set up inside dashboard.
            </div>
          )}
          {formData.role === 'shopkeeper' && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl mb-5 text-[11px] font-extrabold text-emerald-800 text-left">
              <FiAlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="uppercase tracking-wider">Business verification required</p>
                <p className="font-semibold mt-0.5 text-emerald-700/90 leading-relaxed">
                  All documents will be manually verified by our team within 24-48 hours. Your shop will be activated after successful verification.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Basic Info: Responsive Grid for Shopkeepers, Stacked for Others */}
            <div className={`grid gap-4 ${
              formData.role === 'shopkeeper' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}>
              <InputField icon={FiUser} label="Full Name" id="su-name" error={errors.name}>
                <input id="su-name" type="text" name="name" className={inputCls}
                  placeholder="Priyanshu Pathak"
                  value={formData.name} onChange={e => set('name', e.target.value)} />
              </InputField>

              <InputField icon={FiMail} label="Email Address" id="su-email" error={errors.email}>
                <input id="su-email" type="email" name="email" className={inputCls}
                  placeholder="you@example.com"
                  value={formData.email} onChange={e => set('email', e.target.value)} />
              </InputField>

              <InputField 
                icon={FiPhone} 
                label="Phone Number" 
                id="su-phone" 
                error={errors.phoneNumber} 
                optional={formData.role === 'customer'}
              >
                <input id="su-phone" type="tel" name="phoneNumber" className={inputCls}
                  placeholder="9876543210"
                  value={formData.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} />
              </InputField>

              <div>
                <InputField icon={FiLock} label="Password" id="su-pw" error={errors.password}>
                  <input id="su-pw" type={showPw ? 'text' : 'password'} name="password" className={inputCls}
                    placeholder="Min. 6 characters"
                    value={formData.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </InputField>
                <StrengthBar password={formData.password} />
              </div>

              <div className={formData.role === 'shopkeeper' ? 'md:col-span-2' : ''}>
                <InputField icon={FiLock} label="Confirm Password" id="su-cpw" error={errors.confirmPassword}>
                  <input id="su-cpw" type={showCpw ? 'text' : 'password'} name="confirmPassword" className={inputCls}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                  <button type="button" onClick={() => setShowCpw(v => !v)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    {showCpw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </InputField>
              </div>
            </div>

            {/* Business Verification Documents (ONLY for Shopkeepers) */}
            {formData.role === 'shopkeeper' && (
              <div className="border-t border-gray-200 pt-6 space-y-5">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5 mb-2 select-none">
                  <span>📄</span> Business Verification Documents
                </h3>

                {/* 1. Aadhaar Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4.5 space-y-4">
                  <InputField label="Aadhaar Card Number" id="su-aadhaar-num" error={errors.aadhaarNumber}>
                    <input id="su-aadhaar-num" type="text" className={inputCls}
                      placeholder="12-digit Aadhaar Number"
                      maxLength={12}
                      value={docs.aadhaarNumber} 
                      onChange={e => setDocVal('aadhaarNumber', e.target.value.replace(/\D/g, ''))} />
                  </InputField>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <DocumentUploadSlot
                      label="Aadhaar Card Front"
                      id="su-aadhaar-front"
                      file={docs.aadhaarFront}
                      onFileChange={val => setDocVal('aadhaarFront', val)}
                      onFileRemove={() => setDocVal('aadhaarFront', null)}
                      error={errors.aadhaarFront}
                      placeholder="Upload Front Page File"
                    />
                    <DocumentUploadSlot
                      label="Aadhaar Card Back"
                      id="su-aadhaar-back"
                      file={docs.aadhaarBack}
                      onFileChange={val => setDocVal('aadhaarBack', val)}
                      onFileRemove={() => setDocVal('aadhaarBack', null)}
                      error={errors.aadhaarBack}
                      placeholder="Upload Back Page File"
                    />
                  </div>
                </div>

                {/* 2. PAN Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4.5 space-y-4">
                  <InputField label="PAN Card Number" id="su-pan-num" error={errors.panNumber}>
                    <input id="su-pan-num" type="text" className={inputCls}
                      placeholder="10-char PAN (e.g. ABCDE1234F)"
                      maxLength={10}
                      value={docs.panNumber} 
                      onChange={e => setDocVal('panNumber', e.target.value.toUpperCase())} />
                  </InputField>
                  
                  <DocumentUploadSlot
                    label="PAN Card Certificate"
                    id="su-pan-file"
                    file={docs.panFile}
                    onFileChange={val => setDocVal('panFile', val)}
                    onFileRemove={() => setDocVal('panFile', null)}
                    error={errors.panFile}
                  />
                </div>

                {/* 3. GSTIN (Optional) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4.5 space-y-4">
                  <InputField label="GSTIN" id="su-gstin-num" error={errors.gstin} optional>
                    <input id="su-gstin-num" type="text" className={inputCls}
                      placeholder="15-char GSTIN Number"
                      maxLength={15}
                      value={docs.gstin} 
                      onChange={e => setDocVal('gstin', e.target.value.toUpperCase())} />
                  </InputField>
                  
                  <DocumentUploadSlot
                    label="GST Certificate Upload"
                    id="su-gst-file"
                    file={docs.gstFile}
                    onFileChange={val => setDocVal('gstFile', val)}
                    onFileRemove={() => setDocVal('gstFile', null)}
                    error={errors.gstFile}
                  />
                </div>

                {/* 4. FSSAI License (Optional) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4.5 space-y-4">
                  <InputField label="FSSAI License Number" id="su-fssai-num" error={errors.fssaiNumber} optional>
                    <input id="su-fssai-num" type="text" className={inputCls}
                      placeholder="14-digit FSSAI Number"
                      maxLength={14}
                      value={docs.fssaiNumber} 
                      onChange={e => setDocVal('fssaiNumber', e.target.value.replace(/\D/g, ''))} />
                  </InputField>
                  
                  <DocumentUploadSlot
                    label="FSSAI Certificate Upload"
                    id="su-fssai-file"
                    file={docs.fssaiFile}
                    onFileChange={val => setDocVal('fssaiFile', val)}
                    onFileRemove={() => setDocVal('fssaiFile', null)}
                    error={errors.fssaiFile}
                  />
                </div>

                {/* 5. Udyam Registration (Optional) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4.5 space-y-4">
                  <InputField label="Udyam Registration Number" id="su-udyam-num" error={errors.udyamNumber} optional>
                    <input id="su-udyam-num" type="text" className={inputCls}
                      placeholder="Udyam Number (e.g. UDYAM-BR-...)"
                      value={docs.udyamNumber} 
                      onChange={e => setDocVal('udyamNumber', e.target.value)} />
                  </InputField>
                  
                  <DocumentUploadSlot
                    label="Udyam Certificate Upload"
                    id="su-udyam-file"
                    file={docs.udyamFile}
                    onFileChange={val => setDocVal('udyamFile', val)}
                    onFileRemove={() => setDocVal('udyamFile', null)}
                    error={errors.udyamFile}
                  />
                </div>

                {/* 6. Shop Premises Photo (Optional) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4.5 space-y-4">
                  <DocumentUploadSlot
                    label="Shop Premises Photo"
                    id="su-shop-photo"
                    file={docs.shopPhoto}
                    onFileChange={val => setDocVal('shopPhoto', val)}
                    onFileRemove={() => setDocVal('shopPhoto', null)}
                    placeholder="Upload Shop Premises Photo (JPG, PNG)"
                  />
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {message && (
              <div className={`flex items-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold text-left ${
                msgType === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-650'
              }`}>
                {msgType === 'success' ? (
                  <FiCheck size={14} className="flex-shrink-0 mt-0.5 stroke-[2.5]" />
                ) : (
                  <FiAlertCircle size={14} className="flex-shrink-0 mt-0.5 stroke-[2.5]" />
                )}
                <span>{message}</span>
              </div>
            )}

            {/* Submit Account Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 select-none ${
                formData.role === 'shopkeeper'
                  ? 'bg-[#166534] hover:bg-green-800 shadow-green-800/10'
                  : 'bg-[#0F3A1F] hover:bg-[#165a31] shadow-green-950/10'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span> 
                  <FiArrowRight size={14} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <p className="text-center text-sm text-gray-400 font-semibold mt-6 select-none">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className={`font-black tracking-wide transition ${
                formData.role === 'shopkeeper' ? 'text-[#166534] hover:text-green-800' : 'text-[#0F3A1F] hover:text-green-850'
              }`}
            >
              Sign in →
            </Link>
          </p>

          <p className="text-center text-[10px] text-gray-300 font-semibold mt-4 leading-relaxed select-none">
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-400">Terms of Service</a> and{' '}
            <a href="#" className="underline hover:text-gray-400">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
