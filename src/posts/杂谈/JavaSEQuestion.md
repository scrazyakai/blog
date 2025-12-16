---
title: Java基础八股
icon: pen-to-square
date: 2025/10/2
categories:
 - 杂谈
tags:
 - JavaSE八股
star: true
sticky: true
cover: "https://akainews.oss-cn-beijing.aliyuncs.com/images/top-1.gif"
---


## 1. Java语言有哪些特性

跨平台性、面向对象、平台无关性

## 2. JVM、JDK、JRE有什么区别

JVM(Java虚拟机)：是实现跨平台的关键

JDK(Java开发工具包)：一整套完整的JavaJDK

JRE(Java运行环境)：包括Java运行需要的库以及JVM

![img.png](../%E5%9B%BE%E7%89%87/img.png)

## 3. 说说什么是跨平台，原理是什么

Java一次编译到处运行,原理是加入了一个中间件——JVM，JVM中.calss文件被翻译成各个系统的机器码

## 4. 什么是字节码，使用字节码的好处是什么

Java代码编译后产生的.class就是字节码，实现跨平台的特性

## 5. Java有哪些数据类型

暂时无法在飞书文档外展示此内容

## 6. 自动类型转换和强制类型转换

将小范围的值或变量赋给大范围的变量的时候会自动进行类型转换，反之需要强制类型转换

## 7. 自动装箱和拆箱

装箱：将基本数据类型转化为包装数据类型

拆箱：包装数据类型会自动转化为基本数据类型

## 8. &和&&的区别

&是逻辑与操作

&&是短路逻辑与操作：左边表达式为false，右边的表达式会直接短路掉，不会再进行运算

|和||同理

## 9. break、continue、return

break:结束循环

continue:跳过此次循环，继续执行下次循环

return:程序返回，不再执行下面的代码

## 10. 说说自增和自减

符号在前是先加减再运算，符号在后是先计算再加减

## 11. float是怎么表示浮点数的


$$
float = (-1)^S \times 1.M \times 2^{E - 127}
$$


- S:符号位(1位)，0代表正数,1代表负数
- 存储指数位(8位)，使用**移码**表示（即实际指数 = E - 127，E = 实际指数+127）
- M:尾数为(23位)

> `0.1 (十进制)` 转成二进制小数：
>
> ```
> 0.1 × 2 = 0.2 → 0 
> 0.2 × 2 = 0.4 → 0 
> 0.4 × 2 = 0.8 → 0 
> 0.8 × 2 = 1.6 → 1   （取 1，余 0.6） 
> 0.6 × 2 = 1.2 → 1   （取 1，余 0.2） 
> 0.2 × 2 = 0.4 → 0 
> 0.4 × 2 = 0.8 → 0 
> 0.8 × 2 = 1.6 → 1 
> 0.6 × 2 = 1.2 → 1 
> …… 循环
> ```
>
> 结果： `0.1 (十进制)` = **`0.0001100110011001100110011...`** **(二进制无限循环)**
>
> ------
>
> 1. 科学计数法（标准化）
>
> 把二进制移到 `1.xxxx` 形式：
>
> `0.0001100110011...` → **`1.1001100110011... × 2^-4`****(小数点向右移动四位)**
>
> ------
>
> 1. 拆分 IEEE 754 结构
>
> - **符号位** = `0`（正数）
> - **指数位** = `-4 + 127 = 123` → 二进制：`01111011`
> - **尾数位** = 小数部分 `10011001100110011001100...` （只保留 23 位）
>
> 所以最终存储的大概是：
>
> ```
> 0 | 01111011 | 10011001100110011001101
> ```

## 12. 怎么保证数据准确性

1. 避免使用浮点数，减少精度产生的影响，用BigDecimal替代
2. 处理小额支付时，使用较小的单位进行运算

## 13. 面向对象的三大特征

封装：将数据和操作数据的方法捆绑在一起，形成独立的对象。

- 好处:提高安全性、隐藏实现细节

继承：子类可以继承父类的属性和方法

- 好处：代码复用、减少重复。

多态：不同类的对象对同一操作有不同的表现形式

- 提高代码扩展性和灵活性。

## 14. 多态解决了什么问题？

- 统一接口，调用方便
- 减少代码重复，提高代码复用
- 支持开闭原则(对外扩展开放，对内修改关闭)
- 代码解耦

## 15. 重载和重写的区别

|          | 重载     | 重写                     |
| -------- | -------- | ------------------------ |
| 参数列表 | 必须不同 | 必须相同                 |
| 返回类型 | 可以不同 | 必须相同                 |
| 修饰符   | 可以不同 | 大于或等于原来的修饰符   |
| 抛出异常 | 没有限制 | 父类声明异常的相同或子类 |

## 16. 访问修饰符

