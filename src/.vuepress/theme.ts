import { plumeTheme } from "vuepress-theme-plume";

import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default plumeTheme({
  hostname: "https://scrazyakai.github.io",
  logo: "/lxh_71.gif",
  docsRepo: "https://github.com/scrazyakai/blog",
  docsBranch: "main",
  docsDir: "src",
  // 保留现有文章 URL，避免开发服务器自动改写 Markdown。
  autoFrontmatter: false,
  navbar,
  sidebar,
  profile: {
    name: "Recursion",
    avatar: "/lxh_71.gif",
    description: "一个后端开发者",
  },
  social: [
    { icon: "github", link: "https://github.com/scrazyakai?tab=repositories" },
  ],
  collections: [
    {
      type: "post",
      dir: "posts",
      title: "博文",
      link: "/posts/",
      tags: true,
      archives: true,
      categories: true,
    },
  ],
  footer: {
    message: "青云小筑 · 心安之处即桃源",
    copyright: '<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">豫ICP备2025147212号-1</a>',
  },
  encrypt: {
    rules: {
      "demo/encrypt.md": "1234",
      "posts/算法/二分.md": "1234",
    },
  },
  comment: {
    provider: "Giscus",
    repo: "scrazyakai/blog",
    repoId: "R_kgDOP6b3kA",
    category: "Announcements",
    categoryId: "DIC_kwDOP6b3kM4CwIxi",
  },
  markdown: {
    mermaid: true,
    math: { type: "katex" },
    image: { lazyload: true, size: true },
    include: {},
  },
});
