# Mind Planning - Supabase & Clerk Setup Guide

This guide will walk you through setting up Supabase (database) and Clerk (authentication) for the Mind Planning application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Clerk Setup](#clerk-setup)
4. [Backend Configuration](#backend-configuration)
5. [Frontend Configuration](#frontend-configuration)
6. [Database Migration](#database-migration)
7. [Clerk Webhooks](#clerk-webhooks)
8. [Testing the Setup](#testing-the-setup)
9. [Deployment Checklist](#deployment-checklist)

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- A GitHub account (for Clerk social login, optional)
- A credit card (for Supabase - free tier available)

---

## Supabase Setup

### Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### Step 2: Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `mind-planning`
   - **Database Password**: Generate a strong password (⚠️ **SAVE THIS!**)
   - **Region**: Choose closest to your users
3. Click "Create new project"
4. Wait for the project to be provisioned (1-2 minutes)

### Step 3: Get Database Connection Strings

1. Go to **Project Settings** (gear icon) → **Database**
2. Scroll to **Connection string** section
3. Copy both connection strings:

#### Transaction Pooler (for the app - port 6543)
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Session Pooler / Direct (for migrations - port 5432)
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

⚠️ Replace `[PASSWORD]` with your database password.

---

## Clerk Setup

### Step 1: Create a Clerk Account

1. Go to [clerk.com](https://clerk.com)
2. Click "Start building for free"
3. Sign up with GitHub, Google, or email

### Step 2: Create a New Application

1. Click "Add application"
2. **Application name**: `Mind Planning`
3. **Sign-in options**: Select what you want:
   - ✅ Email
   - ✅ Google (recommended)
   - ✅ GitHub (recommended for dev tools)
4. Click "Create application"

### Step 3: Get API Keys

1. In your Clerk Dashboard, go to **API Keys**
2. Copy these keys:
   - **Publishable key**: `pk_test_...` (public, used in frontend)
   - **Secret key**: `sk_test_...` (secret, used in backend)

### Step 4: Configure Clerk Settings

1. Go to **User & Authentication** → **Email, Phone, Username**
   - Enable **Email address** (required)
   - Enable **Name** (recommended)

2. Go to **User & Authentication** → **Social Connections**
   - Enable **Google** and/or **GitHub** if desired
   - Follow the setup instructions for each

---

## Backend Configuration

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

### Step 3: Edit `.env` File

Open `backend/.env` and fill in your values:

```env
# ===========================================
# SUPABASE DATABASE
# ===========================================

# Connection pooling URL (for the app)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection URL (for migrations)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ===========================================
# CLERK AUTHENTICATION
# ===========================================

CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxx"

# (Optional) For webhooks - set up later
# CLERK_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"

# ===========================================
# SERVER
# ===========================================

PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Step 4: Install Dependencies

```bash
npm install
```

This will install:
- `@clerk/backend` - Clerk SDK for Node.js
- `@prisma/client` - Database ORM
- `express` - Web framework
- `svix` - Webhook verification
- `zod` - Validation

---

## Frontend Configuration

### Step 1: Navigate to Project Root

```bash
cd ..  # Back to project root
```

### Step 2: Create Environment File

```bash
cp .env.example .env.local
```

### Step 3: Edit `.env.local` File

```env
# ===========================================
# CLERK AUTHENTICATION
# ===========================================

VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# ===========================================
# BACKEND API
# ===========================================

VITE_API_URL=http://localhost:3001/api
```

### Step 4: Install Clerk Package

```bash
npm install @clerk/clerk-react
```

### Step 5: Update Main Entry Point

In `src/main.tsx`, change the import:

```tsx
// Change this:
import App from './App'

// To this:
import App from './AppWithClerk'
```

---

## Database Migration

### Step 1: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### Step 2: Push Schema to Database

For development (no migration files):
```bash
npx prisma db push
```

For production (with migration history):
```bash
npx prisma migrate dev --name init
```

### Step 3: Verify in Supabase

1. Go to Supabase Dashboard → **Table Editor**
2. You should see all your tables:
   - `User`
   - `Organization`
   - `Team`
   - `Project`
   - `MindMap`
   - `Node`
   - `NodeConnection`
   - etc.

### Step 4: (Optional) Open Prisma Studio

```bash
npx prisma studio
```

This opens a web UI to browse your database at `http://localhost:5555`.

---

## Clerk Webhooks

Webhooks sync user data from Clerk to your database automatically.

### Step 1: Start Your Backend

```bash
cd backend
npm run dev
```

### Step 2: Expose Local Server (for development)

Use ngrok or similar to expose your local server:

```bash
ngrok http 3001
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`).

### Step 3: Configure Webhook in Clerk

1. Go to Clerk Dashboard → **Webhooks**
2. Click "Add Endpoint"
3. **Endpoint URL**: `https://abc123.ngrok.io/api/webhooks/clerk`
4. **Events**: Select:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Click "Create"
6. Copy the **Signing Secret** (`whsec_...`)

### Step 4: Add Webhook Secret to Backend

Add to `backend/.env`:

```env
CLERK_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

### Step 5: Restart Backend

```bash
npm run dev
```

Now when users sign up via Clerk, they'll automatically be created in your database!

---

## Testing the Setup

### Step 1: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected
✅ Server running on http://localhost:3001
   Environment: development
   Frontend URL: http://localhost:5173
```

### Step 2: Start Frontend Dev Server

In a new terminal:
```bash
cd ..  # project root
npm run dev
```

### Step 3: Test Authentication

1. Open `http://localhost:5173`
2. You should see the Clerk sign-in page
3. Sign up with email or social login
4. After signing in, you should see the Dashboard

### Step 4: Verify User in Database

Check Prisma Studio or Supabase Table Editor:
- A new user should appear in the `User` table
- The `clerkId` should match your Clerk user ID

### Step 5: Test API Endpoints

Using curl or Postman:

```bash
# Get your session token from browser DevTools:
# Application → Cookies → __session

curl http://localhost:3001/api/me \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

---

## Deployment Checklist

### Backend Deployment (e.g., Railway, Render, Fly.io)

1. ✅ Set all environment variables in hosting platform
2. ✅ Use production Clerk keys (`sk_live_...`, `pk_live_...`)
3. ✅ Update `FRONTEND_URL` to production URL
4. ✅ Run `npx prisma migrate deploy` (not `db push`)
5. ✅ Set up production webhook endpoint in Clerk

### Frontend Deployment (e.g., Vercel, Netlify)

1. ✅ Set `VITE_CLERK_PUBLISHABLE_KEY` (production key)
2. ✅ Set `VITE_API_URL` to production backend URL
3. ✅ Add production domain to Clerk's allowed origins

### Clerk Production Setup

1. Go to Clerk Dashboard → **Production**
2. Switch to production mode
3. Configure your production domain
4. Update social login redirect URLs

### Supabase Production Setup

1. Consider upgrading from free tier for:
   - More database space
   - Automatic backups
   - Better connection limits
2. Set up Row Level Security (RLS) policies if using Supabase directly

---

## Troubleshooting

### "Missing VITE_CLERK_PUBLISHABLE_KEY"

Make sure you:
1. Created `.env.local` (not `.env`)
2. Prefixed the variable with `VITE_`
3. Restarted the dev server after adding the variable

### "Database connection failed"

Check:
1. Your DATABASE_URL is correct
2. The password doesn't have special characters that need escaping
3. You're using the correct port (6543 for pooler)

### "Invalid token" on API requests

1. Make sure the frontend is getting the token correctly
2. Check that `CLERK_SECRET_KEY` in backend matches your Clerk app
3. Verify the user exists in Clerk Dashboard

### User not appearing in database

1. Check webhook is configured correctly
2. Look at backend logs for errors
3. Verify the webhook secret is correct
4. Test the webhook in Clerk Dashboard (resend test event)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                       Frontend                          │
│                   (React + Vite)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ ClerkProvider│  │ AuthContext │  │  API Client │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          ▼                │                ▼
    ┌──────────┐           │         ┌──────────────┐
    │  Clerk   │           │         │   Backend    │
    │  Cloud   │◄──────────┘         │  (Express)   │
    └──────────┘                     │              │
          │                          │  ┌────────┐  │
          │ Webhooks                 │  │ Prisma │  │
          │                          │  └────┬───┘  │
          ▼                          └───────┼──────┘
    ┌──────────────────────────────────────┐ │
    │            Supabase                   │◄┘
    │         (PostgreSQL)                  │
    └──────────────────────────────────────┘
```

---

## Next Steps

1. **Set up CI/CD** - Automate deployments with GitHub Actions
2. **Add monitoring** - Use Sentry for error tracking
3. **Implement RLS** - Add Row Level Security in Supabase
4. **Add tests** - Write integration tests for auth flow
5. **Configure rate limiting** - Protect your API endpoints

---

## Support

- **Clerk Documentation**: [clerk.com/docs](https://clerk.com/docs)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Prisma Documentation**: [prisma.io/docs](https://www.prisma.io/docs)
