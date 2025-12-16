---
title: MyBatis插件加密、解密敏感信息
date: 2025/11/18
categories:
- 杂谈
tags:
- MyBatis插件
---
# MyBatis插件

## 创建Demo项目

![image-mybatisplug1.png](../../.vuepress/public/images/image-mybatisplug1.png)

版本选择

|              组件               | 版本       |
| :-----------------------------: | ---------- |
|             **JDK**             | **1.8**    |
|         **Spring Boot**         | **2.7.18** |
| **MyBatis-Spring-Boot-Starter** | **2.3.1**  |
|         **Spring Web**          | **2.6.13** |

## 代码编写

项目结构

```
.
├── java
│   └── com.akai.mybatisplugdemo
│       ├── annotations
│       │   └── EncryptField
│       ├── config
│       │   └── MyBatisConfig
│       ├── controller
│       │   └── UserController
│       ├── Interceptor
│       │   └── EncryptInterceptor
│       ├── mapper
│       │   └── UserMapper
│       ├── model
│       │   └── User
│       ├── utils
│       │   └── AESUtil
│       └── MyBatisPlugDemoApplication
└── resources
    └── mapper
        └── userMapper.xml
```

加密注解

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface EncryptField {
}

```

拦截器

```java
@Intercepts({
    // 拦截写操作加密
    @Signature(type = ParameterHandler.class, method = "setParameters", args = PreparedStatement.class),
    // 拦截查询结果解密
    @Signature(type = ResultSetHandler.class, method = "handleResultSets", args = Statement.class)
})
public class EncryptFieldInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object target = invocation.getTarget();

        // ---- 加密写入 ----
        if (target instanceof ParameterHandler) {
            Object parameter = ((ParameterHandler) target).getParameterObject();
            if (parameter != null) {
                if (parameter instanceof List) {
                    for (Object obj : (List<?>) parameter) encryptFields(obj);
                } else {
                    encryptFields(parameter);
                }
            }
        }

        // ---- 解密查询结果 ----
        else if (target instanceof ResultSetHandler) {
            Object result = invocation.proceed();
            if (result instanceof List) {
                for (Object obj : (List<?>) result) {
                    decryptFields(obj);
                }
            } else {
                decryptFields(result);
            }
            return result;
        }

        return invocation.proceed();
    }

    private void encryptFields(Object obj) throws IllegalAccessException {
        if (obj == null) return;
        for (Field field : obj.getClass().getDeclaredFields()) {
            if (field.isAnnotationPresent(EncryptField.class)) {
                field.setAccessible(true);
                Object value = field.get(obj);
                if (value != null) field.set(obj, encrypt(value.toString()));
            }
        }
    }

    private void decryptFields(Object obj) throws IllegalAccessException {
        if (obj == null) return;
        for (Field field : obj.getClass().getDeclaredFields()) {
            if (field.isAnnotationPresent(EncryptField.class)) {
                field.setAccessible(true);
                Object value = field.get(obj);
                if (value != null) field.set(obj, decrypt(value.toString()));
            }
        }
    }

    private String encrypt(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes());
    }

    private String decrypt(String value) {
        return new String(Base64.getDecoder().decode(value));
    }
}


```
支持批量插入和批量查询包含敏感信息的数据
```java
@Intercepts({
    // 拦截写操作加密
    @Signature(type = ParameterHandler.class, method = "setParameters", args = PreparedStatement.class),
    // 拦截查询结果解密
    @Signature(type = ResultSetHandler.class, method = "handleResultSets", args = Statement.class)
})
public class EncryptFieldInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object target = invocation.getTarget();

        // ---- 加密写入 ----
        if (target instanceof ParameterHandler) {
            Object parameter = ((ParameterHandler) target).getParameterObject();
            if (parameter != null) {
                if (parameter instanceof List) {
                    for (Object obj : (List<?>) parameter) encryptFields(obj);
                } else {
                    encryptFields(parameter);
                }
            }
        }

        // ---- 解密查询结果 ----
        else if (target instanceof ResultSetHandler) {
            Object result = invocation.proceed();
            if (result instanceof List) {
                for (Object obj : (List<?>) result) {
                    decryptFields(obj);
                }
            } else {
                decryptFields(result);
            }
            return result;
        }

        return invocation.proceed();
    }

    private void encryptFields(Object obj) throws IllegalAccessException {
        if (obj == null) return;
        for (Field field : obj.getClass().getDeclaredFields()) {
            if (field.isAnnotationPresent(EncryptField.class)) {
                field.setAccessible(true);
                Object value = field.get(obj);
                if (value != null) field.set(obj, encrypt(value.toString()));
            }
        }
    }

    private void decryptFields(Object obj) throws IllegalAccessException {
        if (obj == null) return;
        for (Field field : obj.getClass().getDeclaredFields()) {
            if (field.isAnnotationPresent(EncryptField.class)) {
                field.setAccessible(true);
                Object value = field.get(obj);
                if (value != null) field.set(obj, decrypt(value.toString()));
            }
        }
    }

    private String encrypt(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes());
    }

    private String decrypt(String value) {
        return new String(Base64.getDecoder().decode(value));
    }
}

