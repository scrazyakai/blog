---
title: RabbitMQ
date: 2025/10/28
categories:
 - 杂谈
tags:
 - RabbitMQ
---



# 1. MQ基础

## 1.1. 认识MQ

1. 同步调用： 同步调用是指**调用方在等待被调用的函数执行完成后，才能继续执行后续代码**。  

特点：

- 顺序执行，一件事做完了才能做下一件。
- 简单易理解。
- 如果被调用函数耗时较长，会**阻塞**后续代码执行，导致程序“卡住”。

1. 异步调用： 异步调用是指**调用方发起函数调用后，不等待其完成，而是继续执行后续代码**，等函数完成时通过**回调函数**、Promise 或**async/await** 的方式再处理结果。

特点：

- 不阻塞，可以提高程序性能和响应速度。
- 更复杂，需要处理回调、状态管理等问题。
- 常用于网络请求、定时器、事件监听等场景。

1. MQ框架

![img](https://xcnd3kl8v2nj.feishu.cn/space/api/box/stream/download/asynccode/?code=NzkyMTEwMWMxY2I3MjMxNGNiZDM0YTBkYzgwN2IxMTNfWGhORjJuazI1ck8xMTU3angycnRZOEEyaWViQzJENmdfVG9rZW46VjRwZ2JwRUJHb1pTbjJ4OW5GTGNNOHB3bmFlXzE3NjE2Mjc4NjQ6MTc2MTYzMTQ2NF9WNA)

## 1.2. 快速入门

主要框架是

生产者生成并发送消息到交换机，交换机根据路由键将消息发送到绑定的队列中，消费者监听队列中的消息，有消息就取出并处理消息

①RabbitMQ的exchange(交换机)仅起到路由的功能

②交换机要与队列进行绑定才能发送消息

③虚拟主机之间是数据隔离的，互不影响

④docker启动mq        

```Java
docker start mq
```

使用SpringAMQP接收消息

①引入spring-boot-starter-amqp依赖

```XML
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

②配置rabbitmq服务器消息

```YAML
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

③工厂类

```Java
import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    //交换机
    public static final String EXCHANGE_NAME = "demo.direct";
    //队列
    public static final String QUEUE_NAME = "demo.queue";
    //路由key
    public static final String ROUTING_KEY = "demo.key";

    // 1. 定义直连交换机
    @Bean
    public DirectExchange demoExchange() {
    /*
    1. durable —— 是否持久化
true：交换机会被持久化到磁盘，RabbitMQ 重启后仍然存在。
false：非持久化，RabbitMQ 重启后就消失。
 一般生产环境都设置为 true。
2. autoDelete —— 是否自动删除
true：当没有队列再绑定到这个交换机时，交换机会自动删除。
false：不会自动删除，需要手动删除。
 一般情况下设置为 false，防止误删。
    */
    
        return new DirectExchange(EXCHANGE_NAME, true, false);
    }

    // 2. 定义队列
    @Bean
    public Queue demoQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    // 3. 绑定交换机和队列
    @Bean
    public Binding binding(Queue demoQueue, DirectExchange demoExchange) {
        return BindingBuilder.bind(demoQueue).to(demoExchange).with(ROUTING_KEY);
    }
}
```

④生产者

```Java
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ProducerTest {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    void testSendMessage() {
        String msg = "Hello RabbitMQ with Exchange!";
         //发送消息
        rabbitTemplate.convertAndSend(
                RabbitConfig.EXCHANGE_NAME,  // 交换机
                RabbitConfig.ROUTING_KEY,   // 路由键
                msg                         // 消息内容
        );
        System.out.println(" [x] Sent '" + msg + "'");
    }
}
```

⑤消费者

```Java
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MqListener {
    //监听队列
    @RabbitListener(queues = RabbitConfig.QUEUE_NAME)
    public void listen(String msg) {
        log.info("消费者收到了消息：{}", msg);
    }
}
```

1. Wokr queues模型：将多个消费者绑定到一个队列，共同消费队列中的消息

默认情况下RabbitMQ会将消息依次轮询绑定给每一个消费者，但没有考虑消费者是否已经处理完消息，可能发生消息堆积

修改application.yml,修改preFetch为1，确保同一时刻最多投递给消费者1条消息（处理完再给新消息）：

```Java
spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 1 # 每次只能获取一条消息，处理完成才能获取下一个消息
```

1. Fanout（广播）交换机：将接收到的消息广播到每一个跟其绑定的queue

发送消息

```Java
private RabbitTemplate rabbitTemplate;
    @Test
    void testSendMessage2Queue() {
        String exchangeName = "hmall.fanout";
        String msg = "hello world";
        rabbitTemplate.convertAndSend(exchangeName, null,msg);//这里的null是routingKey
    }
```

1. Direct（定向）交换机

在rabbit客户端进行绑定时输入RoutingKey

```Java
@Test
    void testSendDirect(){
        String exchangeName = "hamll.direct";
        String msg = "hello world";
        rabbitTemplate.convertAndSend(exchangeName,"yellow" ,msg);//yellow时指定的RoutingKey
    }
@RabbitListener(queues = "direct.q1")
    void listenDirectQueue1(String msg){
        System.out.println("direct.q1收到消息" + msg );
    }
    @RabbitListener(queues = "direct.q2")
    void listenDirectQueue2(String msg){
        System.out.println("direct.q2收到消息" + msg );
    }
```

1. Topic（话题）交换机：

只有topic交换机能够使用‘#'(代指0个或多个单词)和'*'(代指一个单词)通配符，topic接收的RoutingKey可以是多个单词，以'.'分割

```Java
 @Test
    void testSendTopic(){
        String exchangeName = "hmall.topic";
        String msg = "hello world";
        rabbitTemplate.convertAndSend(exchangeName,"japan.news" ,msg);
    }
```

1. 声明队列和交换机

​         ①使用工厂模式声明交换机和队列(太麻烦了)

```Java
@Configuration
public class FanoutConfiguration {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Bean
    public FanoutExchange fanoutExchange(){
        return new FanoutExchange("fanout.exchange");
    }
    @Bean
    public Queue fanoutQueue1(){
        return new Queue("fanout.queue1");
    }
    @Bean
    public Binding fanoutBinding1(Queue fanoutQueue1,Exchange fanoutExchange){
        return BindingBuilder.bind(fanoutQueue1()).to(fanoutExchange());
    }
}
```

​        ②直接在监听器上配置（运行后会自动创建）

```Java
@RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "direct.queue1",durable = "true"),
            exchange = @Exchange(name = "1.direct"),
            key = {"red","blue"}
    ))
    void listenDirectQueue1(String msg){
        System.out.println("direct.queue1收到消息" + msg );
    }
```

1. 消息转换器

SpringAMQP的转换器不安全，所以需要引入Jackson

```Java
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
</dependency>
```

​        在启动类中声明MessageConverter

```Java
@SpringBootApplication
public class PublisherApplication {
    public static void main(String[] args) {
        SpringApplication.run(PublisherApplication.class);
    }
    @Bean
    public MessageConverter jacksonMessageConvertor(){
        return new Jackson2JsonMessageConverter();
    }
}
```