---
title: 手写LRU
date: 2025/10/14
icon: pen-to-square
categories:
 - 杂谈
tags:
 - LRU

---



# LRU

## 什么是LRU

LRU 是 **Least Recently Used（最近最少使用）** 的缩写，是一种经典的 **缓存淘汰算法**，核心思想是：当缓存空间已满，需要新增数据时，优先删除 “最近一段时间内使用频率最低、或最久未被使用” 的数据

## 实现方法

`accessOrder` 为 **true**  访问顺序为最近访问,false为为插入顺序访问

`loadFactor`平衡因子，默认为0.75f

`removeEldestEntry` 是 `LinkedHashMap` 的一个钩子（hook），每次 `put` 或 `putAll` 插入条目后会被调用，用于判断是否删除最老（链表头部）的元素。

```java
import java.util.LinkedHashMap;
import java.util.Map;

public class LRUCache<K,V>{
    private final int capacity;
    private final LinkedHashMap<K,V> map;
    public LRUCache(int capacity){
        this.capacity = capacity;
        this.map = new LinkedHashMap<K,V>(capacity,0.75f,true){
            protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                // 当元素数量超过容量时，删除最老的元素（LRU）
                return size() > LRUCache.this.capacity;
            }
        };

    }
    public synchronized V get(K key){
        return map.getOrDefault(key,null);
    }
    public synchronized void put(K key,V value){
        map.put(key,value);
    }
}
```

## 标准实现方法

```java
import java.util.HashMap;

public class LRUCache<K, V> {

    private final int capacity;
    private final HashMap<K, Node<K, V>> map;
    private final Node<K, V> head, tail; // 虚拟头尾节点，方便操作
    private int size;

    // 双向链表节点
    private static class Node<K, V> {
        K key;
        V value;
        Node<K, V> prev, next;
        Node(K key, V value) {
            this.key = key;
            this.value = value;
        }
    }

    public LRUCache(int capacity) {
        if (capacity <= 0) throw new IllegalArgumentException("capacity must be > 0");
        this.capacity = capacity;
        this.map = new HashMap<>();
        this.head = new Node<>(null, null); // 虚拟头
        this.tail = new Node<>(null, null); // 虚拟尾
        head.next = tail;
        tail.prev = head;
        this.size = 0;
    }

    // 获取元素
    public V get(K key) {
        Node<K, V> node = map.get(key);
        if (node == null) return null;
        moveToTail(node);
        return node.value;
    }

    // 插入元素
    public void put(K key, V value) {
        Node<K, V> node = map.get(key);
        if (node != null) {
            node.value = value;
            moveToTail(node);
        } else {
            if (size == capacity) {
                // 删除头部节点（LRU）
                Node<K, V> lru = head.next;
                removeNode(lru);
                map.remove(lru.key);
                size--;
            }
            Node<K, V> newNode = new Node<>(key, value);
            addToTail(newNode);
            map.put(key, newNode);
            size++;
        }
    }

    // 移动节点到尾部（最近使用）
    private void moveToTail(Node<K, V> node) {
        removeNode(node);
        addToTail(node);
    }

    // 从链表中删除节点
    private void removeNode(Node<K, V> node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    // 添加节点到尾部
    private void addToTail(Node<K, V> node) {
        node.prev = tail.prev;
        node.next = tail;
        tail.prev.next = node;
        tail.prev = node;
    }

    // 打印缓存（从 LRU -> MRU）
    public void printCache() {
        Node<K, V> curr = head.next;
        while (curr != tail) {
            System.out.print(curr.key + "=" + curr.value + " ");
            curr = curr.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        LRUCache<Integer, String> cache = new LRUCache<>(3);

        cache.put(1, "A");
        cache.put(2, "B");
        cache.put(3, "C");
        cache.printCache(); // 1=A 2=B 3=C

        cache.get(1);
        cache.put(4, "D"); 
        cache.printCache(); // 2=B 3=C 1=A -> 2 被淘汰

        cache.get(3);
        cache.put(5, "E");
        cache.printCache(); // 1=A 4=D 3=C -> 1 被淘汰
    }
}

```

