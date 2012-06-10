---
layout: post
title: Life Before ARC
categories:
- Programming
tags:
- iOS
- alloc
- autorelease
---

最近在看一本书, 书名是 "Pro Multithreading and Memory Management for iOS and OS X",主要讲内存管理及多线程相关内容的.   
![Pro.Multithreading.and.Memory.Management.for.iOS.and.OS.X](http://farm6.staticflickr.com/5240/7221562548_c08c9b581f_n.jpg)

第一章讲的便是手动管理内存的相关知识.
<br>
### 一.概述   

Objc和其他许多高级语言一样在对象的内存管理方便都使用了引用计数的方案.

- 如果你创建了一个对象,你便拥有这个对象,此时对象的引用计数为1,
- 当你想拥有一个不是你创建的对象的时候，可以对其使用retain方法,引用计数加1
- 当你用完了一个对象无需再时候的时候，你需要对其使用release方法释放所有权,这时引用计数减1
- 当一个对象的引用计数为0的时候,其dealloc方法将被调用将其销毁
- 当一个对象被销毁后,你还通过其先前的引用进行操作,那就可能引发crash或者不可预料的异常,这是非常危险的.


用来创建对象的方法的名称都是有一定的规律的,方法为以下或者以以下各种方法名打头的方法(但必须遵守驼峰命名规则,比如newer便不可以用作创建对象的方法名)都是用来创建对象的,在我们自己定义的用来创建对象的方法也需要遵守此规则

- alloc 分配内存
- new  NSObject中[NSObject new]等同于 [[NSObject alloc] init]
- copy 复制出一个新对象
- mutableCopy 复制出一个可变(如数组可增删对象)的新对象

<br>

如果一个函数返回一个新创建的对象 比如 [NSArray array] 这样的,调用者对返回的对象并没有拥有权,但是在返回的时候新建的对象又不能在返回前释放,那该如何实现呢?
下面是一个解决此类问题的例子

{% highlight objc %}
- (id)object{
	id obj = [[NSObject alloc] init];//创建对象
	[obj autorelease];//释放对象的所有权,这个时候对象并不会立即销毁,因为此时对象的所有者为当前活动的autoreleasePool
	return obj;//返回对象
}
{% endhighlight %}

当某个对象调用autorelease方法后,其会被加入autoreleasePool,当autoreleasePool清空的时候，这个对象会被释放并销毁.
   
<br>
### 二.引用计数的实现原理

<br>

alloc方法的调用堆栈如下

{% highlight objc %}
+alloc
+allocWithZone:
class_createInstance
calloc
{% endhighlight %}

class_createInstance方法的源码可以在苹果开源的runtime中找到 [http://opensource.apple.com/source/objc4/objc4-493.11/runtime/objc-runtime-new.mm](http://opensource.apple.com/source/objc4/objc4-493.11/runtime/objc-runtime-new.mm),
class_createInstance根据不同的情况调用calloc或者malloc去分配内存块.

那retainCount,retain,release是如何实现的呢?
以下为各个方法的调用栈
{% highlight objc %}
-retainCount 
__CFDoExternRefOperation
CFBasicHashGetCountOfKey
{% endhighlight %}

{% highlight objc %}
-retain 
__CFDoExternRefOperation 
CFBasicHashAddValue
{% endhighlight %}

{% highlight objc %}
-release 
__CFDoExternRefOperation 
CFBasicHashRemoveValue
{% endhighlight %}

我们可以发现retainCount,retain,release使用到了同一个CF函数`__CFDoExternRefOperation`,此函数是开源的，代码在下面的文件中
[http://www.opensource.apple.com/source/CF/CF-635.21/CFRuntime.c](http://www.opensource.apple.com/source/CF/CF-635.21/CFRuntime.c).
对象的引用计数的信息保存在一个哈希表中.

<br>
### 三.自动释放池(NSAutoreleasePool)的实现原理
我们先看一个简单的例子

{% highlight objc %}
NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init]; 
id obj = [[NSObject alloc] init];
[obj autorelease];
[pool drain];//等同于[pool release],autorelease pool是不能被retain的
{% endhighlight %}

![Autorelase Pool](http://farm6.staticflickr.com/5332/7225706146_bec59b116a.jpg)   

当对objc调用autorelease方法时候，便释放其所有权,此时当前活动的autorelease pool拥有此对象,当当前活动autorelease pool被销毁时,autorelease pool所拥有的所有对象会收到release消息.
AutoreleasePool不能调用autorelease方法，否则会报错.   
<br>
很多时候我们发现并不需要自己去创建Autorelease Pool,这是为什么呢？
因为在主线程中每一次RunLoop开始的时候会自动创建一个Autorelease Pool,结束的时候销毁这个Autorelease Pool
![Runloop Autorelease Pool](http://farm8.staticflickr.com/7233/7225706212_8c66a0cb80.jpg)
AutoreleasePool是可以嵌套的,你可以想象成每创建一个NSAutoreleasePool对象的时候都将其push到一个栈中，栈顶的为当前活动的Autorelease Pool,当Autorelease Pool释放的时候会从这个栈中pop掉。

有时候我们为了程序的性能考虑，需要自己在适当的地方加上autorelease pool,以便及时释放掉内存.比如下面这种情况

{% highlight objc %}
for (int i = 0; i < numberOfImages; ++i) {
	NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
	//Loading images, etc.
	//Too many autoreleased objects exist. 
	[pool drain];
	//All the autoreleased objects are released by [pool drain]. 
}
{% endhighlight %}

如果不及时释放内存，则多次循环后图片和相关资源占用着内存，瞬间使得内存占用飙升。

和autorelease相关的源码在此文件中 [http://opensource.apple.com/source/objc4/objc4-493.11/runtime/objc-arr.mm](http://opensource.apple.com/source/objc4/objc4-493.11/runtime/objc-arr.mm) 
AutoreleasePool的实现为AutoreleasePoolPage类，是用C++来实现的。
其中有一个重要的方法需要说明一下的,

- objc_autoreleasePoolPush 创建一个AutoreleasePool并push到堆栈中
- objc_autorelease 将对象放到当前活动的AutoreleasePool中
- objc_autoreleasePoolPop 将当前活动的AutoreleasePool从堆栈中pop出去(即被销毁)



{% highlight objc %}
NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init]; //等价于objc_autoreleasePoolPush() 
id obj = [[NSObject alloc] init];
[obj autorelease];//等价于 objc_autorelease(obj) 
[pool drain];// 等价于 objc_autoreleasePoolPop(pool) 
{% endhighlight %}

