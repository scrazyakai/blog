import type { ThemeSidebarMulti } from "vuepress-theme-plume";

export default {
  "/posts/": [
    {
      text: "前端",
      prefix: "前端",
      collapsed: false,
      items: [
        { text: "React", prefix: "React", items: "auto", collapsed: false },
      ],
    },
    { text: "算法", prefix: "算法", items: "auto", collapsed: false },
    { text: "项目", prefix: "项目", items: "auto", collapsed: false },
    { text: "杂谈", prefix: "杂谈", items: "auto", collapsed: false },
    { text: "面试准备", prefix: "面试准备", items: "auto", collapsed: false },
  ],
  "/demo/": "auto",
} satisfies ThemeSidebarMulti;
