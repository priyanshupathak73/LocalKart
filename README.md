# Divine Bakery - Professional Local Business Website

A stunning, modern local business website built with **Next.js**, **Tailwind CSS**, and **Framer Motion**. Designed specifically for local businesses like bakeries, salons, restaurants, and more.

## 🚀 Features

✅ **Modern UI/UX Design**
- Dark indigo background with purple/blue gradient accents
- Smooth hover effects and animations
- Mobile-first responsive design
- Light/Dark mode toggle

✅ **Performance Optimized**
- Built with Next.js 14 (latest version)
- Server-side rendering for SEO
- Image optimization
- Fast load times

✅ **Interactive Components**
- Sticky navigation bar
- Hero section with animated gradients
- Service cards with hover animations
- Testimonials slider with smooth transitions
- Scroll reveal animations
- Contact form with validation
- WhatsApp floating button
- Google Maps integration
- Social media links

✅ **Accessibility**
- Semantic HTML
- ARIA labels
- Keyboard navigation
- High contrast mode support

## 📁 Folder Structure

```
local-business-website/
├── app/
│   ├── layout.jsx          # Root layout with providers
│   ├── page.jsx            # Home page
│   └── providers.jsx       # Theme provider configuration
├── components/
│   ├── Navbar.jsx          # Navigation bar
│   ├── HeroSection.jsx     # Hero section with CTA
│   ├── ServicesSection.jsx # Services/products cards
│   ├── AboutSection.jsx    # About business section
│   ├── TestimonialsSection.jsx # Customer testimonials slider
│   ├── LocationSection.jsx # Location with Google Maps
│   ├── ContactForm.jsx     # Contact form
│   ├── Footer.jsx          # Footer with links
│   └── WhatsAppButton.jsx  # WhatsApp floating button
├── data/
│   └── business.js         # Mock business data
├── hooks/
│   └── useScrollReveal.js  # Custom hook for scroll animations
├── styles/
│   └── globals.css         # Global styles and animations
├── public/                 # Static assets
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── next.config.js          # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Step 1: Clone/Setup
```bash
cd "Local business"
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Build for Production
```bash
npm run build
npm run start
```

## 🎨 Tailwind CSS Setup

The project comes with Tailwind CSS pre-configured. Custom colors are defined in `tailwind.config.js`:

```js
colors: {
  'dark-bg': '#0f0a1a',      // Dark indigo background
  'dark-secondary': '#1a1530', // Secondary dark color
  'accent-purple': '#a78bfa',  // Purple accent
  'accent-blue': '#60a5fa',    // Blue accent
  'accent-indigo': '#4f46e5',  // Indigo accent
}
```

## 🎬 Framer Motion Animations

The website includes various animations:
- **Page transitions**: Smooth fade-in effects
- **Hover animations**: Card lift and glow effects
- **Scroll reveals**: Elements appear as you scroll
- **Slider animations**: Smooth testimonial transitions
- **Floating animations**: Subtle floating elements
- **Gradient morphing**: Animated gradient backgrounds

## 🌙 Light/Dark Mode

Toggle between light and dark themes using the sun/moon icon in the navbar. The preference is automatically saved.

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Hamburger menu on mobile
- Optimized images and typography

## 🗺️ Google Maps Integration

The location section includes an embedded Google Maps. Update the coordinates in `data/business.js`:

```js
mapCoordinates: {
  lat: 27.5088,  // Mathura coordinates
  lng: 77.6890,
}
```

## 💬 WhatsApp Integration

The floating WhatsApp button opens a pre-filled message. Update the number in `data/business.js`:

```js
whatsapp: '919876543210',  // Include country code
```

## 📝 Customizing Business Data

All business information is centralized in `data/business.js`. Update:
- Business name and tagline
- Services and features
- Testimonials and customer reviews
- Contact information
- Social media links
- Opening hours
- Address and location

## 🚀 Deployment on Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"
5. Your site is live! 🎉

### Environment Variables (if needed)
Create a `.env.local` file for sensitive data:
```
NEXT_PUBLIC_MAP_API_KEY=your_api_key
```

## 🎯 UI/UX Benefits for Customer Trust

### 1. **Professional First Impression**
Modern, clean design signals credibility and attention to detail. Customers immediately recognize a well-maintained business.

### 2. **Smooth Interactions**
Framer Motion animations create fluid, satisfying interactions that feel premium and reduce friction. Smooth scrolling and hover effects make navigation feel natural.

### 3. **Accessibility**
Inclusive design (keyboard navigation, dark mode, proper contrast) shows the business cares about all customers, building trust.

### 4. **Mobile Responsiveness**
Seamless experience across devices ensures customers can interact anytime, anywhere, showing the business is modern and prepared.

### 5. **Clear Information Hierarchy**
Well-organized sections (Services, Testimonials, Contact) help customers quickly find what they need without confusion.

### 6. **Social Proof**
Testimonials section with real customer reviews builds confidence and trust through peer validation.

### 7. **Easy Contact**
Multiple contact options (WhatsApp, Email, Phone, Form) show accessibility and customer-first mentality.

### 8. **Visual Consistency**
Cohesive color scheme and typography create a unified brand identity that customers remember and trust.

### 9. **Fast Performance**
Quick load times and smooth animations indicate a professional, well-maintained business vs. slow competitors.

### 10. **Dark Mode**
Modern dark mode support shows the business stays current with user preferences, improving user experience.

## 📊 SEO Optimization

- ✅ Semantic HTML structure
- ✅ Meta tags in layout
- ✅ Mobile-friendly design
- ✅ Fast page load time
- ✅ Open Graph tags ready
- ✅ Structured data ready for implementation

## 🔧 Customization Tips

### Change Colors
Edit `tailwind.config.js` to match your brand:
```js
'brand-primary': '#your-color',
'brand-secondary': '#your-color',
```

### Update Typography
Modify font families in `styles/globals.css`

### Add More Services
Add objects to `businessData.services` in `data/business.js`

### Change Animations
Customize Framer Motion variants in component files

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Icons](https://react-icons.github.io/react-icons/)

## 🤝 Contributing

Feel free to fork and customize this template for your local business!

## 📄 License

This project is open source and available under the MIT License.

## 💡 Support

For issues or questions, create an issue in the repository.

---

**Built with ❤️ for local businesses** | Deployed on Vercel ⚡
