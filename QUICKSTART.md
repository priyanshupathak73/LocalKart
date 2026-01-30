# 🚀 Quick Start Guide - 5 Minutes to Launch

## Step 1: Open Terminal (1 min)

**Windows:**
1. Click Start menu
2. Type "PowerShell" or "Command Prompt"
3. Open it

**Mac/Linux:**
- Press Cmd + Space, type "Terminal"

## Step 2: Navigate to Project (1 min)

```bash
cd "C:\Users\priya\OneDrive\Desktop\Local business"
```

Or on **Mac/Linux**:
```bash
cd ~/Desktop/"Local\ business"
```

## Step 3: Install Dependencies (2 min)

```bash
npm install
```

(This installs all required packages)

## Step 4: Start Development Server (1 min)

```bash
npm run dev
```

**Expected output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 5: Open in Browser ✅

Go to: **http://localhost:3000**

You should see the Divine Bakery website! 🎉

---

## 🎨 Customize Quickly

### Change Business Name
File: `data/business.js` → Line 2
```js
name: 'Your Bakery Name',
```

### Change Colors
File: `tailwind.config.js` → colors section
```js
'accent-purple': '#a78bfa', // Change to your color
```

### Add Your Services
File: `data/business.js` → services array
```js
{
  id: 7,
  name: 'Your Service',
  icon: '🎂',
  description: 'Description here',
  features: ['Feature 1', 'Feature 2'],
}
```

### Update Contact Info
File: `data/business.js` → Top section
```js
phone: '+91 1234567890',
email: 'your@email.com',
whatsapp: '911234567890',
```

---

## 📱 Test Responsiveness

**In Browser DevTools (F12):**
1. Press `F12`
2. Click device toggle icon (mobile icon)
3. Select different screen sizes

All sections should look good on:
- ✅ Mobile (320px)
- ✅ Tablet (768px)
- ✅ Desktop (1024px+)

---

## 🛑 Stop Development Server

Press `Ctrl + C` in terminal

---

## 🚀 Deploy (When Ready)

### Option 1: Vercel (Easiest - Free)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Follow prompts, then your site is live in seconds!

### Option 2: GitHub + Vercel (Recommended)

1. Push code to GitHub
2. Go to vercel.com
3. Import repository
4. Click deploy
5. Done! ✅

---

## 📚 File Guide

| File | Purpose |
|------|---------|
| `data/business.js` | All business data (names, services, testimonials) |
| `app/page.jsx` | Main home page |
| `components/*.jsx` | Reusable components (Navbar, Hero, etc.) |
| `styles/globals.css` | Global styles |
| `tailwind.config.js` | Design tokens (colors, spacing) |
| `README.md` | Project overview |
| `DEPLOYMENT_GUIDE.md` | Full deployment steps |
| `DESIGN_SYSTEM.md` | Design guidelines |

---

## 🎬 Component Tree

```
Page (app/page.jsx)
├── Navbar.jsx
├── HeroSection.jsx
├── ServicesSection.jsx
├── AboutSection.jsx
├── TestimonialsSection.jsx
├── LocationSection.jsx
├── ContactForm.jsx
├── Footer.jsx
└── WhatsAppButton.jsx
```

---

## 🔥 Features Already Included

✅ **Mobile Responsive**
✅ **Dark Mode** (toggle in navbar)
✅ **Smooth Animations** (Framer Motion)
✅ **Google Maps** (Location section)
✅ **WhatsApp Button** (Floating button)
✅ **Contact Form** (With validation)
✅ **Testimonials Slider** (Auto-play ready)
✅ **SEO Ready** (Meta tags, sitemap)
✅ **Fast Performance** (Next.js optimized)
✅ **Light/Dark Mode** (next-themes)

---

## ❓ Common Issues & Fixes

### Issue: "npm: command not found"
**Fix:** Install Node.js from nodejs.org

### Issue: Port 3000 already in use
**Fix:** Use different port
```bash
npm run dev -- -p 3001
```

### Issue: Styles not showing
**Fix:** 
```bash
rm -r .next
npm run dev
```

### Issue: Dark mode not working
**Fix:** Clear browser localStorage and refresh

---

## 📞 Essential Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Check for errors
```

---

## 🌐 After Deployment

### Must-Do Checklist
- [ ] Test all links work
- [ ] Test dark/light mode
- [ ] Test on mobile
- [ ] Test contact form
- [ ] Check WhatsApp integration
- [ ] Check Google Maps loads
- [ ] Verify no console errors
- [ ] Check page speed (PageSpeed Insights)

### Optional Enhancements
- [ ] Add Google Analytics
- [ ] Setup Google Business Profile
- [ ] Submit sitemap to Google Search Console
- [ ] Create custom domain
- [ ] Setup email notifications

---

## 📖 Learn More

- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion
- **Vercel Deployment**: https://vercel.com/docs

---

## ⏱️ Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Install dependencies | 2-3 min | ✅ |
| Customize business data | 5-10 min | ✅ |
| Adjust colors/branding | 5-10 min | ✅ |
| Test locally | 5 min | ✅ |
| Deploy to Vercel | 3-5 min | ✅ |
| **Total** | **25-35 min** | 🚀 |

---

**Your professional website can be live in under 30 minutes!**

Need help? Check README.md or DEPLOYMENT_GUIDE.md

Good luck! 🎉
