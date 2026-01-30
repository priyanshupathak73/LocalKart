# 🏪 Local Business Discovery Platform

A modern, full-featured local business discovery platform for Ara, Bihar - built with Next.js 14, React 18, and Tailwind CSS.

## 🎯 Features

### 1. **Discovery Landing Page** (`/`)
- **Smart Search Bar**: Real-time search by business name, category, or description
- **Category Filters**: Quick filter buttons (Bakery, Medical, Salon, Grocery, Coaching)
- **Suggested Shops Grid**: Display filtered businesses with images, ratings, reviews
- **Live Filtering**: Results update instantly as you type or change filters
- **Dark Mode Support**: Full dark/light theme compatibility

### 2. **Shop Detail Pages** (`/shop/[id]`)
Every shop has a complete, rich business page featuring:
- **Hero Section**: Full-width background image with gradient overlay and business info
- **Services Section**: Service cards with images, descriptions, and icons
- **Gallery Section**: 4-image gallery showcase
- **Stats Section**: Achievement cards (e.g., "Daily Orders: 350+")
- **Testimonials Section**: Customer reviews with ratings and avatars
- **Contact Section**: 
  - Contact cards (phone, email, address, hours)
  - Google Maps embed with business location
  - WhatsApp contact button for direct messaging
- **Similar Shops**: Recommendation section for related businesses in same category
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Animations**: Smooth Framer Motion transitions throughout

### 3. **Directory Page** (`/directory`)
Full-featured business directory with:
- **Advanced Search**: Multi-field search (name, category, services)
- **Category Filtering**: Filter by business type
- **Sorting Options**: Sort by rating, reviews, or name
- **Grid Display**: Responsive grid layout
- **Empty States**: Helpful messages when no results found

## 📊 Data Structure

All businesses include:
```javascript
{
  id: 'bakery-001',
  name: 'Divine Bakery',
  category: 'Bakery',
  categoryIcon: '🎂',
  
  // Contact & Location
  phone: '+91 9876543210',
  email: 'hello@divinebakery.com',
  whatsapp: '919876543210',
  address: 'Ara, Bihar',
  coordinates: { lat, lng },
  openingHours: { weekdays, weekends },
  
  // Rich Content
  heroImage: 'https://unsplash.com/...',
  image: 'https://unsplash.com/...',
  description: 'Business description...',
  tagline: 'Catchy tagline',
  
  // Services with Images
  services: [
    {
      id: 1,
      title: 'Custom Cakes',
      image: 'https://unsplash.com/...',
      description: 'Personalized cakes...',
      icon: '🎂'
    }
  ],
  
  // Media
  galleryImages: ['url1', 'url2', 'url3', 'url4'],
  
  // Social Proof
  stats: [
    { label: 'Daily Orders', value: '350+' },
    { label: 'Custom Cakes', value: '120+' }
  ],
  
  testimonials: [
    {
      id: 1,
      name: 'Customer Name',
      role: 'Wedding Organizer',
      content: 'Amazing cakes!',
      rating: 5,
      avatar: '🙂'
    }
  ],
  
  // Metrics
  rating: 4.8,
  reviews: 156
}
```

## 🎨 Design System

### Colors
- **Dark Background**: `#0f0a1a` (dark-bg)
- **Purple Accent**: `#a78bfa` (gradient-purple)
- **Blue Accent**: `#60a5fa` (gradient-blue)
- **Light Text**: White on dark, Gray on light

### Components
- **Search Bar**: Icon with input field, clear button
- **Category Buttons**: Interactive filter buttons with active state
- **Business Cards**: Image, icon, name, description, rating, arrow CTA
- **Service Cards**: Service image, icon, title, description
- **Stat Cards**: Large value + label
- **Testimonial Cards**: Avatar, name, role, stars, content
- **Contact Cards**: Icon, label, action (phone/email/location)

### Animations
- **Framer Motion** throughout:
  - Stagger animations on load
  - Hover effects (scale, lift)
  - Scroll-triggered reveals
  - Smooth transitions between filters
  - Icon animations

## 📱 Responsive Design

- **Mobile** (< 640px): Single column, stacked layout
- **Tablet** (640px - 1024px): 2 columns, optimized touch targets
- **Desktop** (> 1024px): 3-4 columns, full featured layout

