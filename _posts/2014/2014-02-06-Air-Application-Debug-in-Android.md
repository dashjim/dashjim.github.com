---
layout: post
title: Adobe Air App跑在Android上的兼容性问题
categories:
- Technology
tags:
- Adobe Flex, Adobe Air, Android, Flash Builder
---

> 这一两个月又把Flash Builder捡起来做了一段时间的Air开发。要求Air APP要能同时运行在PC, Android上。遇到兼容性问题现在全部解决。

### Input控件不能输入中文
解决之道，在FB的编译选项里有一个Language的参数，删除就行了。
### APP的视频在某平板上不能显示H.264的视频
花了一个多星期才搞定，各种Debug。最终发现是Air Runtime版本的问题。Android Market上只有最新版的Air，到哪里才能找到不同的版本呢？经过一番查找，最终在联想的乐商店找到了各种历史版本，然后一个个的试，终于Air 3.1上跑出来了。

### 关于Air Runtime的Tips: 
 
* TIP 1

由于Air的版本不停更新，如何保证在旧版上测试并发布过的APP在用户更新了Air Runtime后不会出兼容问题呢？答案是使用`Apk-captive-runtime`编译参数。示例如下：

```
adt -package -target apk‑captive‑runtime -storetype pkcs12 -keystore SigningCert_test.p12 InStoreApp.apk InStoreApp-app.xml InStoreApp.swf icons res Default.png
```
这个参数的作用是把Air Runtime绑定在APK中，这样不用用户去单独安装Air，即使用户安装了其它的版本也不会被用到。

* TIP 2

AIR的SDK目前是3.9，但FB 4.7中自带的还是3.1。如何在FB中升级或切换使用不同的AIR　SDK？官方有如下两篇文档，但是没说清楚反而误导群众。

> [http://helpx.adobe.com/flash-builder/kb/overlay-air-sdk-flash-builder.html](http://helpx.adobe.com/flash-builder/kb/overlay-air-sdk-flash-builder.html)

> [http://helpx.adobe.com/x-productkb/multi/how-overlay-air-sdk-flex-sdk.html](http://helpx.adobe.com/flash-builder/kb/overlay-air-sdk-flash-builder.html)
    
需要补充的是，我们要下载**两个不同版本**的AIR　SDK，分别覆盖不同的文件目录（Flex SDK，和Plugin）。之前一定要**做好备份**。