```
mybatis配置类

```java
@Configuration
public class MyBatisConfig {

    @Bean
    public EncryptInterceptor encryptInterceptor() {
        return new EncryptInterceptor();
    }
}

```

加密工具类

```java
public class AESUtil {

    private static final String KEY = "1234567890123456";

    public static String encrypt(String value) {
        try {
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(KEY.getBytes(), "AES"));
            return Base64.getEncoder().encodeToString(cipher.doFinal(value.getBytes("UTF-8")));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static String decrypt(String value) {
        try {
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(KEY.getBytes(), "AES"));
            return new String(cipher.doFinal(Base64.getDecoder().decode(value)), "UTF-8");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

```

mapper类

```java
@Mapper
public interface UserMapper {

    void insert(User user);

    User selectById(Long id);
}

```
mapper类(支持批量插入和查找包含敏感信息的数据)
```java
@Mapper
public interface UserMapper {

    // 单条插入
    void insert(User user);

    // 批量插入
    void insertBatch(@Param("users") List<User> users);

    // 单条查询
    User selectById(Long id);

    // 批量查询
    List<User> selectByIds(@Param("ids") List<Long> ids);
}

```
xml文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.akai.mybatisplugdemo.mapper.UserMapper">

    <insert id="insert">
        INSERT INTO user (name, email, phone)
        VALUES (#{name}, #{email}, #{phone})
    </insert>

    <select id="selectById" resultType="com.akai.mybatisplugdemo.model.User">
        SELECT id, name, email, phone
        FROM user
        WHERE id = #{id}
    </select>

</mapper>

```
xml文件(支持批量插入和查找包含敏感信息的数据)
```java
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.akai.mybatisplugdemo.mapper.UserMapper">

    <!-- 单条插入 -->
    <insert id="insert">
        INSERT INTO user (name, email, phone)
        VALUES (#{name}, #{email}, #{phone})
    </insert>

    <!-- 批量插入 -->
    <insert id="insertBatch">
        INSERT INTO user (name, email, phone)
        VALUES
        <foreach collection="users" item="user" separator=",">
            (#{user.name}, #{user.email}, #{user.phone})
        </foreach>
    </insert>

    <!-- 单条查询 -->
    <select id="selectById" resultType="com.akai.mybatisplugdemo.model.User">
        SELECT id, name, email, phone
        FROM user
        WHERE id = #{id}
    </select>

    <!-- 批量查询 -->
    <select id="selectByIds" resultType="com.akai.mybatisplugdemo.model.User">
        SELECT id, name, email, phone
        FROM user
        WHERE id IN
        <foreach collection="ids" item="id" open="(" separator="," close=")">
            #{id}
        </foreach>
    </select>

</mapper>

```
测试Controller

```java
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @PostMapping("/add")
    public String add() {
        User u = new User();
        u.setPhone("13800001234");
        u.setName("牛魔王");
        u.setEmail("250128418@qq.com");
        userMapper.insert(u);
        return "ok";
    }

    @GetMapping("/{id}")
    public User get(@PathVariable Long id) {
        return userMapper.selectById(id);
    }
}
```
Controller类(支持批量插入和查找包含敏感信息的数据)
```java
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    // 单条插入
    @PostMapping("/add")
    public String add() {
        User u = new User();
        u.setPhone("13800001234");
        u.setName("牛魔王");
        u.setEmail("250128418@qq.com");
        userMapper.insert(u);
        return "ok";
    }

    // 批量插入
    @PostMapping("/addBatch")
    public String addBatch() {
        List<User> users = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            User u = new User();
            u.setName("用户" + i);
            u.setPhone("1380000" + i + "234");
            u.setEmail("user" + i + "@qq.com");
            users.add(u);
        }
        userMapper.insertBatch(users);
        return "ok";
    }

    // 单条查询
    @GetMapping("/{id}")
    public User get(@PathVariable Long id) {
        return userMapper.selectById(id);
    }

    // 批量查询
    @PostMapping("/getBatch")
    public List<User> getBatch(@RequestBody List<Long> ids) {
        return userMapper.selectByIds(ids);
    }
}

```
测试实体类

```java
@With
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor

public class User {
    private Integer id;
    private String name;
    @EncryptField
    private String email;
    @EncryptField
    private String phone;
}
```

建表SQL

```SQL
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
```
## PostMan测试
Post方法：
![image-mybatisplug2.png](../../.vuepress/public/images/image-mybatisplug2.png)
Get方法：注意这里查找2是因为已经测试过一次了
![image-mybatisplug3.png](../../.vuepress/public/images/image-mybatisplug3.png)


