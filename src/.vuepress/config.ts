import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  lang: "zh-CN",
  title: "青云小筑",
  description: "青云小筑",
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
