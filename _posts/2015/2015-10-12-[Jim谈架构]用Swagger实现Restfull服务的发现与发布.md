---
layout: post
title: ［Jim谈架构］用Swagger实现Restful服务的发现与发布 
categories:
- Common Tec
tags:
- Java
---


> [Swagger](http://swagger.io)是一个新兴的支持多语言（Python, Java等）的Rest服务的编档与API发布工具集。作者在写作本文前搜索了相关的中文介绍，但是发现大多都没有提到重点，特写作此文。
-----------------

### 你当前的Retfull项目还缺什么

#### 如何保证文档与API的一至性与准确性

在服务器端Restful API做好后，如何让其它的使用者知道我有哪些接口可以调用？接口的细节是什么？如何使用？在现阶段很多公司的做法都是手工维护一个单一的文档，然后把它发布到网上，比如新浪Weibo的公开API。这种做法的最明显问题是随着服务器端API版本的更新，难以维护全部文档的准确性，同时这要消耗额外的人力。

Swagger的Java版本支持'Spring MVC / Boot'，只要在相关的API上加上'@API'的Annotation就可以自动生成对接口的描述，并且可以以JSON或者HTML的形式随服务器发布在指定的端口上。如果不想加入@API还有更懒的办法，参考下面这个开源的小项目。 [Springfox](http://www.hascode.com/2015/07/integrating-swagger-into-a-spring-boot-restful-webservice-with-springfox/)

下面网页的左边是生成的JSON描述，右边是HTML描述。[预览Swagger生成的文档](http://editor.swagger.io/#/)

![预览图](/media/pic2015/1012-0.png)
Swagger生产的文档不仅仅是对API的描述，你还可以直接对每API做测试！

![预览图](/media/pic2015/1012-1.png)

#### 自动生成从API描述文档生成客户端

现在文档可以即时发布在服务器上了。这还没完，Swagger还提供了Client工具，可以自动读取Swagger生成的Restful API文档，因为该文档中以经包含了每个API签名的所有信息，这些工具还可以自动生成（Java/Python/JS等）调用这些客户端的代码。WoW，是不是很Cool？其实一点也不酷哈，在基于SOAP的WebServices协议族里Swagger的这一功能是可以通过Axis与WSDL来实现的，其实Swagger就是借鉴了之前的设计。

### 参考文档

1. [Integrating Swagger into a Spring Boot RESTful Webservice with Springfox](http://www.hascode.com/2015/07/integrating-swagger-into-a-spring-boot-restful-webservice-with-springfox/)
2. [Documenting a REST API with Swagger and Spring MVC](http://blog.zenika.com/index.php?post/2013/07/11/Documenting-a-REST-API-with-Swagger-and-Spring-MVC)
3. [Documenting Restful Webservice - Spring Boot & Swagger UI](http://www.javacodegeeks.com/2015/03/spring-boot-swagger-ui.html)
