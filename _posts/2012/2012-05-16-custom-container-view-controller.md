---
layout: post
title: Container View Controller
categories:
- Programming
tags:
- iOS
- UIViewController
---

<br>
### 一.UIViewController
做iOS开发的经常会和UIViewController打交道,从类名可知UIViewController属于MVC模型中的C(Controller),说的更具体点它是一个视图控制器,管理着一个视图(view)。 

UIViewController的view是lazy loading的,当你访问其view属性的时候,view会从xib文件载入或者通过代码创建(覆盖loadView方法,自定义其view hierarchy),并返回,如果要判断一个View Controller的view是否已经被加载需要通过其提供的isViewLoaded方法来判断。    
view加载后viewDidLoad会被调用,这里可以进行一些数据的请求或加载,用来更新你的界面。   
当view将被加入view hierarchy中的时候viewWillAppear会被调用,view完成加入的时候viewDidAppear会被调用,同样当view将要从view hierarchy中移除的时候viewWillDisappear会被调用,完成移除的时候viewDidDisappear会被调用。     
当内存紧张的时候,所有的UIViewController对象的didReceiveMemoryWarning会被调用,其默认实现是 如果当前viewController的view的superview是nil的话,则将view释放且viewDidUnload会被调用,viewDidUnload中你可以进行后继的内存清理工作(主要是界面元素的释放,当再次加载的时候需要重建)。

如果想要展示一个View Controller,一般有如下一种途径

1. 设置成Window的rootViewController(iOS 4.0之前UIWindow并没有rootViewController属性,只能通过addSubview的方式添加一个View Controller的view)
2. 使用某个已经存在的Container来展示,比如使用UINavigationController来展示某个View Controller
[navigationController pushViewController:vc animated:YES];
3. 以模态界面的方式展现出来 presentModalViewController
4. 以addSubview的方式将使其view作为另一个View Controller的view的subView

直接使用4种方法是比较危险的,上一级 View Controller并不能对当前View Controller的 生命周期相关的函数进行调用,以及旋转事件的传递等。
     

<br><br>    
### 二.Hierarchy

