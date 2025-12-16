---
title: Docker基本命令
icon: pen-to-square
date: 2025-8-2
categories:
 - 项目
tags:
 - docker
---
# Docker
通俗的讲

>镜像：相当于APP安装包
>
>容器：安装的APP实例

### 查看版本

```bash
docker version
```

### 查看本机镜像

```bash
docker images
```

### 查看运行中的容器

```bash
docker ps
```

### 拉取镜像

```bash
docker pull 镜像名[:tag]
```
### 删除镜像

```bash
docker rmi 镜像ID
```

### 给镜像打标签

```bash
docker tag 源镜像ID 新名字:新tag
example: docker tag nginx:1.25 mynginx:prod
```

### 运行容器

```bash
复制编辑
docker run -d -p 8080:80 nginx
```