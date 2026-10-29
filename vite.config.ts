import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

// `npm run dev` proxies /api to a local `php -S` so the PHP endpoints work during development:
//   php -S localhost:8000 -t public
export default defineConfig({
  plugins: [
    { enforce: "pre", ...mdx({ remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] }) },
    react({ include: /\.(mdx|tsx|ts)$/ }),
  ],
  server: {
    proxy: { "/api": "http://localhost:8000" },
  },
});
