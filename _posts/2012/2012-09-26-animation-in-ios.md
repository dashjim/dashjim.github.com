---
layout: post
title: 谈谈iOS Animation
categories:
- Programming
tags:
- iOS
- animation
---


### 零.前言
 这里没有太多的代码细节,只是探索iOS动画的基本概念,以及其抽象模型,数学基础等.我们学习一个知识的时候一般有两个部分,抽象部分和形象部分,抽象好比语言的语法,是规则,形象好比具体的句子,可以用来和别人交流的.抽象比形象难于理解,但比形象通用.其实数学中经常碰到抽象和形象的概念,比如有一系列离散的点,这是形象;通过这些点我们拟合出一条曲线,得到其函数,函数是抽象的;然后通过这个函数我们可以得到更多的点,这又回到了形象上.所以学习任何知识不能仅仅停留在会用了,而要上升一个层次,去学习研究其抽象层次上的知识,抽象层度越高,则越通用.

### 一.基本概念
什么是Animation(动画),简单点说就是在一段时间内,显示的内容发生了变化.对CALayer来说就是在一段时间内,其Animatable Property发生了变化.从CALayer(CA = Core Animation)类名来看就可以看出iOS的Layer就是为动画而生的,便于实现良好的交互体验.
这里涉及到两个东西: 一是Layer(基类CALayer),一是Animation(基于CAAnimation). Animation作用于Layer.CALayer提供了接口用于给自己添加Animation.
用于显示的Layer本质上讲是一个Model,包含了Layer的各种属性值.
Animation则包含了动画的时间,变化,以及变化的速度.下面分别详细讲解Layer和Animation相关知识. 

### 二.CALayer及时间模型
我们都知道UIView是MVC中的View.UIView的职责在于界面的显示和界面事件的处理.每一个View的背后都有一个layer(可以通过view.layer进行访问),layer是用于界面显示的.CALayer属于QuartzCore框架,非常重要,但并没有想象中的那么好理解.我们通常操作的用于显示的Layer在Core Animation这层的概念中其实担当的是数据模型Model的角色,它并不直接做渲染的工作.关于Layer,之前从座标系的角度分析过,这次则侧重于它的时间系统.

#### 1.Layer的渲染架构
Layer也和View一样存在着一个层级树状结构,称之为图层树(Layer Tree),直接创建的或者通过UIView获得的(view.layer)用于显示的图层树,称之为模型树(Model Tree),模型树的背后还存在两份图层树的拷贝,一个是呈现树(Presentation Tree),一个是渲染树(Render Tree). 
呈现树可以通过普通layer(其实就是模型树)的layer.presentationLayer获得,而模型树则可以通过modelLayer属性获得(详情文档).模型树的属性在其被修改的时候就变成了新的值,这个是可以用代码直接操控的部分;呈现树的属性值和动画运行过程中界面上看到的是一致的.而渲染树是私有的,你无法访问到,渲染树是对呈现树的数据进行渲染,为了不阻塞主线程,渲染的过程是在单独的进程或线程中进行的,所以你会发现Animation的动画并不会阻塞主线程.

