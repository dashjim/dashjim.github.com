---
layout: post
title: 基于TCP和无线网络（3G）的实时应用需要注意的问题
categories:
- Telecom
tags:
- Flex, Adobe AIR, Video, TCP
---

     



最近工作中把一个实时的基于Adobe Air的实时视频聊天程序porting到Android上。原本PC版本测试时视频的质量很好，但是转到Android上后在3G网络上测试发现视频质量比较差。由于Air程序与服务器是通过RTMP这一基于TCP的协议来沟通的，在解决问题的过程中有一些关于TCP的小小发现。

----------


## 3G下测试出的情况
在3G网络下测试的时候我先在设备上运行了一个网速测试的APP，得出当时的网速是上行4.5M下行1.6M左右，对WCDMA来说这是一个比较好的数字，而我们的服务器设置中视频质量仅需要320K的带宽就够了。然而实际通话时的视频和音频质量都非常差（最后双方关上视频，仅用音频的质量都比较差）。

## 服务器上抓包
> **NOTE:**
> 需要注意抓包的准确性问题。在服务器上如果用tcpdump抓包，特别是像视频实时应用的时候由于数据量大，tcpdump依赖的底层库可能会来不及处理而buffer溢出，使得数据文件不完整。这样在用wireshark分析的时候会看到的丢包量就是不准确的。
![](/media/pic2014/0201-2.png)
>解决方法参考[tcpdump抓包丢失问题](http://wenku.baidu.com/view/74b3166e1eb91a37f1115cf6.html)。

在分析抓到的包时我们看到大量的丢包，如下图：
![](/media/pic2014/0201-1.png)

###更多测试的结果
下面的对比测试中我们对比一下不同丢包情况所导致的不同TCP吞吐率曲线。（前面一个小峰是带宽测试留下的。）

下图是视频质量好的时候的TCP呑吐率情况
![](/media/pic2014/0201-4.png)
下图是视频时断时续丟包
![](/media/pic2014/0201-5.png)
下图是视频几乎无法进行的情况
![](/media/pic2014/0201-6.png)

由上面的图形我们看到不同的丢包对TCP传输率产生了不同的影响。
## 3G带宽与TCP丢包

这轮测试下来得出的重要结论是**TCP在WCDMA3G下的网速远达不到其宣称值**！因为丢包会导致TCP误以为是网络拥塞，而双方减小收发窗口，主动降速。
下图就是我实测的TCP网速。
![](/media/pic2014/0201-3.png)
再来看一下维基是怎么说这个问题的：
> [TCP_over_wireless_networks](http://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_over_wireless_networks)

> TCP has been optimized for wired networks. Any packet loss is considered to be the result of network congestion and the congestion window size is reduced dramatically as a precaution. However, wireless links are known to experience sporadic and usually temporary losses due to fading, shadowing, hand off, and other radio effects, that cannot be considered congestion. After the (erroneous) back-off of the congestion window size, due to wireless packet loss, there can be a congestion avoidance phase with a conservative decrease in window size. This causes the radio link to be underutilized. Extensive research has been done on the subject of how to combat these harmful effects. Suggested solutions can be categorized as end-to-end solutions (which require modifications at the client or server),[38] link layer solutions (such as RLP in cellular networks), or proxy based solutions (which require some changes in the network without modifying end nodes).


> [参考3G的标称网速](http://en.wikipedia.org/wiki/3g)
 
> HSPA is an amalgamation of several upgrades to the original W-CDMA standard and offers speeds of **14.4 Mbit/s** down and **5.76 MBit/s** up. HSPA is backwards compatible with and uses the same frequencies as W-CDMA.

注意标称网速不包括自身的信令消耗，所以150M的WiFi实际数据传输速度超不过80兆。3G消耗的信令可能更多。

## 如何改进


**带宽检测**

大多数实时通信程序都会在链接建立前发几个包测试带宽，这种做法在传统网络问题不大（会部分受到tcp slow start的影响）。但是在3G下，这几个包如果不丢，测出的速度会过高，如果有丢包，则测出的速度会过低。

所以在3G下的应用必须在链接建立后实时监测通信质量，如果发现延迟增加等情况要实时降低视频分辨率以保证流畅。

另一种简单办法是延长一开始的带宽测试时间。比如说测十秒。我曾在与Skype的对比测试中发现从拨号到对方实际振铃有较长延迟，这中间有可能就是在测带宽。


**UDP**

使用基于UDP的传输协议可以从根本上解决以上问题。
