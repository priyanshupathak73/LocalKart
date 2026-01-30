# Multi-Business Local Directory Platform - Documentation

## 📋 Overview

Your website has been successfully extended from a single-business site into a **Multi-Business Local Directory Platform**. The platform now supports multiple local businesses across 5 categories with advanced filtering, search, and recommendation features.

## 🏢 Supported Categories

1. **Bakery** 🎂
   - Divine Bakery
   - Sweet Dreams Bakery

2. **Medical** ⚕️
   - Care Plus Medical Center
   - Wellness Clinic

3. **Salon** 💇‍♀️
   - Glamour Studio
   - Men's Grooming Hub

4. **Grocery** 🛒
   - Fresh Market
   - Daily Essentials Store

5. **Coaching** 📚
   - Excel Academy
   - Skill Up Institute

## 📁 New Folder Structure

```
Local business/
├── app/
│   ├── directory/
│   │   └── page.jsx                 # Main directory page with filters
│   ├── shop/
│   │   └── [id]/
│   │       └── page.jsx             # Dynamic shop detail page
│   └── page.jsx                     # Updated home with directory section
├── components/
│   ├── DirectoryPreviewSection.jsx  # Home page directory preview
│   ├── SearchBar.jsx                # Search component
│   ├── CategoryFilter.jsx           # Category filter buttons
│   ├── ShopCard.jsx                 # Individual business card
│   ├── ShopGrid.jsx                 # Grid of businesses
│   ├── ShopDetail.jsx               # Detailed shop view
│   └── RelatedShops.jsx             # Related businesses section
├── data/
│   └── businesses.js                # All business data (10 shops)
└── utils/
    ├── filteringLogic.js            # Filter and search utilities
    └── recommendationLogic.js       # Recommendation algorithms
```

## 🔍 Key Features

### 1. **Advanced Search**
- Search by business name
- Search by category
- Search by services
- Search by description
- Real-time search results

### 2. **Category Filtering**
- Filter by: All, Bakery, Medical, Salon, Grocery, Coaching
- Combined with search for granular results
- Mobile-friendly category buttons

### 3. **Sorting Options**
- **Top Rated** ⭐ - Sort by rating (highest first)
- **Most Reviewed** 💬 - Sort by review count
- **Name (A-Z)** 🔤 - Alphabetical sorting

### 4. **Dynamic Shop Pages**
- Unique URL: `/shop/[id]`
- Full business details
- Contact information
- Services list
- Testimonials
- Opening hours
- WhatsApp integration

### 5. **Recommendation System**
- Related businesses by category
- Personalized recommendations
- Trending businesses algorithm
- "More [Category] Businesses" section on detail pages

### 6. **Business Data**
Each business includes:
- ID, name, category, icon
- Phone, email, WhatsApp
- Address, coordinates
- Opening hours
- Tagline, description
- Image, rating, reviews
- Services (name, icon, description)
- Testimonials (name, role, rating, text)

## 🛠️ Usage Guide

### Home Page
- Displays directory preview section
- Shows all 5 categories
- Features 3 highlighted businesses
- Link to full directory

**URL:** `/`

### Directory Page
- Browse all 10 businesses
- Search and filter
- Sort by rating/reviews/name
- Click to view details

**URL:** `/directory`

**Query Parameters:**
- `?category=Bakery` - Filter by category
- `?search=cake` - Search query

### Shop Detail Page
- View complete business information
- Contact details (phone, email, WhatsApp)
- All services offered
- Customer testimonials
- Opening hours
- Location (with coordinates)
- Related businesses section

**URL:** `/shop/[id]`

**Example:** `/shop/bakery-001`

## 📊 Business Data Structure

### businesses.js

```javascript
{
  id: 'bakery-001',
  name: 'Divine Bakery',
  category: 'Bakery',
  categoryIcon: '🎂',
  phone: '+91 9876543210',
  email: 'hello@divinebakery.com',
  whatsapp: '919876543210',
  address: 'Gyan Vihar Colony, Ara, Bihar 801101',
  coordinates: {
    lat: 25.5941,
    lng: 84.1633,
  },
  openingHours: {
    weekdays: '7:00 AM - 10:00 PM',
    weekends: '8:00 AM - 11:00 PM',
  },
  tagline: 'Freshly Baked Happiness',
  description: '...',
  image: 'https://images.unsplash.com/...',
  rating: 4.8,
  reviews: 156,
  services: [...],
  testimonials: [...]
}
```

