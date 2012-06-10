---
layout: post
title: NSImage
categories:
- Programming
tags:
- objc
- Cocoa
---

### 1.图片的加载

NSImage 这个应该是经常用到的一个类，最常用的莫过于 [NSImage imageNamed:@"name"] 来加载一个资源中的图片。
可能这并没有你想象的那么简单。

{% highlight objc %}
NSImage *myImage = [NSImage imageNamed:@"imageName.png"] ;
{% endhighlight %}

加载一个图片的时候,先到到缓存中搜寻，看cache中是否存在，如果不存在则从资源中加载，用完了之后，其实这个图片会被缓存起来，且在缓存中一个图片对应一个唯一标识，默认为不带后缀的图片名(具体方式)，
当然你可以主动的为某一个图片注册一个自己的标识，比如

{% highlight objc %}
NSImage *myImage = [NSImage imageNamed:@"imageName.png"] ;
[myImage setName:@"myImage"];
{% endhighlight %}

这样之后你就可以通过[NSImage imageNamed:@"myImage"]来获取这个缓存中的图片了，如果你硬是不想缓存某个图片，那么你可以在用完了图片之后进行如下操作

{% highlight objc %}
[myImage setName:nil];
{% endhighlight %}

这样下次你加载图片的时候就会重新从资源中加载了。

### 2.坐标系的问题

在cocoa中默认情况下的View采用的坐标系是类似于数学坐标系的，左下角为坐标原点（在cocoa touch中，左上角为坐标原点）。
但是为了方便，cocoa中有些控件默认情况下是Flipped的（如NSTableView NSButton 链接），即坐标原点在左上角，这当然是为了控件实现的方便。

如果你需要在一个Flipped View中画一个NSImage，那你得注意了，最好别用NSImage的setFlipped方法（Deprecated in Mac OS X v10.6），因为前面讲过了，图片是在缓存中的，可能你下次需要在一个非Flipped View中画这个图，那你之前把图片设置成flipped会造成影响，所以NSImage在draw的时候优先选择drawInRect:fromRect:operation:fraction:respectFlipped:hints:这个方法