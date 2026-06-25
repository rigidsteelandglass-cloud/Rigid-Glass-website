# Noah's Showers — Setup & Handoff Guide

A fast, good-looking portfolio site for Noah's shower & bathroom work, with a
simple photo dashboard so **Noah can add new projects himself — no code, no
Claude needed.**

- **Built with:** Astro (static site) + Tailwind. Fast, free to host, great with photos.
- **Photos managed by:** Sveltia CMS — a clean dashboard at `yoursite.com/admin`.
- **Hosting:** Netlify free tier (no credits, no charges).

---

## What's already done (on this computer)

- ✅ Full site: Home, Work (portfolio), project detail pages, About, Contact.
- ✅ Contact form (emails Noah automatically via Netlify Forms).
- ✅ Photo dashboard wired up at `/admin`.
- ✅ Sample projects + placeholder photos so it looks full from day one.

You're looking at it locally right now. The steps below take it live.

---

## Step 1 — Put Noah's real info in (2 min)

Open **`src/config.ts`** and edit the values at the top:

```ts
businessName: "Noah's Showers",
owner: 'Noah',
tagline: 'Custom showers & bathroom remodels, done right',
serviceArea: 'the local area',   // e.g. 'Greater Springfield'
phone: '(555) 555-1234',          // <-- Noah's real number
email: 'noah@example.com',         // <-- Noah's real email
```

That one file updates the whole site (header, footer, contact page, SEO).

---

## Step 2 — Go live (do this WITH Noah, ~15 min)

Everything lands under **Noah's own accounts** so the site is truly his.

### 2a. Noah makes two free accounts
1. **GitHub** → https://github.com/signup
2. **Netlify** → https://app.netlify.com/signup (he can "Sign up with GitHub" — easiest)

### 2b. Create the repo and push (you, on this computer)
1. On GitHub, Noah creates a new **empty** repo named `noahs-showers` (no README).
2. Back here, connect and push:
   ```bash
   git add -A
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<noahs-username>/noahs-showers.git
   git push -u origin main
   ```

### 2c. Deploy on Netlify
1. Netlify → **Add new site → Import an existing project → GitHub** → pick `noahs-showers`.
2. Netlify auto-detects Astro (build `npm run build`, publish `dist`). Click **Deploy**.
3. In ~1 minute it's live at something like `random-name.netlify.app`.
4. **Site settings → Change site name** → set it to `noahs-showers` (→ `noahs-showers.netlify.app`).

> Update the URL in two files once you know the final one:
> `astro.config.mjs` (`site:`) and `public/admin/config.yml` (`site_url`/`display_url`).
> Then commit + push. (A custom domain like `noahsshowers.com` can be added later in
> Netlify → Domain settings, ~$12/yr.)

---

## Step 3 — Turn on the photo dashboard (one-time, ~10 min)

This is what lets Noah log in at `/admin` and add photos. It uses **Netlify's
built-in GitHub login** — no extra servers, nothing to maintain.

1. **Tell the dashboard which repo it edits.** Open `public/admin/config.yml`,
   set:
   ```yaml
   repo: <noahs-username>/noahs-showers
   ```
   Commit + push.

2. **Create a GitHub OAuth app** (this is the "login" connector):
   - GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
   - Application name: `Noahs Showers CMS`
   - Homepage URL: `https://noahs-showers.netlify.app`
   - **Authorization callback URL:** `https://api.netlify.com/auth/done`
   - Register, then copy the **Client ID** and generate a **Client Secret**.

3. **Give Netlify those keys:**
   - Netlify → your site → **Site configuration → Access & security → OAuth →
     Install provider → GitHub** → paste the Client ID + Secret → Save.

4. **Done.** Go to `https://noahs-showers.netlify.app/admin`, click
   **Login with GitHub**, and the dashboard opens.

---

## Step 4 — How Noah adds a new project (the whole point!)

Send Noah this:

1. Go to **`noahs-showers.netlify.app/admin`** and click **Login with GitHub**.
2. Click **Projects → New Project**.
3. Fill in:
   - **Project title** (e.g. "Walk-in tile shower")
   - **Location** (optional)
   - **Date completed**
   - **Short description** (1–2 sentences)
   - **Main photo** — drag in the best photo
   - **More photos** — add as many as he likes
   - **Show on home page?** — toggle on for favorites
4. Click **Publish**.

That's it. The site rebuilds itself and the new project is live in about a
minute. No code, no Claude, no waiting on anyone.

> **Tip:** phone photos are large. Noah doesn't need to resize them, but smaller
> files publish faster. The free tiers handle hundreds of photos easily.

---

## Step 5 — The QR code

Once the final URL is set, generate a QR code pointing to it (for business
cards, truck magnet, job-site signs). Free options:
- https://www.qr-code-generator.com or any "URL to QR" site → enter
  `https://noahs-showers.netlify.app` → download the PNG/SVG.

(Or ask Claude Code to generate one into this repo — it can.)

---

## Costs — all free

| Thing | Tier | Limit | Enough? |
|---|---|---|---|
| Netlify hosting | Free | 100 GB bandwidth/mo, 300 build min/mo | Yes, by a mile |
| Netlify Forms | Free | 100 submissions/mo | Yes |
| GitHub | Free | unlimited public repos | Yes |
| Photos | stored in repo | hundreds, auto-cached | Yes |

The only optional paid thing is a **custom domain** (~$12/yr) if Noah wants
`noahsshowers.com` instead of the free `.netlify.app` address.

---

## Replacing the placeholder photos

The teal/gray tiled images are placeholders. They vanish naturally as Noah adds
real projects in `/admin`. To swap the **About-page portrait**, replace
`public/images/uploads/noah.svg` with a real photo (keep a similar name or update
the path in `src/pages/about.astro`).

---

## Running it locally again (for you)

```bash
npm install      # first time only
npm run dev      # open http://localhost:4321
```
