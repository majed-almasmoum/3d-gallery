# Majed 3D Portfolio V2

Next.js App Router rebuild of the original 3D printing portfolio, with the same
Arabic home page, gallery, admin upload flow, and Supabase-ready database and
storage API routes.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and
   `ADMIN_PASSWORD`.
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Keep the storage bucket name as `images`, or update `SUPABASE_STORAGE_BUCKET`.
   Uploaded files are stored under `SUPABASE_STORAGE_PREFIX`.

Without Supabase env variables, the gallery falls back to the copied local
images and `data/works.json`, so the site is viewable immediately.
