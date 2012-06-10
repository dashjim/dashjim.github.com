---
layout: post
title: Javascript原型链研究
categories:
- Programming
tags:
- Javascript
---

> 前言:如果想深入理解Javascript的面向对象编程思想,那么对于原型链的理解将十分重要,由于看了李战老师的<悟透Javascript>,产生了很多疑问,于是带着疑问在网络上查找答案,也翻出了Ecma-262来看了,总算明白了一些东西,但还是有些疑问.

### 一.类别和对象
在Javascript没有所谓的其他高级语言中的”类”的概念,所有的”数据”除了基本类型便是对象.
如果从集合论的角度在思考问题,我们可以将所有的这些数据进行分类,那么可以得到如下几类:
Undefined,Null,Boolean,Number,String还有Object
所有的基本数据类型必定属于前面五种类型(Type)之一,而复杂的数据类型只有Object一种.
我们可以举例说明一下,

{% highlight js %}
Undefine={undefined}
Null={null}
Boolean={true,false}
Number={0,1,2,0.1……}
String={'a','b','123',…}
Object={json对象,function f(){},…}
{% endhighlight %}


以上的只是简单的说明,并不严谨.  
有了以上的说明我们再来看typeof这个运算符  
其实typeof就是根据上面的这些类型来判断并返回结果的,  
Ecma-262文档中有如下表格 

![typeof](http://farm8.staticflickr.com/7058/7075638741_2a8828c3c2_d.jpg)

我们从这里可以看出在Javascript中Object类别的成员又可以分成两类,普通的对象和函数对象.

### 2.内建对象(Build-in Object)
在Javascript语言中有一些内建对象,其中有Global,Object,Function,Array,String,Boolean,Number,Math,Date,RegExp(注意这里和上面所讲的类别是两码事)还有一些其他的错误类,这里暂不一一列举.这些内建对象其实都是构造器,或者说它们都是函数.这里我们可以通过new运算符创建相应的对象.如  

var s = new String(‘string’);这样得到的是一个字符串对象,typeof s 是”object”而如果没有使用new而是var s=String(‘string’);得到的是一个基本类型字符串,typeof s得到的是”string”

### 3.原型Prototype
由于Javascript中没有类,那通过什么来实现面向对象中的继承呢,对,就是原型,原型本身也是对象.
每一个对象都有一个隐式的原型，而函数对象除了隐式的原型引用外，还有一个显式的原型引用。
在一般情况下，对象的隐式原型是不可以访问的，而函数对象的显式原型可以通过 FunctionName.prototype进行访问，
但在Firefox中你可以通过对象的__proto__属性访问对象的隐式原型。
说了这么多，你可以还是对这两种原型没有理解，我们举个例子吧。

{% highlight js %}
function Person(name){
this.name=name;
}
alert(Person.prototype);
alert(Person.prototype.constructor);
alert(Person.__proto__===Function.prototype);
alert(Person.constructor);

var p = new Person('Luke');
alert(p.prototype);
alert(p.__proto__===Person.prototype);
alert(p.constructor);
{% endhighlight %}

运行上面的代码我们可以知道，Person这个函数他的显式原型是一个object对象，而这个原型对象的构造器就是Person自己。
我们又可以知道这个函数的哦隐式原型是内置对象Function的显式原型，且我们可以知道Person的构造器是Function函数。

接着我又创建了一个对象p，可以知道如果直接使用prototype是无法访问的，结果为undefined，因为p是一个普通对象，只能在Firefox中通过__proto__来访问其隐式的原型，可以知道其隐式的原型为Person的显式原型。
我这里就很武断的得出一个结论来，当然不一定正确。

一个创建的对象，如果不主动的修改其隐式的原型（当然我们无法修改），那么默认的隐式原型为其constructor的显式原型。

### 4.原型链
通过上面的例子我们已经可以隐约的知道，构造函数和通过构造函数创建的对象之间通过原型对象联系在一起了，Javascript也正是通过这种途径来进行继承的。
我们看上图，MyFunction为一个函数，它的显式原型是FP，当然FP本身也是一个对象，而且其constructor是MyFunction
o1,o2是通过MyFunction创建的两个对象，这两个对象的隐式原型都是FP.

这里有一个疑问，你也可以通过上一节的代码继续进行测试，
{% highlight js %}
function Person(name){
this.name=name;
}
var o = Person.prototype;
alert(o.constructor);
alert(o.__proto__===Person.prototype);
alert(o.__proto__===Object.prototype);
{% endhighlight %}

> 通过这段代码我们可以发现一个构造函数的显式原型的constructor是这个函数自身，而其隐式原型却不是这个函数的prototype,这是不是违反了常理呢?????????这时我注意到，这个函数的prototype并不是我们用户自己创建的，而是由Javascript引擎进行创建管理的，也许它为了维持原型链的存在，使得prototype自己的隐式原型设置成了原型的终点Object.prototype

Javascript内建对象的原型链
![prototype](http://farm8.staticflickr.com/7138/6929572382_cffb5c382a_z_d.jpg)