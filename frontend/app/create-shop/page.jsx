'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AUTH_API_BASE_URL from '@/utils/authApi';

const categories = ['grocery', 'bakery', 'salon', 'pharmacy', 'restaurant', 'other'];
const serviceTypes = [
  { value: 'products', label: 'Products' },
  { value: 'services', label: 'Services' },
  { value: 'both', label: 'Both' },
];

export default function CreateShopPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'grocery',
    description: '',
    address: '',
    phoneNumber: '',
    imageUrl: '',
    service_type: 'products',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, imageUrl: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setMessage('❌ Please login again');
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== 'shopkeeper') {
      setMessage('❌ Only shopkeepers can create shops');
      setLoading(false);
      return;
    }

    if (!formData.imageUrl) {
      setMessage('❌ Please upload a shop image');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/shops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: user.id,
          name: formData.name,
          category: formData.category,
          description: formData.description,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          imageUrl: formData.imageUrl,
          service_type: formData.service_type,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(`❌ ${data.message || 'Failed to create shop'}`);
        return;
      }

      setMessage('✓ Shop created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (error) {
      console.error('Create shop error', error);
      setMessage('❌ Failed to create shop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main
        className={`min-h-screen pt-28 pb-14 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950'
            : 'bg-gradient-to-br from-white via-purple-50 to-blue-50'
        }`}
      >
        <div className="mx-auto max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 backdrop-blur-md ${
              theme === 'dark' ? 'bg-gray-900/50 border border-purple-500/30' : 'bg-white/80 border border-purple-200'
            }`}
          >
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create Your Shop</h1>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Complete shop onboarding to unlock your dashboard.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Shop Name"
                className="w-full rounded-lg border border-purple-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
              />

              <select
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-purple-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Shop Description"
                rows={4}
                className="w-full rounded-lg border border-purple-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
              />

              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Shop Address / Location"
                className="w-full rounded-lg border border-purple-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
              />

              <input
                required
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full rounded-lg border border-purple-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Shop Image Upload</label>
                <input
                  required
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full rounded-lg border border-purple-200 bg-white/80 px-4 py-3"
                />
              </div>

              <select
                required
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                className="w-full rounded-lg border border-purple-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
              >
                {serviceTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              {message && (
                <div className={`rounded-lg px-4 py-3 text-sm ${message.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loading ? 'Creating Shop...' : 'Create Shop'}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
