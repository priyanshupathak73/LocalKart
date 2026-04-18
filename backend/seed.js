/**
 * Database Seed Script
 * Populates MongoDB with business data.
 *
 * Usage:  node seed.js
 */

require('dotenv').config();
const mongoose  = require('mongoose');
const connectDB = require('./config/db');
const Business  = require('./models/Business');

const buildDynamicCategoryImage = (category = 'business', businessId = '', width = 600, height = 400) => {
  const safeCategory = encodeURIComponent(String(category || 'business').toLowerCase());
  const safeId = encodeURIComponent(String(businessId || 'biz'));
  return `https://source.unsplash.com/${width}x${height}/?${safeCategory}&sig=${safeId}`;
};

const ensureUniqueSeedImages = (businesses = []) => {
  const seen = new Set();

  return businesses.map((business) => {
    let image = typeof business.image === 'string' ? business.image.trim() : '';

    if (!image) {
      image = buildDynamicCategoryImage(business.category, business.id);
    }

    if (seen.has(image)) {
      image = buildDynamicCategoryImage(business.category, business.id);
    }

    seen.add(image);

    return {
      ...business,
      image,
    };
  });
};

// ── Seed Data ────────────────────────────────────────────────
// Every image is now a working Unsplash URL — no more broken /images/*.png paths

