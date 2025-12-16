---
title: 限流
icon: pen-to-square
date: 2025/10/18
categories:
 - 杂谈
tags:
 - 限流
---

# 限流

## 使用场景

| 场景                   | 说明                               | 示例                               |
| ---------------------- | ---------------------------------- | ---------------------------------- |
| **接口防刷**           | 限制单个用户或IP访问频率           | 登录接口、短信验证码接口           |
| **秒杀系统**           | 控制并发请求数，保护库存与数据库   | “双11”秒杀抢购接口                 |
| **网关层限流**         | 控制整体流量、防止突发流量打垮后端 | Nginx、Spring Cloud Gateway、Zuul  |
| **服务间调用限流**     | 控制下游依赖的访问频率             | 微服务调用：A → B，每秒最多 100 次 |
| **MQ消费者限速**       | 控制消费速率，避免下游处理不过来   | 消费 Kafka/RabbitMQ 数据           |
| **分布式系统全局限流** | 统一限制整个系统的请求速率         | Redis + Lua 实现全局限流           |

## 漏桶算法

* 请求先进入桶中；

* 桶以**固定速率**漏水（处理请求）；

* 当桶满时，新请求直接丢弃。

```
    请求流入
   ↓↓↓↓↓↓↓↓↓↓↓
  ┌────────────┐
  │   漏桶      │  ——→ 按固定速率流出
  │   (容量N)   │
  └────────────┘

```

## 令牌桶算法

令牌桶中定期生成令牌：

- 每个请求必须拿到令牌才能执行；
- 桶最多能装 `capacity` 个令牌；
- 没有令牌的请求要么等待，要么丢弃。

## Redisson的RedissonRateLimiter

Redisson 的限流器实现了一个 **令牌桶算法 (Token Bucket)**：

```
      令牌按速率生成 → 桶容量上限 → 请求消耗令牌
```

### 特性：

- 每秒生成固定数量令牌；

- 当桶满时，新令牌丢弃；

- 请求只有拿到令牌才能执行；

- 没有令牌 → 立即拒绝 或 等待一段时间。

### 使用

#### 引入依赖

```
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.27.2</version> <!-- 使用最新版 -->
</dependency>
```

#### 配置 Redis（application.yml）

```
spring:
  redis:
    host: localhost
    port: 6379
    password: 123456
redisson:
  config: |
    singleServerConfig:
      address: "redis://127.0.0.1:6379"
      password: 123456
```

#### 注入 RedissonClient

```
import org.redisson.api.RedissonClient;
import org.redisson.api.RRateLimiter;
import org.redisson.api.RateType;
import org.redisson.api.RateIntervalUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RedisRateLimiter {

    @Autowired
    private RedissonClient redissonClient;

    public boolean tryAcquire(String key) {
        RRateLimiter rateLimiter = redissonClient.getRateLimiter("limit:" + key);
        // 初始化（只在首次执行时生效）
        rateLimiter.trySetRate(
                RateType.OVERALL,   // 全局限流（也可选择 PER_CLIENT）
                5,                  // 每秒最多5个请求
                1,                  // 时间间隔1秒
                RateIntervalUnit.SECONDS
        );
        return rateLimiter.tryAcquire(1); // 获取1个令牌
    }
}

```

#### 实现限流接口

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    String key();
    long permitsPerSecond();
}

```

AOP实现

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class RateLimitAspect {

    @Autowired
    private RedisRateLimiter limiter;

    @Around("@annotation(rateLimit)")
    public Object around(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String key = rateLimit.key();
        long rate = rateLimit.permitsPerSecond();
        if (!limiter.tryAcquire(key)) {
            return "请求太频繁，请稍后再试！";
        }
        return joinPoint.proceed();
    }
}

```

#### 使用

```
@GetMapping("/create")
@RateLimit(key = "createOrder", permitsPerSecond = 5)
public String createOrder() {
    return "下单成功！";
}

```

