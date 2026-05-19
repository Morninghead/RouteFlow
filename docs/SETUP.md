# Setup Guide

## Prerequisites

- Node.js 18+ and pnpm 8+
- Docker (for local Supabase)
- Firebase project
- Google Cloud project (Maps API)
- Telegram Bot Token (optional, per-school)
- LINE Official Account (optional, per-school)

## 1. Install Dependencies

```bash
cd "x:\B2B AI Saas\ShcoolBusRouteArranger"
pnpm install
```

## 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication → Phone provider
3. Add a web app and copy credentials
4. Generate a service account key (Project Settings → Service Accounts)

## 3. Supabase Setup

### Option A: Local Development (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
cd supabase
supabase start

# Note the API URL and anon key from output
```

### Option B: Supabase Cloud

1. Create project at https://supabase.com
2. Copy API URL and anon key from Settings → API

## 4. Google Maps Setup

1. Go to https://console.cloud.google.com
2. Enable APIs:
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
   - Geocoding API
   - Places API
3. Create API key with restrictions

## 5. Environment Variables

Copy `.env.example` to `.env.local` in `apps/web/`:

```bash
cp .env.example apps/web/.env.local
```

Fill in all values:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
FIREBASE_ADMIN_PROJECT_ID=your-project
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 6. Database Migration

```bash
# If using local Supabase
cd supabase
supabase db reset

# If using Supabase Cloud
supabase link --project-ref your-project-ref
supabase db push
```

## 7. Seed Development Data

```bash
# Local
supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres

# Cloud
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/seed/dev_seed.sql
```

## 8. Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000

## 9. Test Accounts

After seeding, you can log in with:

- **SuperAdmin**: Firebase UID `demo_superadmin_uid` (phone: +66812345678)
- **Admin**: Firebase UID `demo_admin_uid` (phone: +66812345679)
- **Driver**: Firebase UID `demo_driver_uid` (phone: +66812345680)
- **Parent**: Firebase UID `demo_parent_uid` (phone: +66812345682)

## 10. Per-School Configuration

### Telegram Bot

1. Create bot via @BotFather
2. Get bot token
3. Add to school config in Admin dashboard

### LINE Official Account

1. Create LINE OA at https://manager.line.biz
2. Enable Messaging API
3. Get Channel Access Token and Secret
4. Add to school config in Admin dashboard

## Troubleshooting

### Port Conflicts

If ports 3000, 54321-54323 are in use:

```bash
# Change Next.js port
pnpm dev -- -p 3001

# Change Supabase ports in supabase/config.toml
```

### Firebase Auth Errors

- Ensure Phone Auth is enabled in Firebase Console
- Add localhost to authorized domains
- Check service account key format (newlines as `\n`)

### Supabase Connection Errors

- Verify `NEXT_PUBLIC_SUPABASE_URL` matches `supabase status` output
- Check RLS policies are applied (run migrations)

### Google Maps Not Loading

- Verify API key has all required APIs enabled
- Check browser console for specific API errors
- Add localhost to API key restrictions

## Next Steps

- [Admin Guide](./ADMIN_GUIDE.md)
- [Driver Guide](./DRIVER_GUIDE.md)
- [Parent Guide](./PARENT_GUIDE.md)
