import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
   // "/demo/",
    "/posts/算法/",
    "/posts/杂谈/",
    "/posts/项目/",
  {
    text: "博文",
    icon: "pen-to-square",
    prefix: "/posts/",
    children: [
      {
        text: "算法",
        icon: "pen-to-square",
        prefix: "/算法",
        children: [
          { text: "二分", icon: "pen-to-square", link: "https://www.52xinxin.top/posts/%E7%AE%97%E6%B3%95/%E4%BA%8C%E5%88%86.html" },
          { text: "回溯", icon: "pen-to-square", link: "https://www.52xinxin.top/posts/%E7%AE%97%E6%B3%95/%E5%9B%9E%E6%BA%AF.html" },
          // "3",
          // "4",
        ],
      },
      {
        text: "项目",
        icon: "pen-to-square",
        prefix: "/项目",
        children: [
          {
            text: "Docker",
            icon: "pen-to-square",
            link: "https://scrazyakai.github.io/blog/posts/%E9%A1%B9%E7%9B%AE/docker.html",
          },
          {
            text: "面经",
            icon: "pen-to-square",
            link: "https://scrazyakai.github.io/blog/posts/%E9%A1%B9%E7%9B%AE/%E9%9D%A2%E8%AF%95%E9%81%87%E5%88%B0%E7%9A%84%E9%A2%98.html",
          },
        ],
      },
      {
        text: "杂谈",
        icon: "pen-to-square",
        prefix: "/杂谈",
        children: [
          {
            text: "红黑树",
            icon: "pen-to-square",
            link: "https://www.52xinxin.top/posts/%E6%9D%82%E8%B0%88/Red-Black-Tree.html",
          },
          {
            text: "限流",
            icon: "pen-to-square",
            link: "https://www.52xinxin.top/posts/%E6%9D%82%E8%B0%88/RateLimiting.html",
          },
        ],
      },
      {
        text: "面试准备",
        icon: "pen-to-square",
        prefix: "/面试准备",
        children: [
          {
            text: "大文件上传",
            icon: "pen-to-square",
            link: "https://www.52xinxin.top/posts/%E6%9D%82%E8%B0%88/Red-Black-Tree.html",
          },
          {
            text: "限流",
            icon: "pen-to-square",
            link: "https://www.52xinxin.top/posts/%E6%9D%82%E8%B0%88/RateLimiting.html",
          },
        ],
      }
      // { text: "樱桃", icon: "pen-to-square", link: "cherry" },
      // { text: "火龙果", icon: "pen-to-square", link: "dragonfruit" },
      // "tomato",
      // "strawberry",
    ],
  },
  // {
  //   text: "V2 文档",
  //   icon: "book",
  //   link: "https://theme-hope.vuejs.press/zh/",
  // },
]);
