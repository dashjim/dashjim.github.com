---
layout: post
title: ConcurrentHashMap原理分析
categories:
- Programming
tags:
- Java
---

## 一.Java并发基础

当一个对象或变量可以被多个线程共享的时候，就有可能使得程序的逻辑出现问题。
在一个对象中有一个变量i=0，有两个线程A，B都想对i加1，这个时候便有问题显现出来，关键就是对i加1的这个过程不是原子操作。要想对i进行递增，第一步就是获取i的值，当A获取i的值为0，在A将新的值写入A之前，B也获取了A的值0，然后A写入，i变成1，然后B也写入i，i这个时候依然是1.
当然java的内存模型没有上面这么简单，在Java Memory Model中，Memory分为两类，main memory和working memory，main memory为所有线程共享，working memory中存放的是线程所需要的变量的拷贝（线程要对main memory中的内容进行操作的话，首先需要拷贝到自己的working memory，一般为了速度，working memory一般是在cpu的cache中的）。volatile的变量在被操作的时候不会产生working memory的拷贝，而是直接操作main memory，当然volatile虽然解决了变量的可见性问题，但没有解决变量操作的原子性的问题，这个还需要synchronized或者CAS相关操作配合进行。

多线程中几个重要的概念:

#### 可见性

也就说假设一个对象中有一个变量i，那么i是保存在main memory中的，当某一个线程要操作i的时候，首先需要从main memory中将i 加载到这个线程的working memory中，这个时候working memory中就有了一个i的拷贝，这个时候此线程对i的修改都在其working memory中，直到其将i从working memory写回到main memory中，新的i的值才能被其他线程所读取。从某个意义上说，可见性保证了各个线程的working memory的数据的一致性。
可见性遵循下面一些规则：

* 当一个线程运行结束的时候，所有写的变量都会被flush回main memory中。
* 当一个线程第一次读取某个变量的时候，会从main memory中读取最新的。
* volatile的变量会被立刻写到main memory中的，在jsr133中，对volatile的语义进行增强，后面会提到
* 当一个线程释放锁后，所有的变量的变化都会flush到main memory中，然后一个使用了这个相同的同步锁的进程，将会重新加载所有的使用到的变量，这样就保证了可见性。

#### 原子性

还拿上面的例子来说，原子性就是当某一个线程修改i的值的时候，从取出i到将新的i的值写给i之间不能有其他线程对i进行任何操作。也就是说保证某个线程对i的操作是原子性的，这样就可以避免数据脏读。
通过锁机制或者CAS（Compare And Set 需要硬件CPU的支持）操作可以保证操作的原子性。

#### 有序性

假设在main memory中存在两个变量i和j，初始值都为0，在某个线程A的代码中依次对i和j进行自增操作（i，j的操作不相互依赖），

{% highlight java %}
i++;
j++;
{% endhighlight %}

由于，所以i,j修改操作的顺序可能会被重新排序。那么修改后的ij写到main memory中的时候，顺序可能就不是按照i，j的顺序了，这就是所谓的reordering，在单线程的情况下，当线程A运行结束的后i，j的值都加1了，在线程自己看来就好像是线程按照代码的顺序进行了运行（这些操作都是基于as-if-serial语义的），即使在实际运行过程中，i，j的自增可能被重新排序了，当然计算机也不能帮你乱排序，存在上下逻辑关联的运行顺序肯定还是不会变的。但是在多线程环境下，问题就不一样了，比如另一个线程B的代码如下

{% highlight java %}
if(j==1) {
    System.out.println(i);
}
{% endhighlight %}

按照我们的思维方式，当j为1的时候那么i肯定也是1，因为代码中i在j之前就自增了，但实际的情况有可能当j为1的时候i还是为0。这就是reordering产生的不好的后果，所以我们在某些时候为了避免这样的问题需要一些必要的策略，以保证多个线程一起工作的时候也存在一定的次序。JMM提供了happens-before 的排序策略。这样我们可以得到多线程环境下的as-if-serial语义。
这里不对happens-before进行详细解释了,详细的请看这里http://www.ibm.com/developerworks/cn/java/j-jtp03304/，这里主要讲一下volatile在新的java内存模型下的变化，在jsr133之前，下面的代码可能会出现问题

{% highlight java %}
Map configOptions;
char[] configText;
volatile boolean initialized = false;
// In Thread A
configOptions = new HashMap();
configText = readConfigFile(fileName);
processConfigOptions(configText, configOptions);
initialized = true;
// In Thread B
while (!initialized) 
  sleep();
// use configOptions
{% endhighlight %}

jsr133之前，虽然对 volatile 变量的读和写不能与对其他 volatile 变量的读和写一起重新排序，但是它们仍然可以与对 nonvolatile 变量的读写一起重新排序，所以上面的Thread A的操作，就可能initialized变成true的时候，而configOptions还没有被初始化，所以initialized先于configOptions被线程B看到，就产生问题了。

