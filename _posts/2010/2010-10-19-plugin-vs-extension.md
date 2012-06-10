---
layout: post
title: 插件和扩展的区别
categories:
- Programming
tags:
- Sofeware
---

尽管我们每天都和浏览器的插件或者扩展打交道，但很多人还是无法正确区分插件和扩展的差异。  
插件（Plugins）顾名思义，就是将别的东西“插”进来,这里就拿浏览器举例子吧，在浏览器中，插件的功能就是将第三方的库提供的功能通过embed，object标签在页面中应用起来，比如Flash插件，Silverlight插件，Quicktime插件。这些插件就像驱动程序一样，使得你的浏览器可以调用本地方法，系统的接口，实现浏览器无法独立实现的功能，或者这么讲，插件使得别的程序才能处理的内容在浏览器的页面中得以展现和处理。  

那扩展（Extensions or Add-ones）呢？扩展通常是通过程序自身所开放的api来实现的用于扩展程序自身功能的东西，在浏览器中，比如Firefox的Firebug，浏览器的Twitter的插件，这些插件很多都是增加一些浏览器上的窗口或者按钮，来扩展浏览器的功能。这里有一点需要说明一下，扩展本身可以包含一个或者多个插件，但是插件不包含扩展。  

参考了 [http://colonelpanic.net/2010/08/browser-plugins-vs-extensions-the-difference/](http://colonelpanic.net/2010/08/browser-plugins-vs-extensions-the-difference/)