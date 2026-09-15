import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/blog/",
  lang: "zh-CN",
  title: "青云小筑",
  description: "青云小筑",
  bundler: viteBundler(),
  theme,
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/blog/favicon.png" }],
  ],
});
