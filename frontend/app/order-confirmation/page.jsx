'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiMapPin, FiCalendar, FiArrowRight } from 'react-icons/fi';

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [mounted, setMounted] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    setMounted(true);
    const storedOrders = localStorage.getItem('local_orders');
    if (storedOrders && orderId) {
      try {
        const orders = JSON.parse(storedOrders);
        const match = orders.find(o => o.id === orderId);
        if (match) {
          setOrderDetails(match);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [orderId]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden animate-fade-in p-8 text-center space-y-6">
        
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900 animate-pulse">
            <FiCheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
        </div>

        {/* Text Headers */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Order Confirmed!</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
            Thank you for supporting your local merchants.
          </p>
        </div>

        {/* Details Wrapper */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 text-left space-y-3.5">
          <div className="flex justify-between items-center text-xs border-b border-gray-200/50 dark:border-slate-800 pb-2.5">
            <span className="text-gray-400 font-bold">Order ID</span>
            <span className="text-gray-800 dark:text-gray-200 font-extrabold font-mono text-[11px]">
              {orderId || 'N/A'}
            </span>
          </div>

          {orderDetails && (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-bold">Total Paid</span>
                <span className="text-blue-600 dark:text-blue-400 font-black">₹{orderDetails.total}</span>
              </div>

              <div className="flex gap-2 text-xs">
                <FiMapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5 text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Delivery Address</span>
                  {orderDetails.address || '123, Green Street, Pune, Maharashtra'}
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                <FiCalendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5 text-gray-600 dark:text-gray-300 font-semibold">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Expected Delivery</span>
                  Rohit Sharma (Delivery Partner) • Within 45 minutes
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => router.push('/customer-dashboard?tab=orders')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl transition duration-150 flex items-center justify-center gap-2"
          >
            Track My Order
            <FiArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push('/customer-dashboard')}
            className="w-full py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition duration-150"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-55 text-gray-400 font-bold text-xs">Loading order confirmation...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
