# Free Tier Deployment Plan - $0/month

## 🎯 100% Free Infrastructure

### **Platform Selection**

| Component | Free Service | Limits | Cost |
|-----------|-------------|--------|------|
| **Web App** | Vercel Free | 100GB bandwidth, unlimited sites | $0 |
| **Database** | Supabase Free | 500MB database, 1GB file storage, 2GB bandwidth | $0 |
| **Authentication** | Firebase Free (Spark) | 10k phone auth/month | $0 |
| **Hosting** | Vercel Edge Network | Global CDN included | $0 |
| **Mobile Build** | Expo EAS Free | Limited builds/month | $0 |
| **Maps API** | Google Maps Free | $200 credit/month (~28k requests) | $0 |
| **Monitoring** | Sentry Free | 5k events/month | $0 |
| **Analytics** | Vercel Analytics Free | 2.5k events/month | $0 |

**Total Monthly Cost: $0**

---

## 🏗️ Free Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Free Tier                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Next.js Web App (apps/web)                      │   │
│  │  - SSR/SSG pages                                 │   │
│  │  - API Routes (serverless functions)            │   │
│  │  - Edge Middleware (rate limiting)               │   │
│  └──────────────────────────────────────────────────┘   │
│         ↓ 100GB bandwidth/month                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Supabase Free Tier                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database (500MB)                     │   │
│  │  - Row Level Security (RLS)                      │   │
│  │  - Real-time subscriptions                       │   │
│  │  - Auto-generated REST API                       │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Storage (1GB)                                   │   │
│  │  - Photo uploads                                 │   │
│  │  - CDN delivery                                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│           Firebase Free (Spark Plan)                     │
│  - Phone Authentication (10k/month)                      │
│  - Cloud Messaging (unlimited)                           │
│  - Admin SDK                                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Google Maps API                             │
│  $200 free credit/month = ~28,000 requests              │
│  - Distance Matrix API                                   │
│  - Directions API                                        │
│  - Geocoding API                                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Notification Services (Free)                     │
│  - Telegram Bot API (unlimited, free)                    │
│  - LINE Messaging API (free tier)                        │
│  - FCM (unlimited push notifications)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile App Deployment (Free)

### **Option 1: PWA (Progressive Web App) - RECOMMENDED**
```
Platform: Vercel (same as web)
Cost: $0
Benefits:
  ✅ No app store fees
  ✅ Instant updates
  ✅ Works on iOS & Android
  ✅ Offline support via Service Workers
  ✅ Can be "installed" to home screen
  ✅ Access to camera, geolocation, notifications
```

### **Option 2: Capacitor Native (if needed)**
```
Build: Local machine (free)
Distribution: 
  - Android: APK direct download (free)
  - iOS: TestFlight only (requires $99/year Apple Developer)
```

**Recommendation:** Start with PWA, upgrade to native only if needed.

---

## 🚀 Deployment Steps

### **1. Setup Supabase (Free)**

```bash
# Create account at supabase.com (free tier)
# Create new project

# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### **2. Setup Firebase (Free Spark Plan)**

```bash
# Go to console.firebase.google.com
# Create project (select Spark plan - FREE)
# Enable Phone Authentication
# Enable Cloud Messaging (FCM)

# Download service account key
# Settings → Service Accounts → Generate New Private Key
```

### **3. Setup Google Maps API (Free $200 credit)**

```bash
# Go to console.cloud.google.com
# Enable APIs:
#   - Distance Matrix API
#   - Directions API
#   - Geocoding API
# Create API key
# Set restrictions (HTTP referrers for web, app restrictions for mobile)
```

### **4. Deploy to Vercel (Free)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from root
vercel --prod

# Set environment variables in Vercel dashboard
```

---

## 🔐 Environment Variables (Vercel Dashboard)

```env
# Supabase (from supabase.com dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Firebase (from Firebase console)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Notifications (optional)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
LINE_CHANNEL_ACCESS_TOKEN=your_line_token
```

---

## 📊 Free Tier Limits & Optimization

### **Supabase Free Tier (500MB database)**

**Optimization Strategies:**
```sql
-- 1. Auto-delete old data (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  DELETE FROM trip_events WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM driver_locations WHERE created_at < NOW() - INTERVAL '7 days';
  DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 2. Schedule cleanup (run weekly)
SELECT cron.schedule('cleanup-old-data', '0 0 * * 0', 'SELECT cleanup_old_data()');
```

**Storage Optimization:**
- Compress photos before upload (max 800x600, 80% quality)
- Delete photos after 30 days
- Use Supabase Storage CDN (included)

### **Vercel Free Tier (100GB bandwidth)**

