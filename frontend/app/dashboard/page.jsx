'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AUTH_API_BASE_URL from '@/utils/authApi';

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-purple-200 bg-white/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
  });
  const [productImage, setProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [productImageName, setProductImageName] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const shopRes = await fetch(`${AUTH_API_BASE_URL}/shops?owner_id=${encodeURIComponent(user.id)}`);
      const shopData = await shopRes.json();

      if (!shopRes.ok || !shopData.success) {
        setShop(null);
        setMessage('Please create your shop first');
        setTimeout(() => router.push('/create-shop'), 1200);
        return;
      }

      setShop(shopData.shop);

      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${AUTH_API_BASE_URL}/products?shop_id=${encodeURIComponent(shopData.shop.id)}`),
        fetch(`${AUTH_API_BASE_URL}/orders?shop_id=${encodeURIComponent(shopData.shop.id)}`),
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      setProducts(productsData.success ? productsData.products : []);
      setOrders(ordersData.success ? ordersData.orders : []);
    } catch (error) {
      console.error('Dashboard load error', error);
      setMessage('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'shopkeeper') {
      router.push('/');
      return;
    }

    loadDashboardData();
  }, [user, router]);

  const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('Please upload a JPG, PNG, or WebP image');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image size must be 2MB or smaller');
      e.target.value = '';
      return;
    }

    setMessage('');
    setProductImage(file);
    setProductImageName(file.name);

    const previewUrl = URL.createObjectURL(file);
    setProductImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return previewUrl;
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!shop) {
      setMessage('Please create your shop first');
      router.push('/create-shop');
      return;
    }

    setSubmittingProduct(true);
    setMessage('');

    try {
      if (!productImage) {
        setMessage('Please choose a product image');
        setSubmittingProduct(false);
        return;
      }

      const formData = new FormData();
      formData.append('shop_id', shop.id);
      formData.append('name', productForm.name);
      formData.append('category', productForm.category);
      formData.append('price', String(Number(productForm.price) || 0));
      formData.append('stock', String(Number(productForm.stock) || 0));
      formData.append('image', productImage);

      const response = await fetch(`${AUTH_API_BASE_URL}/products`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setMessage(data.message || 'Failed to add product');
        return;
      }

      setProductForm({
        name: '',
        category: '',
        price: '',
        stock: '',
      });
      setProductImage(null);
      setProductImageName('');
      if (productImagePreview) {
        URL.revokeObjectURL(productImagePreview);
        setProductImagePreview('');
      }

      setMessage('Product added successfully');
      await loadDashboardData();
    } catch (error) {
      console.error('Create product error', error);
      setMessage('Failed to add product');
    } finally {
      setSubmittingProduct(false);
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
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 rounded-2xl border border-purple-200 bg-white/80 p-5">
            <h1 className="text-2xl font-bold text-gray-900">Shopkeeper Dashboard</h1>
            <p className="text-sm text-gray-600">
              {shop ? `${shop.name} • ${shop.category} • ${shop.address}` : 'Loading shop information...'}
            </p>
          </div>

          {message && (
            <div className="mb-4 rounded-lg bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700">
              {message}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-purple-200 bg-white/80 p-8 text-center text-sm text-gray-600">
              Loading dashboard...
            </div>
          ) : !shop ? (
            <div className="rounded-2xl border border-purple-200 bg-white/80 p-8 text-center">
              <p className="text-lg font-semibold text-gray-900">Please create your shop first</p>
              <button
                onClick={() => router.push('/create-shop')}
                className="mt-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Go to Create Shop
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Shop" value={shop.name} subtitle={shop.service_type} />
                <StatCard title="Products" value={products.length} subtitle="Total listed products" />
                <StatCard title="Orders" value={totalOrders} subtitle="Total orders" />
                <StatCard title="Stock" value={totalStock} subtitle={`Revenue ₹${totalRevenue}`} />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-purple-200 bg-white/80 p-5">
                  <h2 className="text-lg font-bold text-gray-900">Add Product</h2>
                  <p className="text-xs text-gray-600">Products are linked to your shop automatically.</p>

                  <form onSubmit={handleCreateProduct} className="mt-4 space-y-3">
                    <input
                      required
                      name="name"
                      value={productForm.name}
                      onChange={handleProductChange}
                      placeholder="Product Name"
                      className="w-full rounded-lg border border-purple-200 px-3 py-2"
                    />
                    <input
                      required
                      name="category"
                      value={productForm.category}
                      onChange={handleProductChange}
                      placeholder="Category"
                      className="w-full rounded-lg border border-purple-200 px-3 py-2"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        name="price"
                        type="number"
                        min="0"
                        value={productForm.price}
                        onChange={handleProductChange}
                        placeholder="Price"
                        className="w-full rounded-lg border border-purple-200 px-3 py-2"
                      />
                      <input
                        required
                        name="stock"
                        type="number"
                        min="0"
                        value={productForm.stock}
                        onChange={handleProductChange}
                        placeholder="Stock"
                        className="w-full rounded-lg border border-purple-200 px-3 py-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Product Image</label>
                      <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100">
                        Choose Image
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleProductImageChange}
                        />
                      </label>
                      {productImageName && (
                        <p className="text-xs text-gray-600">Selected file: {productImageName}</p>
                      )}
                      {productImagePreview && (
                        <div className="overflow-hidden rounded-xl border border-purple-200 bg-white">
                          <img src={productImagePreview} alt="Selected product preview" className="h-44 w-full object-cover" />
                        </div>
                      )}
                      <p className="text-xs text-gray-500">Allowed: JPG, PNG, WebP up to 2MB</p>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingProduct}
                      className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 font-semibold text-white disabled:opacity-60"
                    >
                      {submittingProduct ? 'Adding...' : 'Add Product'}
                    </button>
                  </form>
                </section>

                <section className="rounded-2xl border border-purple-200 bg-white/80 p-5">
                  <h2 className="text-lg font-bold text-gray-900">Products</h2>
                  {products.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">No products yet. Add your first product.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center gap-3 rounded-lg border border-purple-100 p-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-600">
                              {product.category} • ₹{product.price} • Stock {product.stock}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
