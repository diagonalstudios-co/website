// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://diagonalstudios.com.ar",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [sitemap()],
  vite: {
    // @tailwindcss/vite pulls vite@8 while astro bundles vite@6, so the plugin
    // types don't line up; the runtime plugin is compatible with both.
    plugins: /** @type {any} */ ([tailwindcss()]),
  },
});
