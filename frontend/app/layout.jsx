import '@/styles/globals.css';

export const metadata = {
  title: 'LocalKart – Hyperlocal Same-Hour Delivery in Ara, Bihar',
  description: 'Order from local shops in Ara, Bihar and get delivered in under an hour. Free delivery now!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          .scrollbar-none::-webkit-scrollbar { display: none; }
          .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </head>
      <body className="bg-white dark:bg-dark-bg text-gray-900 dark:text-white transition-colors">
        {children}
      </body>
    </html>
  );
}