|          | private | default | protect | public |
| -------- | ------- | ------- | ------- | ------ |
| 同一类中 | √       | √       | √       | √      |
| 同一包中 |         | √       | √       | √      |
| 子类中   |         |         | √       | √      |
| 全部类   |         |         |         | √      |

## 17. this关键字的作用

代指当前对象

## 18. 抽象类和接口的区别
| 对比点   | 抽象类              | 接口                                             |
| ----- | ---------------- | ---------------------------------------------- |
| 关键字   | `abstract class` | `interface`                                    |
| 成员变量  | 可以有普通成员变量        | 只能有常量（`public static final`）                   |
| 方法    | 可以有抽象方法和普通方法     | JDK 1.8 前：只有抽象方法；1.8+ 可有 `default`、`static` 方法 |
| 构造方法  | ✅ 可以有            | ❌ 不能有                                          |
| 继承/实现 | 只能单继承            | 可以多实现                                          |
| 使用场景  | 抽象出类的 **共性**     | 定义行为 **规范/能力**                                 |

## 19. 成员变量和局部变量的区别

- 语法形式上

成员变量可以被访问控制修饰符修饰，局部变量不能

成员变量没有赋值会自动以默认值赋值，局部变量没有

- 创建时机

成员变量：随类创建而创建

局部变量：随方法的调用而消失

- 存储方面：

成员变量和对象一起存储在堆内存中

局部变量如果是基本数据类型存储在栈中，如果是引用数据类型存放指向堆内存的引用

## 20. static关键字

| 修饰对象 | 作用                         |
| -------- | ---------------------------- |
| 变量     | 静态变量，所有实例共享       |
| 方法     | 静态方法，类级别，与实例无关 |
| 代码块   | 类加载的时候会先加载代码块   |

## 21. final关键字有什么作用

| 用法       | 作用                 |
| ---------- | -------------------- |
| final 变量 | 值不可改变           |
| final 方法 | 方法不可被重写       |
| final 类   | 类不可被继承         |
| final 参数 | 方法内不可修改参数值 |

## 22. final、finally、finalize 的区别？

### final

- **类型**：关键字/修饰符
- **作用**：用于声明常量、防止继承、防止方法重写
- **使用位置**：可以修饰类、方法、变量
- **示例**：`final int MAX = 100;`

### finally

- **类型**：异常处理关键字
- **作用**：用于异常处理中，finally 块中的代码无论是否发生异常都会执行
- **使用位置**：配合 try-catch 使用
- 特点:
  - 通常用于释放资源（关闭文件、数据库连接等）
  - 即使 try 或 catch 中有 return 语句，finally 也会执行
  - 如果 finally 中有 return，会覆盖 try/catch 中的 return
- **示例**：

```java
try {
    // 可能抛出异常的代码
} catch (Exception e) {
    // 异常处理
} finally {
    // 无论如何都会执行的代码
}
```

### finalize

- **类型**：Object 类的方法
- **作用**：对象被垃圾回收器回收之前调用的方法
- **使用位置**：可以在类中重写此方法
- 特点:
  - 不推荐使用（Java 9 已标记为 @Deprecated）
  - 执行时机不确定，可能永远不会被调用
  - 可能影响性能
  - 建议使用 try-with-resources 或显式的 close() 方法代替
- **示例**：

```java
@Override
protected void finalize() throws Throwable {
    // 清理资源的代码
    super.finalize();
}
```

**总结**：final 用于声明不可变，finally 用于异常处理保证代码执行，finalize 用于垃圾回收（已过时）。

## 23. == 和equals()的区别

- `==`比较的如果是基本数据类型，比较的就是值。如果是引用数据类型，比较的就是引用是否相同
- `equals()`一般与`==`相同都是比较引用是否相同，但是equals()方法一般会被重写，来比较内容是否相同

## 24. 为什么重写equals()也要重写hashCode()方法

重写equals()方法而不重写hashCode()方法可能会导致两个相同的对象会有不同的哈希码，导致HashMap不能正确处理这两个对象

### 什么是hashCode()方法

hashCode 方法主要用来获取对象的哈希码(哈希码是由对象的内存地址或者对象的属性计算出来的，它是⼀个 int 类型的整数，通常是不会重复的，因此可以用来作为键值对的建，以提高查询效率。)

### 为什么两个对象有相同的哈希值但不是同一个对象？

由于哈希函数将一个较大的输入域映射到一个较小的输出域，不同的输入值（即不同的对象）可能会产生相同的输出值即哈希冲突

### 总结

**只重写** **`equals`** **不重写** **`hashCode`**：逻辑相等的对象会进到不同桶，`HashMap` 会认为它们是不同的 key。

