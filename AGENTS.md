# AGENTS.md

Astro 7 + TypeScript (strict) + Tailwind v4 single-package site: Spanish-language
marketing site for Diagonal Studios. No monorepo, no tests, no linter, no CI.
Node >= 22.12 required (Astro 7 engines); local dev uses Node 24.

## Commands

- `npm run dev` — dev server (the netlify adapter emulates functions locally).
- `npm run build` — the ONLY verification gate: runs `astro check` (typecheck +
  Astro diagnostics) then `astro build`. Run it before considering a change done.
- `astro preview` is NOT supported by the @astrojs/netlify adapter. For
  production parity run `npx netlify dev` (Netlify CLI, downloaded on demand).
- `@astrojs/check` is a devDependency, so `astro check` runs non-interactively.

## Architecture

- Path aliases come from tsconfig (`@components/*`, `@layouts/*`, `@styles/*`);
  Astro resolves them natively — no vite alias needed.
- `src/pages/index.astro` is a thin shell composing `src/components/*.astro`
  sections in order. Head/meta (canonical, Open Graph, JSON-LD), Google Fonts
  `<link>`s and the `.reveal` scroll animation live in
  `src/layouts/BaseLayout.astro`; `CaseLayout.astro` composes it instead of
  duplicating the head.
- SEO plumbing: `site: "https://diagonalstudios.com.ar"` in `astro.config.mjs`
  feeds `@astrojs/sitemap` (`dist/sitemap-index.xml`) and absolute
  canonical/OG URLs. `public/robots.txt` points at the sitemap, names AI
  crawlers explicitly (Allow) and blocks only `CCBot`. `src/pages/404.astro` is
  `noindex` (no canonical). `public/og.png` is the 1200×630 social card
  referenced by `og:image`.
- AI-SEO files: `public/llms.txt` (site index for LLMs, llmstxt.org format) and
  `public/llms-full.txt` (full site copy in one Markdown) are hand-maintained —
  update BOTH whenever visible copy changes.
- Contact form: `ContactForm.astro` POSTs JSON to `/api/contact` (JS path);
  the `<form>` also has `action`/`method` as no-JS fallback and the API
  branches on Content-Type (JSON → JSON responses, form-data → HTML responses).
  Anti-spam gate: honeypot input `website` (off-screen) + hidden `formTime`
  stamped with `Date.now()` on load (re-stamped after `form.reset()`); the API
  answers fake success without emailing when the honeypot is filled, or when
  `formTime` is missing/invalid/<3s old (required on JSON, optional on the
  no-JS urlencoded path). If spam outgrows this, escalate to Cloudflare
  Turnstile — don't reach for reCAPTCHA.
- Partial SSR: `astro.config.mjs` uses `@astrojs/netlify` (`imageCDN: false`
  keeps the build-time sharp pipeline; `session: false` skips Netlify Blobs).
  Everything is prerendered except `src/pages/api/contact.ts`
  (`prerender = false`). Build output: flat `dist/` (the publish dir) +
  `.netlify/v1/functions/ssr/` — a catch-all function (`path: '/*'`,
  `preferStatic: true`: static files win, everything else reaches the Astro
  app, which serves its own 404). The dev server wipes `.netlify/` on start;
  every build regenerates it. `netlify.toml` pins NODE_VERSION 22.
- Contact form: `ContactForm.astro` POSTs JSON to `/api/contact`, which emails
  via Resend. The route reads `process.env.RESEND_API_KEY` at RUNTIME — Astro 6+
  inlines `import.meta.env` into the build, so never use it for secrets.
  `astro.config.mjs` calls `process.loadEnvFile()` so `astro dev` picks up the
  gitignored `.env` (fresh clones lack it; build still succeeds, form returns
  500). On Netlify the env var must be set in Site settings → Environment
  variables (Production scope). From/to addresses are hardcoded in
  `src/pages/api/contact.ts`. Astro's CSRF origin check applies to
  form-encoded POSTs: behind a reverse proxy forward Host/proto correctly or
  same-origin posts will 403 (`security.checkOrigin`).
- Content collection `cases` = `src/content/cases/*.md`, schema in
  `src/content.config.ts` (glob loader, `z` from `astro/zod`); frontmatter must
  match the zod schema exactly.
- Case data is DUPLICATED: `/casos/[slug]` pages come from the collection, but
  homepage cards in `src/components/SuccessStories.astro` use a hardcoded
  `CASES` array. Adding/editing a case = update the markdown AND that array.
- Images are local files in `src/components/images/` (filenames contain spaces)
  imported as ES modules and rendered with `<Image>` from `astro:assets`
  (`format="webp"`, explicit width/height) — keep new images on that path.

## Conventions

- Tailwind v4: no config file. Design tokens are in the `@theme` block of
  `src/styles/global.css` (`bg-paper`, `text-g-500`, `font-display`, ...). Use
  those tokens, not default palette names, for site styling.
- All user-facing copy is Spanish (es-AR, voseo: "Iniciá", "intentá").
- Conventional commits with Spanish descriptions (`feat: agrega ...`).
- `.env`, `dist/`, `.astro/`, `.netlify/` are gitignored — never commit them.
- Deploy: Netlify free plan, configured in `netlify.toml` (build
  `npm run build`, publish `dist`, NODE_VERSION 22 — the toml overrides UI
  build settings). Auto-deploys from GitHub `main`. Credit-based free tier:
  300/month (production deploy = 15 credits, 1GB bandwidth = 20).
- `npm audit` shows ~8 high advisories from `@astrojs/netlify`'s LOCAL dev
  tooling (`extract-zip`, `ipx`/`sharp` — emulation only, not shipped to
  production, no upstream fix yet): accepted noise.
