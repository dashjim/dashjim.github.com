---
layout: post
title: 提速10倍！- 使用JVisualVM优化你的Java程序
categories:
- Common Tec
tags:
- Java
---

> 作者参于过一个Android项目由近100个程序员开发了3年时间，基本上是把一个服务器做到手机里，当时还是单核时代，整个项目最大的挑战就是性能问题，其间关于框架是不是性能瓶颈有过激烈的争论。本人负责性能优化时使用创新性的方法借助Android的工具TraceView解决了如下问题。度量程序中框架与每一个模块各自的计算资源消耗是多少？性能瓶颈在哪里？然后进行有针对性的优化并最终数倍提升了程序的性能，这种在Android上得来的经验最终可以推广到普通的Java程序中来。作者的一个结论是任何没有经过系统性优化的Java程序，使用本文中的方法最少可以提速一倍，最高可至10倍。

### 性能优化的方法论

性能优化一般是在有了性能问题的时候才进行，在进行了一轮优化后，这一活动的较果一定要是可度量的，没有度量的优化是不可能抓住重点的。所以性能优化大体的流程一定是`度量->优化->度量`这样一个个循环。性能优化的最高标准是将其固化到开发的流程中，比如说在每一次Scrum的结尾做一次优化，或者像作者当年那样，将性能度量做到集成测试里，每天都会自动运行并报警。这个最高级别可以称为性能的持续优化级。

### 如何度量

相信大家在开发中一定会产生对程序所依赖的容器，类库，框架甚至JVM的性能产生过疑虑，但是往往双不知如何下手。这就轮到JVisualVM出场，它是Oracle JDK自带的图形化工具，与Android提供的TraceView有类似之处，可以度量VM上每一个方法级别的CPU、内存消耗。然面除此之外，_最重要的是它可以累计每一个package在一段时间内的CPU消耗_，而我们的Java程序中的模块一定是按package来划分的。


** 如何用JVisualVM度量模块的消耗 **

![Before rebase](/media/pic2014/0317-0.png)

在JVM的层面上无论是你的业务程序还是第三方类库都是字节码。

** After rebase **

> Notice: dev commit ccd4673 changed to 9d76e0b

![After rebase](/media/pic2014/0317-1.png)

** Conclusion**

Rebase do not like merge - which will cause a commit, and from the tree you cannot see when the dev is split out and when it is merged back. - So Linus calls it is a _clean_ for history.
