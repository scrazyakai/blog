---
title: 线程的实现方法
icon: pen-to-square
date: 2025/10/15
categories:
 - 杂谈
tags:
 - 线程
---

# 线程的实现方法

## ⭐继承Thread

记得线程的运行一定要在main方法里面

```java
public class MyThread extends Thread{
    @Override
    public void run(){
        System.out.println("MyThread1");
    }

    public static void main(String[] args) {
        MyThread myThread = new MyThread();
        myThread.start();
    }
}

```

## ⭐实现Runnable

```
public class MyThread1 implements Runnable{
    @Override
    public void run() {
        System.out.println("MyThread1");
    }

    public static void main(String[] args) {
        Thread thread = new Thread(new MyThread1());
        thread.start();
    }
}
```

## 实现Callable

Callable实现的线程能够返回结果和抛出异常

* `Callable` 定义了一个能返回结果的任务；
* FutureTask` 把它包装成既能被 `Thread` 执行（Runnable），又能返回结果（ Future）；` 
* `Thread` 负责真正启动线程去执行这个任务。

```
public class MyThread2 implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        System.out.println(Thread.currentThread().getName() + " 正在计算...");
        Thread.sleep(1000);
        return 42; // 返回结果
    }

    public static void main(String[] args) throws Exception {
        FutureTask<Integer> task = new FutureTask<>(new MyThread2());
        Thread thread = new Thread(task);
        thread.start();
        Integer result = task.get(); // 阻塞等待结果
        System.out.println("计算结果：" + result);
    }
}
```

## ⭐使用线程池

```
public class MyThread3 {
    public static void main(String[] args) {
//        ExecutorService pool = Executors.newFixedThreadPool(3);// 固定线程数
//        ExecutorService pool = Executors.newCachedThreadPool();   // 可伸缩线程池
        ExecutorService pool = Executors.newSingleThreadExecutor(); // 单线程
        for (int i = 0; i < 5; i++) {
            pool.execute(() -> {
                System.out.println(Thread.currentThread().getName() + " 正在执行任务...");
            });
        }
        pool.shutdown();
    }
}
```

### 线程池参数

```java
public ThreadPoolExecutor(
    int corePoolSize,           // 核心线程数
    int maximumPoolSize,        // 最大线程数
    long keepAliveTime,         // 非核心线程存活时间
    TimeUnit unit,              // 存活时间的单位
    BlockingQueue<Runnable> workQueue, // 任务队列
    ThreadFactory threadFactory,       // 线程工厂
    RejectedExecutionHandler handler   // 拒绝策略
)
```

#### 核心线程数

线程池中始终保留的线程数，即使这些线程空闲也不会被销毁。

有新任务到来时，若当前线程数 < `corePoolSize` → 直接创建新线程执行；否则进入队列。

#### 最大线程数

线程池中能容纳的最大线程数。当队列满了且线程数**<**最大线程数，就会创建非核心线程处理任务。超过这个数后再提交就会触发拒绝策略

#### 空闲线程存活时间

适用于线程数 > core 的非核心线程：空闲超过此时间则回收。

#### ⭐任务队列

* 有界是指队列有固定的容量上限
* OMM是内存溢出
* “无容量”= **队列中不能存任务**，也就是说，**来一个任务，必须立刻交给线程执行，否则无法放入队列。**

| 队列类型                | 是否有界   | 底层结构 | 特点                                     | 适用场景               |
| ----------------------- | ---------- | -------- | ---------------------------------------- | ---------------------- |
| `ArrayBlockingQueue`    | ✅ 有界     | 数组     | 控制并发、防止 OOM                       | 固定线程池             |
| `LinkedBlockingQueue`   | ⚠️ 默认无界 | 链表     | 吞吐高，但可能 OOM                       | 默认 `FixedThreadPool` |
| `SynchronousQueue`      | ✅ 无容量   | 无存储   | 不排队，直接交付线程，能够自动扩大线程数 | `CachedThreadPool`     |
| `PriorityBlockingQueue` | ⚠️ 默认无界 | 堆       | 按优先级执行                             | 任务优先级调度         |

#### 线程工厂

用于定制线程名、优先级、是否为守护线程，便于排查、监控。

#### 拒绝策略

`AbortPolicy`（默认）：抛异常。

`CallerRunsPolicy`：由调用线程（提交任务的线程）直接执行该任务（同步执行）

`DiscardPolicy`：丢弃任务。

`DiscardOldestPolicy`：丢弃队列中最旧任务，尝试重新提交

### 线程池的执行顺序

提交任务 → 若当前线程数 < `corePoolSize` → 新建线程执行。
否则将任务放入 `workQueue`。
若队列满且线程数 < `maximumPoolSize` → 新建非核心线程执行。
若线程数已达 `maximumPoolSize` 且队列满 → 触发 `handler`（拒绝策略）。
### 多线程打印0-200

```java
public class Main {
    private static final int MAX = 200;
    private static int num = 0;
    private static final Object lock = new Object();
    private static boolean flag = true;

    static void print() {
        Thread thread1 = new Thread(() -> {
            while (true) {
                synchronized (lock) {
                    while (!flag) { // 等待轮到线程1
                        try {
                            lock.wait();//释放锁，并等待
                        } catch (InterruptedException e) {
                            throw new RuntimeException(e);
                        }
                    }
                    if (num > MAX) {
                        lock.notifyAll();//唤醒在等待的线程
                        break;
                    }
                    System.out.println("线程1: " + num++);
                    flag = false; // 切换到线程2
                    lock.notifyAll();//唤醒在等待的线程
                }
            }
        });

        Thread thread2 = new Thread(() -> {
            while (true) {
                synchronized (lock) {
                    while (flag) { // 等待轮到线程2
                        try {
                            lock.wait();
                        } catch (InterruptedException e) {
                            throw new RuntimeException(e);
                        }
                    }
                    if (num > MAX) {
                        lock.notifyAll();//唤醒在等待的线程
                        break;
                    }
                    System.out.println("线程2: " + num++);
                    flag = true; // 切换到线程1
                    lock.notifyAll();//唤醒在等待的线程
                }
            }
        });

        thread1.start();
        thread2.start();
    }

    public static void main(String[] args) {
        print();
    }
}


```

使用ArrayBlockingQueue

```java
public class ThreadsPrint {
    public static void main(String[] args) {
        ArrayBlockingQueue<Integer> queue1 = new ArrayBlockingQueue<>(1);
        ArrayBlockingQueue<Integer> queue2 = new ArrayBlockingQueue<>(1);
        try {
            queue1.put(0);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        Thread thread1 = new Thread(()->{
            for(int i = 0; i <= 200;i+=2){
                try {
                    queue1.take();
                    System.out.println(i);
                    queue2.put(0);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        },"线程1");
        Thread thread2 = new Thread(()->{
            for(int i = 1; i <= 200;i+=2){
                try {
                    queue2.take();
                    System.out.println(i);
                    queue1.put(0);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        },"线程2");
        thread1.start();
        thread2.start();

    }
}
```