---
layout: post
title: iOS的三维透视投影
categories:
- Programming
tags:
- iOS
- 3d
- perspective
---

#### 一.概述   
在iOS中使用CATransform3D这个结构体来表示三维的齐次坐标变换矩阵.
齐次坐标是一种坐标的表示方法，n维空间的坐标需要用n+1个元素的坐标元组来表示,在[Quartz 2D Transform](https://developer.apple.com/library/mac/documentation/graphicsimaging/conceptual/drawingwithquartz2d/dq_affine/dq_affine.html#//apple_ref/doc/uid/TP30001066-CH204-CJBECIAD)中就有关于齐次坐标的应用,那边是关于二维空间的变换，其某点的齐次坐标的最后一个元素始终设置为1。使用齐次坐标而不是简单的数学坐标是为了方便图形进行仿射变换，仿射变换可以通过仿射变换矩阵来实现，3D的仿射变换可以实现诸如 平移(translation)，旋转(rotation),缩放(scaling),切变(shear)等变换。如果不用齐次坐标那么进行坐标变换可能就涉及到两种运算了，加法（平移）和乘法（旋转，缩放），而使用齐次坐标以及齐次坐标变换矩阵后只需要矩阵乘法就可以完成一切了。上面的这些如果需要深入了解就需要去学习一下图形变换的相关知识，自己对矩阵的乘法进行演算。

iOS中的CALayer的3D本质上并不能算真正的3D(其视点即观察点或者所谓的照相机的位置是无法变换的),而只是3D在二维平面上的投影，投影平面就是手机屏幕也就是xy轴组成的平面(注意iOS中为左手坐标系)，那么视点的位置是如何确定的呢？可以通过CATransform3D中的m34来间接指定， m34 = -1/z,其中z为观察点在z轴上的值,而Layer的z轴的位置则是通过anchorPoint来指定的，所谓的anchorPoint(锚点)就是在变换中保持不变的点，也就是某个Layer在变换中的原点,xyz三轴相交于此点。在iOS中，Layer的anchorPoint使用unit coordinate space来描述，unit coordinate space无需指定具体真实的坐标点而是使用layer bounds中的相对位置，下图展示了一个Layer中的几个特殊的锚点,    
![](http://farm9.staticflickr.com/8164/7525485756_6782ed8ce6.jpg)
    
 m34 = -1/z中，当z为正的时候，是我们人眼观察现实世界的效果，即在投影平面上表现出近大远小的效果，z越靠近原点则这种效果越明显，越远离原点则越来越不明显，当z为正无穷大的时候，则失去了近大远小的效果，此时投影线垂直于投影平面，也就是视点在无穷远处，CATransform3D中m34的默认值为0，即视点在无穷远处.
 
 还有一个需要说明一下的就是齐次坐标到数学坐标的转换
 通用的齐次坐标为 (a, b, c, h),其转换成数学坐标则为 (a/h, b/h, c/h).
   
#### 二.代数解释    
假设一个Layer anchorPoint为默认的 (0.5, 0.5 ), 其三维空间中一个A点 (6, 0, 0)，m34 = -1/1000.0, 则此点往z轴负方向移动10个单位之后，则在投影平面上看到的点的坐标是多少呢？

A点使用齐次坐标表示为 (6, 0, 0, 1)    

QuartzCore框架为我们提供了函数来算出所需要的矩阵，
{% highlight objc%}
    CATransform3D transform = CATransform3DIdentity;
    transform.m34 = -1/1000.0;
    transform = CATransform3DTranslate(transform, 0, 0, -10);
{% endhighlight %}
  
计算出来的矩阵为       
{% highlight objc%} 
{ 1,    0,    0,     0;   
  0,    1,    0,     0;   
  0,    0,    1,     -0.001;   
  0,    0,  -10,    1.01;      
}   
{% endhighlight %}

其实上面的变换矩阵本质上是两个矩阵相乘得到的 变换矩阵 * 投影矩阵
变换矩阵为    
{% highlight objc%}
{1,    0,    0,    0;   
 0,    1,    0,    0;   
 0,    0,    1,    0;   
 0,    0,   -10,  1;      
}     
{% endhighlight %}    
投影矩阵为  
{% highlight objc%} 
{1,    0,    0,    0;   
 0,    1,    0,    0;   
 0,    0,    1, -0.001;   
 0,    0,    0,    1;   
}     
{% endhighlight %}    
上面的两个矩阵相乘则会得到最终的变换矩阵(如果忘记矩阵乘法的可以去看下线性代数复习下)，所以一个矩阵就可以完成变换和投影。

将A点坐标乘上最终的变换矩阵，则得到
{6, 0 , -10, 1.01}, 转换成数学坐标点为 {6/1.01, 0, 10/1.01},则可以知道其在投影平面上的投影点为
{6/1.01, 0, 0} 也就是我们看到的变换后的点。其比之前较靠近原点。越往z轴负方向移动，则在投影平面上越靠近原点。


#### 三.几何解释   
将上面的例子使用几何的方式来进行解释分析，当我们沿着y轴的正方向向下看时候，可以得到如下的景象   
   
![](http://farm8.staticflickr.com/7134/7525866072_efebf5cd22.jpg)
   
 虚线为投影线，其和x轴的交点即为A点的投影点。
 由相似三角形的定理我们很容易算出投影的点，
 
  1000/(1000 + 10) = x/6,则x = 6*1000/1010 = 6/1.01