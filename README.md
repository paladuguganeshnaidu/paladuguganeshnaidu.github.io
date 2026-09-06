# Portfolio — Paladugu Ganesh Naidu

A static, single-page portfolio for **Paladugu Ganesh Naidu** — positioned around
Generative AI engineering, applied machine learning, deep-learning foundations,
and cybersecurity.

Built with plain HTML, CSS and JavaScript (no framework, no build step) and
deployed on GitHub Pages behind the custom domain `paladuguganeshnaidu.tech`.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
npx serve .
```

## Project structure

```
index.html      — content, semantic structure & SEO metadata
css/style.css   — light editorial theme, opening-loader + reveal system, responsive
js/main.js      — loader, neural/3D canvas background, nav, scroll reveals, live stat
robots.txt      — crawl rules + sitemap pointer
sitemap.xml     — sitemap for search engines
images/         — profile photos, role logos
logos/          — tool + certification logos
```

## Design direction

- **Theme:** editorial light-minimal — warm paper canvas, hairline rules, big
  Space Grotesk type, with a restrained **AI violet** + **security cyan** accent pair.
- **Motion:** an opening percentage loader that reveals the page, masked line-rise
  hero entrance, staggered scroll reveals, an infinite marquee, and a live ambient
  background (drifting soft orbs, a faint neural constellation and a rotating
  3D wireframe orb on `<canvas>`).
- **Accessibility:** respects `prefers-reduced-motion`; semantic landmarks, one `h1`,
  skip-link, labelled sections, descriptive image alt text.

## SEO notes

- Single `h1`, semantic `section`/`article`/`header`/`footer` landmarks.
- Clean `<title>` + meta description (~155 chars), canonical URL.
- Open Graph + Twitter card tags for social sharing.
- `Person` + `WebSite` JSON-LD with `sameAs` profile links, employer, education,
  skills and location.
- `robots.txt` and `sitemap.xml` shipped at the site root.
- No keyword-stuffing meta tags; relevance comes from real, descriptive content.

## Deploying to GitHub Pages

1. Push the contents of this folder to the root of your `<username>.github.io`
   repository (or any repo, then enable Pages under Settings → Pages).
2. Keep the `CNAME` file if you use the custom domain `paladuguganeshnaidu.tech`
   (delete it to use the default `github.io` URL).
3. GitHub Pages serves `index.html` at the root automatically — no build step.