## 🎯 Filtering and Search Logic

### filterBusinesses(businesses, searchQuery, selectedCategory)
- Combines category and search filters
- Returns filtered business array
- Case-insensitive search

### sortBusinesses(businesses, sortBy, order)
- Supports: 'rating', 'reviews', 'name'
- Default order: descending
- Returns sorted array

### Search matches:
- Business name
- Category
- Description
- Tagline
- Address
- Service names
- Service descriptions

## 🧠 Recommendation Algorithms

### getRecommendedBusinesses(businessId, limit)
**Scoring factors:**
- Same category: 40 points
- High rating (≥4.5): 30 points
- Recent reviews (≥100): 20 points
- Similar services: 20 points

### getSimilarBusinesses(businessId, limit)
- Returns businesses from same category
- Sorted by rating

### getPersonalizedRecommendations(viewedBusinessIds, limit)
- Based on user viewing history
- Preferred category boost: 50 points
- Rating bonus: ×10 points
- Review bonus: up to 20 points

### getTrendingBusinesses(limit)
- Formula: rating×10 + min(reviews/20, 30)
- Top ranked businesses

## 🎨 UI/UX Features

### Dark Mode Support
- All components support dark/light theme
- Uses `next-themes` for persistence
- Tailwind dark mode classes

### Animations
- Page transitions (Framer Motion)
- Scroll reveals
- Hover effects on cards
- Staggered list animations

### Responsive Design
- Mobile (< 640px)
- Tablet (640-1024px)
- Desktop (> 1024px)
- Ultra-wide support

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance

## 📱 Mobile Responsive

All components are fully responsive:

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| SearchBar | Full width | Full width | Full width |
| CategoryFilter | Horizontal scroll | Scroll | Grid |
| ShopGrid | 1 column | 2 columns | 3 columns |
| ShopDetail | Stacked | Stacked | 3-column layout |

## 🔗 Navigation

### Internal Links
- Home → Directory Preview
- Directory Preview → `/directory`
- Category Button → `/directory?category=X`
- Shop Card → `/shop/[id]`
- Related Shops → `/directory?category=X`

### External Links
- WhatsApp → `https://wa.me/[number]`
- Phone → `tel:[number]`
- Email → `mailto:[email]`

## 🚀 Adding New Businesses

### Step 1: Add to businesses.js
```javascript
{
  id: 'category-xxx',
  name: 'Business Name',
  category: 'Category',
  categoryIcon: '🏪',
  // ... other fields
}
```

### Step 2: Update Imports
No additional imports needed - automatically picked up

### Step 3: Update Categories
Categories are automatically extracted from business data

### Step 4: Test
- Check `/directory` page
- Verify filters work
- Test search functionality

## 🔧 Customization

### Change Business Location
Edit `coordinates` in each business object:
```javascript
coordinates: {
  lat: 25.5941,  // Latitude
  lng: 84.1633,  // Longitude
}
```

### Add New Category
1. Add business with new `category` value
2. Update `getCategories()` if needed
3. Category automatically appears in filters

### Update Theme Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  purple: { ... },
  blue: { ... },
}
```

### Modify Recommendation Algorithm
Edit `utils/recommendationLogic.js`:
- Adjust scoring weights
- Add new factors
- Change sorting logic

## 📈 Performance Optimization

### Implemented
- Image optimization with Next.js Image
- Dynamic imports for components
- Lazy loading of business cards
- Memoized filtering logic
- Viewport-based animations

### SEO
- Dynamic meta tags for each business
- Open Graph tags
- Structured data (JSON-LD)
- Mobile-friendly
- Fast page load

## 🧪 Testing Checklist

- [ ] Search bar works across all categories
- [ ] Category filter updates results
- [ ] Sorting by rating/reviews/name works
- [ ] Shop detail page loads correctly
- [ ] Related businesses show correct category
- [ ] WhatsApp links work
- [ ] Phone links dial on mobile
- [ ] Dark mode toggle works
- [ ] Mobile responsive on all screen sizes
- [ ] Animations smooth and performant

## 📞 Support

For issues or questions:

1. Check business data structure in `data/businesses.js`
2. Review filtering logic in `utils/filteringLogic.js`
3. Verify component props match expected data
4. Check console for errors

## 🎉 You're All Set!

Your multi-business directory platform is ready to use! 

- **Home:** `/`
- **Directory:** `/directory`
- **Shop Detail:** `/shop/[id]`

Start exploring!
