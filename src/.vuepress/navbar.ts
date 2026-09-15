import { defineNavbarConfig } from "vuepress-theme-plume";

export default defineNavbarConfig([
  { text: "首页", link: "/" },
  { text: "博文", link: "/posts/" },
  { text: "分类", link: "/posts/categories/" },
  { text: "标签", link: "/posts/tags/" },
  { text: "归档", link: "/posts/archives/" },
  { text: "关于", link: "/intro.html" },
]);