#### 2.事务管理
CALayer的那些可用于动画的(Animatable)属性,称之为Animatable Properties,这里有一份详情的列表,罗列了所有的 [CALayer Animatable Properties](http://developer.apple.com/library/ios/#documentation/Cocoa/Conceptual/CoreAnimation_guide/Articles/AnimProps.html).
如果一个Layer对象存在对应着的View,则称这个Layer是一个Root Layer,非Root Layer一般都是通过CALayer或其子类直接创建的.下面的subLayer就是一个典型的非Root Layer,它没有对应的View对象关联着.
{% highlight objc %}
    subLayer = [[CALayer alloc] init];
    subLayer.frame = CGRectMake(0, 0, 300, 300);
    subLayer.backgroundColor = [[UIColor redColor] CGColor];
    [self.view.layer addSublayer:subLayer];
{% endhighlight %}
      

所有的非Root Layer在设置Animatable Properties的时候都存在着隐式动画,默认的duration是0.25秒.
{% highlight objc %}
    subLayer.position = CGPointMake(300,400);
{% endhighlight %}
像上面这段代码当下一个RunLoop开始的时候并不是直接将subLayer的position变成(300,400)的,而是有个移动的动画进行过渡完成的.      

任何Layer的animatable属性的设置都应该属于某个CA事务(CATransaction),事务的作用是为了保证多个animatable属性的变化同时进行,不管是同一个layer还是不同的layer之间的.CATransaction也分两类,显式的和隐式的,当在某次RunLoop中设置一个animatable属性的时候,如果发现当前没有事务,则会自动创建一个CA事务,在线程的下个RunLoop开始时自动commit这个事务,如果在没有RunLoop的地方设置layer的animatable属性,则必须使用显式的事务.  


显式事务的使用如下：
{% highlight objc %}
[CATransaction begin];
...  
[CATransaction commit];
{% endhighlight %}

事务可以嵌套.当事务嵌套时候,只有当最外层的事务commit了之后,整个动画才开始.

可以通过CATransaction来设置一个事务级别的动画属性,覆盖隐式动画的相关属性,比如覆盖隐式动画的duration,timingFunction.如果是显式动画没有设置duration或者timingFunction,那么CA事务设置的这些参数也会对这个显式动画起作用.    

还可以设置completionBlock,当当前CATransaction的所有动画执行结束后, completionBlock会被调用.

#### 3.时间系统

CALayer实现了CAMediaTiming协议.
CALayer通过CAMediaTiming协议实现了一个有层级关系的时间系统.除了CALayer,CAAnimation也采纳了此协议,用来实现动画的时间系统.    
在CA中,有一个Absolute Time(绝对时间)的概念,可以通过CACurrentMediaTime()获得,其实这个绝对时间就是将mach_absolute_time()转换成秒后的值.这个时间和系统的uptime有关,系统重启后CACurrentMediaTime()会被重置.   
就和座标存在相对座标一样,不同的实现了CAMediaTiming协议的存在层级关系的对象也存在相对时间,经常需要进行时间的转换,CALayer提供了两个时间转换的方法:
    
{% highlight objc %}
- (CFTimeInterval)convertTime:(CFTimeInterval)t fromLayer:(CALayer *)l;
- (CFTimeInterval)convertTime:(CFTimeInterval)t toLayer:(CALayer *)l;
{% endhighlight %}   

现在来重点研究CAMediaTiming协议中几个重要的属性.    

#### beginTime
无论是图层还是动画,都有一个时间线Timeline的概念,他们的beginTime是相对于父级对象的开始时间.
虽然苹果的文档中没有指明,但是通过代码测试可以发现,默认情况下所有的CALayer图层的时间线都是一致的,他们的beginTime都是0,绝对时间转换到当前Layer中的时间大小就是绝对时间的大小.所以对于图层而言,虽然创建有先后,但是他们的时间线都是一致的(只要不主动去修改某个图层的beginTime),所以我们可以想象成所有的图层默认都是从系统重启后开始了他们的时间线的计时.

但是动画的时间线的情况就不同了,当一个动画创建好,被加入到某个Layer的时候,会先被拷贝一份出来用于加入当前的图层,在CA事务被提交的时候,如果图层中的动画的beginTime为0,则beginTime会被设定为当前图层的当前时间,使得动画立即开始.如果你想某个直接加入图层的动画稍后执行,可以通过手动设置这个动画的beginTime,但需要注意的是这个beginTime需要为 CACurrentMediaTime()+延迟的秒数,因为beginTime是指其父级对象的时间线上的某个时间,这个时候动画的父级对象为加入的这个图层,图层当前的时间其实为[layer convertTime:CACurrentMediaTime() fromLayer:nil],其实就等于CACurrentMediaTime(),那么再在这个layer的时间线上往后延迟一定的秒数便得到上面的那个结果.     

#### timeOffset
这个timeOffset可能是这几个属性中比较难理解的一个,官方的文档也没有讲的很清楚.
local time也分成两种一种是active local time 一种是basic local time.  
timeOffset则是active local time的偏移量.   
你将一个动画看作一个环,timeOffset改变的其实是动画在环内的起点,比如一个duration为5秒的动画,将timeOffset设置为2(或者7,模5为2),那么动画的运行则是从原来的2秒开始到5秒,接着再0秒到2秒,完成一次动画.

#### speed
speed属性用于设置当前对象的时间流相对于父级对象时间流的流逝速度,比如一个动画beginTime是0,但是speed是2,那么这个动画的1秒处相当于父级对象时间流中的2秒处.
speed越大则说明时间流逝速度越快,那动画也就越快.比如一个speed为2的layer其所有的父辈的speed都是1,它有一个subLayer,speed也为2,那么一个8秒的动画在这个运行于这个subLayer只需2秒(8 / (2 * 2)).所以speed有叠加的效果.

#### fillMode
fillMode的作用就是决定当前对象过了非active时间段的行为.
比如动画开始之前,动画结束之后。如果是一个动画CAAnimation,则需要将其removedOnCompletion设置为NO,要不然fillMode不起作用.
下面来讲各个fillMode的意义   
**kCAFillModeRemoved**  这个是默认值,也就是说当动画开始前和动画结束后,动画对layer都没有影响,动画结束后,layer会恢复到之前的状态   
**kCAFillModeForwards** 当动画结束后,layer会一直保持着动画最后的状态     
**kCAFillModeBackwards**  这个和kCAFillModeForwards是相对的,就是在动画开始前,你只要将动画加入了一个layer,layer便立即进入动画的初始状态并等待动画开始.你可以这样设定测试代码,将一个动画加入一个layer的时候延迟5秒执行.然后就会发现在动画没有开始的时候,只要动画被加入了layer,layer便处于动画初始状态    
**kCAFillModeBoth** 理解了上面两个,这个就很好理解了,这个其实就是上面两个的合成.动画加入后开始之前,layer便处于动画初始状态,动画结束后layer保持动画最后的状态.   

其他的一些参数都是比较容易理解的.


#### 实际应用
参见苹果官方 QA1673 [How to pause the animation of a layer tree](https://developer.apple.com/library/ios/#qa/qa2009/qa1673.html)

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
{% endhighlight %}
    

### 三.显式动画Animation
当需要对非Root Layer进行动画或者需要对动画做更多自定义的行为的时候,就必须使用到显式动画了,显式动画的基类为CAAnimation,常用的是CABasicAnimation,CAKeyframeAnimation有时候还会使用到CAAnimationGroup,CATransition(注意不是CATransaction,Transition是过渡的意思).   
![](http://ww1.sinaimg.cn/large/65cc0af7gw1dxlusbklpmj.jpg)      

这里再强调关于动画的两个重要的点:一是中间状态的插值计算(Interpolation),二是动画节奏控制(Timing); 有时候插值计算也和Timing有一定关系.
如果状态是一维空间的值(比如透明度),那么插值计算的结果必然再起点值和终点值之间,如果状态是二维空间的值(比如position),那么一般情况下插值得到的点会落在起点和终点之间的线段上（当然也有可能连线是圆滑曲线）.
#### 1.CABasicAnimation
不管是CABasicAnimation还是CAKeyframeAnimation都是继承于CAPropertyAnimation.
![](http://ww4.sinaimg.cn/large/65cc0af7gw1dxlum1261zj.jpg)
CABasicAnimation有三个比较重要的属性,fromValue,toValue,byValue,这三个属性都是可选的,但不能同时多于两个为非空.最终都是为了确定animation变化的起点和终点.[Setting Interpolation Values](http://developer.apple.com/library/ios/#documentation/GraphicsImaging/Reference/CABasicAnimation_class/Introduction/Introduction.html#//apple_ref/doc/uid/TP40004496-CH1-SW4)详细介绍了这个三个值的各种情况以及用途.
设置了动画的起点和终点之后,中间的值都是通过插值方式计算出来的.插值计算的结果由timingFunction指定,默认timingFunction为nil,会使用liner的,也就是变化是均匀的.     

#### 2.Timing Function的作用
Timing Function的会被用于变化起点和终点之间的插值计算.形象点说是Timing Function决定了动画运行的节奏(Pacing),比如是均匀变化(相同时间变化量相同),先快后慢,先慢后快还是先慢再快再慢.

时间函数是使用的一段函数来描述的,横座标是时间t取值范围是0.0-1.0,纵座标是变化量x(t)也是取值范围也是0.0-1.0
假设有一个动画,duration是8秒,变化值的起点是a终点是b(假设是透明度),那么在4秒处的值是多少呢？
可以通过计算为 a + x(4/8) * (b-a), 为什么这么计算呢？讲实现的时间映射到单位值的时候4秒相对于总时间8秒就是0.5然后可以得到0.5的时候单位变化量是 x(0.5), x(0.5)/1 = 实际变化量/(b-a), 其中b-a为总变化量,所以实际变化量就是x(0.5) * (b-a) ,最后4秒时的值就是 a + x(0.5) * (b-a),所以计算的本质是映射.

Timing Function对应的类是CAMediaTimingFunction,它提供了两种获得时间函数的方式,一种是使用预定义的五种时间函数,一种是通过给点两个控制点得到一个时间函数.
相关的方法为
{% highlight objc %}
+ (id)functionWithName:(NSString *)name;

+ (id)functionWithControlPoints:(float)c1x :(float)c1y :(float)c2x :(float)c2y;

- (id)initWithControlPoints:(float)c1x :(float)c1y :(float)c2x :(float)c2y;
{% endhighlight %}

五种预定义的时间函数名字的常量变量分别为    
kCAMediaTimingFunctionLinear,    
kCAMediaTimingFunctionEaseIn,   
kCAMediaTimingFunctionEaseOut,    
kCAMediaTimingFunctionEaseInEaseOut,    
kCAMediaTimingFunctionDefault.   
下图展示了前面四种Timing Function的曲线图,横座标表示时间,纵座标表示变化量,这点需要搞清楚(并不是平面座标系中xy).
![](http://ww1.sinaimg.cn/large/65cc0af7gw1dxlv7mhtj3j.jpg)  
自定义的Timing Function的函数图像就是一条三次贝塞尔曲线[Cubic Bezier Curve](http://zh.wikipedia.org/zh-cn/%E8%B4%9D%E5%A1%9E%E5%B0%94%E6%9B%B2%E7%BA%BF),贝塞尔曲线的优点就是光滑,用在这里就使得变化显得光滑.一条三次贝塞尔曲线可以由起点终点以及两个控制点决定.     
上面的kCAMediaTimingFunctionDefault对应的函数曲线其实就是通过[(0.0,0.0), (0.25,0.1), (0.25,0.1), (1.0,1.0)]这四个点决定的三次贝塞尔曲线,头尾为起点和终点,中间的两个点是控制点.   
![](http://ww2.sinaimg.cn/large/65cc0af7gw1dxm21gxjr0j.jpg)    
上图中P0是起点,P3是终点,P1和P2是两个控制点   

如果时间变化曲线既不是直线也不是贝塞尔曲线,而是自定义的,又或者某个图层运动的轨迹不是直线而是一个曲线,这些是基本动画无法做到的,所以引入下面的内容,CAKeyframeAnimation,也即所谓的关键帧动画.

#### 3.CAKeyframeAnimation
任何动画要表现出运动或者变化,至少需要两个不同的关键状态,而中间的状态的变化可以通过插值计算完成,从而形成补间动画,表示关键状态的帧叫做关键帧.
![](http://ww3.sinaimg.cn/large/65cc0af7gw1dxlv01a1jmj.jpg)
CABasicAnimation其实可以看作一种特殊的关键帧动画,只有头尾两个关键帧.CAKeyframeAnimation则可以支持任意多个关键帧,关键帧有两种方式来指定,使用path或者使用values,path是一个CGPathRef的值,且path只能对CALayer的 anchorPoint 和 position 属性起作用,且设置了path之后values就不再起效了.而values则更加灵活.
keyTimes这个可选参数可以为对应的关键帧指定对应的时间点,其取值范围为0到1.0,keyTimes中的每一个时间值都对应values中的每一帧.当keyTimes没有设置的时候,各个关键帧的时间是平分的.   
还可以通过设置可选参数timingFunctions(CAKeyframeAnimation中timingFunction是无效的)为关键帧之间的过渡设置timingFunction,如果values有n个元素,那么timingFunctions则应该有n-1个.但很多时候并不需要timingFunctions,因为已经设置了够多的关键帧了,比如没1/60秒就设置了一个关键帧,那么帧率将达到60FPS,完全不需要相邻两帧的过渡效果（当然也有可能某两帧 值相距较大,可以使用均匀变化或者增加帧率,比如每0.01秒设置一个关键帧）.

在关键帧动画中还有一个非常重要的参数,那便是calculationMode,计算模式.其主要针对的是每一帧的内容为一个座标点的情况,也就是对anchorPoint 和 position 进行的动画.当在平面座标系中有多个离散的点的时候,可以是离散的,也可以直线相连后进行插值计算,也可以使用圆滑的曲线将他们相连后进行插值计算.
calculationMode目前提供如下几种模式
kCAAnimationLinear   
kCAAnimationDiscrete   
kCAAnimationPaced   
kCAAnimationCubic   
kCAAnimationCubicPaced

**kCAAnimationLinear** calculationMode的默认值,表示当关键帧为座标点的时候,关键帧之间直接直线相连进行插值计算;    
**kCAAnimationDiscrete** 离散的,就是不进行插值计算,所有关键帧直接逐个进行显示;   
**kCAAnimationPaced** 使得动画均匀进行,而不是按keyTimes设置的或者按关键帧平分时间,此时keyTimes和timingFunctions无效;      
**kCAAnimationCubic** 对关键帧为座标点的关键帧进行圆滑曲线相连后插值计算,对于曲线的形状还可以通过tensionValues,continuityValues,biasValues来进行调整自定义,这里的数学原理是[Kochanek–Bartels spline](http://en.wikipedia.org/wiki/Kochanek-Bartels_spline),这里的主要目的是使得运行的轨迹变得圆滑;      
**kCAAnimationCubicPaced** 看这个名字就知道和kCAAnimationCubic有一定联系,其实就是在kCAAnimationCubic的基础上使得动画运行变得均匀,就是系统时间内运动的距离相同,此时keyTimes以及timingFunctions也是无效的.   




<br>
最后推荐下WWDC 2010和2011上的关于Animation相关的Session,大家可以找找来看.2010的有说到Core Graphic相关内容.以及他们都从性能方面对CA做了些诠释.



