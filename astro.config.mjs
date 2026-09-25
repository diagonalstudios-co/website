// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";

// Astro doesn't load .env into process.env; API routes read runtime env
// (Astro 6+ inlines import.meta.env at build time, so it can't be used for
// secrets). This covers dev/preview; deployed hosts inject env directly.
try {
  process.loadEnvFile();
} catch {
  /* .env optional: fresh clones and CI builds don't have it */
}

// https://astro.build/config
export default defineConfig({
  site: "https://diagonalstudios.com.ar",
  // imageCDN: false keeps Astro's build-time sharp pipeline (images are
  // already optimized webp; no dependency on Netlify Image CDN).
  adapter: netlify({
    imageCDN: false,
  }),
  // Sessions are unused: skip the Netlify Blobs runtime in the function.
  session: false,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
