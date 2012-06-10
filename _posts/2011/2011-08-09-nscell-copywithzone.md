---
layout: post
title: NSCell copyWithZone
categories:
- Programming
tags:
- objc
- Cocoa
---

有时候，我们的TableView需要显示的内容是自定义样式的。  
这个时候你需要创建一个自定义的Cell来渲染你自己想要的内容。  
所以你继承了NSCell，并拥有一个数据对象，用来作为渲染的数据来源。  
  
由于NSTableView需要使用到NSCell的copyWithZone方法在适当的时候复制NSCell，而NSCell默认的copyWithZone方法的实现方式是使用NSCopyObject创建了原始cell对象的一份浅拷贝，所以在复制的时候只会简单的复制指针的值，而不会去深拷贝或者去retain，那么这样程序运行的时候就会出错了。原因就是Cell所引用的某个对象被错误的完全释放了（复制的时候没有retain，但是在释放cell的时候，将这个对象release了一把）。所以在实现copyWithZone的时候可以采用如下方法。  
  
{% highlight objc %}
- (id)copyWithZone:(NSZone *)zone
{
    id cellCopy = [super copyWithZone:zone];
    /* Assume that other initialization takes place here. */
 
    cellCopy->titleCell = nil;
    [cellCopy setTitleCell:[self titleCell]];
 
    return cellCopy;
}
{% endhighlight %}

参考文档：
1.[内存管理编程指南：实现对象复制](http://www.apple.com.cn/developer/iphone/library/documentation/UserExperience/Conceptual/MemoryMgmt/Articles/mmImplementCopy.html)
2.[NSTableView copies cells – bug or feature?](http://www.cocoabuilder.com/archive/cocoa/57340-nstableview-copies-cells-bug-or-feature.html)