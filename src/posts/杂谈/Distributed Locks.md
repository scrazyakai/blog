---
title: 分布式锁
icon: pen-to-square
date: 2025/10/16
categories:
 - 杂谈
tags:
 - 分布式锁
---

# 分布式锁

## 什么是分布式锁

    单体项目直接使用JVM的synchronized或ReentrantLock来保证同一时间仅有一个线程访问某个资源。但是
    在分布式系统多个服务实例）中，不同节点的线程互相隔离，JVM 内的锁不再有效，需要一个跨节点的锁——分布式锁
    简而言之👉分布式锁是为了解决分布式系统中多节点（多个服务实例）之间对共享资源的并发访问控制问题而产
    生的一种锁机制。
![image-20251016214415205.png](../%E5%9B%BE%E7%89%87/image-20251016214415205.png)

    例如图中如果不加任何限制同一时间可能会在三个服务器中分别创建变量A，这就会导致对共享资源（这里的变
    量 A 可视为共享资源）的并发访问出现问题，比如数据不一致等

## 一个合格的分布式锁的特点

| 特性                 | 说明                                     |
| -------------------- | ---------------------------------------- |
| **互斥性**           | 同一时间只能有一个客户端持有锁           |
| **可重入性**（可选） | 同一个线程可多次获取同一把锁             |
| **超时自动释放**     | 避免死锁，如果持锁节点宕机，锁能自动释放 |
| **可靠性**           | 锁不会被误删，释放锁只能由持有者执行     |
| **性能**             | 高并发下能快速获取和释放锁               |

## Redis实现分布式锁

基本原理：`SET key value NX EX 3`   

NX:String类的key不存在时再创建

EX:时间单位为秒

### Lua脚本释放锁

```java
if redis.call("get",KEYS[1]) == ARGV[1] then
    redis.call("del",KEYS[1])
    else
        return 0;
end
    
```

### 完整业务代码

#### jedis依赖

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>5.1.0</version>
</dependency>

```

#### 连接redis

```java
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class JedisPoolExample {
    public static void main(String[] args) {
        // 创建连接池
        JedisPool pool = new JedisPool("127.0.0.1", 6379);

        // 从池中获取连接
        try (Jedis jedis = pool.getResource()) {
            jedis.set("user", "Alice");
            System.out.println("user = " + jedis.get("user"));
        }

        // 程序退出时关闭池
        pool.close();
    }
}

```

#### 业务实现

```java
// 获取锁
String result = jedis.set("lock_key", UUID.randomUUID().toString(), SetParams.setParams().nx().px(30000));
if ("OK".equals(result)) {
    // 获取锁成功，执行业务逻辑
}

// 释放锁（Lua 脚本）
String luaScript = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                   "return redis.call('del', KEYS[1]) " +
                   "else return 0 end";
jedis.eval(luaScript, Collections.singletonList("lock_key"), Collections.singletonList(uniqueValue));
```

## Redisson的分布式锁

### 独特的看门狗机制

对于没有加释放锁时间的命令，每**十秒**续期一次，目的是为了防止命令还没执行完毕就释放锁

### 关键源码分析

* `scheduler`其实就是一个定时调度的线程池`private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);`

* `internalLockLeaseTime`锁的默认时间
* `isHeldByCurrentThread(threadId)`判断线程是否仍持有锁
* `expireAsync(leaseTime, TimeUnit.MILLISECONDS)`异步更新Redis中锁的过期时间
* `renewExpiration();`递归地加入到线程池的工作队列中

```java
private void renewExpiration() {
    // 定时任务，每 10 秒续期一次
    scheduler.schedule(() -> {
        if (isHeldByCurrentThread(threadId)) {
            expireAsync(leaseTime, TimeUnit.MILLISECONDS);
            renewExpiration(); // 递归调用
        }
    }, internalLockLeaseTime / 3, TimeUnit.MILLISECONDS); // 默认 10 秒
}

```

### 业务代码实现

####  引入依赖

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson</artifactId>
    <version>3.23.4</version>
</dependency>

```

#### 配置Redisson

```java
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;

public class RedissonManager {
    private static RedissonClient redissonClient;

    static {
        Config config = new Config();
        config.useSingleServer()
              .setAddress("redis://127.0.0.1:6379")
              .setDatabase(0);
        redissonClient = Redisson.create(config);
    }

    public static RedissonClient getClient() {
        return redissonClient;
    }
}

```

#### 业务代码

* `RedissonClient client = RedissonManager.getClient();`不是Redis 里立刻创建一个实体对象”。它只是**根据 key 名称（这里是 `"myLock"`）返回一个锁对象的引用**；

* `lock.lock();`才是真正向Redis中写入键，尝试加锁

```java
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import java.util.concurrent.TimeUnit;

public class RedissonLockExample {
    public static void main(String[] args) {
        RedissonClient client = RedissonManager.getClient();
        RLock lock = client.getLock("myLock");

        try {
            // 加锁（默认看门狗会自动续期）
            lock.lock();
            System.out.println("线程1获取锁，执行业务逻辑...");
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
            System.out.println("线程1释放锁");
            client.shutdown();
        }
    }
}

```

