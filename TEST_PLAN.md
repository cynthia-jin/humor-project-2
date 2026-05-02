# Project 2 — Test Plan

**App:** Humor Admin (humor-project-2)
**Flows:** Auth → Dashboard → CRUD → Custom resource pages → Image upload/replace
**Stack:** Next.js 16 (App Router, Turbopack), Supabase SSR auth + Storage, superadmin gate

## Pre-flight

| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npm run lint` | pass |
| `npm run build` | pass (17/17 routes) |

## plan

`npm run dev`, open http://localhost:3000. Run 3× across browsers (signed-out / non-superadmin / superadmin sessions).

### Auth
1. Signed-out → `/admin` redirects to `/login`. Login page shows the dark card, not a debug button.
2. Sign in as a non-superadmin → `/admin` redirects back to `/login` (gate trips on `is_superadmin = false`).
3. Sign in as superadmin → lands on `/admin` dashboard. Sidebar shows email; current page is highlighted indigo with a left-border accent.
4. Click **Logout** → session cleared, back to `/login`.

### Dashboard
5. **Platform** stat tiles render (Users, Images, Captions, LLM Models/Providers, Terms, Whitelist Emails, Avg captions/image). 4-col grid, no overflow.
6. **Caption ratings** stats render. Histograms (Likes per caption, Vote value distribution) draw correctly. Top-rated captions and Humor flavors tables show data with formatted timestamps.
7. **Recent activity** tables (users, images, captions) render with `Apr 30, 2025, 2:24 PM`-style timestamps, hover for full ISO.

### Sidebar nav
8. Five group labels visible (Overview / Content / Humor System / LLM / Config). Each link works; active route is highlighted; tab-key navigation shows focus rings.

### Generic CRUD (test on `terms` and `llm-models`)
9. `/admin/terms` → list table with zebra striping, sticky header, truncated UUIDs (mono, with tooltip), formatted timestamps.
10. **New** → required fields show red `*`. Submit button shows "Creating…" + disables during round-trip. Row inserted, redirect to list.
11. **Edit** → form pre-populates. ID is a small subtitle under the H1 (not a heavy panel). Save → "Saving…" → redirect.
12. **Delete** in Danger zone → confirm dialog → row removed.
13. Visit `/admin/foo` (unknown slug) → friendly "Unknown admin resource" page lists known slugs.

### Custom pages — verify joins (was 8/10 rubric gap)
14. `/admin/captions` → each row shows image thumb, author **email** (not UUID), flavor **slug** (not UUID).
15. `/admin/caption-requests` → requester **email**, image thumb, "Captions generated: N" matches actual joined count.
16. `/admin/llm-responses` → header reads `OpenAI / gpt-4o-mini` (provider/model joined). System / User / Model Response are `<details>` collapsibles with char counts.
17. `/admin/llm-prompt-chains` → "Chain for *email*" with "Responses: N" count.
18. `/admin/users` → Yes/No flags render as colored pills, not plain text.

### Images flow (rebuilt)
19. `/admin/images` → 3-col grid with status pills. Whole card is the link; tab-key shows focus ring.
20. **New Image** → "Upload image" file picker is the primary CTA. Pick `.png` / `.jpg` → Create → uploads to Storage → row appears in grid.
21. **New Image** → submit empty (no file, no URL) → server throws "Provide either an uploaded image file or a URL."
22. **New Image** → expand "Use external URL instead" → paste URL → Create → row inserted.
23. **Edit Image** → page header shows current image preview card (thumb + URL + status pills). "Replace image" file input is the only visible primary action; URL is hidden behind disclosure.
24. **Edit Image** → pick a new file → Save → `images.url` updated to new public URL; old file remains in Storage.
25. **Edit Image** → expand "Use external URL instead" → change URL → Save (no file) → URL field wins. Submit *both* a file and a URL → file wins (matches helper text).
26. **Delete Image** in Danger zone → confirm → row removed.

**Pass criteria:** all 26 green; no console errors; tab-key nav has visible focus everywhere; long prompts collapse; URLs/captions don't break mid-word.

## Post-testing summary

- Tested all flows end-to-end across 3 superadmin sessions; no console errors on final pass.
- **Bug:** non-dashboard admin pages (captions, caption-requests, users, images, humor-*, llm-*) used light-mode classes (`text-gray-500`, `bg-gray-50`, plain `border`, `bg-black` buttons) on top of the forced-dark `admin-dark` skin — cards near-invisible, form inputs near-white. Fixed across all custom pages and the generic CRUD pages.
- **Bug:** four resource pages (captions, caption-requests, llm-responses, llm-prompt-chains) queried one table and rendered raw FK UUIDs (`Image ID: 7c4f…`, `Model: 12`). Joined each to its related tables — captions now shows image thumb + author email + flavor slug; llm-responses now shows `Provider / Model` and resolved flavor/step labels. Closed the rubric gap on "data from multiple tables/charts."
- **Bug + UX:** Edit form had a "Refresh" button that was a dead link to the same URL. Replaced with **Cancel** → list. Standardized Save/Cancel layout across all five forms.
- **Bug + UX:** Edit Image form showed a file picker AND a pre-filled Image URL field with no indication they were alternatives — confusing. Rebuilt around a current-image preview card; "Replace image" is the primary CTA; the URL field is hidden behind a "Use external URL instead (advanced)" disclosure. Applied the same pattern to New Image.
- **Bug:** `<input type="file">` and form inputs had no visible focus ring on the dark background — keyboard nav untraceable. Added shared `focus-visible:ring-2 focus-visible:ring-indigo-500` via [lib/admin/styles.ts](lib/admin/styles.ts), applied across every form.
- **Bug:** server-action submit buttons had no pending state, allowing accidental double-submits. Built [`<SubmitButton>`](app/admin/SubmitButton.tsx) with `useFormStatus` — disables and shows "Saving…" / "Creating…" during the round-trip.
- **Bug:** delete button had no confirm step. Wrapped in [`<DeleteConfirmButton>`](app/admin/DeleteConfirmButton.tsx) with `window.confirm()` and moved into a "Danger zone" section below a separator.
- **Bug:** dashboard `xl:grid-cols-8` packed 8 stat tiles into one row; numbers crowded against labels. Reflowed to `lg:grid-cols-4`. Added `Platform` h2 to mirror "Caption ratings."
- **Bug:** raw ISO timestamps (`2025-04-30T18:24:51.123456+00:00`) rendered everywhere. Added [`formatTimestamp()`](lib/admin/format.ts) → `Apr 30, 2025, 2:24 PM` with full ISO in `title=` tooltip; applied to every list page and the dashboard recent-activity tables.
- **Bug:** `break-all` on emails / URLs / captions broke text mid-word. Swapped for `truncate` (URLs / emails, with tooltip) or `line-clamp-2` (captions).
- **Bug:** long LLM prompts in `<pre>` blocks ran unbounded down the page. Wrapped each prompt in `<details>` with a char-count summary and a `max-h-64 overflow-auto` scroll container.
- **Bug:** sidebar had no active-state highlighting and used empty `h-3` divs as section dividers. Split into [AdminSidebarNav](app/admin/AdminSidebarNav.tsx) client component with five labeled groups (Overview / Content / Humor System / LLM / Config) and `usePathname()`-driven active-route highlighting.
- **Bug:** login page had eight `console.log("STEP N: …")` lines and `alert()` for errors. Stripped debug; restyled as a centered dark card with inline error panel.
- **Verified:** auth gated at the page level via `requireSuperadmin()` (3-retry profile lookup handles the OAuth-cookie-before-profile-row race); image upload writes to Storage with `upsert: false` (re-uploading same path raises an error rather than silently overwriting); `caption_votes` trigger correctly maintains `captions.like_count` (verified by checking dashboard "Top-rated" reordering after a vote).
- **Deferred:** dashboard caption-ratings analytics fetch up to 50k rows and aggregate in JS (PostgREST has no `COUNT(DISTINCT)` / `GROUP BY`). At ~50k votes/captions this should migrate to a Postgres RPC. Documented in [CLAUDE.md](CLAUDE.md).
- **Demo-ready.**
