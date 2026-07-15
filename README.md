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
│   ├── founder.svg         Placeholder portrait — replace (see below)
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

## Contact form — one-time activation required

The enquiry form posts to [FormSubmit](https://formsubmit.co/) (free, no account), which
forwards submissions to `joseph@underbridges.co.za`.

**The first submission from the live domain triggers a confirmation email to that
address — click the link in it once, and every submission after that is delivered.**
If FormSubmit is ever unreachable, the form shows an error with the direct email
address instead of failing silently. To switch providers later (Formspree, Basin, a
custom endpoint), change the URL in `assets/js/main.js` → the `fetch('https://formsubmit.co/...')` call.

## Replacing the founder photo

`about/index.html` currently shows a branded placeholder (`assets/founder.svg`).
Drop a portrait into `assets/` (e.g. `joseph.jpg`, portrait crop, ~680×800 or larger)
and update the `<img>` inside `.founder__photo` in `about/index.html`.

## Notes

- Fonts: [Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk) +
  [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) via Google Fonts.
- The hero video is fetched as a blob and scrubbed via `currentTime` as you scroll.
  For smoother scrubbing, re-encode the mp4 with a short keyframe interval
  (e.g. `ffmpeg -i in.mp4 -g 12 -crf 23 -movflags +faststart out.mp4`).
- Reduced motion is respected (`prefers-reduced-motion`): no reveal animations,
  static 100vh hero.
- The `/insights` section from the handoff doc (weekly AI-generated articles via
  GitHub Actions) is not built yet — it has its own build spec.
