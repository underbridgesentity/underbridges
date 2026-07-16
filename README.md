# Under Bridges — underbridges.co.za

Marketing website for **Under Bridges Entity (Pty) Ltd**, a Johannesburg-based creative and
digital studio. Built from the "Under Bridges Website v4" design (Claude Design project).

## Stack

Plain static HTML/CSS/JS — no framework, no build step, no dependencies. You own the code.

```
├── index.html              Home (scroll-scrubbed hero video)
├── services/index.html     Services — Creative / Digital / Events
├── about/index.html        About + founder
├── contact/index.html      Contact form + direct details
├── 404.html                Not-found page
├── assets/
│   ├── css/main.css        Full design system (chamfers, type, colors)
│   ├── js/main.js          Nav state, mobile menu, reveal, hero scrub, form
│   ├── ub-logo-*.svg       Brand logos (white/black)
│   ├── ub-icon-*.svg       Brand marks (white/black)
│   ├── ub-hero.mp4         Hero video (scrubbed by scroll position)
│   ├── joseph-mbedzi.jpg   Founder portrait (about page)
│   ├── clients/            Trusted-by logos, normalised to brand ink
│   └── og-image.png        Social share card (1200×630)
├── favicon.svg / .png      Orange brand mark
├── apple-touch-icon.png    White mark on dark
├── robots.txt / sitemap.xml
└── .nojekyll               Keeps GitHub Pages from running Jekyll
```

## Run locally

Any static file server works:

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

## Deploy

The site is host-agnostic static files.

- **Vercel** — import the GitHub repo at vercel.com/new, framework preset "Other",
  no build command, output directory `./`. Add the `underbridges.co.za` domain in
  the project settings and point DNS as instructed.
- **GitHub Pages** — repo Settings → Pages → deploy from `main` / root. Add the
  custom domain `underbridges.co.za` (this creates a `CNAME` file) and set an A/ALIAS
  record at your DNS host.
- **Cloudflare Pages / Netlify** — connect the repo, no build command, output `./`.

After launch: submit `https://underbridges.co.za/sitemap.xml` in Google Search Console
and create the Google Business Profile (see SEO checklist in the design handoff doc).

## Contact form — Resend via serverless function

The enquiry form posts to `/api/contact` ([api/contact.js](api/contact.js)), a Vercel
serverless function that validates the input (honeypot, lengths, email format) and
sends the enquiry through [Resend](https://resend.com) to `info@underbridges.co.za`,
from `website@portal.underbridges.co.za` (the domain verified in the Resend account)
with the visitor's address as reply-to.

- The Resend key lives in the **`RESEND_API_KEY` environment variable** on the Vercel
  project (Settings → Environment Variables) — never commit it to this public repo.
  If the key is ever exposed, rotate it in the Resend dashboard and update the env var.
- Verifying the apex `underbridges.co.za` in Resend (DNS records from their dashboard)
  would allow a cleaner from-address like `website@underbridges.co.za` — update the
  `from` field in `api/contact.js` if you do.
- If sending fails, the form shows an error with the direct email address instead of
  failing silently.
- Note: the local `python3 -m http.server` can't run the function — test form
  submissions on a Vercel deployment (or with `vercel dev`).

## Updating imagery

- **Founder photo** — `assets/joseph-mbedzi.jpg` (1020×1200, cropped for the about-page
  card). To replace it, export a portrait crop at roughly the same ratio and overwrite the file.
- **Client logos** — `assets/clients/*.png` are pre-processed to flat brand ink
  (`#1A1613`) on transparency and trimmed to their content box. To add one, process a new
  logo the same way and add an `<img class="clients__logo">` to the row in `index.html`
  (use the `--tall` / `--squat` / `--wide` modifier classes to optically match sizes).

## Security

- Security headers ship in two host-agnostic files: `vercel.json` (Vercel) and
  `_headers` (Netlify / Cloudflare Pages). They set a strict Content-Security-Policy
  (self-hosted everything; `connect-src` allows only FormSubmit), `nosniff`,
  `frame-ancestors 'none'`, a locked-down Permissions-Policy, and HSTS.
  **GitHub Pages cannot set custom headers** — prefer Vercel or Cloudflare Pages
  for the headers to apply.
- `/.well-known/security.txt` publishes the responsible-disclosure contact
  (expires 2027-07-15 — bump it yearly).
- The contact form has a honeypot field, native validation, and no secrets client-side.
  FormSubmit applies its own spam filtering and rate limits.
- No cookies, no analytics, no third-party requests except the form submission.

## Notes

- Fonts: [Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk) +
  [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif), self-hosted
  in `assets/fonts/` (latin subset, SIL Open Font License) — no Google Fonts requests.
- The hero video is fetched as a blob and scrubbed via `currentTime` as you scroll.
  For smoother scrubbing, re-encode the mp4 with a short keyframe interval
  (e.g. `ffmpeg -i in.mp4 -g 12 -crf 23 -movflags +faststart out.mp4`).
- Reduced motion is respected (`prefers-reduced-motion`): no reveal animations,
  static 100vh hero.
- The `/insights` section from the handoff doc (weekly AI-generated articles via
  GitHub Actions) is not built yet — it has its own build spec.