## 🔧 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **React**: React 18 with Hooks
- **Styling**: Tailwind CSS 3.3
- **Animations**: Framer Motion 10+
- **Icons**: react-icons
- **Theme**: next-themes (dark mode)
- **Images**: Unsplash placeholders + Next.js Image optimization

## 📝 Business Categories

1. **🎂 Bakery** (2 businesses)
   - Divine Bakery
   - Sweet Dreams Bakery

2. **⚕️ Medical** (2 businesses)
   - Care Plus Medical Center
   - Wellness Clinic

3. **💇 Salon** (2 businesses)
   - Glamour Studio
   - Men's Grooming Hub

4. **🛒 Grocery** (2 businesses)
   - Fresh Market
   - Daily Essentials Store

5. **📚 Coaching** (2 businesses)
   - Excel Academy
   - NEET Coaching Center

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## 📂 Project Structure

```
Local business/
├── app/
│   ├── page.jsx                    # Discovery landing page
│   ├── directory/
│   │   └── page.jsx               # Directory with advanced filters
│   ├── shop/
│   │   └── [id]/
│   │       └── page.jsx           # Dynamic shop detail page
│   ├── layout.jsx
│   └── providers.jsx
├── components/
│   ├── Navbar.jsx                 # Navigation bar
│   ├── DiscoveryHeroSection.jsx   # Homepage hero with search
│   ├── DirectoryPreviewSection.jsx # Directory preview on home
│   ├── SearchBar.jsx              # Reusable search component
│   ├── CategoryFilter.jsx         # Category button filter
│   ├── ShopCard.jsx               # Business card component
│   ├── ShopGrid.jsx               # Responsive grid
│   ├── ShopDetail.jsx             # Shop detail view (legacy)
│   ├── RelatedShops.jsx           # Similar shops component
│   └── [other components...]
├── data/
│   ├── business.js                # Single bakery (legacy)
│   └── businesses.js              # All 10 businesses with normalization
├── utils/
│   └── filteringLogic.js          # Search and filter functions
└── public/
    └── [images...]
```

## 🔍 Key Features Implementation

### Real-time Search
```jsx
// Homepage search updates results instantly
const [searchQuery, setSearchQuery] = useState('');
const filteredBusinesses = businesses.filter(b =>
  b.name.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### Dynamic Shop Pages
```jsx
// Each shop gets full bakery-style treatment
export default function ShopPage({ params }) {
  const business = getBusinessById(params.id);
  // Render hero, services, gallery, stats, testimonials, contact, map, similar shops
}
```

### Image Normalization
```javascript
// Service and gallery images automatically assigned by category
const categoryServiceImages = {
  Bakery: ['url1', 'url2', 'url3', 'url4'],
  Medical: ['url1', 'url2', 'url3', 'url4'],
  // ... etc
};

const normalizeServices = (business) => {
  return business.services.map((service, index) => ({
    ...service,
    image: categoryServiceImages[business.category][index]
  }));
};
```

## 🌍 Location

**Ara, Bihar** - All businesses are local to this region

## 📊 Data Flow

1. **Homepage**: User lands on discovery page
2. **Search/Filter**: User searches or filters by category
3. **Browse**: User sees filtered results in real-time
4. **Click Shop**: User navigates to `/shop/[id]`
5. **Explore**: User views full shop details with all sections
6. **Contact**: User can call, email, message on WhatsApp, or find on Google Maps

## ✨ User Experience

- **Instant Search**: No delays, real-time filtering
- **Category Quick Access**: Single tap to filter by type
- **Rich Visuals**: Images throughout the experience
- **Clear Ratings**: Star ratings and review counts
- **Easy Contact**: Multiple ways to reach out (phone, email, WhatsApp, maps)
- **Mobile Friendly**: Optimized for all screen sizes
- **Dark Mode**: Comfortable viewing at any time
- **Smooth Animations**: Professional, polished interactions

## 🎯 Future Enhancements

- User accounts and saved favorites
- Real-time availability/appointment booking
- Business owner management dashboard
- More detailed reviews and ratings system
- Payment integration for services
- Advanced location-based search
- Business analytics and insights

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
