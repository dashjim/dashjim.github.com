---
layout: post
title: Derby Database
categories:
- Programming
tags:
- Java
- Database
---

最近由于要给一个历史系统迁移环境，基本上属于黑盒操作，没有文档，源码倒是有。  
这个系统的有一个部分使用了derby数据库，嗯，之前听说过derby数据库是一个纯java实现的比较轻量级的数据库，只需要几个jar包就ok了，且属于apache的开源项目了。  
我遇到的第一事情是数据库文件在那里了，我得连进去看看表啊，表的数据什么的吧。于是需要一个数据库连接工具。  
搜了下发现jdk自带了一个derby连接工具叫做ij，至于为何叫ij不得而已，猜测i的意思是交互interactive的意思吧。  
ij工具的位置在$JAVA_HOME/db/bin下，使用起来也很简单。  
derby有两重运行的方式，一种是单独运行，一种是随程序一起运行和程序一起共享一个jvm。  
ij的使用非常简单。  
{% highlight bash %}
connect "jdbc:derby:/path/to/your/db;create=true;user=xxxx;password=xxx"
{% endhighlight %}
运行了之后你可以通过help;查看能够使用的命令。