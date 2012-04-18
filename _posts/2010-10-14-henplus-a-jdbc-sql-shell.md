---
layout: post
title: HenPlus
categories:
- Programming
tags:
- Java
---

今天给大家介绍一个简单易用的基于JDBC的SQL-shell：HenPlus
由于在线上环境没有root权限，所以我们无法完成程序的安装，安装HenPlus，首先需要安装一个java-readlinehttp://java-readline.sourceforge.net/，在编译安装的时候会提示你没有权限，但是目标文件都已经编译好了，一个libJavaReadline.so ，一个libreadline-java.jar。一会儿我们会使用到这两个文件。

然后我们下载安装henplus，安装的时候指定目录，你就安装到你的home目录下的某个子目录里就ok了。安装应该没有问题，安装好了之后，你会发现有两个子目录。bin和share，bin是启动脚本，share是jar包。
这个时候你运行bin下的脚本会报错，需要对henplus进行修改

{% highlight bash %}
# location of the readline lib.
# Modify this, if you installation stores this at a different
# position.
LD_LIBRARY_PATH=$THISDIR/../lib:../share/jni:$LD_LIBRARY_PATH
CLASSPATH=$CLASSPATH:../share/libreadline-java.jar:../share/oracle-jdbc-10.1.0.2.0.jar
{% endhighlight %}

这个地方指定到刚刚编译好的两个文件，保存。当然为了方便，我也直接将oracle的jdbc的驱动指定了。
然后在次运行./henplus
进入到命令行后，
连接数据库

{% highlight bash %}
connect jdbc:oracle:thin:username/password@192.16.134.32:1521:xxx name
{% endhighlight %}

name是你自己取的名字，下次你再用的时候，进来后可以直接connect name,这些设置信息会默认保存在你自己home目录下.henplus中

之后你便可以运行sql什么的拉，记得sql后面加分号然后回车进行运行。