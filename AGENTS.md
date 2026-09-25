# AGENTS.md

Astro 5 + TypeScript (strict) + Tailwind v4 single-package site: Spanish-language
marketing site for Diagonal Studios. No monorepo, no tests, no linter, no CI.

## Commands

- `npm run dev` — dev server.
- `npm run build` — the ONLY verification gate: runs `astro check` (typecheck +
  Astro diagnostics) then `astro build`. Run it before considering a change done.
- `npm run preview` — serves the production build.
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
  feeds `@astrojs/sitemap` (`dist/client/sitemap-index.xml`) and absolute
  canonical/OG URLs. `public/robots.txt` points at the sitemap.
  `src/pages/404.astro` is `noindex` (no canonical). `public/og.png` is the
  1200×630 social card referenced by `og:image`.
- Partial SSR: `astro.config.mjs` uses `@astrojs/node` (standalone). Everything
  is prerendered except `src/pages/api/contact.ts` (`prerender = false`).
  Build output: `dist/client/` + `dist/server/entry.mjs`.
- Contact form: `ContactForm.astro` POSTs JSON to `/api/contact`, which emails
  via Resend. Needs `RESEND_API_KEY` in `.env` (gitignored — fresh clones lack
  it; build still succeeds, form returns 500). From/to addresses are hardcoded
  in `src/pages/api/contact.ts`.
- Content collection `cases` = `src/content/cases/*.md`, schema in
  `src/content.config.ts`; frontmatter must match the zod schema exactly.
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
- `.env`, `dist/`, `.astro/` are gitignored — never commit them.
- Deploy platform undecided (README: Vercel "in evaluation"); the SSR route
  requires a Node host.
