import React, { useState } from 'react';
import { FiArrowLeft, FiCreditCard, FiDollarSign, FiZap } from 'react-icons/fi';

/**
 * PaymentMethodSelection Component
 * Renders a mobile-friendly payment method selection screen for the checkout flow.
 * 
 * @param {Object} props
 * @param {number} props.subtotal - Cart subtotal amount
 * @param {number} props.deliveryFee - Standard delivery fee
 * @param {number} props.total - Final order total
 * @param {Function} props.onProceed - Callback when "Proceed to Pay" is clicked (passes selectedMethod)
 * @param {Function} props.onBack - Callback to return to the Cart view
 */
export default function PaymentMethodSelection({
  subtotal = 0,
  deliveryFee = 20,
  total = 0,
  onProceed = () => {},
  onBack = () => {},
}) {
  const [selectedMethod, setSelectedMethod] = useState('online'); // 'online' | 'cod' | 'upi_auto'

  const methods = [
    {
      id: 'online',
      title: 'Online Payment',
      badge: 'Recommended',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      description: 'Pay with UPI, Card, Wallet',
      subtext: 'Powered by Razorpay • Secure & Instant',
      icon: <FiCreditCard className="w-5 h-5" />,
      logos: ['UPI', 'Visa', 'Mastercard', 'GPay', 'PhonePe'],
    },
    {
      id: 'upi_auto',
      title: 'UPI Auto Pay',
      badge: 'Fastest',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      description: 'Pay via UPI',
      subtext: 'Instant payment using UPI ID • Powered by Razorpay',
      icon: <FiZap className="w-5 h-5" />,
    },
    {
      id: 'cod',
      title: 'Cash on Delivery',
      description: 'Cash on Delivery',
      subtext: 'Pay when order is delivered',
      icon: <FiDollarSign className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-white">
        <button
          onClick={onBack}
          type="button"
          className="p-1.5 rounded-xl hover:bg-gray-50 text-gray-500 transition duration-150"
          aria-label="Back to Cart"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Select Payment Method</h2>
      </div>

      <div className="p-6 space-y-5">
        {/* Payment Options */}
        <div className="space-y-4">
          {methods.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/30 shadow-md shadow-blue-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white hover:shadow-sm'
                }`}
              >
                {/* Custom radio button */}
                <div className="mt-0.5 flex-shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-gray-900">{method.title}</span>
                    {method.badge && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${method.badgeColor}`}>
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 font-semibold mt-1">
                    {method.description}
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    {method.subtext}
                  </p>

                  {/* Payment partner badges */}
                  {method.logos && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {method.logos.map((logo, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-black px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded text-gray-400 uppercase tracking-tight select-none"
                        >
                          {logo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Icon wrapper */}
                <div className={`flex-shrink-0 p-2 rounded-xl transition-colors ${
                  isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400'
                }`}>
                  {method.icon}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bill Summary */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Bill Summary</h3>
          <div className="flex justify-between text-xs font-bold text-gray-600">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-600">
            <span>Delivery Fee</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="line-through text-gray-400 font-normal">₹{deliveryFee}</span>
              Free
            </span>
          </div>
          <div className="flex justify-between text-sm font-black text-gray-900 pt-2.5 border-t border-gray-200">
            <span>Total Amount</span>
            <span className="text-blue-600">₹{total}</span>
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={() => onProceed(selectedMethod)}
          type="button"
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2"
        >
          Proceed to Pay ₹{total}
        </button>
      </div>
    </div>
  );
}
