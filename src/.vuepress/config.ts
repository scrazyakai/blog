import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  // base: "/blog/",

  lang: "zh-CN",
  title: "青云小筑",
  description: "青云小筑",
  theme,
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/favicon.png" }],
    // 如果用 PNG 或 SVG 图标，可以改成:
    // ["link", { rel: "icon", type: "image/png", href: "/favicon.png" }],
  ],

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
