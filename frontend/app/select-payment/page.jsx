'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PaymentMethodSelection from '@/components/dashboard/PaymentMethodSelection';
import API_BASE_URL from '@/utils/api';
import { FiShoppingBag } from 'react-icons/fi';

export default function SelectPaymentPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState('');

  // Load SDK scripts and parse localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    // Load Razorpay Checkout SDK script dynamically
    const rzpId = 'razorpay-sdk-script';
    if (!document.getElementById(rzpId)) {
      const script = document.createElement('script');
      script.id = rzpId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Load Cashfree Web SDK script dynamically
    const cfId = 'cashfree-sdk-script';
    if (!document.getElementById(cfId)) {
      const script = document.createElement('script');
      script.id = cfId;
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Read details
    const storedCart = localStorage.getItem('local_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error(e);
      }
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
    const storedAddrs = localStorage.getItem('local_addresses');
    if (storedAddrs) {
      try {
        const addrs = JSON.parse(storedAddrs);
        const primary = addrs.find(a => a.isPrimary)?.address;
        setAddress(primary || '123, Green Street, Pune, Maharashtra - 411001');
      } catch (e) {
        console.error(e);
      }
    } else {
      setAddress('123, Green Street, Pune, Maharashtra - 411001');
    }
  }, []);

  if (!mounted) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 20; // Original fee for display
  const total = subtotal; // Free delivery period promo total

  const completeOrderLocally = (orderId) => {
    // Clear cart in localStorage
    localStorage.setItem('local_cart', JSON.stringify([]));
    window.dispatchEvent(new Event('local_cart_updated'));

    // Save order in history list
    const storedOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
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
      status: 'Placed',
      items: [...cart],
      subtotal,
      deliveryFee: 0,
      total,
      address,
      deliveryAgent: {
        name: 'Rohit Sharma',
        phone: '9870653210',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      }
    };
    localStorage.setItem('local_orders', JSON.stringify([newOrder, ...storedOrders]));

    // Redirect to Order Confirmation
    router.push(`/order-confirmation?orderId=${orderId}`);
  };

  const executeOnlinePayment = async (orderId, gatewayPreference = 'razorpay') => {
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
          // Mock Razorpay
          const opt = confirm(`[Mock Razorpay] Simulating checkout for Order: ${rzpOrder.id}.\nAmount: ₹${(rzpOrder.amount / 100).toFixed(2)}\n\nClick OK to confirm payment, or CANCEL to trigger fallback to Cashfree.`);
          
          if (!opt) {
            await executeOnlinePayment(orderId, 'cashfree');
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
          completeOrderLocally(orderId);
        } else {
          // Real Razorpay
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

                if (!verifyRes.ok) throw new Error('Payment verification failed');
                completeOrderLocally(orderId);
              } catch (err) {
                alert('Verification error: ' + err.message);
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
            const tryFallback = confirm(`Razorpay Payment Failed: ${resp.error.description}.\nWould you like to try Cashfree instead?`);
            if (tryFallback) {
              await executeOnlinePayment(orderId, 'cashfree');
            }
          });
          rzp.open();
        }
      } else if (orderData.gateway === 'cashfree') {
        const cfOrder = orderData.cashfreeOrderDetails;

        if (orderData.isMock || !window.Cashfree) {
          // Mock Cashfree
          const opt = confirm(`[Mock Cashfree] Simulating checkout for Order: ${cfOrder.order_id}.\nAmount: ₹${cfOrder.order_amount}\n\nClick OK to confirm payment, or CANCEL to trigger fallback to Razorpay.`);
          
          if (!opt) {
            await executeOnlinePayment(orderId, 'razorpay');
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
          completeOrderLocally(orderId);
        } else {
          // Real Cashfree
          try {
            const cashfree = new window.Cashfree({ mode: 'sandbox' });
            await cashfree.checkout({
              paymentSessionId: cfOrder.payment_session_id,
              redirectTarget: '_self'
            });

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
            completeOrderLocally(orderId);
          } catch (err) {
            const tryFallback = confirm('Cashfree Checkout Failed. Would you like to try Razorpay instead?');
            if (tryFallback) {
              await executeOnlinePayment(orderId, 'razorpay');
            }
          }
        }
      }
    } catch (error) {
      alert('Payment initialization error: ' + error.message);
    }
  };

  const handleProceedToPay = async (method) => {
    if (cart.length === 0) return;

    try {
      // 1. Create Order via Backend API
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
          address: address,
          paymentMethod: method,
          customerId: user?.id || user?._id || 'CUST789'
        })
      });

      if (!checkoutRes.ok) {
        const errData = await checkoutRes.json();
        throw new Error(errData.message || 'Failed to create order');
      }

      const { orderId } = await checkoutRes.json();

      // 2. COD vs Online verification
      if (method === 'cod') {
        const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            paymentMethod: 'cod'
          })
        });

        if (!verifyRes.ok) throw new Error('Failed to verify COD order');
        completeOrderLocally(orderId);
      } else {
        await executeOnlinePayment(orderId, 'razorpay');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 flex flex-col justify-center items-center">
      {cart.length === 0 ? (
        <div className="max-w-md bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 p-8 text-center shadow-lg">
          <FiShoppingBag className="w-12 h-12 mx-auto text-blue-500 mb-4 animate-bounce" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Active Cart Found</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Your shopping cart is currently empty or session has expired.</p>
          <button
            onClick={() => router.push('/customer-dashboard')}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20"
          >
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="w-full max-w-lg">
          <PaymentMethodSelection
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            onProceed={handleProceedToPay}
            onBack={() => router.push('/customer-dashboard?tab=cart')}
          />
        </div>
      )}
    </div>
  );
}