JSR 133 Expert Group 决定让 volatile 读写不能与其他内存操作一起重新排序，新的内存模型下，如果当线程 A 写入 volatile 变量 V 而线程 B 读取 V 时，那么在写入 V 时，A 可见的所有变量值现在都可以保证对 B 是可见的。

结果就是作用更大的 volatile 语义，代价是访问 volatile 字段时会对性能产生更大的影响。这一点在ConcurrentHashMap中的统计某个segment元素个数的count变量中使用到了。

## 二.线程安全的HashMap

什么时候我们需要使用线程安全的hashmap呢，比如一个hashmap在运行的时候只有读操作，那么很明显不会有问题，但是当涉及到同时有改变也有读的时候，就要考虑线程安全问题了，在不考虑性能问题的时候，我们的解决方案有Hashtable或者Collections.synchronizedMap(hashMap)，这两种方式基本都是对整个hash表结构做锁定操作的，这样在锁表的期间，别的线程就需要等待了，无疑性能不高。

## 三.ConcurrentHashMap实现原理

数据结构
ConcurrentHashMap的目标是实现支持高并发、高吞吐量的线程安全的HashMap。当然不能直接对整个hashtable加锁，所以在ConcurrentHashMap中，数据的组织结构和HashMap有所区别。

一个ConcurrentHashMap由多个segment组成，每一个segment都包含了一个HashEntry数组的hashtable，
每一个segment包含了对自己的hashtable的操作，比如get，put，replace等操作，这些操作发生的时候，对自己的hashtable进行锁定。由于每一个segment写操作只锁定自己的hashtable，所以可能存在多个线程同时写的情况，性能无疑好于只有一个hashtable锁定的情况。


源码分析
在ConcurrentHashMap的remove，put操作还是比较简单的，都是将remove或者put操作交给key所对应的segment去做的，所以当几个操作不在同一个segment的时候就可以并发的进行。

{% highlight java %}
    public V remove(Object key) {
    int hash = hash(key.hashCode());
        return segmentFor(hash).remove(key, hash, null);
    }
{% endhighlight %}

而segment中的remove操作除了加锁之外和HashMap中的remove操作基本无异。

{% highlight java %}
        /**
         * Remove; match on key only if value null, else match both.
         */
        V remove(Object key, int hash, Object value) {
            lock();
            try {
                int c = count - 1;
                HashEntry<K,V>[] tab = table;
                int index = hash & (tab.length - 1);
                HashEntry<K,V> first = tab[index];
                HashEntry<K,V> e = first;
                while (e != null && (e.hash != hash || !key.equals(e.key)))
                    e = e.next;

                V oldValue = null;
                if (e != null) {
                    V v = e.value;
                    if (value == null || value.equals(v)) {
                        oldValue = v;
                        // All entries following removed node can stay
                        // in list, but all preceding ones need to be
                        // cloned.
                        ++modCount;
                        HashEntry<K,V> newFirst = e.next;
                        for (HashEntry<K,V> p = first; p != e; p = p.next)
                            newFirst = new HashEntry<K,V>(p.key, p.hash,
                                                          newFirst, p.value);
                        tab[index] = newFirst;
                        count = c; // write-volatile
                    }
                }
                return oldValue;
            } finally {
                unlock();
            }
        }
{% endhighlight %}

上面的代码中关于volatile类型的变量count值得一提，这里充分利用了Java 5中对volatile语义的增强，count = c的操作必须在modCount，table等操作的后面，这样才能保证这些变量操作的可见性。
Segment类继承于ReentrantLock，主要是为了使用ReentrantLock的锁，ReentrantLock的实现比
synchronized在多个线程争用下的总体开销小。
put操作和remove操作类似。

接下来我们来看下get操作。

{% highlight java %}
    public V get(Object key) {
        int hash = hash(key.hashCode());
        return segmentFor(hash).get(key, hash);
    }
{% endhighlight %}

也是使用了对应的segment的get

{% highlight java %}
       V get(Object key, int hash) {
            if (count != 0) { // read-volatile
                HashEntry<K,V> e = getFirst(hash);
                while (e != null) {
                    if (e.hash == hash && key.equals(e.key)) {
                        V v = e.value;
                        if (v != null)
                            return v;
                        return readValueUnderLock(e); // recheck
                    }
                    e = e.next;
                }
            }
            return null;
        }
{% endhighlight %}

上面的代码中，一开始就对volatile变量count进行了读取比较，这个还是java5对volatile语义增强的作用，这样就可以获取变量的可见性。所以count != 0之后，我们可以认为对应的hashtable是最新的，当然由于读取的时候没有加锁，在get的过程中，可能会有更新。当发现根据key去找元素的时候，但发现找得的key对应的value为null，这个时候可能会有其他线程正在对这个元素进行写操作，所以需要在使用锁的情况下在读取一下value，以确保最终的值。

其他相关涉及读取的操作也都类似。