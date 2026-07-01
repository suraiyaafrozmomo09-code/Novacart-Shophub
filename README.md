# ShopHub - Amazon-Style E-Commerce Website
## Complete Capstone Project Guide

### Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Installation Guide](#installation-guide)
5. [Folder Structure](#folder-structure)
6. [Database Setup](#database-setup)
7. [Running the Project](#running-the-project)
8. [Admin Access](#admin-access)
9. [Deployment](#deployment)
10. [Next Steps](#next-steps)

---

## Project Overview

ShopHub is a full-featured e-commerce platform with:
- **Customer Features**: Registration, Login, Browse, Search, Filter, Cart, Checkout (COD + Online), Orders
- **Admin Features**: Dashboard, Product CRUD, Category Management, Order Management, Sales Reports
- **Product Recommendation Engine** (Python FastAPI) - Content-Based, Collaborative Filtering, Hybrid
- **Web Scraper** (BeautifulSoup/Selenium) - Competitor price tracking
- **User Analytics** - Search logs, Clickstream tracking

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Python FastAPI (Recommendations & Scraping) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |

---

## Prerequisites

Before you begin, install these tools on your machine:

1. **Node.js 18+** - https://nodejs.org/en/download/
   - Verify: `node --version`
2. **Python 3.10+** - https://www.python.org/downloads/
   - Verify: `python --version`
3. **Git** - https://git-scm.com/downloads
   - Verify: `git --version`
4. **VS Code** - https://code.visualstudio.com/download
5. **Supabase Account** - https://supabase.com (Free tier is enough)

---

## Installation Guide

### Step 1: Open VS Code

1. Open VS Code
2. Go to **File > Open Folder**
3. Navigate to: `C:\Users\MRCS\OneDrive\Documents\capstone`
4. Click **Select Folder**

Or run this in PowerShell:
```powershell
cd C:\Users\MRCS\OneDrive\Documents\capstone
code .
```

### Step 2: Create Supabase Project

1. Go to **https://supabase.com**
2. Click **Start your project**
3. Sign in with GitHub or email
4. Click **New project**
5. Enter project name: `shophub`
6. Set a strong database password (save it somewhere)
7. Select region closest to you (e.g., Asia Pacific)
8. Click **Create new project**
9. Wait for setup to complete (~2 minutes)

### Step 3: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon, bottom left)
2. Click **API**
3. Copy these two values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 4: Configure Frontend Environment

1. In VS Code, go to the `frontend` folder
2. Find the file `.env.local.example`
3. **Rename it** to `.env.local`
4. Open `.env.local` and paste your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

5. **Save the file** (Ctrl+S)

### Step 5: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Open the file `supabase/migrations/001_initial_schema.sql` from VS Code
4. Copy ALL the SQL content
5. Paste into the Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message: `Success. No rows returned`

### Step 6: Create Admin User

1. In Supabase dashboard, go to **Authentication**
2. Click **Users**
3. Click **Add user** > **Create new user**
4. Enter:
   - Email: `admin@shophub.com`
   - Password: `admin123`
5. Click **Create user**
6. Go back to **SQL Editor** and run this:

```sql
UPDATE users SET role = 'admin', full_name = 'Admin User' WHERE email = 'admin@shophub.com';
```

### Step 7: Install Frontend Dependencies

Open PowerShell in VS Code and run:

```powershell
cd frontend
npm install
```

### Step 8: Run the Development Server

```powershell
npm run dev
```

Open your browser and go to:
**http://localhost:3000**

You should see the ShopHub homepage!

---

## Folder Structure

```
capstone/
├── frontend/                          # Next.js Frontend App
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/               # Authentication pages
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── register/
│   │   │   │       └── page.tsx
│   │   │   ├── (customer)/           # Customer pages
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx      # Product listing
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx  # Product detail
│   │   │   │   ├── cart/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── checkout/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── orders/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx
│   │   │   ├── (admin)/              # Admin pages
│   │   │   │   ├── layout.tsx        # Admin sidebar layout
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx      # Product list
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx
│   │   │   │   ├── categories/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── orders/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── customers/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── reports/
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Homepage
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── header.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   └── supabase-provider.tsx
│   │   │   └── admin/
│   │   │       └── admin-layout.tsx
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── next.config.ts
│
├── backend/                           # Python FastAPI Backend
│   ├── app/
│   │   └── __init__.py
│   ├── scrapers/
│   │   ├── __init__.py
│   │   └── product_scraper.py
│   ├── main.py
│   └── requirements.txt
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
│
└── README.md                          # This file
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | Customer and admin profiles |
| `categories` | Product categories |
| `products` | Product master data |
| `product_variants` | Size/color variants with pricing |
| `cart` | Customer shopping carts |
| `orders` | Customer orders |
| `order_items` | Individual items in orders |
| `payments` | Payment records |
| `reviews` | Product ratings & comments |
| `search_logs` | User search queries (analytics) |
| `click_events` | User click tracking (analytics) |
| `wishlist` | Saved products |

### Key Relationships
```
categories (1) --- (n) products
products (1) --- (n) product_variants
users (1) --- (n) cart
users (1) --- (n) orders
orders (1) --- (n) order_items
products (1) --- (n) reviews
products (1) --- (n) click_events
products (1) --- (n) wishlist
```

---

## Running the Project

### Start Frontend (Development)
```powershell
cd frontend
npm run dev
```
Open: **http://localhost:3000**

### Start Backend (Recommendations + Scraping)
```powershell
# One-time setup
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```
API available at: **http://localhost:8000/docs**

### Build for Production (Frontend)
```powershell
cd frontend
npm run build
```

---

## Admin Access

| Role | Credentials | URL |
|------|-------------|-----|
| Admin | admin@shophub.com / admin123 | http://localhost:3000/admin/dashboard |

### Creating Admin Users

Run this in Supabase SQL Editor:
```sql
-- Make a user an admin
UPDATE users SET role = 'admin' WHERE email = 'admin@shophub.com';

-- View all admins
SELECT id, email, full_name, role FROM users WHERE role = 'admin';
```

---

## Deployment Guide

### Option 1: Deploy Frontend (Vercel)

1. Push your `frontend` folder to a GitHub repository
2. Go to **https://vercel.com**
3. Click **Add New Project**
4. Import your GitHub repository
5. Set **Root Directory**: `frontend`
6. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **Deploy**

### Option 2: Deploy Backend (Railway / Render)

1. Push your `backend` folder to GitHub
2. Go to **https://railway.app**
3. Click **New Project** > **Deploy from GitHub repo**
4. Select your backend repo
5. Railway auto-detects Python and installs requirements.txt
6. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option 3: Deploy Database (Supabase)

Supabase is already cloud-hosted. Just ensure:
- Your project is active
- Auth providers are enabled (Email)
- Storage bucket `product-images` exists

---

## Next Steps / Refinements for Supervisor

After your initial demonstration, consider these enhancements:

### Immediate Improvements
1. **Add real product images** to Supabase Storage
2. **Connect Python backend** to Supabase for live recommendations
3. **Implement actual scraping** with proper error handling
4. **Add email notifications** (order confirmations)
5. **Add payment gateway** (bKash, SSLCommerz)

### Advanced Features
1. **ML Recommendation Model** - Train with scikit-learn on real user data
2. **Redis caching** - Cache product listings and recommendations
3. **Full-text search** - Supabase PostgREST search or Elasticsearch
4. **Multi-vendor support** - Multiple sellers on one platform
5. **Mobile app** - React Native wrapper
6. **Admin analytics dashboard** - Advanced charts with Chart.js/Recharts
7. **Order tracking** - SMS notifications with logistics integration
8. **Review moderation** - Admin can manage reviews

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Run `npx kill-port 3000` then `npm run dev` |
| Supabase connection error | Check `.env.local` URL and key are correct |
| Images not loading | Add `images.unsplash.com` to `next.config.ts` `images.remotePatterns` |
| Auth not working | Check Supabase Auth providers are enabled in dashboard |
| TypeScript errors | Run `npm run typecheck` in frontend directory |

---

## Support

- **Kilo AI Docs**: https://kilo.ai/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

---

**Built as a Capstone Project for [Your University Name]**