我们知道一个View可以将另一个View添加为子View(subview),构成一个View Hierarchy.当某一个View添加到window的View Hierarchy中时,将被“显示”。每一个View Controller管理着的其实就是一个View Hierarchy.而View Controller本身可以有Child View Controller,所以也存在一个 View Controller Hierarchy的概念,当View Controller收到上层传来的诸如旋转，显示事件的时候,需要传递给它的Child View Controller.
一般情况下,View Hierarchy 和 View Controller Hierarchy需要保持一致性,比如一个View Controller的view的superView是由其parent view controller管理着
![Hierarchy](http://farm8.staticflickr.com/7105/7208538724_c77ed287c2_d.jpg)


     
<br><br>
### 三.Container

一个iOS的app很少只由一个ViewController组成,除非这个app极其简单。
当有多个View Controller的时候,我们就需要对这些View Controller进行管理。
那些负责一个或者多个View Controller的展示并对其视图生命周期进行管理的对象,称之为容器,大部分容器本身也是一个View Controller,这样的容器可以称之为Container View Controller,也有极少数容器不是View Controller,比如UIPopoverController,其继承于NSObject。
    
我们常用的容器有 UINavigationController,UITabbarController等,一般容器有一些共同的特征:

1. 提供对Child View Controller进行管理的接口,比如添加Child View Controller,切换Child View Controller的显示,移除Child View Controller 等
2. 容器“拥有”所有的Child View Controller
3. 容器需要负责 Child View Controller的appearance callback的调用(viewWillAppear,viewDidAppear,viewWillDisaapper,viewDidDisappear),以及旋转事件的传递
4. 保证view hierarchy 和 view controller hierarchy 层级关系一致,通过parent view controller将child view controller和容器进行关联

从上面可以看出来,实现一个Container View Controller并不是一个简单的事情,好在iPhone的界面大小有限,一般情况下一个View Controller的view都是充满界面或者系统自带容器的,我们无需自己创建额外的容器,但是在iPad中情况就不同了。


     
<br><br>
### 四.Custom Container View Controller

在iOS 5之前框架并不支持自定义 Container View Controller, iOS 5开始开放了一些新的接口来支持支持自定义容器

{% highlight objc %}
addChildViewController:
removeFromParentViewController
transitionFromViewController:toViewController:duration:options:animations:completion:
willMoveToParentViewController:
didMoveToParentViewController:
{% endhighlight %}
其中前两个接口比较重要,可以直接改变View Controller 的 Hierarchy。   

有点意外的是,在不做任何额外设置的情况下进行如下操作

{% highlight objc %}
[viewController.view addSubview:otherViewController.view]
{% endhighlight %}

iOS 5中otherViewController是可以立刻收到viewWillAppear和viewDidAppear的调用。 

至于旋转事件的传递以及其他时机viewWillAppear viewDidAppear的调用是需要建立在
[viewController addChildViewController:otherViewController]基础上的。


当我们需要在iOS 4上实现自定义容器,或者有时候我们不想让viewWillAppear这类方法被自动调用,而是想自己来控制,这个时候我们就得需要手动来调用这些方法,而不是由框架去自动调用。
iOS 5中可以很方便的禁用掉自动调用的特性,覆盖automaticallyForwardAppearanceAndRotationMethodsToChildViewControllers返回NO

但是单单覆盖这个方法在iOS5下还是有问题的,当执行下面的语句的时候

{% highlight objc %}
[viewController.view addSubview:otherViewController.view]
{% endhighlight %}

otherViewController还是是可以立刻收到viewWillAppear和viewDidAppear的调用。   
解决这一问题的方法就是在iOS5的时候调用[viewController.view addSubview:otherViewController.view]之前 进行如下操作

{% highlight objc %}
[viewController addChildViewController:otherViewController]
{% endhighlight %}


总的来说实现兼容iOS 4和iOS 5的容器有不少问题和注意点的
    
1. view加入view层级前后分别调用viewWillAppear和viewDidAppear;容器的viewWillAppear,viewDidAppear,viewWillDisappear,viewDidDisappear中需要对当前显示的Child View Controller调用相同的方法,容器需要保证Child View Controller的viewWillAppear调用之前Child View Controller的view已经load了.还有一点就是保证容器的View不会出现bounds为CGRectZero的情况,因为如果此View包含多个subview,其bounds改变的时候subview会根据自己的autoresizingMask改变frame,但是当bounds变为0再变为非0的时候,subview的frame就有可能不是你想要的了(比如某个subview的autoresizingMask为UIViewAutoresizingFlexibleBottomMargin)
2. 容器的shouldAutorotateToInterfaceOrientation中需要检测每一个Child View Controller的shouldAutorotateToInterfaceOrientation如果一个不支持,则看做不支持
3. 容器的willRotateToInterfaceOrientation,didRotateFromInterfaceOrientation,willAnimateRotationToInterfaceOrientation方法中需要将这些事件传递给所有的Child View Controller
4. 由于UIViewController的parentViewController属性为只读,且iOS4中没有提供容器支持的接口（iOS 5中容器支持的接口会间接的维护这个属性）,所以为了使得childViewController和容器得以关联,我们可以顶一个View Controller的基类,添加一个比如叫做superController的属性用来指定对应的parentViewController
5. 由于UIViewController的interfaceOrientation为只读属性,且iOS5中没有提供容器接口,所以UIViewController的这个interfaceOrientation变的不可信,为了取得当前UIViewController的orientation我们可以用UIWindow下的rootViewController的interfaceOrientation的值
6. 容器的viewDidUnload方法中需要对view未释放的childViewController的view进行释放,且调用其viewDidUnload方法


       
     
> 苹果对UIViewController以及其使用有着非常详细的文档 [UIViewController Reference](http://developer.apple.com/library/ios/#DOCUMENTATION/UIKit/Reference/UIViewController_Class/Reference/Reference.html) , [ViewController Programming Guide](http://developer.apple.com/library/ios/#featuredarticles/ViewControllerPGforiPhoneOS/Introduction/Introduction.html)。
