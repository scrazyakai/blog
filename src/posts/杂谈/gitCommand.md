---
title: git常用命令
icon: pen-to-square
date: 2025/10/2
categories:
 - 杂谈
tags:
 - git
---

# git命令

初始化本地仓库

```bash
git init
```

将修改的所有代码提交到缓存区

```bash
git add .
```

提交缓存区

```bash
git commit -m "***"
```

推送提交

```bash
git push
```

查看当前状态（新增、修改、删除）

```bash
git status
```

切换分支

```bash
git checkout <分支名>
```

查看远程仓库

```bash
git remote -v
```

推送到远程仓库

```bash
git push origin <分支名>
```

安全回退推送

```bash
git revert <commit_id>
```

回退提交(保留修改在工作区)

```bash
git reset --soft HEAD^
```



