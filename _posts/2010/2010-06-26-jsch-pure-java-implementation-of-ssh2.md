---
layout: post
title: Jsch – Pure Java implementation of SSH2
categories:
- Programming
tags:
- Java
- SSH
---

## 一.SSH的介绍

SSH(Secure Shell)是一种网络协议,用于互联网上不同设备之间信息的安全传输.在安全性方面其使用了公钥的加密技术.
关于SSH还有一个故事,以前有一个叫做Tatu Ylönen的芬兰程序员开发了一个叫做SSH的网络协议和服务程序,后来Tatu Ylönen对SSH源码的协议进行了改变,以至于远远超出了公开源代码许可的限度.这引起了很多依赖ssh的人的不满,于是OpenBSD的开发人员便着手开发自己的SSH,于是OpenSSH便诞生了. 

目前大都数的Linux中都运行着OpenSSH,为用户安全的提供远程登录管理和其他数据传输的功能.  

## 二.JSCH的介绍

相对于C实现的openssh,今天我要说的是一个Java的SSH2实现,这样我们就可以完全通过java来调用ssh实现一些功能,比如通过jsch远程执行一些linux命令,或者通过jsch实现一个基于java的sftp客户端等等.  
  
JSCH的官方网站http://www.jcraft.com/jsch/
Maven中的坐标http://mvnrepository.com/artifact/com.jcraft/jsch/0.1.42
  
目前有许多项目都是用到了jsch:

Ant(1.6 or later). 
JSch has been used for Ant’s sshexec and scp tasks.  
Eclipse(3.0).
Our Eclipse-CVSSSH2 plug-in has been included in Eclipse SDK 3.0. This plug-in will allow you to get ssh2 accesses to remote CVS repository by JSch.  
NetBeans 5.0(and later)  
Jakarta Commons VFS  
Maven Wagon  
Rational Application Devloper for WebSphere Software  
HP Storage Essentials  
JIRA  
可惜的是JSCH并没有文档,所以很多时候只能看样例代码或者自己看api文档来摸索使用.
在介绍如何使用之前先看下一个必要的知识.

一个ssh的连接我们称之为一个Session,从一个建立好的Session中我们可以获取各种类型的Channel,每一种Channel的功能是不一样的.如exec通道是用来执行一个单独的命令并获得返回结果,shell远端终端方式的交互,sftp可以传输文件等,具体的通道类型可以看这里http://www.ssh.com/support/documentation/online/ssh/guardian/11/scb_ssh_channel_types.html

通常我们本机的ssh的相关文件保存在~/.ssh目录下
我们可以通过ssh-keygen -t rsa 来生成一对ras类型的公私钥.

## 三.代码片段示例

### 1.初始化Session

JSch jsch = new JSch();
//当然你也可以通过密码的方式进行用户的验证
//密码的验证方式需要在下面使用session.setPassword("pass");
jsch.addIdentity("/home/luke/.ssh/id_rsa");
Session session = jsch.getSession("user", "hostname", 22);
session.setConfig("StrictHostKeyChecking", "no");
// making a connection with timeout.
session.connect(30000);
这样一个ssh的Session便建立好了,下面我们可以通过这个Session获取一些Channel,运行一些功能

### 2.exec channel 示例

{% highlight java %}
Channel channel = session.openChannel("exec");
//command is your command to be exexuted
((ChannelExec) channel).setCommand(command);
BufferedReader fromServer = new java.io.BufferedReader(new InputStreamReader(
(channel.getInputStream())));
channel.connect();
StringBuffer sb = new StringBuffer();
Thread.sleep(1000);
while (fromServer.ready()) {
String tt = fromServer.readLine();
sb.append(tt+'\n');
}
channel.disconnect();
System.out.println(sb.toString);
{% endhighlight %}

在ssh的channel中,我们的输入输出都是建立在Java I/O的流模型之上的,
Channel向远程服务的输出为OutputStream,远程机器返回的内容是通过Channel的InputStream,
所以我们可以以流的形式向Channel的OutputStream放要传给远程机器的命令,也可以从Channel的InputStream中读取内容.(这一点在shell类型的channel中尤为重要)

### 3.sftp channel的代码片段示例

{% highlight java %}
ChannelSftp channel = (ChannelSftp)session.openChannel("sftp");
channel.connect(1000);
channel.get("远程文件", "本地目录");
channel.disconnect();
{% endhighlight %}

这样我们便实现了获取远程文件的功能,更多使用方法还请参阅官方jar包中的实例代码.