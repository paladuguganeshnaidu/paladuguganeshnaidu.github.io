# Ganesh Naidu — AI engineering portfolio

Astro generates crawlable static HTML; Three.js adds a lazy-loaded floating AI scene. The design uses sage, lavender, peach and soft blue. No server or hosted AI service is required.

## Local development

Use Node.js 22 or later.

- npm ci
- npm run dev
- npm run build
- npm run check
- npm run preview

## Content and routes

The previous project, lab, journey, research, certification and profile content is preserved in src/data/pages.json. Legacy .html addresses redirect to clean routes and retain query strings and fragments. /Ai-GenAi-Engineer/ contains all 28 original phases (0–27), statuses, projects and depth guidance. /lomvren/ describes the product formerly called LocalForge, based on its public README. /resume/ embeds and links the original provided PDF; its bytes are preserved.

Professional updates come from the supplied Profile.pdf: ClinchWorks, ToriiMinds, Red Hat Student Ambassador and the historical Google Student Ambassador role. The source snapshot is retained in src/data/legacy.json and src/data/roadmap-source.html. Edit pages.json and roadmap.json for ongoing content changes.

## Animation and accessibility

The Three.js bundle is loaded on idle on the homepage only. It uses capped pixel density and frame rate, stops continuous rendering for reduced motion or manual pause, and suspends when the tab is hidden. No-WebGL and failed-module paths retain a static scene. Pause preference persists locally. CSS infrastructure layers assemble with scroll. Navigation, project filters and roadmap disclosures are keyboard accessible. Core content works without JavaScript.

## Search and hosting

Canonical URLs, descriptions, social metadata, Person/WebSite/WebPage structured data, robots.txt and sitemap.xml are generated for the existing custom domain. Search engine crawling is supported; actual indexing is decided by search engines.

GitHub Pages deployment uses .github/workflows/deploy.yml and publishes dist. The repository Pages build source must be GitHub Actions. CNAME preserves paladuguganeshnaidu.tech. The existing static audit workflow builds and verifies the generated site.

## Original hardware imagery

NVIDIA RTX 5090: https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/
NVIDIA DGX Spark: https://www.nvidia.com/en-us/products/workstations/dgx-spark/

Original product images are attributed on the homepage. Hardware is illustrative; no endorsement, ownership of depicted equipment, or performance benchmark is implied. The LOMVREN interface card is a clearly labeled workflow illustration.
