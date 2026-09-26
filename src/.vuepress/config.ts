import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";
import { fileURLToPath } from "node:url";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  lang: "zh-CN",
  title: "青云小筑",
  description: "青云小筑",
  plugins: [{
    name: "blog-landscape-design",
    alias: {
      "@theme/Posts/VPPosts.vue": fileURLToPath(new URL("./components/PostsLayout.vue", import.meta.url)),
      "@theme/VPDoc.vue": fileURLToPath(new URL("./components/ReadingLayout.vue", import.meta.url)),
      "@theme/VPFriends.vue": fileURLToPath(new URL("./components/FriendsPage.vue", import.meta.url)),
    },
    extendsPage(page) {
      if (page.path === "/posts/") {
        page.frontmatter.sidebar = false;
        page.frontmatter.pageClass = "posts-index-page";
      } else if (page.path.startsWith("/posts/") || page.path === "/friends/") {
        page.frontmatter.sidebar = false;
        page.frontmatter.pageClass = [page.frontmatter.pageClass, "landscape-page"].filter(Boolean).join(" ");
      }
    },
  }],
  bundler: viteBundler({
    viteOptions: {
      plugins: [{
        name: "giscus-theme-preview",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // Only the public comment styles are readable by the Giscus iframe.
            if (/^\/comments\/(dark|light|transparent)\.css(?:\?|$)/.test(req.url || "")) {
              res.setHeader("Access-Control-Allow-Origin", "https://giscus.app");
            }
            next();
          });
        },
      }],
    },
  }),
  theme,
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/favicon.png" }],
  ],
});
