# 🚀 Turso Setup (30 seconds)

## What is Turso?
- SQLite database that works everywhere
- Edge-deployed (super fast)
- Zero config needed
- FREE tier: 500 databases, 1GB storage

## Setup Steps

### 1. Install Turso CLI
```bash
# Install globally
npm install -g @turso/cli

# OR use npx (no install needed)
npx @turso/cli --help
```

### 2. Login & Create Database
```bash
# Login to Turso
turso auth login

# Create your database
turso db create gdayai-support

# Get your database URL
turso db show gdayai-support
```

### 3. Add to Vercel
```bash
# Add environment variables to Vercel
vercel env add TURSO_DATABASE_URL production
# Paste the URL from step 2

vercel env add TURSO_AUTH_TOKEN production
# Get token with: turso db tokens create gdayai-support
```

### 4. Deploy
```bash
# Deploy to Vercel
vercel --prod
```

## That's it! ✅

Your database is now running on Turso's edge network.

## Alternative: Use Local SQLite (Zero Setup)
If you want ZERO setup, just deploy as-is. It will use the existing SQLite file in development mode.

## Even Simpler: JSON Files
Want something even simpler? I can convert this to use JSON files instead of any database. 