---
layout: post
title: 关于Javascriot的对象的constructor属性
categories:
- Programming
tags:
- Javascript
---

在Javascript中经常有一些让你匪夷所思的结果,我觉得一个主要的原因是大家最其规范了解甚少.
其实这也无可厚非, JS中有太多的不够优美的地方,且Ecma-262的文档始终没有一份完整的中文版.

今天想说的是Javascript中关于对象的constructor属性,这里需要你了解Javascript的原型链的知识.

在一个对象里访问其属性或者方法,如果对象本身没有就会去其隐式原型中访问,这样一层一层的过去直至原型链的根源,即Object对象的隐式原型.

这里我们先讲一下构造函数,一般在JS中我们定义一个构造函数,函数名都是以大写字母开始,这是一个良好的编程习惯.
每一个构造函数中存在一个显式原型和一个隐式原型,显式原型是你可以改变的,而隐式是你无法访问的.
当你使用new运算符创建一个构造函数的对象的时候,这个对象的隐式原型即为构造函数的显式原型,这样就实现了基于原型的继承.

我们自己new出来的对象自己是没有constructor属性的,那么当你访问这个属性的时候,它回去它的原型链中去遍历寻找.
这里举个简单的例子,方便大家理解.

{% highlight js %}
function Con()
{
};
var a = new Con();
alert(a.constructor);
{% endhighlight %}

这里我们可以看到,结果a的constructor属性为Con,

![js构造函数](http://farm8.staticflickr.com/7062/6929652050_26f3be4487_z_d.jpg)

你可能会想a对象就是通过Con构造函数new出来的这很正常.那我们看下面的例子.
{% highlight js %}
function Con()
{
};
Con.prototype = obj;
var a = new Con();
alert(a.constructor);
{% endhighlight %}

![更改Con的显式原型后](http://farm8.staticflickr.com/7084/6929652054_a25c77dde1_d.jpg)


从这里我们可以断定,a的constructor和其隐式原型相关,在之前的Javascript原型链研究中我抛出了一个关于原型且和constructor相关的疑问,一直没有得到澄清,最近在看Javascript : The Good Parts中似乎看到了结论.
这本书在第五章 继承 的Pseudoclassical 中如是说

{% highlight js %}
/*When a function object is created ,
the Function constructor that produces
the function object runs some code like this:*/
this.prototype ={constructor:this}
{% endhighlight %}

突然之间有种恍然大悟的感觉,原来之前我猜测的是正确的,当然这个描述我没有在ecma-262中找到依据,但是Douglas Crockford的话,我信了.

我们回过头来思考一下,每一个通过构造函数的new出来的对象的constructor(也就是说每一个构造函数的显式原型的constructor属性)默认为这个构造函数本身,这样你在思考一下,一切明了.
