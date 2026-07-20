# RIGID Steel & Glass — Setup & Handoff

A fast portfolio site with a photo dashboard so **Noah can add project photos
himself — no code, and without redeploying the site.**

- **Built with:** Astro (static) + Tailwind.
- **Photos & logo:** Supabase Storage, loaded in the browser at page load.
- **Dashboard:** `yoursite.com/admin`.
- **Hosting:** Netlify free tier.

**Why it works this way:** photos are *not* part of the build. Noah uploads to
Supabase, visitors fetch straight from Supabase. Netlify only rebuilds when the
code changes — so uploading photos costs zero build minutes.

---

## One-time Supabase setup

Project: `rigidsteelandglass` (`hqucdpebfvssjhhwvjli`).

### 1. Run this in the Supabase SQL Editor

Creates the public `gallery` bucket and locks writes to Noah's account.

```sql
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Anyone may view photos.
create policy "gallery public read"
  on storage.objects for select
  using (bucket_id = 'gallery');

-- Only Noah may add, replace, or delete them.
create policy "gallery admin write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery'
    and auth.jwt() ->> 'email' = 'rigidsteelandglass@gmail.com');

create policy "gallery admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'gallery'
    and auth.jwt() ->> 'email' = 'rigidsteelandglass@gmail.com');
```

### 2. Create Noah's login

Authentication → Users → **Add user** → email `rigidsteelandglass@gmail.com`,
set a password, tick *Auto Confirm*. Give Noah the password; he can change it
later from the same screen.

### 3. Turn off public signups

Authentication → Sign In / Providers → disable **Allow new users to sign up**.
Without this, anyone could create an account (they still couldn't upload — the
policies above check the email — but there's no reason to allow it).

---

## Deploying to Netlify

1. Push to GitHub.
2. Netlify → Add new project → Import from GitHub → pick this repo.
3. Build command `npm run build`, publish directory `dist` (already in
   `netlify.toml` — Netlify reads it automatically).
4. Deploy.

After that, **only code changes trigger builds.** Photo uploads never do.

---

## Noah's day-to-day

1. Go to `yoursite.com/admin`.
2. Sign in.
3. **Add project photos** — pick one or many; they appear on the site
   immediately (refresh to see them).
4. **Replace logo** — swaps the wordmark everywhere. Use a PNG or SVG with a
   transparent background.
5. **Delete** under any photo removes it from the site.

Newest photos show first. The home page shows the latest 6; `/work` shows all.

---

## Editing business details

Phone, email, service area, and the three service categories live in
`src/config.ts`. Changing those *is* a code change, so it triggers one Netlify
build — that's fine, it's rare.
