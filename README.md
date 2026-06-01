# The Pepperazzi Website

A React + Vite starter site for a photography and videography business, ready to deploy on Cloudflare Pages.

## Images, Logo, and Video

Put the real SVG logo here:

```bash
public/brand/the-pepperazzi-logo.svg
```

Hero carousel media goes in:

```bash
public/media/hero/
```

Any supported image or video added to `public/media/hero/` is picked up automatically by the carousel during local development and at Cloudflare Pages build time. Prefix filenames to control order:

```bash
public/media/hero/01-wedding-ceremony.webp
public/media/hero/02-family-session.webp
public/media/hero/03-showreel.mp4
public/media/hero/03-showreel-poster.webp
```

Files inside `public` are served from the site root, so `public/media/hero/01-wedding-ceremony.webp` is referenced as `/media/hero/01-wedding-ceremony.webp`.

Portfolio media goes in:

```bash
public/media/portfolio/
```

The portfolio gallery automatically scans that folder. Start filenames with a filter tag:

```bash
public/media/portfolio/wedding-james.webp
public/media/portfolio/pets-black-lab.webp
public/media/portfolio/family-smith-session.webp
public/media/portfolio/commercial-brand-film.mp4
```

## Local Development

```bash
npm install
npm run dev
```

## Cloudflare Pages

Use these settings when creating the Pages project:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

The site includes `public/_redirects` for single-page app routing and `public/_headers` for a small set of production headers.
