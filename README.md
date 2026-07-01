# NovaCart

NovaCart is a premium dark-theme ecommerce platform built with Next.js, Supabase, and FastAPI. It combines a polished storefront, customer shopping flow, admin management tools, and a recommendation-ready backend in one repository.

## Overview

NovaCart includes:

- Customer authentication, browsing, search, cart, checkout, profile, and order history
- Admin tools for products, categories, customers, orders, and reporting
- A branded dark editorial storefront with custom UI components and curated local product media
- Supabase-backed catalog, auth, and commerce data
- A Python backend for recommendation and scraping workflows

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Python FastAPI |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Styling | Tailwind CSS, custom motion-driven components |
| Data | SQL migrations under `supabase/migrations` |

## Repository structure

```text
capstone/
├── frontend/        # Next.js storefront and admin app
├── backend/         # FastAPI backend and scraping utilities
├── supabase/        # SQL migrations and admin setup
├── Product_Recommendations.pdf
└── README.md
```

## Main features

### Storefront

- Dark luxury homepage and collection browsing
- Product listing and product detail pages
- Registration and login with Supabase auth
- Cart, checkout, profile, and order history

### Admin

- Dashboard overview
- Product create, edit, and catalog management
- Category management
- Order and customer management
- Reports view

### Data and backend

- Supabase schema and seed migrations
- Stable product code support
- Recommendation-oriented backend structure in `backend/`
- Scraper utilities for catalog and competitor workflows

## Local setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- Git
- A Supabase project

### 1. Install frontend dependencies

```powershell
cd frontend
npm install
```

### 2. Configure environment variables

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run database migrations

Apply the SQL files inside `supabase/migrations` to your Supabase project in order.

### 4. Start the frontend

```powershell
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Start the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Build

```powershell
cd frontend
npm run build
```

## Supabase notes

- Auth, users, products, variants, cart, orders, analytics, and wishlist data are managed through Supabase
- Schema updates live in `supabase/migrations`
- Admin helper SQL is included in `supabase/admin-setup.sql`

## Deployment

### Frontend

Deploy `frontend/` to Vercel and add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend

Deploy `backend/` to Railway, Render, or any FastAPI-compatible host using:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Database

Use Supabase as the hosted database and auth provider.

## Notes

- Local environment files are ignored from Git
- Frontend build output and dependencies are excluded from version control
- Product imagery in `frontend/public/product-images` is intentionally stored locally for consistent catalog presentation
