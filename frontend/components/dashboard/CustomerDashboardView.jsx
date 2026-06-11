import React, { useState, useEffect, useMemo } from 'react';
import products from '../../data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiMapPin, FiStar, FiChevronRight, FiSearch, FiPhone, FiCheck, FiShoppingBag, FiHeart, FiMessageSquare, FiSettings } from 'react-icons/fi';
import API_BASE_URL from '@/utils/api';
import fallbackBusinesses from '@/data/businesses';
import PaymentMethodSelection from './PaymentMethodSelection';
import ProfileSettingsView from './ProfileSettingsView';
import { useRouter } from 'next/navigation';

export default function CustomerDashboardView({
  activeTab = 'home',
  setActiveTab = () => {},
  searchValue = '',
}) {
  const router = useRouter();
  // Sync state with localStorage for persistence
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // Sidebar items state
  const [user, setUser] = useState(null);
  const [savedShopIds, setSavedShopIds] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phoneNumber: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileMessageType, setProfileMessageType] = useState('');

  // Address state
  const [addresses, setAddresses] = useState([
    { id: 'addr-1', tag: 'Home 🏠', address: '123, Green Street, Pune, Maharashtra - 411001', isPrimary: true },
    { id: 'addr-2', tag: 'Office 💼', address: '45, Tech Park, Hinjewadi, Pune, Maharashtra - 411057', isPrimary: false }
  ]);
  const [addrTag, setAddrTag] = useState('Home 🏠');
  const [addrFlat, setAddrFlat] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrArea, setAddrArea] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [resolvedAreas, setResolvedAreas] = useState([]);
  const [pincodeError, setPincodeError] = useState('');
  const [loadingPincode, setLoadingPincode] = useState(false);

  // Checkout flow states
  const [cartStep, setCartStep] = useState('cart'); // 'cart' | 'payment'
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'autopay' | 'cod'

  // Browsing and filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All'); // 'All' | 'Under 50' | '50-100' | '100-200' | 'Above 200'
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity' | 'price-low' | 'price-high' | 'rating'
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderDetails, setExpandedOrderDetails] = useState(false);

  // Initialize state from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('local_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error(e);
      }
    }

    const storedOrders = localStorage.getItem('local_orders');
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed default mock orders so the screen has order history to display
      const defaultOrders = [
        {
          id: 'ORD123456',
          date: '12 May 2024, 10:30 AM',
          status: 'Out for Delivery',
          items: [
            { id: 'prod-001', name: 'Tomato 1 kg', price: 25, quantity: 1 },
            { id: 'prod-002', name: 'Potato 1 kg', price: 20, quantity: 2 },
            { id: 'prod-007', name: 'Milk 1 Ltr', price: 55, quantity: 1 }
          ],
          subtotal: 120,
          deliveryFee: 20,
          total: 140,
          deliveryAgent: {
            name: 'Rohit Sharma',
            phone: '9870653210',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          }
        },
        {
          id: 'ORD123455',
          date: '10 May 2024, 02:15 PM',
          status: 'Delivered',
          items: [
            { id: 'prod-003', name: 'Onion 1 kg', price: 22, quantity: 3 },
            { id: 'prod-008', name: 'Fresh Bread 1 Packet', price: 40, quantity: 1 }
          ],
          subtotal: 106,
          deliveryFee: 20,
          total: 126,
          deliveryAgent: {
            name: 'Rohit Sharma',
            phone: '9870653210',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          }
        }
      ];
      localStorage.setItem('local_orders', JSON.stringify(defaultOrders));
      setOrders(defaultOrders);
    }

    // Load User
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setProfileForm({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phoneNumber: parsedUser.phoneNumber || parsedUser.phone_number || '',
      });
    } else {
      const seedUser = { id: 'CUST789', name: 'Priyanshu Pathak', email: 'priyanshu@example.com', phoneNumber: '9876543210', role: 'customer' };
      localStorage.setItem('user', JSON.stringify(seedUser));
      setUser(seedUser);
      setProfileForm({ name: seedUser.name, email: seedUser.email, phoneNumber: seedUser.phoneNumber });
    }

    // Load Saved Shops
    const savedIds = JSON.parse(localStorage.getItem('savedShops') || '[]');
    setSavedShopIds(savedIds);

    // Load Inquiries
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

    // Fetch Shops list to resolve names
    const fetchShops = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/businesses`);
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : [];
          if (list.length > 0) {
            setAllShops(list);
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
      setAllShops(fallbackBusinesses);
    };
    fetchShops();
  }, []);

  // Load Razorpay and Cashfree SDK scripts dynamically
  useEffect(() => {
    const rzpId = 'razorpay-sdk-script';
    if (!document.getElementById(rzpId)) {
      const script = document.createElement('script');
      script.id = rzpId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const cfId = 'cashfree-sdk-script';
    if (!document.getElementById(cfId)) {
      const script = document.createElement('script');
      script.id = cfId;
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Save cart changes to localStorage
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('local_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('local_cart_updated'));
  };

  // Add item to cart
  const handleAddToCart = (product) => {
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      saveCart(newCart);
    } else {
      saveCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (productId, delta) => {
    const existingIndex = cart.findIndex((item) => item.id === productId);
    if (existingIndex === -1) return;

    const newCart = [...cart];
    newCart[existingIndex].quantity += delta;
    if (newCart[existingIndex].quantity <= 0) {
      newCart.splice(existingIndex, 1);
    }
    saveCart(newCart);
  };

  // Remove item from cart
  const handleRemoveFromCart = (productId) => {
    const newCart = cart.filter((item) => item.id !== productId);
    saveCart(newCart);
  };

  // Helper to save verified order to local storage history list
  const completeOrderLocally = (orderId, statusLabel, subtotalVal, deliveryFeeVal, totalVal) => {
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
      status: statusLabel,
      items: [...cart],
      subtotal: subtotalVal,
      deliveryFee: deliveryFeeVal,
      total: totalVal,
      deliveryAgent: {
        name: 'Rohit Sharma',
        phone: '9870653210',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      }
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('local_orders', JSON.stringify(updatedOrders));

    // Clear cart
    saveCart([]);

    // Select order to track and switch view to order status
    setSelectedOrderId(orderId);
    setCartStep('cart'); // reset checkout cart step
    setActiveTab('order-status');
  };

  // Handle Unified Online Gateways with Failover Routing
  const executeOnlinePayment = async (orderId, subtotal, deliveryFee, total, gatewayPreference = 'razorpay') => {
    try {
      const createOrderRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          gatewayPreference,
          customerData: {
            id: user?.id || user?._id || 'guest_customer',
            phone: user?.phoneNumber || '9999999999',
            email: user?.email || 'customer@example.com',
            name: user?.name || 'LocalKart Customer'
          }
        })
      });

      if (!createOrderRes.ok) {
        const errData = await createOrderRes.json();
        throw new Error(errData.message || 'Failed to initiate gateway order');
      }

      const orderData = await createOrderRes.json();

      if (orderData.gateway === 'razorpay') {
        const rzpOrder = orderData.razorpayOrderDetails;

        if (orderData.isMock || !window.Razorpay) {
          // Simulated Mock Razorpay checkout with failover prompt
          const opt = confirm(`[Mock Razorpay] Simulating checkout for Order: ${rzpOrder.id}.\nAmount: ₹${(rzpOrder.amount / 100).toFixed(2)}\n\nClick OK to confirm payment, or CANCEL to trigger fall back to Cashfree.`);
          
          if (!opt) {
            console.log('Failing over from mock Razorpay to Cashfree gateway...');
            await executeOnlinePayment(orderId, subtotal, deliveryFee, total, 'cashfree');
            return;
          }

          const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: rzpOrder.id,
              razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
              razorpaySignature: `mock_sig_${Math.random().toString(36).substring(2, 10)}`,
              gateway: 'razorpay'
            })
          });

          if (!verifyRes.ok) throw new Error('Mock Razorpay verification failed');
          completeOrderLocally(orderId, 'Order Placed', subtotal, deliveryFee, total);
        } else {
          // Live Razorpay Checkout
          const options = {
            key: orderData.razorpayKeyId,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: 'LocalKart',
            description: 'LocalKart Store Checkout',
            order_id: rzpOrder.id,
            handler: async function (response) {
              try {
                const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    gateway: 'razorpay'
                  })
                });

                if (!verifyRes.ok) throw new Error('Razorpay payment verification failed');
                completeOrderLocally(orderId, 'Order Placed', subtotal, deliveryFee, total);
              } catch (err) {
                alert('Razorpay verification error: ' + err.message);
              }
            },
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
              contact: user?.phoneNumber || ''
            },
            theme: { color: '#2563EB' }
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', async function (resp) {
            console.warn('Razorpay failed, prompting Cashfree fallback:', resp.error.description);
            const tryFallback = confirm(`Razorpay Payment Failed: ${resp.error.description}.\nWould you like to try Cashfree instead?`);
            if (tryFallback) {
              await executeOnlinePayment(orderId, subtotal, deliveryFee, total, 'cashfree');
            }
          });
          rzp.open();
        }
      } else if (orderData.gateway === 'cashfree') {
        const cfOrder = orderData.cashfreeOrderDetails;

        if (orderData.isMock || !window.Cashfree) {
          // Simulated Mock Cashfree checkout
          const opt = confirm(`[Mock Cashfree] Simulating checkout for Order: ${cfOrder.order_id}.\nAmount: ₹${cfOrder.order_amount}\n\nClick OK to confirm payment, or CANCEL to trigger fall back to Razorpay.`);
          
          if (!opt) {
            console.log('Failing over from mock Cashfree to Razorpay gateway...');
            await executeOnlinePayment(orderId, subtotal, deliveryFee, total, 'razorpay');
            return;
          }

          const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gateway: 'cashfree',
              cfOrderId: cfOrder.order_id,
              paymentSessionId: cfOrder.payment_session_id
            })
          });

          if (!verifyRes.ok) throw new Error('Mock Cashfree verification failed');
          completeOrderLocally(orderId, 'Order Placed', subtotal, deliveryFee, total);
        } else {
          // Live Cashfree Checkout
          try {
            const cashfree = new window.Cashfree({ mode: 'sandbox' });
            await cashfree.checkout({
              paymentSessionId: cfOrder.payment_session_id,
              redirectTarget: '_self'
            });

            // Post Checkout Verification check
            const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                gateway: 'cashfree',
                cfOrderId: cfOrder.order_id,
                paymentSessionId: cfOrder.payment_session_id
              })
            });

            if (!verifyRes.ok) throw new Error('Cashfree verification failed');
            completeOrderLocally(orderId, 'Order Placed', subtotal, deliveryFee, total);
          } catch (err) {
            console.error('Cashfree checkout modal error:', err);
            const tryFallback = confirm('Cashfree Checkout Failed. Would you like to try Razorpay instead?');
            if (tryFallback) {
              await executeOnlinePayment(orderId, subtotal, deliveryFee, total, 'razorpay');
            }
          }
        }
      }
    } catch (error) {
      console.error('executeOnlinePayment failed:', error);
      alert('Online payment failure: ' + error.message);
    }
  };

  // Proceed to Checkout / Order Placement using backend APIs
  const handleCheckout = async (selectedPaymentMethod = 'online') => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 0; // Free delivery period promo
    const total = subtotal + deliveryFee;
    const primaryAddress = addresses.find(a => a.isPrimary)?.address || '123, Green Street, Pune, Maharashtra - 411001';

    try {
      // 1. Save Checkout details & Create MongoDB Pending Order
      const checkoutRes = await fetch(`${API_BASE_URL}/api/checkout/payment-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart.map(item => ({
            productId: item.id || item.productId,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            shopId: item.shopId || null
          })),
          address: primaryAddress,
          paymentMethod: selectedPaymentMethod,
          customerId: user?.id || user?._id || 'CUST789'
        })
      });

      if (!checkoutRes.ok) {
        const errData = await checkoutRes.json();
        throw new Error(errData.message || 'Failed to initialize checkout');
      }

      const { orderId } = await checkoutRes.json();

      // 2. Handle payment/verification based on method
      if (selectedPaymentMethod === 'cod') {
        const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            paymentMethod: 'cod'
          })
        });

        if (!verifyRes.ok) {
          throw new Error('Failed to confirm COD order');
        }

        completeOrderLocally(orderId, 'Order Placed', subtotal, deliveryFee, total);
      } else {
        // Unified Online Payment Router (starts with Razorpay)
        await executeOnlinePayment(orderId, subtotal, deliveryFee, total, 'razorpay');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout error: ' + error.message);
    }
  };

  // Profile Edit submits
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
    window.dispatchEvent(new Event('storage'));
  };

  // Saved shops wishlist handlers
  const handleRemoveSavedShop = (shopId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedIds = savedShopIds.filter((id) => id !== shopId);
    setSavedShopIds(updatedIds);
    localStorage.setItem('savedShops', JSON.stringify(updatedIds));
  };

  // Unified Address handlers
  const handlePincodeLookup = async (pinVal) => {
    const pin = pinVal.trim();
    if (!/^\d{6}$/.test(pin)) {
      return;
    }

    setLoadingPincode(true);
    setPincodeError('');
    setResolvedAreas([]);

    // Local fallback database
    const localPincodes = {
      '411001': { city: 'Pune', state: 'Maharashtra', areas: ['Camp', 'Pune G.P.O.'] },
      '411057': { city: 'Pune', state: 'Maharashtra', areas: ['Hinjewadi Phase 1', 'Hinjewadi Phase 2', 'Wakad'] },
      '411038': { city: 'Pune', state: 'Maharashtra', areas: ['Kothrud', 'Karve Nagar'] },
      '411004': { city: 'Pune', state: 'Maharashtra', areas: ['Shivaji Nagar', 'F.C. Road', 'Model Colony'] },
      '802301': { city: 'Ara', state: 'Bihar', areas: ['Ara Chowk', 'Bhojpur', 'Town Thana'] },
      '802302': { city: 'Ara', state: 'Bihar', areas: ['Gyan Vihar', 'Maula Bagh', 'Pakri'] },
      '110001': { city: 'New Delhi', state: 'Delhi', areas: ['Connaught Place', 'Parliament House'] },
      '400001': { city: 'Mumbai', state: 'Maharashtra', areas: ['Fort', 'Colaba'] }
    };

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      if (res.ok) {
        const data = await res.json();
        if (data[0] && data[0].Status === 'Success') {
          const postOffices = data[0].PostOffice;
          const city = postOffices[0].District || postOffices[0].Division;
          const state = postOffices[0].State;
          const areas = postOffices.map(po => po.Name);
          
          setAddrCity(city);
          setAddrState(state);
          setResolvedAreas(areas);
          if (areas.length > 0) setAddrArea(areas[0]);
          setLoadingPincode(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API error, using local fallback', err);
    }

    // Try local fallback
    const localData = localPincodes[pin];
    if (localData) {
      setAddrCity(localData.city);
      setAddrState(localData.state);
      setResolvedAreas(localData.areas);
      setAddrArea(localData.areas[0]);
    } else {
      setPincodeError('Pincode not found. You can enter the city, state, and area manually.');
      setResolvedAreas([]);
    }
    setLoadingPincode(false);
  };

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAddrPincode(val);
    if (val.length === 6) {
      handlePincodeLookup(val);
    } else {
      setResolvedAreas([]);
    }
  };

  const handleAddAddressUnified = (e) => {
    e.preventDefault();
    if (!addrFlat.trim() || !addrArea.trim() || !addrCity.trim() || !addrState.trim()) return;
    
    const combinedAddr = `${addrFlat.trim()}, ${addrArea.trim()}, ${addrCity.trim()}, ${addrState.trim()}${addrPincode ? ` - ${addrPincode}` : ''}`;
    const newAddr = {
      id: `addr-${Date.now()}`,
      tag: addrTag,
      address: combinedAddr,
      isPrimary: addresses.length === 0
    };

    setAddresses([...addresses, newAddr]);
    
    // Clear inputs
    setAddrFlat('');
    setAddrPincode('');
    setAddrArea('');
    setAddrCity('');
    setAddrState('');
    setResolvedAreas([]);
    setPincodeError('');
  };

  const handleSetPrimaryAddress = (id) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isPrimary: a.id === id
    })));
  };

  const handleRemoveAddress = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  // Fetch current selected order details
  const selectedOrder = useMemo(() => {
    if (selectedOrderId) {
      return orders.find(o => o.id === selectedOrderId);
    }
    return null; // Return null if no order is selected to show history list correctly
  }, [orders, selectedOrderId]);

  // Saved Shops lookup
  const savedShops = useMemo(() => {
    return allShops.filter((shop) => savedShopIds.includes(shop.id));
  }, [allShops, savedShopIds]);

  // Categories helper list
  const categoryShortcuts = [
    { label: 'Fruits & Vegetables', emoji: '🍎', bgColor: 'bg-red-50 text-red-500 border-red-100', category: 'Fruits & Vegetables' },
    { label: 'Dairy & Bakery', emoji: '🥐', bgColor: 'bg-amber-50 text-amber-600 border-amber-100', category: 'Dairy & Bakery' },
    { label: 'Groceries', emoji: '🧂', bgColor: 'bg-green-50 text-green-600 border-green-100', category: 'Groceries' },
    { label: 'Beverages', emoji: '🥤', bgColor: 'bg-orange-50 text-orange-500 border-orange-100', category: 'Beverages' },
    { label: 'Personal Care', emoji: '🧴', bgColor: 'bg-indigo-50 text-indigo-500 border-indigo-100', category: 'Personal Care' },
    { label: 'Household', emoji: '🧼', bgColor: 'bg-sky-50 text-sky-500 border-sky-100', category: 'Household' }
  ];

  // Map categories
  const getNormalizedCategory = (cat) => {
    if (cat === 'Dairy & Daivery') return 'Dairy & Bakery';
    if (cat === 'Deliveries') return 'Groceries';
    return cat;
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    const normCategory = getNormalizedCategory(selectedCategory);
    if (normCategory !== 'All') {
      result = result.filter(p => p.category === normCategory);
    }

    // Search input
    const query = (searchValue || '').trim().toLowerCase();
    if (query) {
      result = result.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    }

    // Price bracket filter
    if (priceFilter === 'Under 50') {
      result = result.filter(p => p.price < 50);
    } else if (priceFilter === '50-100') {
      result = result.filter(p => p.price >= 50 && p.price <= 100);
    } else if (priceFilter === '100-200') {
      result = result.filter(p => p.price >= 100 && p.price <= 200);
    } else if (priceFilter === 'Above 200') {
      result = result.filter(p => p.price > 200);
    }

    // Sorting logic
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => (b.reviews * b.rating) - (a.reviews * a.rating));
    }

    return result;
  }, [selectedCategory, priceFilter, sortBy, searchValue]);

  // Paginated products
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset page when category/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceFilter, sortBy, searchValue]);

  // Sync search input
  useEffect(() => {
    if (searchValue.trim().length > 0 && activeTab !== 'categories') {
      setActiveTab('categories');
    }
  }, [searchValue, activeTab, setActiveTab]);

  // Reset cart checkout step when switching tabs
  useEffect(() => {
    setCartStep('cart');
  }, [activeTab]);


  // ==================== RENDERS ====================

  // 1. HOME VIEW (Image 4)
  const renderHomeView = () => {
    const storesList = [
      { id: 'store-1', name: 'Fresh Mart', rating: '4.5', time: '20-33 mins', imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80' },
      { id: 'store-2', name: 'Green Braket', rating: '4.3', time: '25-25 mins', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80' },
      { id: 'store-3', name: 'Daily Needs Store', rating: '4.1', time: '15-25 mins', imageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&auto=format&fit=crop&q=80' },
      { id: 'store-4', name: 'Super Store', rating: '4.1', time: '15-25 mins', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&auto=format&fit=crop&q=80' }
    ];

    return (
      <div className="space-y-8 pb-10">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-100/70 border border-blue-100 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-4 max-w-md z-10 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 tracking-tight leading-tight">
              Shop Local, <br className="hidden sm:inline" /><span className="text-blue-600">Support Local</span>
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Discover products from nearby shops and get foot delivery by your downtop.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setActiveTab('categories');
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all"
            >
              Shop Now
            </button>
          </div>

          <div className="w-56 h-40 relative flex-shrink-0">
            <img
              src="/scooter_delivery.png"
              alt="Scooter Delivery Rider"
              className="w-full h-full object-contain filter drop-shadow-md scale-110"
            />
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Categories</h3>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setActiveTab('categories');
              }}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categoryShortcuts.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedCategory(cat.category);
                  setActiveTab('categories');
                }}
                className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
              >
                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-3xl border mb-3 transition group-hover:scale-105 ${cat.bgColor}`}>
                  {cat.emoji}
                </div>
                <span className="text-xs font-extrabold text-gray-700 text-center tracking-tight leading-snug">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Stores Section */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Popular Stores Near You</h3>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setActiveTab('categories');
              }}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {storesList.map((store) => (
              <div
                key={store.id}
                onClick={() => {
                  setSelectedCategory('All');
                  setActiveTab('categories');
                }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-100 transition duration-200 cursor-pointer flex flex-col group"
              >
                <div className="h-32 bg-gray-100 relative overflow-hidden">
                  <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{store.name}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="flex items-center gap-0.5 text-xs text-yellow-500 font-bold">
                        ★ {store.rating}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">•</span>
                      <span className="text-xs text-gray-500 font-semibold">{store.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


  // 2. CATEGORY & PRODUCTS GRID VIEW (Image 3)
  const renderCategoriesView = () => {
    const listCategories = ['All', 'Fruits & Vegetables', 'Dairy & Daivery', 'Deliveries', 'Beverages', 'Personal Care', 'Household'];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-10">
        {/* Left Column: Categories List & Price Filters */}
        <div className="space-y-6 lg:col-span-1">
          {/* Categories Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Categories</h3>
            <div className="flex flex-col gap-1">
              {listCategories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-extrabold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Filters Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Filters</h3>
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Price</p>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'All', label: 'All Prices' },
                  { value: 'Under 50', label: 'Under ₹50' },
                  { value: '50-100', label: '₹50 - ₹100' },
                  { value: '100-200', label: '₹100 - ₹200' },
                  { value: 'Above 200', label: 'Above ₹200' }
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2.5 text-xs font-bold text-gray-700 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={priceFilter === opt.value}
                      onChange={() => setPriceFilter(opt.value)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400 border-gray-300"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Grid and Sorting */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCategory === 'All' ? 'All Products' : getNormalizedCategory(selectedCategory)}
            </h2>
            
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 self-end">
              <span className="text-xs font-bold text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-extrabold text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400"
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {paginatedProducts.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm font-semibold text-gray-400">
              No products found matching the criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {paginatedProducts.map((product) => {
                const cartItem = cart.find(item => item.id === product.id);
                return (
                  <motion.div
                    layout
                    key={product.id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="relative w-full h-36 bg-gray-50 rounded-xl overflow-hidden mb-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{product.name}</h4>
                      <p className="text-emerald-600 font-extrabold text-base mb-3">₹{product.price}</p>
                    </div>

                    {cartItem ? (
                      <div className="flex items-center justify-between border border-blue-500 rounded-xl overflow-hidden h-9">
                        <button
                          onClick={() => handleUpdateQuantity(product.id, -1)}
                          className="w-9 h-full flex items-center justify-center font-black text-blue-600 hover:bg-blue-50 transition"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs text-blue-700">{cartItem.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(product.id, 1)}
                          className="w-9 h-full flex items-center justify-center font-black text-blue-600 hover:bg-blue-50 transition"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 border border-blue-500 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all text-center"
                      >
                        Add to Cart
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };


  // 3. CART VIEW (Image 2)
  const renderCartView = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = cart.length > 0 ? 20 : 0;
    const totalAmount = subtotal; // Free delivery period promo

    if (cartStep === 'payment') {
      return (
        <PaymentMethodSelection
          subtotal={subtotal}
          deliveryFee={20} // Standard delivery fee (original) for display
          total={subtotal} // Promo total
          onProceed={(method) => {
            handleCheckout(method);
          }}
          onBack={() => setCartStep('cart')}
        />
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <button
          onClick={() => setActiveTab('categories')}
          className="flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:underline"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          Back to Shop
        </button>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            My Cart <span className="text-xs text-blue-600 font-extrabold">({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
          </h2>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white border border-gray-150 rounded-2xl p-12 text-center shadow-sm">
            <FiShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-500 mb-4">Your cart is empty</p>
            <button
              onClick={() => setActiveTab('categories')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-50 flex-shrink-0 border border-gray-100"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 font-extrabold mt-0.5">₹{item.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-9 bg-gray-50">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-8 h-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-3 font-bold text-xs text-gray-700">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-8 h-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-black text-gray-800 w-16 text-right">
                      {item.quantity > 1 && <span className="text-[10px] text-gray-400 font-bold block">({item.quantity}x)</span>}
                      ₹{item.price * item.quantity}
                    </span>

                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Bill Details</h3>
              <div className="space-y-2.5 border-b border-gray-100 pb-3.5">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-600 flex items-center gap-1 font-extrabold animate-pulse">
                    <span className="line-through text-gray-400 font-normal">₹20</span>
                    Free
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
                <span>Total Amount</span>
                <span className="text-blue-600 font-black">₹{subtotal}</span>
              </div>

              <button
                onClick={() => router.push('/select-payment')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };


  // 4. ORDER STATUS & TRACKING VIEW (Image 1)
  const renderOrderStatusView = () => {
    if (!selectedOrder) {
      return (
        <div className="max-w-2xl mx-auto space-y-6 pb-10">
          <h2 className="text-xl font-bold text-gray-900">My Orders History</h2>
          {orders.length === 0 ? (
            <div className="bg-white border border-gray-150 rounded-2xl p-12 text-center shadow-sm">
              <FiShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-500">You have no orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:border-blue-300 transition duration-200 cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Order #{ord.id}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{ord.date}</p>
                    <p className="text-xs text-gray-600 font-bold mt-1.5">
                      {ord.items.length} items • Total: <span className="text-emerald-600">₹{ord.total}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      ord.status === 'Delivered'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {ord.status}
                    </span>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const getTimelineState = (status) => {
      const steps = ['Order Placed', 'Order Confirmed', 'Out for Delivery', 'Delivered'];
      const curIndex = steps.indexOf(status);
      return steps.map((step, idx) => ({
        label: step,
        done: idx <= curIndex,
        time: idx <= curIndex ? (idx === curIndex ? selectedOrder.date : '12 May 2024, 10:35 AM') : null,
        expected: idx === 3 && curIndex < 3 ? 'Expected by today' : null
      }));
    };

    const timeline = getTimelineState(selectedOrder.status);

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        <button
          onClick={() => setSelectedOrderId(null)}
          className="flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:underline"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          Back to Orders
        </button>

        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order #{selectedOrder.id}</h2>
          <p className="text-xs text-gray-500 font-bold mt-1">Placed on {selectedOrder.date}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="relative pl-8 space-y-8">
            <div className="absolute top-2.5 left-3 w-[2px] h-[calc(100%-25px)] bg-gray-100">
              <div
                className="w-full bg-emerald-600 transition-all duration-500"
                style={{
                  height: selectedOrder.status === 'Order Placed' ? '0%' :
                          selectedOrder.status === 'Order Confirmed' ? '33%' :
                          selectedOrder.status === 'Out for Delivery' ? '66%' : '100%'
                }}
              />
            </div>

            {timeline.map((step, idx) => (
              <div key={idx} className="relative flex gap-4 items-start">
                <div className="absolute -left-[27px] z-10">
                  {step.done ? (
                    <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-sm">
                      <FiCheck className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-white border-2 border-blue-600 rounded-full" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className={`text-sm font-extrabold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    {step.done ? step.time : step.expected || `Expected by ${selectedOrder.date}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Delivery Agent</h3>
            <div className="flex items-center gap-4">
              <img
                src={selectedOrder.deliveryAgent.imageUrl}
                alt="Delivery Agent Profile"
                className="w-14 h-14 rounded-full object-cover border border-gray-150 shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-gray-900">{selectedOrder.deliveryAgent.name}</h4>
                <p className="text-xs text-gray-500 font-extrabold mt-0.5">{selectedOrder.deliveryAgent.phone}</p>
              </div>
              <a
                href={`tel:${selectedOrder.deliveryAgent.phone}`}
                className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-blue-600 font-extrabold text-xs rounded-xl shadow-sm transition"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                Order Items ({selectedOrder.items.length})
              </h3>
              <button
                onClick={() => setExpandedOrderDetails(!expandedOrderDetails)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
              >
                {expandedOrderDetails ? 'Hide Details' : 'View Details'}
                <FiChevronRight className={`w-3.5 h-3.5 transform transition-transform ${expandedOrderDetails ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {expandedOrderDetails ? (
              <div className="space-y-2 border-b border-gray-100 pb-2 mb-2 max-h-40 overflow-y-auto pr-1">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>{it.name} <span className="text-gray-400 font-medium">(x{it.quantity})</span></span>
                    <span>₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-bold mb-3 truncate">
                {selectedOrder.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}
              </p>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="text-xs font-bold text-gray-500">Total Charged</span>
              <span className="text-sm font-black text-emerald-600">₹{selectedOrder.total}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 5. WISHLIST VIEW (Saved Shops)
  const renderWishlistView = () => {
    return (
      <div className="space-y-6 pb-10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FiHeart className="text-red-500 fill-red-500 animate-pulse" />
          My Saved Shops
        </h2>

        {savedShops.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl p-6 bg-white shadow-sm">
            <p className="text-sm font-bold text-gray-500 mb-3">You haven't saved any shops yet!</p>
            <p className="text-xs text-gray-400 mb-5">Click the heart icon on any store to save it here for quick access.</p>
            <button
              onClick={() => setActiveTab('home')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
            >
              Discover Shops
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {savedShops.map((shop) => (
              <div
                key={shop.id}
                className="group relative rounded-2xl overflow-hidden border border-gray-100 p-4 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={shop.imageUrl || shop.thumbnail || shop.image || 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=200'}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-sm text-gray-900 hover:text-blue-600 transition-colors">
                      {shop.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{shop.category}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center text-yellow-400 text-xs font-bold gap-0.5">
                        ★ {shop.rating || 'New'}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5 truncate">
                        <FiMapPin className="flex-shrink-0" />
                        {shop.address || 'Pune'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemoveSavedShop(shop.id, e)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition shadow-sm"
                  title="Remove"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 6. SUPPORT VIEW (Inquiries)
  const renderSupportView = () => {
    return (
      <div className="space-y-6 pb-10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FiMessageSquare className="text-blue-500" />
          Recent Inquiries & Requests
        </h2>

        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-sm text-blue-900">{inq.shopName}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Sent on {inq.date}</p>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    inq.status === 'Replied'
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}
                >
                  {inq.status}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-800">{inq.subject}</p>
              <p className="text-xs leading-relaxed text-gray-500 italic">"{inq.message}"</p>
              {inq.reply && (
                <div className="p-4 rounded-xl border border-green-150 bg-green-50/50 text-xs leading-relaxed text-green-800">
                  <p className="font-extrabold mb-1">Reply from Shopowner:</p>
                  "{inq.reply}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 7. SETTINGS VIEW — rendered by dedicated ProfileSettingsView component
  const renderSettingsView = () => {
    return <ProfileSettingsView setActiveTab={setActiveTab} />;
  };

  // 8. ADDRESSES VIEW
  const renderAddressesView = () => {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FiMapPin className="text-blue-600" />
          My Delivery Addresses
        </h2>

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border bg-white shadow-sm flex justify-between items-start gap-4 transition duration-200 ${
                addr.isPrimary ? 'border-blue-500 shadow-blue-500/5' : 'border-gray-100'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg text-gray-700">
                    {addr.tag}
                  </span>
                  {addr.isPrimary && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Primary Address
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-gray-700 leading-relaxed">{addr.address}</p>
              </div>

              <div className="flex items-center gap-2">
                {!addr.isPrimary && (
                  <button
                    onClick={() => handleSetPrimaryAddress(addr.id)}
                    className="text-[10px] font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  onClick={() => handleRemoveAddress(addr.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition border border-transparent hover:border-red-100"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Address Form */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Add New Address</h3>
          </div>

          <form onSubmit={handleAddAddressUnified} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* House/Flat details */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide">House/Flat No, Building, Street Details</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302, Royal Residency, M.G. Road"
                  required
                  value={addrFlat}
                  onChange={(e) => setAddrFlat(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-blue-400 font-medium text-gray-800"
                />
              </div>

              {/* Tag Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Address Tag</label>
                <select
                  value={addrTag}
                  onChange={(e) => setAddrTag(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-blue-400 font-bold text-gray-700"
                >
                  <option value="Home 🏠">Home 🏠</option>
                  <option value="Office 💼">Office 💼</option>
                  <option value="Other 📍">Other 📍</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Pincode Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide flex items-center justify-between">
                  Pincode
                  {loadingPincode && <span className="text-[9px] text-blue-600 animate-pulse font-bold">Verifying...</span>}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit Pincode"
                  value={addrPincode}
                  onChange={handlePincodeChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-blue-400 font-bold text-gray-800"
                />
              </div>

              {/* Area / Locality */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Area / Locality</label>
                {resolvedAreas.length > 0 ? (
                  <select
                    value={addrArea}
                    onChange={(e) => setAddrArea(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400 font-bold text-gray-700"
                  >
                    {resolvedAreas.map((area, idx) => (
                      <option key={idx} value={area}>{area}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Area or Locality"
                    required
                    value={addrArea}
                    onChange={(e) => setAddrArea(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-blue-400 font-medium text-gray-800"
                  />
                )}
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide">City</label>
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-blue-400 font-medium text-gray-800"
                />
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide">State</label>
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-blue-400 font-medium text-gray-800"
                />
              </div>
            </div>

            {pincodeError && (
              <p className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 p-2.5 rounded-lg">{pincodeError}</p>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Add Delivery Address
            </button>
          </form>
        </div>
      </div>
    );
  };


  // Main view switcher
  switch (activeTab) {
    case 'categories':
    case 'stores':
    case 'offers':
      return renderCategoriesView();
    case 'cart':
      return renderCartView();
    case 'orders':
    case 'order-status':
      return renderOrderStatusView();
    case 'wishlist':
      return renderWishlistView();
    case 'support':
      return renderSupportView();
    case 'settings':
      return renderSettingsView();
    case 'addresses':
      return renderAddressesView();
    case 'home':
    default:
      return renderHomeView();
  }
}
