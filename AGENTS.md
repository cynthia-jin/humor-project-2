# Humor Project 2

A Next.js 16 + Supabase app with a superadmin-only admin console for managing humor captions, images, humor flavors, LLM prompt chains, and user feedback (votes).

## Stack

- Next.js 16.1.6 (App Router, Turbopack), React 19.2.3, TypeScript
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Supabase: `@supabase/ssr` (server components/actions) + `@supabase/supabase-js`
- No test framework configured. Scripts: `npm run dev` / `build` / `start` / `lint`.

## Layout

- `app/` — App Router pages
  - `app/admin/` — admin console (sidebar nav in `layout.tsx`, dashboard in `page.tsx`)
  - `app/admin/[resource]/` — generic CRUD list/new/[id] pages driven by `lib/admin/adminCrudConfig.ts`
  - `app/admin/<custom>/` — bespoke admin pages (captions, images, users, humor-*, llm-*, caption-requests)
  - `app/login/`, `app/auth/` — auth flows
- `lib/`
  - `lib/auth.ts` — `requireSuperadmin()` gate; used at the top of every server component under `/admin`. Retries `profiles` lookup 3× to handle OAuth-cookie-before-profile-row races; redirects to `/login` on failure.
  - `lib/supabase/server.ts` — `createSupabaseServerClient()` for server components/actions
  - `lib/supabase/client.ts` — browser client
  - `lib/admin/adminCrudConfig.ts` — resource registry consumed by `app/admin/[resource]/*`; add a new resource entry to get list/new/edit pages for free
  - `lib/admin/adminCrudUtils.ts` — shared CRUD helpers
- `.env.local` — `NEXT_PUBLIC_SUPABASE_URL` + Supabase anon key

## Auth model

- `profiles.is_superadmin` gates the entire `/admin/*` tree.
- `profiles.id` matches `auth.users.id`. Profile row is created by DB triggers on signup.
- Every admin server component starts with `const { supabase } = await requireSuperadmin();`.

## Database (Supabase/Postgres) — key tables

Audit columns appear on most tables and are maintained by triggers `set_created_and_modified_by_user_ids` and `set_modified_datetime_utc`:
- `created_datetime_utc`, `modified_datetime_utc`
- `created_by_user_id`, `modified_by_user_id` (default `auth.uid()`)

Core tables seen in code:

- `profiles` — user profile (id, email, first_name, last_name, is_superadmin)
- `images` — (id uuid, url, is_public, is_common_use)
- `captions` — (id uuid, content, is_public, is_featured, profile_id, image_id, humor_flavor_id, caption_request_id, llm_prompt_chain_id, like_count bigint)
  - `like_count` is a denormalized counter maintained by trigger `trg_caption_like_counter` on `caption_votes`
  - Index `idx_captions_like_count_desc_id` supports top-N-by-likes queries
- `caption_votes` — (id bigint, caption_id uuid, profile_id uuid, vote_value smallint, is_from_study boolean)
  - Unique `(profile_id, caption_id)` — one vote per user per caption
  - Trigger `trg_caption_like_counter` updates `captions.like_count` on insert/update/delete
- `caption_requests`, `caption_examples`
- `humor_flavors`, `humor_flavor_steps`, `humor_flavor_step_types`, `humor_flavor_mix`
- `llm_providers`, `llm_models`, `llm_prompt_chains`, `llm_model_responses`, `llm_input_types`, `llm_output_types`
- `terms`, `term_types`
- `allowed_signup_domains`, `whitelist_email_addresses`

## Conventions

- Data access is server-side in Server Components via `createSupabaseServerClient()`; mutations live in inline `"use server"` actions (see `app/admin/layout.tsx` logout, `app/admin/[resource]/[id]/page.tsx`).
- Resource slugs in URLs use hyphens; `getCrudResourceConfig()` normalizes underscores/casing.
- Counts prefer `select('*', { count: 'exact', head: true })` (no row transfer).
- Tailwind dark admin skin: `admin-dark` class on `AdminLayout`; panels use `border-gray-800 rounded-xl bg-gray-900/20`.

## Known gotchas

- PostgREST has no `COUNT(DISTINCT)` or easy `GROUP BY` — for aggregations on the admin dashboard, either fetch raw rows (with `range(0, 49999)`) and aggregate in JS, or add a Postgres RPC. The caption-ratings stats on the dashboard currently use the in-JS approach; switch to an RPC if captions/votes exceed ~50k.
- `requireSuperadmin()` redirects to `/login` on either missing session *or* missing superadmin flag — don't use it for non-superadmin-gated pages.
