---
layout: post
title: WebRTC Windows/Linux最简单入门示例
categories:
- Technology
tags:
- C++
---


> 本例子在Windowns7/VS 2010和Linux/ARM平台下编译通过，仅播放一段本地当前文件夹下的wav文件，可用于验证WebRTC开发与运行环境.   


## 其它参考

### [官方 - WebRTC getting started](http://www.webrtc.org/reference/getting-started)
讲了如何在各种环境下设置WebRTC开发环境。


### [官方示例 - Android app](https://github.com/SDkie/Webrtc-for-Android)
其实就是上文中提到的例子，但是这个链接给的是单独的git repo，不用把整个WebRTC Repo拖下来。这个例子比较有代表性，虽说是Andorid的但是里面是通过JNI来调用C++的，所以也可以作为C++的参考示例。

### [怎样交叉编译WebRtc到ARM Linux](http://blog.sevenche.com/2014/11/How-to-cross-compile-WebRTC-for-ARM-linux/)
 本人的另一文章。

---------------------
> 本例子以GitHub Gist的形式嵌入，如果你不能访问Gist则看不到代码。

---------------------
{% gist dashjim/825675f0a309a24e22c7 main.cpp %}


---------------------
附：音频Wav文件下载


[下载Wav](/media/pic2014/test.wav)


