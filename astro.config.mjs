// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
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
  adapter: node({
    mode: "standalone",
  }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
