import React from 'react';

/**
 * StatusBadge Component
 * Displays a clean, semantic status pill with dynamic mapping.
 * 
 * @param {Object} props
 * @param {string} props.status - The current status of the order/delivery
 * @param {string} [props.className] - Extra class names for styling overrides
 */
export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;

  const normalized = status.trim().toLowerCase();

  // Color mapping matching reference image
  let colors = 'bg-gray-100 text-gray-700 border-gray-200'; // Default fallback

  if (normalized === 'delivered' || normalized === 'confirmed') {
    colors = 'bg-green-100/80 text-green-700 border-green-200/50';
  } else if (normalized === 'preparing') {
    colors = 'bg-purple-100/80 text-purple-700 border-purple-200/50';
  } else if (normalized === 'pending') {
    colors = 'bg-amber-100/80 text-amber-700 border-amber-200/50';
  } else if (normalized === 'out for delivery') {
    colors = 'bg-blue-100/80 text-blue-700 border-blue-200/50';
  } else if (normalized === 'picked up') {
    colors = 'bg-indigo-100/80 text-indigo-700 border-indigo-200/50';
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full border transition-all duration-200 ${colors} ${className}`}
    >
      {status}
    </span>
  );
}
