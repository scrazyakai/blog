# 青云小筑

基于 VuePress 2 和 [vuepress-theme-plume](https://theme-plume.vuejs.press/) 的个人博客。

## 本地开发

使用 Node.js 20.19+（20.x）或 22.12+，推荐与部署环境一致的 Node.js 22。

```sh
npm ci
npm run docs:dev
```

访问终端显示的本地地址（站点路径为 `/blog/`）。清除缓存后启动可使用 `npm run docs:clean-dev`。

## 构建

```sh
npm run docs:build
```

输出目录为 `src/.vuepress/dist`。推送到 `main` 后，现有 GitHub Actions 工作流会构建并部署到 `pages` 分支。

## 内容与配置

- 文章：`src/posts/`，按子目录自动生成分类。
- 首页：`src/README.md`。
- 主题、评论与加密：`src/.vuepress/theme.ts`。
- 导航栏：`src/.vuepress/navbar.ts`。
- 文章日期使用 `createTime`，标签使用 `tags`，置顶使用 `sticky`。
- 已关闭自动生成 frontmatter，文章沿用原有 `.html` 地址。