**只重写** **`hashCode`** **不重写** **`equals`**：不同对象可能哈希值相同，但 `equals` 不相等，导致逻辑错误，比如取不出值。

## 25. Java是值传递还是引用传递

Java是值传递，对象作为参数传给方法时，传递的值是对象的引用。引用的值是对象在堆中的地址

### 引用对象的特点

引用对象存储的是对象的地址而不是对象本身。因此引用类型在值传递时传递的是对象的地址

## 26. 说说深拷贝和浅拷贝的区别

- 浅拷贝：创建一个新的对象，这个对象的属性和原对象的属性完全相同，如果属性是基本数据类型，拷贝的就是基本数据类型的值，如果是引用数据类型，拷贝的就是引用地址，新旧对象共享同一个引用对象。拷贝方法：实现Cloneable接口并重写clone方法
- 深拷贝：创建一个对象，递归复制所有的对象引用，新对象和原对象完全独立，两个对象的修改不会相互影响。拷贝方法:手动拷贝、序列化

## 27. Java创建对象的方式有哪几种？

- new关键字

```Java
Person person = new Person();
```

- 通过反射

```Java
Class clazz = Class.forName("Person");
Person person = (Person)clazz.newInstance();
```

- Clone

```Java
Person person = new Person();
Person person1 = (Person)person.clone();
```

- 序列化和反序列化

```Java
Person person = new Person();
ObjectOutputStream objectOutputStream = new ObjectOutputStream(new FileOutputStream("person.text"));
objectOutputStream.writeObject();
objectOutputStream.close();
ObjectInputStream objectInputStream = new ObjectInputStream(new FileInputStream("person.text"));
Person person1 = (Person)objectInputStream.readObject();
objectInputStream.close();
```

## 28. String是Java的基本数据类型吗？可以被继承吗？

不是基本数据类型，不能被继承，String类被final修饰

## 29. String和StringBuilder、StringBuffer的区别

- String的字符串内容是不可变的，对字符串的操作都是创建一个新的String对象
- StringBuilder提供了对字符串增删改查操作的方法，可以在原有字符串上修改，不创建新的对象
- StringBuffer在StringBuilder基础上加上synchronized

## 30. String str1 = new String("abc") 和 String str2 = "abc" 的区别？

```Java
String str1 = new String("abc")
```

1. 会先查看常量池中是否有"abc"如果没有就会先在常量池中创建"abc"，如果有直接引用
2. 在堆内存创建新的String对象,并将其初始化为String常量池中"abc"的副本,指向的是堆中的对象
3. 该方法会分别在常量池和堆中创建对象

```Java
String str2 = "abc" 
```

直接引用常量池中的"abc"，指向的是常量池中的对象

## 31. String 是不可变类吗？字符串拼接是如何实现的？

是不可变的，String没有对字符串内容修改的公开方法且String被final修饰不能通过子类实现方法去修改字符串内容。String底层实现是被final修饰的数组

### 字符串拼接怎么实现的

### 编译期常量拼接

```Java
String a = "Hello";
String b = "World";
String c = "Hello" + "World";
```

**在编译阶段**，`"Hello" + "World"` 会被优化成 `"HelloWorld"`，直接存放在字符串常量池。

```Java
String a = "Hello";
String b = "World";
String c = a + b;
```

运行时会将a+b转换成`String c = new StringBuilder().append(a).append(b).toString();`

### 为什么什么设计成不可变的？

- 安全性：字符串常用于类加载、网络地址、文件路径，保持不可变更安全。
- 线程安全：多个线程共享同一个字符串对象不会有并发问题。
- 哈希缓存:能作为hashmap的键，提高哈希查询效率

## 32. intern 方法有什么作用？

作用：返回字符串对象在字符串常量池中的引用。

- 如果常量池中已经有一个与当前字符串内容相同的字符串，`intern()` 就返回常量池里的那个引用。
- 如果常量池中没有，就把当前字符串对象的引用（或副本）加入常量池，然后返回它。

## 33. Integer a= 127，Integer b = 127；Integer c= 128，Integer d = 128；相等吗?

`Integer a = 127等于Integer b = 127`，Java自动装箱过程中，会使用`Integer.valueOf()`方法来创建Integer对象，`Integer.valueOf()`会缓存-128~127的对象，因此a,b在常量池中有相同的`Integer`对象

`Integer c= 128，Integer d = 128`,不相同

## 34. String 怎么转成 Integer 的？原理？

两种实现：使用`Integer.parseInt(s);`或者`Integer.valueOf(s);`底层都是使用`Integer.parseInt(s);`

源码使用的是`result * radix - digit`因为Integer.MIN_VALUE绝对值比Integer.MAX_VALUE多1，能够避免溢出

