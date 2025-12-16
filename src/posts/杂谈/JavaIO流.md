---
title: IO流
date: 2025/10/2
categories:
 - 杂谈
tags:
 - IO流
---
# JavaIO流
## IO
* O是Input和Output，以内存为界限，Input是从外界读取诗句到内存，Output是从内存中取出数据到外界。
* IO流是一种顺序读写数据的模式，它的特点是单向流动。
### 字节流
Java中的InputStream和OutputStream是以字节为基本单位的，InputStream代表输入字节流，OutputStream代表输出字节流
### 字符流
Java中的Reader和Writer是以字符为基本单位的，Reader代表字符输入流，Writer代表字符输出流
### 同步和异步
同步IO是指，读写IO时代码必须等待IO操作结束后才继续执行后续代码，它的优点是代码编写简单，缺点是CPU执行效率低。

而异步IO是指，读写IO时仅发出请求，然后立刻执行后续代码，它的优点是CPU执行效率高，缺点是代码编写复杂。

## File对象
File 对象是文件或目录路径的抽象，不代表文件内容，也不能读写内容。
构建File对象需要传入路径，可以是相对路径，也可以是绝对路径

File用来：

* 创建 / 删除

创建
```java
file.createNewFile();
file.mkdir();   // 只能创建一级目录
file.mkdirs();  // 创建多级目录（常用）
```

删除

file.delete(); //目录必须是空目录
* 判断存在性
```java
f.exists();      // 是否存在
f.isFile();      // 是否是文件
f.isDirectory(); // 是否是目录
```
* 获取属性
```java
f.getName();        // 文件名
f.length();         // 文件大小（字节）
f.lastModified();   // 最后修改时间（时间戳）
```
* 遍历目录
```java
String[] names = dir.list();
```