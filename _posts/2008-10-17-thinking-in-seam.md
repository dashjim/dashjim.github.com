---
layout: post
title: Thinking In Seam
categories:
- Programming
tags:
- Java
---

马越，Redhat 中国社区总架构师，作为Seam框架先行者马越，积极推动中国开源技术的发展。
今天他给我们讲解了Seam。   
  
如今Java在企业应用领域里大行其道，于是诞生了太多太多的框架，Struts，Spring,Hibernate,GWT,JSF…当面对这么多框架的时候，我们如何选择，选择之后又如何将其在服务器中跑起来，这些都需要花费人力。  
  
马越提及在欧美国家，JSF非常的流行，最近Seam的下载量更是非常的高,而中国则主要还是Struts，Spring，Hibernate居多。
首先JSF是SUN提出的JavaEE页面的规范， 有着大量的Widget组件，基于事件驱动.  
  
提及EJB大家都可能感到退却，EJB3之前，EJB确实是非常的繁琐，写一个EJB需要大量的辅助类的配合，然而EJB3出来之后，使用Java5的Annotation特性使得EJB和POJO并无差异，只是增加一些Annotation而已。  
然而JSF的生命周期和EJB的生命周期不同，这使得将两者结合起来非常的困难，然而Seam的出现改变了这一现象。Seam其实不能说它是一个框架，而是一个有状态的应用栈，通过它可以方便将其他的框架的整合在起来。  
  
在Seam中一个核心的概念就是Context，在以前的Web应用中，我们可以设计到request/response Context ,Session Context,Application Context,然而这样的设计能够很好的满足如今复杂多变的企业应用吗，显然是不够的，比如我们在网页上做一个调查问卷，可能问卷的内容不止一页，这是我们就需要一种比Request Context长而比Session Context短的生命周期的Context，这样可以横跨几个request且不会放在Seesion中占用系统资源，所以Coversation Contest 应运而生。还有一个问题，一个业务流程启动后可能需要不止一个人员的参与，所以这时需要一个比Seesion Context更广的Context，于是Seam提出了Business process context.其实这些概念都是一些简单的概念。  
  
其实Seam中是直接将Data Object暴露在页面上的。而我们现有的系统却都避免了这种情况。  