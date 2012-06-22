---
layout: post
title: Mac，iOS界面中的三维坐标系
categories:
- Programming
tags:
- iOS
- geomerty
---


### 一. 三维坐标系   
据说有一次笛卡尔生病了，躺在床上休息，但是他的大脑却没有休息，一只在寻思着通过什么手段把几何图形和代数方程关联起来，也就是几何图形中的每一个点怎么和方程的每一组解关联起来。这个时候他看到房顶上有一只蜘蛛在织网，蜘蛛空中爬来爬去。他想地上墙角的三面墙相交出三条线，把墙角作为原点，把这三条线作为数轴，那么蜘蛛某刻的位置可以通过这三条数轴上的数来表示，反过来，给定一组数便可以确定空间中的一点。后来笛卡尔发明了平面直角坐标系,当然上面的故事是三维空间的，只是为了说明，坐标系的作用是为了便于描述点的位置。（我们学过的除了平面直角坐标系这个二维坐标系外，还学过极坐标系，通过到原点的距离以及夹角角度来表示一个点。）

后人在笛卡尔的平面坐标系的基础上发明了三维坐标系，常用的三维坐标系分两种：左手坐标系和右手坐标系。当确定了x轴，y轴方向之后可以通过左手或右手来确定z轴的方向。下图则是左手坐标系和右手坐标系的规则示意图:   
![](http://farm8.staticflickr.com/7117/7419361874_f5d16fb101.jpg)

弯曲 拇指，食指和中指使它们两两相互垂直，拇指指向x轴正方向，食指指向y轴正方向，中指指向z轴正方向 。左手坐标系使用左手，右手坐标系使用右手。（上面示意图中的左手坐标系或者右手坐标系整体旋转后性质不变，比如左手坐标系旋转后，使得y轴正方向向下，x轴正方向保持向右，它依然是左手坐标系。）

另外还有一个左手或者右手定则来判断旋转的正方向，握住拳头，拇指指向旋转轴的正方向，四指弯曲的方向为旋转的正方向。左手坐标系使用左手来判定，右手坐标系使用右手来判定.   下图是右手的例子:   
![](http://farm6.staticflickr.com/5324/7419361824_7de70fa1af.jpg)

<br>

### 二. Mac，iOS界面中的坐标系   
话说Mac,iOS中的各种坐标系总会让初学者摸不着头脑，一会儿这样一会儿那样。不过有一点是不变的，z轴的正方向总是指向观察者，也就是垂直屏幕平面向上。

#### 1.NSView坐标系   
在Mac中NSView的坐标系默认是右手坐标系（View其实是二维坐标系，但是为了方便我们可以假设其是三维坐标系，只是所有界面的变化都是在xy平面上），原点在左下角. NSView提供了一个可以用于覆盖的方法 
{% highlight objc %}
- (BOOL)isFlipped;
{% endhighlight %}

此默认返回NO，当返回YES的时候，则坐标系变成左手坐标系，坐标原点变成左上角。   
![](http://farm6.staticflickr.com/5328/7419981432_f6c7732dfe.jpg)

在Mac的AppKit中有很多界面组件本身就使用了Flipped Coordinate System(覆盖了上面的方法并返回YES)，如NSButton，NSTableview，NSSplitView 更详细的看这里  其中Cocoa Use of Flipped Coordinates
 这一节  [https://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/CocoaDrawingGuide/Transforms/Transforms.html](https://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/CocoaDrawingGuide/Transforms/Transforms.html)
 
 <br>
#### 2.UIView坐标系 
 而在iOS的UIView中，则没有所谓的Flipped Coordinate的概念，统一使用左手坐标系，也就是坐标原点在左上角.   
 ![](http://farm6.staticflickr.com/5192/7420067916_889152557b.jpg)

<br>

#### 3.Quartz坐标系
Quartz（Core Graphics）坐标系使用的右手坐标系,原点在左下角,所以所有使用Core Graphics画图的坐标系都是右手坐标系，当使用CG的相关函数画图到UIView上的时候，需要注意CTM的Flip变换，要不然会出现界面上图形倒过来的现象。由于UIKit的提供的高层方法会自动处理CTM（比如UIImage的drawInRect方法），所以无需自己在CG的上下文中做处理。
参见[Quartz 2D Coordinate Systems](https://developer.apple.com/library/mac/#documentation/graphicsimaging/conceptual/drawingwithquartz2d/dq_overview/dq_overview.html#//apple_ref/doc/uid/TP30001066-CH202-CJBBAEEC)

#### 4.CALayer坐标系
这个有些变态了，其坐标系和平台有关，在Mac中CALayer使用的是右手坐标系，其原点在左下角；iOS中使用的左手坐标系，其原点在左上角。
参见 [Layer Coordinate System](http://developer.apple.com/library/ios/#DOCUMENTATION/Cocoa/Conceptual/CoreAnimation_guide/Articles/Layers.html#//apple_ref/doc/uid/TP40006082-SW1)