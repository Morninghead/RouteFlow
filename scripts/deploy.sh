#!/bin/bash

# School Bus Route Arranger - Deployment Script
# This script handles deployment to production

set -e

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN is not set"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run type checking
echo "🔍 Running type checks..."
pnpm run type-check

# Run linting
echo "✨ Running linter..."
pnpm run lint

# Build all packages
echo "🏗️  Building packages..."
pnpm run build

# Run database migrations
echo "🗄️  Running database migrations..."
cd supabase
npx supabase db push
cd ..

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod --token=$VERCEL_TOKEN

echo "✅ Deployment completed successfully!"
