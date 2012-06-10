---
layout: post
title: Mac 多屏显示 编程
categories:
- Programming
tags:
- objc
- Cocoa
---

### 一.多屏介绍

mac可以支持多屏显示，有一个屏幕是作为主屏存在的，也就是那个显示Menu Bar以及Dock的屏幕。别的屏幕可以作为扩展屏，或者作为镜像屏幕(其实就是两个屏幕的内容一样)。
我们可以将Menubar 拖到任意一个屏幕（改变主屏），我们可以调整屏幕的左右或者上下位置，我们可以调整屏幕的错位大小（就是上下或者左右拖动屏幕，最大程度的时候，两个屏幕角对角，以保证俩个屏幕有相交区域，鼠标从一个屏幕进入另一个屏幕，需要从从相交的区域进去）。  

### 二.NSScreen类

在Cocoa中，我们可以通过NSScreen类获取所有screen的信息。
可以通过 `+ (NSArray *)screens` 这个类方法获取所有的screen对象，其中第一个元素是放置Menu Bar的屏幕。“The screen containing the menu bar is always the first object (index 0) in the array returned by the screens method.”  

+ (NSScreen *)mainScreen 这个类方法所获得的screen并不一定是包含Menu bar的screen，而是key window（当前响应用户键盘事件的窗口）所在的screen。  

我们可以通过- (NSRect)frame方法获得screen的frame，包括menu bar以及dock的区域。   
- (NSRect)visibleFrame获得的区域不包含menu bar以及dock占用的区域。

### 三.计算区域并截图

多个屏幕的情况下，其实系统将所有的screen放置在一个包括所有屏幕的矩形内。
我们可以通过如下方法计算出整个矩形的frame

{% highlight objc %}
NSRect fullFrame = NSZeroRect;
for (NSScreen *screen in [NSScreen screens]) {
fullFrame = NSUnionRect(fullFrame, [screen frame]);
}
{% endhighlight %}
![1](http://farm8.staticflickr.com/7138/7076984355_3f3f1b6908_z_d.jpg)

图中坐标显的是对称的，如果你将其中一个screen上下拖动，就会变得不对称，各个screen的坐标也会随着变化。

在Cocoa中可以通过一个非常简单的方式对屏幕进行截图，方法如下，cropRect为整个screen中的frame。

{% highlight objc %}
CGImageRef cgImageRef = CGWindowListCreateImage(cropRect,
kCGWindowListOptionOnScreenOnly,
kCGNullWindowID,
kCGWindowImageDefault);
{% endhighlight %}

之前我们用screen的frame获得的区域都是以包含menu bar的屏幕的左下角为坐标原点的。
而在CG的相关方法中，则以左上角为坐标原点。
如果只是在单屏幕的情况下，cropRect的计算就非常简单。但是在多屏的情况下，且各个屏幕的分辨率可能不一样，所以就有点复杂了，比如像刚才的情况，想截图副屏左上角的四分之一的区域，这个时候就需要将包含menubar的screen的左上角作为原点在推算出目标区域坐标。
![2](http://farm8.staticflickr.com/7236/6930917036_d3670bf75f_z_d.jpg)

