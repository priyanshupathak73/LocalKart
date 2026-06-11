import LocalKartHome from '@/components/LocalKartHome';
import { Providers } from './providers';

export const metadata = {
  title: 'LocalKart – Same-Hour Delivery from Local Shops in Ara, Bihar',
  description: 'Order groceries, bakery, medicines and more from shops near you in Ara, Bihar. Free delivery, same-hour delivery, support local businesses.',
  keywords: 'local delivery, grocery delivery, Ara Bihar, hyperlocal marketplace, same-hour delivery, LocalKart',
  openGraph: {
    title: 'LocalKart – Same-Hour Delivery in Ara, Bihar',
    description: 'Get groceries, bakery & more delivered in under an hour from local shops near you.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <Providers>
      <LocalKartHome />
    </Providers>
  );
}
