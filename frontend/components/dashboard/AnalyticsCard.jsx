import React from 'react';

/**
 * AnalyticsCard Component
 * Displays a clean stat metric card with optional trend badge.
 * 
 * @param {Object} props
 * @param {string} props.title - Metric title (e.g. "Total Orders")
 * @param {string|number} props.value - Main numeric value (e.g. "128")
 * @param {Object} [props.trend] - Trend data (e.g. { value: "18%", positive: true })
 * @param {string} [props.themeColor] - Accent theme ('blue' | 'emerald' | 'indigo')
 */
export default function AnalyticsCard({ title, value, trend, themeColor = 'blue' }) {
  // Theme color styling mapper
  const themeClasses = {
    blue: 'border-blue-100 hover:border-blue-300',
    emerald: 'border-emerald-100 hover:border-emerald-300',
    indigo: 'border-indigo-100 hover:border-indigo-300',
  };

  const trendPositive = trend?.positive ?? true;

  return (
    <div className={`p-5 bg-white rounded-2xl border ${themeClasses[themeColor] || themeClasses.blue} shadow-sm transition-all duration-300 hover:shadow-md`}>
      <p className="text-sm font-semibold text-gray-500 tracking-tight">{title}</p>
      
      <div className="flex items-baseline justify-between mt-2">
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
        
        {trend && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
              trendPositive
                ? 'bg-green-50 text-green-700 border border-green-200/50'
                : 'bg-red-50 text-red-700 border border-red-200/50'
            }`}
          >
            {trendPositive ? (
              // Up arrow SVG
              <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            ) : (
              // Down arrow SVG
              <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
              </svg>
            )}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