const seedData = [
  // ============ BAKERIES ============
  {
    id: 'bakery-001',
    name: 'Divine Bakery',
    category: 'Bakery',
    categoryIcon: '🎂',
    phone: '+91 9876543210',
    email: 'hello@divinebakery.com',
    whatsapp: '919876543210',
    address: 'Gyan Vihar Colony, Ara, Bihar 801101',
    coordinates: { lat: 25.5941, lng: 84.1633 },
    openingHours: { weekdays: '7:00 AM - 10:00 PM', weekends: '8:00 AM - 11:00 PM' },
    tagline: 'Freshly Baked Happiness',
    description: 'Premium handcrafted cakes and pastries made with love and quality ingredients.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
    rating: 4.8,
    reviews: 156,
    services: [
      { name: 'Custom Cakes',     icon: '🎂', description: 'Personalized cakes for weddings, birthdays, and special occasions.' },
      { name: 'Fresh Pastries',   icon: '🥐', description: 'Buttery, flaky pastries baked fresh daily.' },
      { name: 'Artisan Bread',    icon: '🍞', description: 'Sourdough and multigrain bread made with traditional methods.' },
      { name: 'Wedding Catering', icon: '💒', description: 'Complete dessert solutions for your dream wedding.' },
    ],
    testimonials: [
      { name: 'Ananya Sharma', role: 'Wedding Organizer', rating: 5, text: 'Amazing cakes!' },
      { name: 'Ravi Patel',    role: 'Regular Customer',  rating: 5, text: 'Perfect quality!' },
    ],
  },
  {
    id: 'bakery-002',
    name: 'Sweet Dreams Bakery',
    category: 'Bakery',
    categoryIcon: '🎂',
    phone: '+91 9123456789',
    email: 'contact@sweetdreams.com',
    whatsapp: '919123456789',
    address: 'Mahla Road, Ara, Bihar 801101',
    coordinates: { lat: 25.5850, lng: 84.1700 },
    openingHours: { weekdays: '6:00 AM - 9:00 PM', weekends: '7:00 AM - 10:00 PM' },
    tagline: 'Where Taste Meets Quality',
    description: 'Traditional bakery with modern recipes. Specializing in donuts, cakes, and cookies.',
    image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600',
    rating: 4.6,
    reviews: 98,
    services: [
      { name: 'Fresh Donuts',    icon: '🍩', description: 'Glazed, chocolate, and filled donuts.' },
      { name: 'Cookies',         icon: '🍪', description: 'Homemade cookies with premium ingredients.' },
      { name: 'Bread Delivery',  icon: '🚚', description: 'Free delivery for daily bread orders.' },
    ],
    testimonials: [
      { name: 'Priya Verma', role: 'Business Owner', rating: 5, text: 'Best donuts in town!' },
    ],
  },

  // ============ MEDICAL ============
  {
    id: 'medical-001',
    name: 'Care Plus Medical Center',
    category: 'Medical',
    categoryIcon: '⚕️',
    phone: '+91 9988776655',
    email: 'care@careplus.com',
    whatsapp: '919988776655',
    address: 'Main Road, Ara, Bihar 801101',
    coordinates: { lat: 25.5950, lng: 84.1550 },
    openingHours: { weekdays: '8:00 AM - 9:00 PM', weekends: '9:00 AM - 8:00 PM' },
    tagline: 'Your Health, Our Priority',
    description: '24/7 Medical Center with experienced doctors and modern equipment.',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600',
    rating: 4.9,
    reviews: 234,
    services: [
      { name: 'General Consultation', icon: '👨‍⚕️', description: 'Consultation with experienced doctors.' },
      { name: 'Diagnostic Tests',     icon: '🔬', description: 'Blood tests, X-ray, and ultrasound services.' },
      { name: 'Pharmacy',             icon: '💊', description: 'On-site pharmacy with all medications.' },
      { name: 'Emergency Service',    icon: '🚑', description: '24/7 emergency medical care.' },
    ],
    testimonials: [
      { name: 'Rajesh Kumar', role: 'Patient', rating: 5, text: 'Excellent service!' },
      { name: 'Meera Singh',  role: 'Patient', rating: 5, text: 'Very professional staff' },
    ],
  },
  {
    id: 'medical-002',
    name: 'Wellness Clinic',
    category: 'Medical',
    categoryIcon: '⚕️',
    phone: '+91 9876543211',
    email: 'wellness@clinic.com',
    whatsapp: '919876543211',
    address: 'Hospital Road, Ara, Bihar 801101',
    coordinates: { lat: 25.5900, lng: 84.1650 },
    openingHours: { weekdays: '9:00 AM - 8:00 PM', weekends: '10:00 AM - 6:00 PM' },
    tagline: 'Holistic Health Solutions',
    description: 'Specialized clinic for wellness, ayurveda, and modern medicine.',
    image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600',
    rating: 4.7,
    reviews: 167,
    services: [
      { name: 'Ayurvedic Treatment', icon: '🌿', description: 'Traditional ayurvedic treatments.' },
      { name: 'Yoga Classes',        icon: '🧘', description: 'Daily yoga and meditation sessions.' },
      { name: 'Consultation',        icon: '📋', description: 'Health consultation and diet planning.' },
    ],
    testimonials: [
      { name: 'Arun Mishra', role: 'Patient', rating: 5, text: 'Life changing!' },
    ],
  },

  // ============ SALON ============
  {
    id: 'salon-001',
    name: 'Glamour Studio',
    category: 'Salon',
    categoryIcon: '💇‍♀️',
    phone: '+91 9765432109',
    email: 'glamour@studio.com',
    whatsapp: '919765432109',
    address: 'Fashion Lane, Ara, Bihar 801101',
    coordinates: { lat: 25.5920, lng: 84.1600 },
    openingHours: { weekdays: '10:00 AM - 8:00 PM', weekends: '9:00 AM - 9:00 PM' },
    tagline: 'Beauty Redefined',
    description: 'Premium beauty salon with certified professionals and latest trends.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
    rating: 4.8,
    reviews: 189,
    services: [
      { name: 'Hair Styling',    icon: '✂️', description: 'Cutting, coloring, and styling services.' },
      { name: 'Makeup',          icon: '💄', description: 'Professional makeup for all occasions.' },
      { name: 'Bridal Services', icon: '👰', description: 'Complete bridal makeup and styling.' },
      { name: 'Spa',             icon: '💆‍♀️', description: 'Relaxing spa treatments and massages.' },
    ],
    testimonials: [
      { name: 'Ritika Sharma', role: 'Bride', rating: 5, text: 'Perfect bridal makeup!' },
    ],
  },
  {
    id: 'salon-002',
    name: "Men's Grooming Hub",
    category: 'Salon',
    categoryIcon: '💇‍♂️',
    phone: '+91 9654321098',
    email: 'mens@grooming.com',
    whatsapp: '919654321098',
    address: 'Central Market, Ara, Bihar 801101',
    coordinates: { lat: 25.5880, lng: 84.1680 },
    openingHours: { weekdays: '9:00 AM - 9:00 PM', weekends: '9:00 AM - 9:00 PM' },
    tagline: "Premium Men's Grooming",
    description: 'Specialized grooming salon for men with expert barbers.',
    image: 'https://images.unsplash.com/photo-1585747860715-cd4628902d4a?w=600',
    rating: 4.7,
    reviews: 145,
    services: [
      { name: 'Haircut',        icon: '✂️',  description: 'Professional haircuts and trims.' },
      { name: 'Beard Grooming', icon: '🧔', description: 'Beard shaping and styling.' },
      { name: 'Massage',        icon: '💆‍♂️', description: 'Relaxing head and shoulder massage.' },
    ],
    testimonials: [
      { name: 'Deepak Singh', role: 'Regular', rating: 5, text: 'Best barber in town!' },
    ],
  },

  // ============ GROCERY ============
  {
    id: 'grocery-001',
    name: 'Fresh Market',
    category: 'Grocery',
    categoryIcon: '🛒',
    phone: '+91 9543210987',
    email: 'fresh@market.com',
    whatsapp: '919543210987',
    address: 'Market Street, Ara, Bihar 801101',
    coordinates: { lat: 25.5970, lng: 84.1570 },
    openingHours: { weekdays: '7:00 AM - 10:00 PM', weekends: '7:00 AM - 11:00 PM' },
    tagline: 'Fresh Produce Daily',
    description: 'Your one-stop shop for fresh groceries, vegetables, and daily essentials.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    rating: 4.6,
    reviews: 221,
    services: [
      { name: 'Fresh Vegetables',  icon: '🥬', description: 'Daily fresh vegetables and fruits.' },
      { name: 'Dairy Products',    icon: '🥛', description: 'Fresh milk, yogurt, and dairy items.' },
      { name: 'Grocery Delivery',  icon: '🚚', description: 'Free home delivery on orders above ₹500.' },
      { name: 'Organic Section',   icon: '🌿', description: 'Certified organic produce and products.' },
    ],
    testimonials: [
      { name: 'Neha Gupta',  role: 'Homemaker', rating: 5, text: 'Always fresh!' },
      { name: 'Vikram Roy',  role: 'Regular',   rating: 5, text: 'Great delivery service!' },
    ],
  },
  {
    id: 'grocery-002',
    name: 'Daily Essentials Store',
    category: 'Grocery',
    categoryIcon: '🛒',
    phone: '+91 9432109876',
    email: 'essentials@store.com',
    whatsapp: '919432109876',
    address: 'Shopping Complex, Ara, Bihar 801101',
    coordinates: { lat: 25.5860, lng: 84.1720 },
    openingHours: { weekdays: '8:00 AM - 9:00 PM', weekends: '8:00 AM - 10:00 PM' },
    tagline: 'Everything You Need',
    description: 'Convenient shopping for daily essentials with competitive prices.',
    image: 'https://images.unsplash.com/photo-1543168256-418811576931?w=600',
    rating: 4.5,
    reviews: 156,
    services: [
      { name: 'Pantry Items',     icon: '🥫', description: 'All types of grocery and pantry items.' },
      { name: 'Home Essentials',  icon: '🧹', description: 'Cleaning and household essentials.' },
      { name: 'Bulk Orders',     icon: '📦', description: 'Special rates for bulk and corporate orders.' },
    ],
    testimonials: [
      { name: 'Suresh Patel', role: 'Business Owner', rating: 5, text: 'Reliable supplier!' },
    ],
  },

  // ============ COACHING ============
  {
    id: 'coaching-001',
    name: 'Excel Academy',
    category: 'Coaching',
    categoryIcon: '📚',
    phone: '+91 9321098765',
    email: 'excel@academy.com',
    whatsapp: '919321098765',
    address: 'Education Hub, Ara, Bihar 801101',
    coordinates: { lat: 25.5930, lng: 84.1620 },
    openingHours: { weekdays: '3:00 PM - 8:00 PM', weekends: '9:00 AM - 5:00 PM' },
    tagline: 'Excellence in Education',
    description: 'Professional coaching center for competitive exams and academics.',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600',
    rating: 4.9,
    reviews: 198,
    services: [
      { name: 'JEE Coaching',    icon: '🧮', description: 'Complete JEE Main & Advanced preparation.' },
      { name: 'NEET Coaching',   icon: '🔬', description: 'Medical entrance exam preparation.' },
      { name: 'Board Exams',    icon: '📖', description: '10th & 12th board exam coaching.' },
      { name: 'Online Classes', icon: '💻', description: 'Live online classes and recorded sessions.' },
    ],
    testimonials: [
      { name: 'Akhil Verma', role: 'JEE Student',  rating: 5, text: 'Got AIR 156!' },
      { name: 'Divya Singh', role: 'NEET Student', rating: 5, text: 'Excellent guidance!' },
    ],
  },
  {
    id: 'coaching-002',
    name: 'Skill Up Institute',
    category: 'Coaching',
    categoryIcon: '💼',
    phone: '+91 9210987654',
    email: 'skillup@institute.com',
    whatsapp: '919210987654',
    address: 'Tech Zone, Ara, Bihar 801101',
    coordinates: { lat: 25.5870, lng: 84.1690 },
    openingHours: { weekdays: '2:00 PM - 7:00 PM', weekends: '10:00 AM - 6:00 PM' },
    tagline: 'Future Ready Skills',
    description: 'Professional skill development and career guidance center.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f70a504f9?w=600',
    rating: 4.8,
    reviews: 167,
    services: [
      { name: 'Web Development',      icon: '🌐', description: 'Full-stack web development courses.' },
      { name: 'Digital Marketing',     icon: '📱', description: 'SEO, social media, and digital marketing.' },
      { name: 'Communication Skills',  icon: '🗣️', description: 'Personality development and public speaking.' },
      { name: 'Career Counseling',     icon: '💡', description: 'One-on-one career guidance sessions.' },
    ],
    testimonials: [
      { name: 'Arjun Kumar', role: 'Student', rating: 5, text: 'Got my dream job!' },
    ],
  },
];

// ── Run Seed ─────────────────────────────────────────────────

const seedDB = async () => {
  await connectDB();

  console.log('🗑️  Clearing existing businesses...');
  await Business.deleteMany({});

  console.log('🌱 Seeding businesses...');
  const normalizedSeedData = ensureUniqueSeedImages(seedData);
  await Business.insertMany(normalizedSeedData);

  console.log(`✅ Seeded ${normalizedSeedData.length} businesses successfully!`);
  process.exit(0);
};

seedDB().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
