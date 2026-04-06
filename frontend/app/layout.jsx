import '@/styles/globals.css';

export const metadata = {
  title: 'Divine Bakery - Premium Baked Goods',
  description: 'Fresh, handcrafted baked goods in Mathura, U.P.',
  keywords: 'bakery, cakes, pastries, Mathura',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-dark-bg text-gray-900 dark:text-white transition-colors">
        {children}
      </body>
    </html>
  );
}
