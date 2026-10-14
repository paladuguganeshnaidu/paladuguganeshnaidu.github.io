# Ganesh Naidu — AI engineering portfolio

Astro generates crawlable static HTML. The homepage displays the supplied original portrait file in a simple photo frame; the optional interactive Three.js constellation lives on /space/. The design uses sage, lavender, peach and soft blue. No server or hosted AI service is required.

## Local development

Use Node.js 22 or later.

- npm ci
- npm run dev
- npm run build
- npm run check
- npm run preview

## Content and routes

The previous project, lab, journey, research, certification and profile content is preserved in src/data/pages.json. Legacy .html addresses redirect to clean routes and retain query strings and fragments. /roadmap/ contains all 28 original phases (0–27), statuses, projects and depth guidance. /tuxnest/ is the portfolio's product page for TuxNest, created, owned and developed by Paladugu Ganesh Naidu. The official product website is https://tuxnest.pages.dev/ and the current source repository is https://github.com/paladuguganeshnaidu/tuxnest. The former /lomvren/ address redirects to /tuxnest/. /resume/ embeds and links the original provided PDF; its bytes are preserved.

Professional updates come from the supplied Profile.pdf: ClinchWorks, ToriiMinds, Red Hat Student Ambassador and the historical Google Student Ambassador role. The source snapshot is retained in src/data/legacy.json and src/data/roadmap-source.html. Edit pages.json and roadmap.json for ongoing content changes.

## Animation and accessibility

The optional Three.js journey constellation is separated onto /space/ and uses capped pixel density and frame rate, respects reduced motion, and suspends when the tab is hidden. The homepage itself does not mount the 3D AI scene. Pause preference persists locally. CSS infrastructure layers assemble with scroll. Navigation, project filters and roadmap disclosures are keyboard accessible. Core content works without JavaScript.

## Search and hosting

Canonical URLs, descriptions, social metadata, Person/WebSite/WebPage structured data, robots.txt and sitemap.xml support the existing custom domain. Person and SoftwareApplication structured data explicitly associate TuxNest with its creator, Paladugu Ganesh Naidu. Search engine crawling is supported; actual indexing is decided by search engines.

GitHub Pages deployment uses .github/workflows/deploy.yml and publishes dist. The repository Pages build source must be GitHub Actions. CNAME preserves paladuguganeshnaidu.tech. The existing static audit workflow builds and verifies the generated site.

## Original hardware imagery

NVIDIA RTX 5090: https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/
NVIDIA DGX Spark: https://www.nvidia.com/en-us/products/workstations/dgx-spark/

Original product images are attributed on the homepage. Hardware is illustrative; no endorsement, ownership of depicted equipment, or performance benchmark is implied. The TuxNest interface card is a clearly labeled workflow illustration, not a claim that the drawing is a pixel-perfect capture of the shipped interface.

The pre-existing /Ai-GenAi-Engineer/ address is served by a separate GitHub Pages project repository. The integrated portfolio roadmap uses /roadmap/ to avoid that routing conflict.

## Journey space and contact

/space/ contains an interactive Three.js constellation with selectable milestones, full journey content and links to all 28 roadmap phases. src/data/milestones.json is the experience source. The new portrait is supplied by the owner. Contact controls open a native accessible dialog with email and LinkedIn choices. TuxNest links point to the official product website and current GitHub source repository.
