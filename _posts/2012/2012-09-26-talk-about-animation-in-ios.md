---
layout: post
title: 谈谈 iOS Animation
categories:
- Programming
tags:
- iOS
- animation
---


(未完待续... 大家有什么建议直接留言哈...)
### 零.前言
 这里依然没有太多的代码细节，只是探索iOS动画的基本概念，以及其抽象模型，数学基础等。我们学习一个知识的时候一般有两个部分，抽象部分和形象部分，抽象好比语言的语法，是规则，形象好比具体的句子，可以用来和别人交流的。抽象比形象难于理解，但比形象通用。其实数学中经常碰到抽象和形象的概念，比如有一系列离散的点，这是形象；通过这些点我们拟合出一条曲线，得到其函数，函数是抽象的；然后通过这个函数我们可以得到更多的点，这又回到了形象上。所以学习任何知识不能仅仅停留在会用了，而要上升一个层次，去学习研究其抽象层次上的知识，抽象层度越高，则越通用。

### 一.基本概念
什么是Animation(动画)，简单点说就是在一段时间内，显示的内容发生了变化。对iOS而言这种外在的显示的变化其实就是Layer内容发生了变化。从CALayer(CA = Core Animation)类名来看就可以看出iOS的Layer就是为动画而生的，便于实现良好的交互体验。
这里涉及到两个东西: 一是Layer(基类CALayer)，一是Animation(基类CAAnimation). Animation作用于Layer.CALayer提供了接口用于给自己添加Animation.
用于显示的Layer本质上讲是一个Model，包含了各种属性值。
Animation则包含了动画的时间,变化,以及变化的速度.下面分别详细讲解Layer和Animation相关知识。 

### 二.CALayer及时间模型
我们都知道UIView是MVC中的View.UIView的职责在于界面的显示和界面事件的处理。每一个View的背后都有一个Layer(可以通过view.layer进行访问),Layer用于界面渲染的。CALayer属于QuartzCore框架,非常重要，但并没有想象中的那么好理解。我们通常操作的用于显示的Layer在Core Animation这层概念中其实担当的是数据模型Model的角色，它并不直接做渲染的工作。关于Layer，之前我从座标系的角度分析过，这次则侧重于它的时间系统。

#### 1.Layer的渲染架构
Layer也和View一样存在着一个树状的层级结构，我们称之为Layer Tree,我们创建的或者通过UIView获得用于显示的图层树(Layer Tree)，称之为模型树(model-tree),model-tree的背后还存在两份Layer Tree的拷贝,一个是呈现树(presentation-tree)，一个是渲染树(render-tree)。     
model-tree在Layer的属性被赋值的时候便变成了新的值，这个是可以使用代码直接进行操控的部分，presentation-tree在animation运行的过程中可以通过presentationLayer属性进行访问，在动画过程中presentationLayer的属性值是和界面上看到的一致的（使用代码测试发现presentationLayer貌似不支持KVO,所以测试的时候使用了Timer来输出动画过程中presentationLayer属性值的变化）。而render-tree是私有的，你无法访问到，render-tree是对presentation-tree的数据进行渲染，为了不阻塞主线程，渲染的过程是在单独的进程或线程中进行的，所以你会发现Animation的动画并不会阻塞主线程。

