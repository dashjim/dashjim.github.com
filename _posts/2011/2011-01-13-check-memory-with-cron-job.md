---
layout: post
title: Check Memory With Cron Job
categories:
- Programming
tags:
- Shell
---

更新:crontab 默认的环境变量比较少,所以你需要设置自己的运行程序所需要的环境变量

手头维护着一个蛮旧的系统，是SUN之前开发，时间一长就偶尔会内存溢出，占内存达百分之八十多，苦于又没有源码，所以今天写了个小脚本用来检测，发现情况不对狠狠的杀掉重启。  
使用crontab进行配置，每隔2分钟进行一次检查

{% highlight bash %}
crontab -e  
*/2 * * * * sh /home/admin/checkmem.sh
{% endhighlight %}

checkmem的脚本为
{% highlight bash %}
#!/bin/bash
export PATH=$PATH:java的bin:xxxx
export JAVA_HOME=/usr/xxx/java
javaMem=`top -b -n 1|grep java|awk '{print $10}'`
DATE=`date +"%Y-%m-%d %H:%M:%S"`
echo "$DATE $javaMem" >> /home/admin/checkmem.log

if [ `echo "$javaMem>55.0"|bc` -eq 1 ]; then
   echo "restart tomcat" >> /home/admin/checkmem.log
  killall -9 java
  nohup sh /home/admin/apache-tomcat-6.0.29/bin/startup.sh & >/dev/null
fi
{% endhighlight %}
脚本每次检查都会将结果记录到日志文件中，方便查看。