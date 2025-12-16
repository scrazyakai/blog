import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    // {
    //   text: "如何使用",
    //   icon: "laptop-code",
    //   prefix: "demo/",
    //   link: "demo/",
    //   children: "structure",
    // },
    {
      text: "算法",
      icon: "book",
      prefix: "posts/算法/",
      children: "structure",
    },
    {
      text: "项目",
      icon: "book",
      prefix: "posts/项目/",
      children: "structure",
    },
    {
      text: "杂谈",
      icon: "book",
      prefix: "posts/杂谈/",
      children: "structure",
    },
    {
      text: "面试准备",
      icon: "book",
      prefix: "posts/面试准备/",
      children: "structure",
    },
    {
      text: "其他",
      icon: "book",
      prefix: "posts/其他/",
      children: "structure",
    }

    // "intro",
    // {
    //   text: "幻灯片",
    //   icon: "person-chalkboard",
    //   link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
    // },
  ],
});
