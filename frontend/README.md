# NovaCart Frontend

This folder contains the Next.js storefront and admin application for NovaCart. It powers the public shopping experience, account flows, and the branded admin interface.

## What is included

- Dark-theme storefront homepage and product browsing
- Product detail, cart, checkout, profile, and order pages
- Supabase authentication for login and registration
- Admin dashboard, product management, categories, customers, orders, and reports
- Local curated product media used across the catalog

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase JavaScript client

## Local development

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `frontend/.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Main folders

```text
frontend/
├── public/product-images/   # Local catalog and branding images
├── src/app/                 # App Router pages
├── src/components/          # UI, layout, and product components
├── src/lib/                 # Supabase, storefront, and media helpers
└── src/types/               # Shared TypeScript types
```

## Scripts

- `npm run dev` starts the local development server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run lint` checks the codebase with ESLint

## Notes

- The development script uses webpack mode for stability in local development
- `.env.local`, `.next`, and `node_modules` are intentionally ignored from Git
- Product image mapping lives in `src/lib/product-media.ts`
