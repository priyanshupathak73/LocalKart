import Navbar from '@/components/Navbar';
import DiscoveryHeroSection from '@/components/DiscoveryHeroSection';
import DirectoryPreviewSection from '@/components/DirectoryPreviewSection';
import AboutSection from '@/components/AboutSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import LocationSection from '@/components/LocationSection';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Providers } from './providers';

export default function Home() {
  return (
    <Providers>
      <main className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-white overflow-x-hidden">
        <Navbar />
        <DiscoveryHeroSection />
        <DirectoryPreviewSection />
        <AboutSection />
        <TestimonialsSection />
        <LocationSection />
        <ContactForm />
        <Footer />
        <WhatsAppButton />
      </main>
    </Providers>
  );
}