**Optimization:**
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  compress: true, // Gzip compression
  swcMinify: true, // Fast minification
}
```

### **Google Maps API ($200 credit = 28k requests)**

**With our caching implementation:**
- Cache TTL: 24 hours
- Expected cache hit rate: 80%
- Actual API calls: ~5,600/month
- **Cost: $0** (well within free tier)

### **Firebase Auth (10k phone auth/month)**

**Optimization:**
- Session duration: 30 days (reduce re-auth)
- Use refresh tokens
- Expected usage: ~500-2000 auth/month for small-medium school

---

## 🎯 Scaling Path (When to Upgrade)

### **Stay on Free Tier if:**
- ✅ < 50 active users/day
- ✅ < 5 schools
- ✅ < 500MB database
- ✅ < 100GB bandwidth/month
- ✅ < 10k phone auth/month

### **Upgrade to Paid ($25-50/month) when:**
- ⚠️ > 100 active users/day
- ⚠️ > 10 schools
- ⚠️ > 500MB database (Supabase Pro: $25/month for 8GB)
- ⚠️ > 100GB bandwidth (Vercel Pro: $20/month for 1TB)
- ⚠️ Need point-in-time recovery (database backups)

---

## 🔧 PWA Configuration (Free Mobile App)

### **1. Update next.config.js**

```javascript
// apps/web/next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

module.exports = withPWA({
  // ... existing config
});
```

### **2. Add manifest.json**

```json
{
  "name": "School Bus Route Manager",
  "short_name": "BusRoute",
  "description": "Manage school bus routes and track students",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f59e0b",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **3. Install Dependencies**

```bash
cd apps/web
npm install next-pwa
```

---

## 📱 Mobile App Features (PWA)

**Available on PWA (Free):**
- ✅ Camera access (photo capture)
- ✅ Geolocation (GPS tracking)
- ✅ Push notifications (FCM)
- ✅ Offline support (Service Workers)
- ✅ Install to home screen
- ✅ Background sync
- ✅ Network status detection

**Only available on Native (Paid):**
- ❌ Background location tracking (iOS)
- ❌ App Store distribution
- ❌ Native performance (marginal difference)

**Verdict:** PWA is sufficient for 95% of use cases.

---

## 💡 Cost Comparison

### **Free Tier (Recommended for MVP)**
```
Vercel Free:           $0/month
Supabase Free:         $0/month
Firebase Spark:        $0/month
Google Maps:           $0/month (within credit)
PWA (no app stores):   $0/month
Monitoring (Sentry):   $0/month
─────────────────────────────
TOTAL:                 $0/month
```

### **Paid Tier (When scaling)**
```
Vercel Pro:            $20/month
Supabase Pro:          $25/month
Firebase Blaze:        ~$5-10/month
Google Maps:           ~$50/month (with caching)
App Stores:            ~$10/month (amortized)
Monitoring:            $0/month (still free)
─────────────────────────────
TOTAL:                 ~$110-125/month
```

---

## ✅ Free Tier Deployment Checklist

- [ ] Create Supabase account (free tier)
- [ ] Create Firebase project (Spark plan)
- [ ] Enable Google Maps APIs (use free credit)
- [ ] Create Vercel account (free tier)
- [ ] Install dependencies: `pnpm install`
- [ ] Run migrations: `supabase db push`
- [ ] Set environment variables in Vercel
- [ ] Deploy: `vercel --prod`
- [ ] Configure PWA manifest
- [ ] Test on mobile devices (iOS Safari, Chrome Android)
- [ ] Set up Sentry error tracking (free tier)
- [ ] Configure photo compression (save storage)
- [ ] Set up database cleanup cron jobs
- [ ] Test offline functionality
- [ ] Verify push notifications work

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Setup Supabase
supabase login
supabase link --project-ref YOUR_REF
supabase db push

# 3. Deploy to Vercel
vercel login
vercel --prod

# 4. Set environment variables in Vercel dashboard
# (copy from .env.example)

# 5. Access your app
# https://your-app.vercel.app
```

---

## 📈 Monitoring (Free)

### **Vercel Analytics (Free)**
- 2,500 events/month
- Real-time performance metrics
- Web Vitals tracking

### **Sentry (Free)**
- 5,000 errors/month
- Error tracking & debugging
- Performance monitoring

### **Supabase Dashboard (Free)**
- Database metrics
- Query performance
- Storage usage
- Real-time connections

---

**Your app is now 100% free to run! 🎉**

**Expected capacity on free tier:**
- 5-10 schools
- 50-100 active users/day
- 500-1000 trips/month
- 10,000+ route calculations/month (cached)

This should be more than enough for MVP and initial customers.
