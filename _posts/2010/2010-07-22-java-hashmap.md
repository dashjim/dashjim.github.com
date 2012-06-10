---
layout: post
title: Java HashMap 核心源码解读
categories:
- Programming
tags:
- Java
---

本篇对HashMap实现的源码进行简单的分析。
所使用的HashMap源码的版本信息如下：

{% highlight java %}
/*
* @(#)HashMap.java	1.73 07/03/13
*
* Copyright 2006 Sun Microsystems, Inc. All rights reserved.
* SUN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
{% endhighlight %}

### 一.概述

在Java中每一个对象都有一个哈希码，这个值可以通过hashCode()方法获得。hashCode()的值和对象的equals方法息息相关，是两个对象的值是否相等的依据，所以当我们覆盖一个类的equals方法的时候也必须覆盖hashCode方法。

例如String的hashCode方法为：

{% highlight java %}
public int hashCode() {
int h = hash;
if (h == 0) {
int off = offset;
char val[] = value;
int len = count;

for (int i = 0; i < len; i++) {
h = 31*h + val[off++];
}
hash = h;
}
return h;
}

{% endhighlight %}

可以看得出，一个字符串的哈希值为s[0]*31^(n-1) + s[1]*31^(n-2) + … + s[n-1]，是一个整数。也就是说所有的字符串可以通过hashCode()将其映射到整数的区间中，由于在java中整数的个数是有限的（四个字节有正负，第一位为符号位-2^31 ~ 2^31 -1），当s[0]*31^(n-1) + s[1]*31^(n-2) + … + s[n-1]足够大的时候可能会溢出，导致其变成负值。从上面的情况我们可以看出两个不同的字符串可能会被映射到同一个整数，发生冲突。因此java的开发人员选择了31这个乘数因子，尽量使得各个字符串映射的结果在整个java的整数域内均匀分布。

谈完java对象的哈希码，我们来看看今天的主角HashMap，HashMap可以看作是Java实现的哈希表。HashMap中存放的是key-value对，对应的类型为java.util.HashMap.Entry，所以在HashMap中数据都存放在一个Entry引用类型的数组table中。这里key是一个对象，为了把对象映射到table中的一个位置，我们可以通过求余法来，所以我们可以使用 [key的hashCode % table的长度]来计算位置（当然在实际操作的时候由于需要考虑table上的key的均匀分布可能需要对key的hashCode做一些处理）。

### 二.源码解析

相关属性
首先肯定是需要一个数组table，作为数据结构的骨干。

{% highlight java %}
transient Entry[] table;
{% endhighlight %}

这边定义了一个Entry数组的引用。
继续介绍几个概念把

capacity容量 是指数组table的长度   
loadFactor 装载因子，是实际存放量/capacity容量 的一个比值，在代码中这个属性是描述了装载因子的最大值，默认大小为0.75  
threshold（阈值）代表hashmap存放内容数量的一个临界点，当存放量大于这个值的时候，就需要将table进行夸张，也就是新建一个两倍大的数组，并将老的元素转移过去。threshold = (int)(capacity * loadFactor);  

put方法详解

{% highlight java %}
    public V put(K key, V value) {
        if (key == null)
            return putForNullKey(value);
        int hash = hash(key.hashCode());
        int i = indexFor(hash, table.length);
        for (Entry<K,V> e = table[i]; e != null; e = e.next) {
            Object k;
            if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {
                V oldValue = e.value;
                e.value = value;
                e.recordAccess(this);
                return oldValue;
            }
        }

        modCount++;
        addEntry(hash, key, value, i);
        return null;
    }
{% endhighlight %}

在HashMap中我们的key可以为null，所以第一步就处理了key为null的情况。  
当key为非null的时候，你也许会认为：恩，直接和table长度相除取模吧，但是这里没有，而是又好像做了一次哈希，这是为什么呢？这个还得先看indexFor(hash, table.length)方法，这个方法是决定存放位置的  

{% highlight java %}
    static int indexFor(int h, int length) {
        return h & (length-1);
    }
{% endhighlight %}

明眼的都可以发现，因为在HashMap中table的长度为2^n (我们把运算都换成二进制进行考虑)，所以h & (length-1)就等价于h%length，这也就是说，如果对原本的hashCode不做变换的话，其除去低length-1位后的部分不会对key在table中的位置产生任何影响，这样只要保持低length-1位不变，不管高位如何都会冲突，所以就想办法使得高位对其结果也产生影响，于是就对hashCode又做了一次哈希
  
{% highlight java %}
    static int hash(int h) {
        // This function ensures that hashCodes that differ only by
        // constant multiples at each bit position have a bounded
        // number of collisions (approximately 8 at default load factor).
        h ^= (h >>> 20) ^ (h >>> 12);
        return h ^ (h >>> 7) ^ (h >>> 4);
    }
{% endhighlight %}

当找到key所对应的位置的时候，对对应位置的Entry的链表进行遍历，如果以及存在key的话，就更新对应的value，并返回老的value。如果是新的key的话，就将其增加进去。modCount是用来记录hashmap结构变化的次数的，这个在hashmap的fail-fast机制中需要使用（当某一个线程获取了map的游标之后，另一个线程对map做了结构修改的操作，那么原先准备遍历的线程会抛出异常）。addEntry的方法如下

{% highlight java %}
    void addEntry(int hash, K key, V value, int bucketIndex) {
    Entry<K,V> e = table[bucketIndex];
        table[bucketIndex] = new Entry<K,V>(hash, key, value, e);
        if (size++ >= threshold)
            resize(2 * table.length);
    }
{% endhighlight %}

get方法  

{% highlight java %}
   public V get(Object key) {
        if (key == null)
            return getForNullKey();
        int hash = hash(key.hashCode());
        for (Entry<K,V> e = table[indexFor(hash, table.length)];
             e != null;
             e = e.next) {
            Object k;
            if (e.hash == hash && ((k = e.key) == key || key.equals(k)))
                return e.value;
        }
        return null;
    }
{% endhighlight %}

get方法其实就是将key以put时相同的方法算出在table的所在位置，然后对所在位置的链表进行遍历，找到hash值和key都相等的Entry并将value返回。