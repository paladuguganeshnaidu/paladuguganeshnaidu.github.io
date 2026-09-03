# Portfolio — Paladugu Ganesh Naidu

A static HTML, CSS, and JavaScript portfolio positioned around GenAI
engineering, applied machine learning, deep learning foundations, and
cybersecurity.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static
server.

Example with Node:

```bash
npx serve .
```

## Edit content

All portfolio content lives in `index.html` so it can be updated without a
build step.

Main files:

- `index.html`: content, structure, and SEO metadata (title, description,
  keywords, Open Graph, JSON-LD)
- `css/style.css`: dark theme, layout, 3D tilt-card system, responsive design
- `js/main.js`: menu behavior, scroll progress, scroll-reveal animations,
  active nav state, back-to-top, 3D tilt-on-hover for cards, the three.js
  hero background, and a best-effort live LeetCode stat fetch

## Design direction

- Palette: near-black background with violet, cyan, and magenta neon
  accents
- Style: glass cards with a cursor-tracking spotlight glow, gradient text,
  monospace accents for labels/eyebrows
- 3D: a rotating three.js wireframe + particle field in the hero, plus a
  perspective-based tilt interaction on every card (mouse-move
  rotateX/rotateY, disabled under `prefers-reduced-motion`)
- Motion: scroll reveals with a subtle 3D rotate-in, hero typewriter,
  progress indicator, smooth menu transitions

## Deploying to GitHub Pages

1. Push the contents of this folder to the root of your
   `<username>.github.io` repository (or any repository, then enable Pages
   in Settings → Pages).
2. Keep the `CNAME` file if you're using the custom domain
   `paladuguganeshnaidu.tech`; delete it if you're using the default
   `github.io` URL.
3. GitHub Pages serves `index.html` at the root automatically — no build
   step required.
