import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import prismjs from "vite-plugin-prismjs";

// https://astro.build/config
export default defineConfig({
  site: "https://hyeongjin.com",
  integrations: [
    tailwind(),
    react({
      include: ["**/react/*"],
    }),
    sitemap(),
  ],
  vite: {
    plugins: [
      prismjs({
        languages: ["bash", "tsx"],
      }),
    ],
  },
});
