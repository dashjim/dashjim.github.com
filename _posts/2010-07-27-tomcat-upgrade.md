---
layout: post
title: Tomcat升级
categories:
- Programming
tags:
- Java
---

之前tomcat使用的版本是5.5.26 ，由于存在DDOS攻击的漏洞，所以需要进行升级，
本来打算升级到5.5.30的，无奈发现部署了新版本的tomcat，F5就直接认为其不可用，
经过在所升级的机器上使用links之类的工具直接访问localhost，发现web应用是正常的。
这个时候把目光转移到F5上，应该和F5的健康检查有一定的关系。  

第二天，找到相应的网络工程师。一台开起tomcat5.5.30 另一台不变，果真发现5.5.30的机器被F5认为不可用。
通过求同寻异的方法，最后定位到一个通过openssl s_client -host host -port port（应用限制使用https方式访问）然后GET某个标志应用状态的页面来检查的策略上。  

通过linux下测试果然发现5.5.30上GET的结果为：  


GET /xxx/xxx/status
HTTP/1.1 400 Bad Request
Server: Apache-Coyote/1.1
Transfer-Encoding: chunked
Date: Mon, 26 Jul 2010 19:39:47 GMT
Connection: close

找到原因了，怎么办呢？为了快速解决问题，所以尝试了下6版本的安全版本6.0.28 发现GET /xxx/xxx/status的结果是OK的，于是就直接升级到这个版本。
今天再回过头来看之前5.5.30的问题的原因。

发现当指定为 HTTP/1.0的协议是可以的

{% highlight html %}
GET /xxx/xxx/status HTTP/1.0
{% endhighlight %}

两次回车
{% highlight html %}
HTTP/1.1 200 OK
Server: Apache-Coyote/1.1
Content-Length: 2
Date: Mon, 26 Jul 2010 19:46:46 GMT
Connection: close

OKclosed
{% endhighlight %}

如果指定HTTP/1.1 的话
按一次回车不会显示结果 ，如果这个时候输入host：123.343.343.43之类的host信息再回车的话，可以获取结果，但是发现连接没有关闭还可以继续发送GET请求。

{% highlight html %}
GET /xxx/xxx/status HTTP/1.1
host:127.0.0.1

HTTP/1.1 200 OK
Server: Apache-Coyote/1.1
Content-Length: 2
Date: Mon, 26 Jul 2010 19:48:55 GMT

OK
{% endhighlight %}

由于没有精力去调试tomcat的源码，而且找官方文档也没发现什么信息。唉。
  
还有tomcat在各个版本以及各个平台下的ssl的配置可能会存在各种问题
比如通过https访问的时候显示ssl_error_rx_record_too_long的错误或者显示连接被断开。
所以配置Connector 的时候，不行的话尝试添加protocol=”org.apache.coyote.http11.Http11Protocol”和SSLEnabled=”true”等参数。