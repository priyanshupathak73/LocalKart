/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f0a1a',
        'dark-secondary': '#1a1530',
        'accent-purple': '#a78bfa',
        'accent-blue': '#60a5fa',
        'accent-indigo': '#4f46e5',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f0a1a 0%, #1a1530 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
