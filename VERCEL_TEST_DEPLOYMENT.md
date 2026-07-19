# NovaCart Vercel test deployment

This guide is for putting the current NovaCart project online for friends-and-family testing.

## What goes where

- `frontend/` deploys to Vercel
- `Supabase` stays as the hosted database and auth backend
- `backend/` is optional for now and does not need to be deployed for the main storefront test

## Before deployment

1. Create a separate Supabase project for testing
2. Run these migrations in order:
   - `001_initial_schema.sql`
   - `002_product_catalog.sql`
   - `003_fix_admin_policy_recursion.sql`
   - `004_sync_auth_users.sql`
   - `005_checkout_and_customer_write_policies.sql`
   - `006_product_codes_and_catalog_expansion.sql`
   - `007_review_language_and_rating_sync.sql`
3. Add an admin user in Supabase Auth
4. Promote that user to `admin` in the `users` table if needed

## Vercel setup

1. Go to [Vercel](https://vercel.com)
2. Import the GitHub repository
3. Set the root directory to `frontend`
4. Keep the framework preset as `Next.js`
5. Add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy

## Important note

The current project already works as a Vercel + Supabase app for testing. The Python backend is not required for the core ecommerce flow right now.

## Recommended testing mode

- Use `Cash on Delivery` only
- Share the link privately with friends and family
- Use the deployed site to collect:
  - registrations
  - cart activity
  - test orders
  - product reviews

## After deployment

Test these flows on the live URL:

1. Register
2. Login
3. Browse products
4. Open a product
5. Add to cart
6. Checkout
7. View orders
8. Leave a review
9. Login as admin
10. Check products, customers, orders, and reports
