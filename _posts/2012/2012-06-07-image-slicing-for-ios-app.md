---
layout: post
title: 关于iOS App的切图
categories:
- Programming
tags:
- iOS
- Photoshop
- Slicing
- image
---

图形用户界面中的图形有两种实现方式，一种是用代码画出来，比如Quartz 2D技术，狠一点有OpenGL ES，另一种则是使用图片。   
代码画的方式比较耗费程序员脑力,CPU或GPU; 图片则耗费磁盘空间,会增加app的体积.一般的app我们会偏重于使用图片来构建用户界面.   
设计师一般会使用PS来设计界面，所以在直接使用之前，有一个PSD到png的切图(Image Slicing)过程.下面是切图过程中可能要注意的几点.   
 <br>
### 一.可重复元素
在用户界面的图形元素中，重复随处可见 ,所以我们利用好框架提供的接口, 以比较高的性价比创建用户界面。
#### 1.Color Pattern
Color Pattern在Web设计中也经常会遇到比如网页的背景,甚至网络中可以找到专门收集各类可重复的纹理图案的站点,比如 [http://subtlepatterns.com](http://subtlepatterns.com).
下面这是一个小图片模板   
<br>
![circles](http://farm8.staticflickr.com/7238/7160467573_a21e1c947b_t.jpg)
<br>
{% highlight objc %}
UIColor *circleColorPattern = [UIColor colorWithPatternImage:
[UIImage imageNamed:@"circle_pattern.png"]];
{% endhighlight %}
这样便可以得到一个颜色模板,用这个颜色画或者填充某个区域的时候，模板图片会在指定的区域中进行平铺.比如把一个View的背景颜色设置成上面这个颜色，便会得到如下结果
<br>
![circles_fill](http://farm8.staticflickr.com/7085/7160467655_e2806877c7.jpg)
<br>
#### 2.resizableImage
除了整体平铺之外，很多时候我们希望某个图片的局部进行平铺，而其余部分则保持不变.
比如常见的按钮，聊天的气泡背景或者图片的阴影边框.
这里举个按钮的例子,一般情况下为了方便做按钮就直接切个按钮背景,如下图
![button-blue](http://farm8.staticflickr.com/7219/7345749786_18422b630d_m.jpg)
但是自己看，你会发现按钮中间大都数像素都是横向重复的，所以可以使用iOS的图片接口来使用体积更小的图片实现相同的效果.
首先使用PS的切图工具进行切图,下图中的切图逻辑是，左边切14像素(13像素加1像素，1像素为中间重复部分),右边切13像素.
    
> Retina屏幕下一个单位对应着两个像素，这里的例子是非Retina下的情况，请注意

<br>
![button-blue-slicing](http://farm8.staticflickr.com/7071/7160590813_382d13dcec_z.jpg)
<br>
<br>

切图后将左右合并，变成最终所需要的图片
<br>
![button-blue-sliced](http://farm8.staticflickr.com/7227/7160590679_c3ffb29b6e_z.jpg)
<br>
图片宽度为27像素宽，中间第14个像素为中间重复的部分.

{% highlight objc %}
UIImage *buttonBackgroundImage = [[UIImage imageNamed:@"button_bkg.png"] 
resizableImageWithCapInsets:UIEdgeInsetsMake(0,13,0,13)];
[button setBackgroundImage:buttonBackgroundImage 
forState:UIControlStateNormal];
{% endhighlight %}
resizableImageWithCapInsets:的参数是一个UIEdgeInsets的结构体类型,被capInsets覆盖到的区域将会保持不变，而未覆盖到的部分将会被用来平铺.   

 在iOS 5.0之前并没有这个方法，而是使用的另一个方法
 {% highlight objc %}
 - (UIImage *)stretchableImageWithLeftCapWidth:(NSInteger)leftCapWidth 
topCapHeight:(NSInteger)topCapHeight;
{% endhighlight %}
这个方法有局限性，它只能指定leftCapWidth和topCapHeight，然后只有一个像素能够重复，也就是rightCapWidth为 imageWidth-leftCapWidth-1,而bottomCapHeight为 imageHeight - topCapHeight -1,所以重复的始终是中间的那一个像素.

<br>
<br>
### 二.图片边缘锯齿和抗锯齿问题
<br>
#### 1.需要抗锯齿
有时候需要在旋转的动画中使用到图片，比如按钮的旋转，图片的旋转，为了避免在旋转的过程中出现边缘锯齿，我们需要在切图的时候，在边缘上多留至少一像素的透明像素，因为iOS在处理图片的时候对于外边缘是不做抗锯齿处理的，但是对于图片内部的边缘则会做抗锯齿处理.

#### 2.需要去除抗锯齿效果
当某个imageView的frame的origin.x或者origin.y 不为整数的时候，会出现你不想要的抗锯齿效果，这个时候本来清晰的图片边缘会变得模糊，而这不是你想要的，所以这个时候我们就要对frame的起点进行取整。
