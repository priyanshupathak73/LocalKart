// Mock business data
const businessData = {
  name: 'Divine Bakery',
  tagline: 'Freshly Baked Happiness',
  location: 'Mathura, Uttar Pradesh',
  address: 'Gyan Vihar Colony, Mathura, U.P. 281001',
  phone: '+91 9876543210',
  email: 'hello@divinebakery.com',
  whatsapp: '919876543210',
  openingHours: {
    weekdays: '7:00 AM - 10:00 PM',
    weekends: '8:00 AM - 11:00 PM',
  },
  mapCoordinates: {
    lat: 27.5088,
    lng: 77.6890,
  },

  hero: {
    title: 'Divine Bakery',
    subtitle: 'Freshly Baked Goodness, Delivered with Love',
    description: 'Handcrafted pastries and cakes made with premium ingredients. Your taste of heaven, every bite.',
    cta: 'Order Now',
  },

  services: [
    {
      id: 1,
      name: 'Custom Cakes',
      icon: '🎂',
      description: 'Personalized cakes for weddings, birthdays, and special occasions.',
      features: ['Custom Design', 'Premium Flavors', '48hr Advance Order'],
    },
    {
      id: 2,
      name: 'Fresh Pastries',
      icon: '🥐',
      description: 'Buttery, flaky pastries baked fresh daily with imported butter.',
      features: ['Daily Fresh', 'Vegan Options', 'Allergy-Friendly'],
    },
    {
      id: 3,
      name: 'Dessert Platters',
      icon: '🍰',
      description: 'Assorted dessert combos perfect for parties and celebrations.',
      features: ['Variety Pack', 'Customizable', 'Party Catering'],
    },
    {
      id: 4,
      name: 'Artisan Bread',
      icon: '🍞',
      description: 'Sourdough and multigrain bread made with traditional methods.',
      features: ['Organic Flour', 'Slow Fermented', 'No Preservatives'],
    },
    {
      id: 5,
      name: 'Seasonal Specials',
      icon: '🌸',
      description: 'Limited edition flavors and seasonal collections.',
      features: ['Limited Stock', 'Trend-Focused', 'Social Media Favorites'],
    },
    {
      id: 6,
      name: 'Wedding Catering',
      icon: '💒',
      description: 'Complete dessert solutions for your dream wedding.',
      features: ['Full Menu', 'Event Planning', 'Professional Setup'],
    },
  ],

  about: {
    title: 'About Divine Bakery',
    intro: 'Since 2015, Divine Bakery has been the heart of Mathura\'s dessert culture.',
    story:
      'Founded by Raj and Priya Singh, Divine Bakery started as a small home kitchen passion project. Today, we\'re the city\'s most trusted bakery, serving over 500 happy customers daily. Our commitment to quality, taste, and innovation has made us a household name.',
    mission: 'To bring joy through freshly baked products that celebrate tradition while embracing modern baking techniques.',
    vision: 'To become the finest bakery in North India, known for excellence, innovation, and customer happiness.',
    achievements: [
      { label: 'Happy Customers', value: '50,000+' },
      { label: 'Years of Experience', value: '9' },
      { label: 'Daily Orders', value: '500+' },
      { label: 'Premium Recipes', value: '120+' },
    ],
  },

  testimonials: [
    {
      id: 1,
      name: 'Ananya Sharma',
      role: 'Wedding Organizer',
      content:
        'Divine Bakery made our wedding dessert spread absolutely magical. The custom cakes were not just beautiful but incredibly delicious!',
      rating: 5,
      avatar: '👩‍🦰',
    },
    {
      id: 2,
      name: 'Ravi Patel',
      role: 'Regular Customer',
      content:
        'Every morning I get fresh pastries from Divine. The quality is consistent, and the service is always warm and welcoming.',
      rating: 5,
      avatar: '👨‍💼',
    },
    {
      id: 3,
      name: 'Priya Verma',
      role: 'Event Manager',
      content:
        'Catering for 200 people was stress-free because Divine Bakery handled everything perfectly. Highly recommended!',
      rating: 5,
      avatar: '👩‍🔬',
    },
    {
      id: 4,
      name: 'Amit Kumar',
      role: 'Business Owner',
      content:
        'The custom cakes for our office events are always a hit. Professional, reliable, and absolutely delicious!',
      rating: 5,
      avatar: '👨‍💻',
    },
  ],

  faq: [
    {
      question: 'How far in advance should I order custom cakes?',
      answer: 'We recommend ordering 48 hours in advance for custom designs. Rush orders are available with a 20% premium.',
    },
    {
      question: 'Do you offer vegan or allergy-friendly options?',
      answer: 'Yes! We have gluten-free, vegan, and allergy-friendly options. Please inform us about allergies when ordering.',
    },
    {
      question: 'What are your delivery options?',
      answer: 'We deliver within Mathura city. Free delivery for orders above ₹500. Same-day delivery available.',
    },
    {
      question: 'Can you do catering for large events?',
      answer: 'Absolutely! We cater for 50-500+ guests. Contact us for custom catering quotes.',
    },
  ],

  socialMedia: {
    instagram: 'https://instagram.com/divinebakery',
    facebook: 'https://facebook.com/divinebakery',
    twitter: 'https://twitter.com/divinebakery',
    whatsapp: 'https://wa.me/919876543210',
  },
};

export default businessData;