```Java
//radix是进制
public static int parseInt(String s, int radix)
            throws NumberFormatException
{
    /*
     * WARNING: This method may be invoked early during VM initialization
     * before IntegerCache is initialized. Care must be taken to not use
     * the valueOf method.
     */

    if (s == null) {
        throw new NumberFormatException("null");
    }

    if (radix < Character.MIN_RADIX) {
        throw new NumberFormatException("radix " + radix +
                                        " less than Character.MIN_RADIX");
    }

    if (radix > Character.MAX_RADIX) {
        throw new NumberFormatException("radix " + radix +
                                        " greater than Character.MAX_RADIX");
    }

    int result = 0;
    boolean negative = false;
    int i = 0, len = s.length();
    int limit = -Integer.MAX_VALUE;
    int multmin;
    int digit;

    if (len > 0) {
        char firstChar = s.charAt(0);
        if (firstChar < '0') { // Possible leading "+" or "-"
            if (firstChar == '-') {
                negative = true;
                limit = Integer.MIN_VALUE;
            } else if (firstChar != '+')
                throw NumberFormatException.forInputString(s);

            if (len == 1) // Cannot have lone "+" or "-"
                throw NumberFormatException.forInputString(s);
            i++;
        }
        multmin = limit / radix;
        while (i < len) {
            // Accumulating negatively avoids surprises near MAX_VALUE
            digit = Character.digit(s.charAt(i++),radix);
            if (digit < 0) {
                throw NumberFormatException.forInputString(s);
            }
            if (result < multmin) {
                throw NumberFormatException.forInputString(s);
            }
            result *= radix;
            if (result < limit + digit) {
                throw NumberFormatException.forInputString(s);
            }
            result -= digit;
        }
    } else {
        throw NumberFormatException.forInputString(s);
    }
    return negative ? result : -result;
}
```

### new Integer(10) == new Integer(10) 相等吗

不相同，new关键字会在堆上创建不同的Integer对象，==比较两个对象的引用不相同

## 35. Object类

- TODO

## 36. 异常处理体系

暂时无法在飞书文档外展示此内容

- Error是较为严重的错误，一般不能通过程序去修复
- Exception是可以被程序处理的异常，分为编译时异常(Checked Exception)和运行时异常(Runtime Exception)
- 编译时异常需要显示处理，运行时异常没有要求必修处理他们

## 37. 异常处理的方法

- 通过throw、throws关键字将异常抛出，交给上层调用者处理
- 通过try-catch方法捕获、处理异常

### cath和finally的异常可以同时抛出吗？

不会同时抛出，finally的异常会将cath的异常覆盖掉，并向上抛出

## 38. 三道经典异常处理题

### 题目一：输出结果是什么

```Java
public class TryDemo {
    public static void main(String[] args) {
        System.out.println(test());
    }
    public static int test() {
        try {
            return 1;
        } catch (Exception e) {
            return 2;
        } finally {
            System.out.print("3");
        }
    }
}
```

最后的输出结果是：31

finally一定会执行，所以在方法结束之前会输出3，方法结束后会

### 题目二：输出结果是什么

```Java
public class TryDemo {
    public static void main(String[] args) {
        System.out.println(test1());
    }
    public static int test1() {
        try {
            return 2;
        } finally {
            return 3;
        }
    }
}
```

输出是3

### 题目三：输出结果是什么

```Java
public class TryDemo {
    public static void main(String[] args) {
        System.out.println(test1());
    }
    public static int test1() {
        int i = 0;
        try {
            i = 2;
            return i;
        } finally {
            i = 3;
        }
    }
}
```

输出是2

## 39. Java中IO分为几类

- 按照数据流方向可以分为：输入流和输出流
- 按照处理的单位可以分为：字节流和字符流
- 按功能分：节点流，处理流，管道流

### Java缓冲区溢出，如何预防

- 合理设置缓冲区大小
- 控制写入数据量

## 40. 有字节流为什么还要字符流？

字符流可以通过字节流转化而来，但这个过程很耗时，所以直接提供了可以操作字符的接口。字符流方便处理文本文档，字节流处理音频和视频

## 41. BIO、NIO、AIO之间的区别

- BIO：同步阻塞I/O，每个请求都需要一个线程来处理，线程会阻塞在 I/O 操作（如 `read()`、`accept()`）上，直到数据就绪。
- NIO：同步非阻塞I/O模型，基于 `Channel`、`Buffer` 和 `Selector`，线程不会阻塞在 I/O 操作上，而是通过 **Selector** 轮询哪些通道就绪
- AIO：异步I/O，发起I/O操作请求之后不用等待，I/O操作完成后会回调通知应用

## 42. 什么是序列化、反序列化

序列化就是将对象转换为字节流的过程

反序列化就是将字节流转换成对象的过程

### Serializable接口有什么用

用来标识一个类可以被序列化