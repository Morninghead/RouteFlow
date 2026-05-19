# 🚀 Setup Instructions - Free Tier Deployment

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Git installed

---

## Step 1: Install Dependencies

```bash
# From project root
pnpm install
```

This will install all dependencies including the new PWA support.

---

## Step 2: Create Free Tier Accounts

### 2.1 Supabase (Database + Storage)

1. Go to [supabase.com](https://supabase.com)
2. Sign up (free tier)
3. Create new project
4. Wait for database to provision (~2 minutes)
5. Copy these values from Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2.2 Firebase (Authentication)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create new project (select **Spark Plan - FREE**)
3. Enable Authentication → Phone
4. Go to Project Settings → Service Accounts
5. Click "Generate New Private Key"
6. Save the JSON file
7. Extract these values:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

### 2.3 Google Maps API

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or use existing
3. Enable these APIs:
   - Distance Matrix API
   - Directions API
   - Maps JavaScript API
4. Create API Key (Credentials → Create Credentials → API Key)
5. Restrict the key:
   - HTTP referrers: `*.vercel.app/*`, `localhost:3000/*`
6. Copy API key → `GOOGLE_MAPS_API_KEY`

### 2.4 Vercel (Hosting)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free tier)
3. We'll deploy later

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env.local` file

```bash
# Copy example file
cp .env.example .env.local
```

### 3.2 Fill in values

Edit `.env.local` with your credentials from Step 2:

```env
# Firebase
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 4: Setup Database

### 4.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 4.2 Login to Supabase

```bash
supabase login
```

### 4.3 Link to your project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**Find your project ref:**
- Go to Supabase dashboard
- Settings → General
- Copy "Reference ID"

### 4.4 Run migrations

```bash
supabase db push
```

This will create all tables, RLS policies, and indexes.

---

## Step 5: Test Locally

### 5.1 Start development server

```bash
cd apps/web
pnpm dev
```

### 5.2 Open browser

Navigate to [http://localhost:3000](http://localhost:3000)

### 5.3 Test PWA features

1. Open Chrome DevTools
2. Go to Application tab
3. Check:
   - ✅ Service Worker registered
   - ✅ Manifest loaded
   - ✅ Cache Storage working

---

## Step 6: Deploy to Vercel (Free)

### 6.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 6.2 Login

```bash
vercel login
```

### 6.3 Deploy

```bash
# From project root
vercel --prod
```

### 6.4 Set Environment Variables

After first deployment:

1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from `.env.local`
5. Redeploy: `vercel --prod`

---

## Step 7: Configure PWA Icons

### 7.1 Generate icons

You need to create these icon files in `apps/web/public/`:

- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)

**Quick way:** Use [realfavicongenerator.net](https://realfavicongenerator.net)

1. Upload your logo (512x512 PNG)
2. Download the generated package
3. Extract to `apps/web/public/`

---

## Step 8: Test PWA Installation

### 8.1 On Desktop (Chrome)

1. Visit your deployed URL
2. Look for install icon in address bar
3. Click "Install"
4. App opens in standalone window

### 8.2 On Mobile (iOS Safari)

1. Visit your deployed URL
2. Tap Share button
3. Tap "Add to Home Screen"
4. App icon appears on home screen

### 8.3 On Mobile (Android Chrome)

1. Visit your deployed URL
2. Tap menu (3 dots)
3. Tap "Install app"
4. App installs like native app

---

## Step 9: Optional - Setup Monitoring

### 9.1 Sentry (Error Tracking - Free)

```bash
# Install Sentry
pnpm add @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

### 9.2 Vercel Analytics (Free)

Already included! Just enable in Vercel dashboard:
- Project Settings → Analytics → Enable

---

## Step 10: Verify Everything Works

### ✅ Checklist

- [ ] Web app loads at your Vercel URL
- [ ] Can install as PWA on mobile
- [ ] Login with phone number works
- [ ] Database queries work
- [ ] Google Maps loads
- [ ] Offline mode works (turn off wifi)
- [ ] Service Worker caches assets
- [ ] Photos can be uploaded
- [ ] Push notifications work (if enabled)

---

## 🎉 You're Done!

Your app is now deployed on 100% free infrastructure:

- ✅ Vercel (hosting)
- ✅ Supabase (database)
- ✅ Firebase (auth)
- ✅ Google Maps (with free credit)
- ✅ PWA (no app store fees)

**Total cost: $0/month**

---

## 📊 Monitor Usage

### Vercel Dashboard
- Bandwidth usage
- Function invocations
- Build minutes

### Supabase Dashboard
- Database size (500MB limit)
- Storage usage (1GB limit)
- API requests

### Firebase Console
- Authentication usage (10k/month limit)
- FCM messages (unlimited)

### Google Cloud Console
- Maps API usage ($200 credit/month)

---

## 🚀 Next Steps

1. **Add your school data** - Use the admin dashboard
2. **Invite drivers** - Send them the PWA link
3. **Configure notifications** - Add Telegram/LINE tokens
4. **Test routes** - Create sample routes
5. **Monitor performance** - Check Vercel Analytics

---

## 🆘 Troubleshooting

### Build fails on Vercel

```bash
# Check build locally first
cd apps/web
pnpm build
```

### Service Worker not registering

- Check browser console for errors
- Verify manifest.json is accessible
- Must be served over HTTPS (Vercel does this automatically)

### Database connection fails

- Verify environment variables in Vercel
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)
- Verify RLS policies are applied

### Google Maps not loading

- Check API key restrictions
- Verify APIs are enabled
- Check browser console for errors

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

**Need help?** Check `DEPLOYMENT_FREE_TIER.md` for detailed architecture info.
