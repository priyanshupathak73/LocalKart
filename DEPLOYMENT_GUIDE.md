# 🚀 Complete Setup & Deployment Guide

## Part 1: Initial Setup

### Step 1: Install Node.js
- Download from [nodejs.org](https://nodejs.org) (LTS version recommended)
- Verify installation:
```bash
node --version
npm --version
```

### Step 2: Navigate to Project
```bash
# Open PowerShell or Command Prompt and navigate to the project folder
cd "C:\Users\priya\OneDrive\Desktop\Local business"
```

### Step 3: Install Dependencies
```bash
npm install
```

This will install:
- Next.js 14 (React framework)
- Tailwind CSS (styling)
- Framer Motion (animations)
- React Icons (icons)
- Next Themes (dark mode)

### Step 4: Start Development Server
```bash
npm run dev
```

Open browser and go to: **http://localhost:3000**

---

## Part 2: Customization

### Update Business Data
Edit `data/business.js`:

```js
const businessData = {
  name: 'Your Business Name',
  location: 'City, State',
  phone: '+91 1234567890',
  email: 'hello@business.com',
  whatsapp: '911234567890',
  // ... update other fields
};
```

### Customize Colors
Edit `tailwind.config.js`:

```js
colors: {
  'dark-bg': '#0f0a1a',      // Change to your primary
  'accent-purple': '#a78bfa', // Change to your accent
  'accent-blue': '#60a5fa',   // Change to your accent
}
```

### Add Your Logo
Replace emoji in components with actual logo image:

```jsx
// In Navbar.jsx
<img src="/logo.png" alt="Logo" className="w-10 h-10" />
```

### Update Google Maps
In `components/LocationSection.jsx`, update coordinates:

```jsx
src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d...`}
```

---

## Part 3: Build for Production

### Build Command
```bash
npm run build
```

This creates an optimized production build.

### Test Production Build Locally
```bash
npm run start
```

Visit: **http://localhost:3000**

---

## Part 4: Deployment on Vercel (Free & Easiest)

### Option A: Using Vercel Dashboard (Recommended)

#### Prerequisites:
- GitHub account (free at github.com)
- Vercel account (free at vercel.com)

#### Steps:

**1. Create GitHub Repository**
```bash
# Initialize git in your project
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Divine Bakery website"

# Create main branch
git branch -M main

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/divine-bakery.git

# Push to GitHub
git push -u origin main
```

**2. Deploy on Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Select your repo and click **"Import"**
5. Framework: **Next.js** (auto-detected)
6. Root Directory: Leave blank
7. Environment Variables: Leave blank (optional)
8. Click **"Deploy"**
9. Wait 2-3 minutes for deployment
10. ✅ Your site is live!

**3. Get Your Domain**
- Vercel provides a free domain: `your-project.vercel.app`
- Add custom domain in Vercel dashboard

### Option B: Using Vercel CLI

#### Install Vercel CLI:
```bash
npm install -g vercel
```

#### Deploy:
```bash
vercel
```

Follow the prompts to deploy.

---

## Part 5: Alternative Deployment Options

### Netlify (Free & Easy)

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect GitHub
5. Select repository
6. Build command: `npm run build`
7. Publish directory: `.next`
8. Click "Deploy"

### AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Connect GitHub repository
3. Configure build settings
4. Deploy

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and push to Docker Hub.

---

## Part 6: Post-Deployment Checklist

### Performance Optimization

**✅ Check PageSpeed Insights**
1. Go to [pagespeed.web.dev](https://pagespeed.web.dev)
2. Enter your deployed URL
3. Analyze performance
4. Improve based on recommendations

**✅ Check SEO**
1. Use [seobility.net](https://seobility.net) for SEO audit
2. Update meta tags
3. Add structured data

### Security

**✅ Enable HTTPS**
- Vercel enables HTTPS automatically

**✅ Add Security Headers**
In `next.config.js`:
```js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    },
  ];
}
```

### Analytics

**✅ Add Google Analytics**
1. Create project at [analytics.google.com](https://analytics.google.com)
2. Get tracking ID
3. Add to layout.jsx

**✅ Add Sitemap**
Create `public/sitemap.xml`

**✅ Add Robots.txt**
Create `public/robots.txt`

---

## Part 7: Monitoring & Maintenance

### Set Up Monitoring

**Vercel Analytics** (Built-in):
- Dashboard → Analytics
- Monitor page performance

**Google Search Console**:
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property (your domain)
3. Monitor search performance

**Google My Business**:
1. Go to [google.com/business](https://google.com/business)
2. Create/claim listing
3. Add business info

### Regular Updates

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update Next.js
npm install next@latest react@latest react-dom@latest
```

---

## Part 8: Troubleshooting

### Common Issues

**Issue: "npm command not found"**
- Solution: Install Node.js from nodejs.org

**Issue: Port 3000 already in use**
```bash
# Use different port
npm run dev -- -p 3001
```

**Issue: Module not found error**
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
```

**Issue: Styles not loading**
- Clear `.next` folder: `rm -r .next`
- Restart dev server: `npm run dev`

**Issue: Dark mode not working**
- Check browser localStorage
- Verify `next-themes` is installed

---

## Part 9: Essential Commands Reference

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter

# Version Control
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to GitHub

# Deployment
vercel                   # Deploy with Vercel CLI
npm run build && npm start # Build and run locally
```

---

## Part 10: Domain & Email Setup

### Domain Registration (Optional)

1. Buy domain from:
   - [Namecheap](https://namecheap.com) ($5-10/year)
   - [GoDaddy](https://godaddy.com)
   - [Google Domains](https://domains.google)

2. Connect to Vercel:
   - Dashboard → Settings → Domains
   - Add domain
   - Update DNS records

### Email Setup (Optional)

**Use Vercel Email or Brevo**:
1. Get SMTP credentials
2. Add to environment variables
3. Test email functionality

---

## Part 11: Final Testing Checklist

- [ ] All links work
- [ ] Mobile responsive
- [ ] Dark/Light mode working
- [ ] WhatsApp button opens chat
- [ ] Contact form sends submission
- [ ] Maps loads correctly
- [ ] Testimonials slider works
- [ ] All animations smooth
- [ ] Page loads fast (<3s)
- [ ] No console errors
- [ ] SEO tags present
- [ ] Images optimized

---

## Part 12: Cost Summary

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | Free | Includes 1 concurrent function |
| GitHub | Free | Source control |
| Domain | $5-15/year | Optional |
| Brevo Email | Free (300/day) | Optional |
| Google Workspace | $6/month | Optional business email |

---

**Congratulations! Your website is ready for the world! 🎉**

For support, visit [nextjs.org/docs](https://nextjs.org/docs)