#### 2.事务管理
Layer的某些属性可用于动画的(Animatable),称之为Animatable Properties,这里有一份详情的列表,罗列了所有的[CALayer Animatable Properties](http://developer.apple.com/library/ios/#documentation/Cocoa/Conceptual/CoreAnimation_guide/Articles/AnimProps.html).
如果一个Layer对象存在对应着的View，则将这个Layer是一个Root Layer，非Root Layer一般都是通过CALayer或其子类直接创建的。下面的subLayer就是一个典型的非Root Layer，它没有对应的View对象关联着。
{% highlight objc %}
    subLayer = [[CALayer alloc] init];
    subLayer.frame = CGRectMake(0, 0, 300, 300);
    subLayer.backgroundColor = [[UIColor redColor] CGColor];
    [self.view.layer addSublayer:subLayer];
{% end highlight %}
     
所有的非Root Layer都存在着隐式的Animation，也就是说你在设置非Root Layer的Animatable的属性的时候，默认都是带动画的，默认的duration是0.25秒。
而Root Layer则不存在隐式的animation，需要显式的使用CAAnimation或者UIView的animation相关方法来创建animation。    

任何Layer的animatable属性的设置都应该属于某个CA事务，事务的作用是为了保证多个animatable属性的变化同时进行，不管是同一个layer还是不同的layer之间的。CATransaction也分两类，显式的和隐式的，当在某次RunLoop中设置一个animatable属性的时候，如果发现当前没有事务，则会自动创建一个CA事务，在线程的下个RunLoop开始时自动commit这个事务，如果在没有runloop的地方设置layer的animatable属性，则必须使用显式的事务。   

显示事务的使用如下：
{% highlight objc %}
[CATransaction begin];
...  
[CATransaction commit];
{% end highlight %}

显式事务可以嵌套。当事务嵌套时候，只有当最外层的事务commit了之后，整个动画才开始。

不管是显示事务还是隐式事务，我们都可以通过CATransaction来覆盖隐式animation的相关行为，比如覆盖隐式animation的duration,animationTimingFunction。如果是显式动画没有设置duration或者timingFunction，那么CA事务设置的这些参数也会对这个显式动画起作用。



#### 3.CAMediaTiming Protocol

CALayer实现了CAMediaTiming协议。
CALayer通过CAMediaTiming协议实现了一个有层级关系的时间系统。
我们都知道有相对座标的概念，系统也提供了相关的接口将某个座标从一个View转换到另一个View(或者从一个Layer转换到另一个Layer)。同样的对于时间而言，在不同的Layer上时间并不是一样快，所以parentLayer时间值并不能作为Layer的本地时间，而需要一个转换。
某个Layer的时间的快慢可以通过speed属性来进行更改。speed越大则说明这个layer的时间流逝的越快。而且某个Layer的时间速度是相对于superLayer的，所以会有叠加的效果。比如一个layer的speed为1时运行一个durarion为8秒的动画，当其设置speed为2后，则运行此动画只花了8 / 2 = 4秒，如果其存在一个subLayer，这个subLayer的speed也为2，则在此subLayer上运行一个8秒的动画则只需要 8 / (2*2) = 2秒
另外还有两个和时间相关的属性beginTime和timeOffset

实际应用参见苹果官方 QA1673 [How to pause the animation of a layer tree](https://developer.apple.com/library/ios/#qa/qa2009/qa1673.html)

{% highlight objc %}
-(void)pauseLayer:(CALayer*)layer
{
    CFTimeInterval pausedTime = [layer convertTime:CACurrentMediaTime() fromLayer:nil];
    layer.speed = 0.0;
    layer.timeOffset = pausedTime;
}

-(void)resumeLayer:(CALayer*)layer
{
    CFTimeInterval pausedTime = [layer timeOffset];
    layer.speed = 1.0;
    layer.timeOffset = 0.0;
    layer.beginTime = 0.0;
    CFTimeInterval timeSincePause = [layer convertTime:CACurrentMediaTime() fromLayer:nil] - pausedTime;
    layer.beginTime = timeSincePause;
}
{% end highlight %}

### 三.Animation
#### 1.CABasicAnimation
不管是CABasicAnimation还是CAKeyframeAnimation都是继承于CAPropertyAnimation。同样Animation也实现了CAMediaTiming协议。
CABasicAnimation有三个比较重要的属性，fromValue,toValue,byValue,这三个属性都是可选的，但不能同时多于两个为非空。最终都是为了确定animation变化的起点和终点。[Setting Interpolation Values](http://developer.apple.com/library/ios/#documentation/GraphicsImaging/Reference/CABasicAnimation_class/Introduction/Introduction.html#//apple_ref/doc/uid/TP40004496-CH1-SW4)详细介绍了这个三个值的各种情况以及用途。
设置了动画的起点和终点之后，中间的值都是通过插值方式计算出来的。插值的具体方式由timingFunction指定，默认timingFunction为nil，会使用liner的，也就是变化是均匀的。

#### 2.Timing Function的作用


#### 3.CAKeyframeAnimation
