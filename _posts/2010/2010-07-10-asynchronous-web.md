---
layout: post
title: Why Asynchronous Web
categories:
- Programming
tags:
- Java
---

这两天在继续了解web应用中的异步处理问题。
然后看到了淘宝文初的博客http://blog.csdn.net/cenwenchu79
，他在几篇文章中多次提及jetty的continuation和servlet3的异步处理特性。看了之后收获不少。

#### 异步处理的层次

异步处理在Web应用中可以分三个层次:

* Socket数据传输的异步化，NIO
* HTTP请求的异步化（Jetty Continuation，Servlet 3）
* 后台服务的异步化

#### 异步处理的原因

我们肯定会思考，为何需要异步化呢？

当访问的并发量很大的时候，如果Socket数据传输如果不做异步化处理，那么每一个socket连接都需要一个单独的线程来处理socket io，这样无疑会花费很多的系统资源，而且程序员需要考虑避免死锁,线程安全等问题。当java引入nio后，就有了异步的socket处理方式，将和socket关联的socketchannel注册到一个selector中，然后调用selector的select方法，当某一个socket有数据可读的时候，就会自动的反应到selector检测的结果中，这样便可以异步的进行处理。
当每一个请求的处理时间较长，http请求不做异步化的话，就会长期占用线程池中的线程（没有线程池或者线程池的最大线程数设置的过大的话，会产生内存消耗过大的问题），那么新的http请求将无法得到及时的响应，大部分的thread都进入阻塞状态。当引入jetty的continuation或者servlet3的Asynchronous ,可以将当前请求先暂停，让出处理线程，当原来的请求可以响应的时候，在答复原来的请求（continuation是将request重复提交一次）。
当后台业务处理组件资源紧张的时候，如果不做异步话就会出现资源争抢的情况，就会存在锁问题，性能降低，很多线程会处理阻塞状态。一个系统模块的服务的问题可能会导致整个系统的性能问题。
所以使用异步方式的根本原因就是：

计算机的cpu或者内存等资源都是有限的，我们要控制系统线程数量，并且使得系统的整体性能不会因为某些阻塞时间较长的线程而急剧下降。