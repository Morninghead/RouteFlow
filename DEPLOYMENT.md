# Deployment Guide

This guide covers deploying the School Bus Route Arranger system to production.

## Prerequisites

- Vercel account (for web app hosting)
- Supabase project (production instance)
- Firebase project (production instance)
- Google Maps API key
- Telegram Bot Token (optional)
- LINE Official Account credentials (optional)

## Environment Setup

### 1. Vercel Configuration

Create a new Vercel project and link it to your repository:

```bash
npx vercel link
```

### 2. Environment Variables

Set the following environment variables in Vercel:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Notifications (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
LINE_CHANNEL_ACCESS_TOKEN=your_line_access_token
LINE_CHANNEL_SECRET=your_line_secret
```

### 3. Database Migration

Run Supabase migrations:

```bash
cd supabase
npx supabase db push --db-url your_production_db_url
```

### 4. Seed Data (Optional)

For initial setup, you may want to seed some data:

```bash
npx supabase db execute --file supabase/seed/prod_seed.sql
```

## Deployment Steps

### Automated Deployment

Use the provided deployment script:

```bash
chmod +x scripts/deploy.sh
VERCEL_TOKEN=your_token ./scripts/deploy.sh
```

### Manual Deployment

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build the project:**
   ```bash
   pnpm run build
   ```

3. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

## Post-Deployment

### 1. Verify Deployment

- Check that the web app is accessible
- Test authentication flow
- Verify database connections
- Test API endpoints

### 2. Configure Notifications

#### Telegram Bot Setup
1. Create a bot via @BotFather
2. Get the bot token
3. Set webhook (if needed)
4. Add token to environment variables

#### LINE Official Account Setup
1. Create a LINE Official Account
2. Get channel access token and secret
3. Set webhook URL
4. Add credentials to environment variables

### 3. Mobile App Deployment

#### Android
```bash
cd apps/driver
pnpm run cap:sync
pnpm run cap:open:android
# Build and publish via Android Studio
```

#### iOS
```bash
cd apps/driver
pnpm run cap:sync
pnpm run cap:open:ios
# Build and publish via Xcode
```

## Monitoring

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor performance and errors

### Supabase Monitoring
- Check database performance
- Monitor API usage
- Review logs for errors

### Firebase Monitoring
- Monitor authentication metrics
- Check for failed login attempts
- Review security rules

## Rollback

If issues occur, rollback to previous deployment:

```bash
npx vercel rollback
```

## Maintenance

### Database Backups
Supabase automatically backs up your database. Configure backup retention in Supabase dashboard.

### Updates
1. Test updates in staging environment
2. Run migrations if needed
3. Deploy to production
4. Monitor for issues

## Security Checklist

- [ ] All API keys are stored as environment variables
- [ ] Firebase security rules are properly configured
- [ ] Supabase RLS policies are enabled
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Authentication is required for protected routes
- [ ] Sensitive data is encrypted

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Check Firebase console
4. Contact support if needed
