---
title: 手写单例模式
icon: pen-to-square
date: 2025/10/14
categories:
 - 杂谈
tags:
 - 设计模式
---



# 手写单例模式

## 定义

保证一个类只有一个实例，并且提供一个全局访问点

## 饿汉式

```java
/**
 * 饿汉式(线程安全)
 * 类加载时创建实例，不管是否使用，都会创建对象
 */
public class Singleton1 {
    private static Singleton1 instance = new Singleton1();
    private Singleton1(){

    }
    private static Singleton1 getInstance(){
        return instance;
    }
}
```

## 懒汉式

```java
/**
 * 懒汉式(线程不安全)
 * 仅第一次加载类的时候创建实例多线成可能会创建多个实例，需要加锁
 */
public class Singleton2 {
    private static Singleton2 instance;
    private Singleton2(){}
    public static Singleton2 getInstance(){
        if(instance == null){
            return new Singleton2();
        }
        return instance;
    }
}

```

## 饿汉式(线程安全,性能低)

```java
/**
 * 单例模式实现类3 - 线程安全懒汉式
 * 通过使用synchronized关键字确保线程安全
 * 但是每次获取实例方法都会加锁，效率低下
 */
public class Singleton3 {
    // 静态实例，防止被引用，此处赋值为null，目的是延迟加载
    private static Singleton3 instance;
    // 私有构造方法，防止被实例化
    private Singleton3(){}
    public  static synchronized Singleton3 getInstance(){
        if(instance == null){
            // 实例化对象
            return new Singleton3();
        }
        return instance;
    }
}
```

## 双检查(DLC)

```java
/**
 * 双重检查（高效 + 线程安全）
 */
public class Singleton4 {
    // 静态实例，防止被引用，此处赋值为null，目的是延迟加载
    private static Singleton4 instance;
    // 私有构造方法，防止被实例化
    private Singleton4(){}
    public  static Singleton4 getInstance(){
        if(instance == null){//避免每次都加锁
            synchronized (Singleton4.class){
                if(instance == null){//防止多个线程同时创建实例
                    instance = new Singleton4();
                }
            }

        }
        return instance;
    }
}
```

## ⭐静态内部类

```java
/**
 * 静态内部类(最推荐)
 */
public class Singleton5 {
    private Singleton5(){}
    private static class SingletonHolder{
        private static final Singleton5 INSTANCE = new Singleton5();
    }
    public static Singleton5 getInstance(){
        return SingletonHolder.INSTANCE;
    }
}

```

## 枚举单例

```java
public enum Singleton6 {
    INSTANCE;
    public void doSomething(){
        System.out.println("Hello Singleton");
    }
}

```



## 面试可能问

**为什么 DCL 需要 `volatile`？**
 因为 `new Singleton()` 不是原子操作，可能发生指令重排。
 可能出现：

```
1. 分配内存空间
2. 赋值引用（此时 instance != null）
3. 执行构造函数
```

若重排为 1→2→3，会导致另一个线程拿到一个**未初始化的对象**。

**反射能破坏单例吗？**
 是的。除非你：

```
private Singleton() {
    if (instance != null) {
        throw new RuntimeException("禁止反射创建实例");
    }
}
```

或直接用 **枚举单例**（无法被反射破坏）。

**序列化会破坏单例吗？**
 是的。需重写 `readResolve()`：

```
private Object readResolve() {
    return instance;
}
```

## 总结

| 实现方式       | 懒加载 | 线程安全 | 性能 | 是否防反射 | 备注                   |
| -------------- | ------ | -------- | ---- | ---------- | ---------------------- |
| 饿汉式         | ❌      | ✅        | 高   | ❌          | 类加载即创建实例       |
| 懒汉式（同步） | ✅      | ✅        | 低   | ❌          | 每次加锁性能差         |
| 双重检查锁     | ✅      | ✅        | 高   | ❌          | 代码复杂，需 volatile  |
| **静态内部类** | ✅      | ✅        | ✅    | ❌          | JVM 保证线程安全       |
| 枚举单例       | ❌      | ✅        | ✅    | ✅          | 最安全，不支持延迟加载 |