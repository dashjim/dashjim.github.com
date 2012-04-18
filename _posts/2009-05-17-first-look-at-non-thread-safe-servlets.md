---
layout: post
title: First Look At Non-Thread-safe Servlets
categories:
- Programming
tags:
- Java
- Servlet
---

Servlet名称的由来:
Servlet由字面上可以看出是指运行在服务器端的小程序,大家应该曾经听说过Java Applet这个东东,它是指运行在客户端的Java小程序.
在这之前处理动态网页一般的时候都是使用CGI(公共网关接口)来处理,但是CGI处理请求的时候是这样的,每得到一个请求,它就会创建一个新的进程来进行处理,这样对计算机资源的消耗可能是有点大的.
而Servlet的处理过程就完全不一样了, 当Servlet每接受到一个请求, 是使用一个线程来进行处理的,而Servlet本身始终只保持一个实例.所以我们可以下一个这样的结论,Servlet是单实例多线程的运行方式，每个请求在一个独立的线程中运行，而提供服务的Servlet实例只有一个。
一般情况下Servlet的容器的工作情况如下:

![Servlet容器示意](http://farm8.staticflickr.com/7120/7075762499_60640bd472_z_d.jpg)

拿Tomcat来说吧,在配置文件中你可以配置最大线程数和最小线程数,线程池在Web容器初始化的时候,初始了最小线程数个工作线程,当一个请求过来时,需要判断是静态资源还是映射到某个servlet,如果是servlet的话就去找,如果当前的servlet没有被初始化,初始化时会调用Servlet的init方法.那么会创建一个这个Servlet的实例,下次有线程需要用到这个Servlet的时候直接使用就可以了. 使用的时候会调用Servlet的service方法.
由上面这样的工作方式,你也许会发现,Servlet对象里的对象成员是线程不安全的,比如说某个线程修改了Servlet对象中的一个属性,那么另一个线程读取的时候是读取的修改之后的值.所以我们一般情况下是不会在Servlet中定义成员变量的.

为此我做了一个小小的实验,本实验使用的构建工具为maven,如果你想要运行或部署此demo相当的简单,只需安装配置好maven后,然后在项目的根目录下 输入 mvn jetty:run 即可,mvn会帮你自动安装jetty和相关插件的.

实验的代码相当的简单,
{% highlight java %}
package com.luke;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class TestServlet extends HttpServlet
{

private int openCount=0;

protected void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
{

doPost(httpServletRequest, httpServletResponse);
}

protected void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
{

int countLocal = 0;
openCount++;
countLocal++;
PrintWriter printWriter = httpServletResponse.getWriter();
printWriter.println("openCount = " + openCount);
printWriter.println(" localCount = " + countLocal);
}

}
{% endhighlight %}
每一个新的请求都会将这个Servlet的成员变量+1,所以openCount一直在变,本例只是想说明Servlet是线程不安全的.