---
layout: post
title: Javascript中的数值类型
categories:
- Programming
tags:
- Javascript
---

Javascript作为一种弱类型语言,所以数字在JS里没有整型,浮点型,短整型,长整型,双精度等数字类型的区分,

所有的数字在Javascript里都是用8个字节来表示的.


#### 1.Number对象  
在JS语言中,有一个原始数字的包装对象Number
Number对象有一些方法和属性,
这个对象有如下一些属性

- MAX_VALUE  可表示的最大的数  
- MIN_VALUE 可表示的最小的数   
- NaN 非数字值   
- NEGATIVE_INFINITY 负无穷大，溢出时返回该值  
- POSITIVE_INFINITY 正无穷大，溢出时返回该值  

   

#### 2.数制
在JS中 八进制数是以0打头,十六进制数以0x开头
每个数字都可以通过函数转换为对应进制
{% highlight js %}
var num=255;
document.writeln(num.toString(16)+' hex
'); // Outputs: ff
document.writeln(num.toString(8)+' octal
'); // Outputs: 377
document.writeln(num.toString(2)+' binary
'); // Outputs: 11111111
{% endhighlight %}



#### 3.字符串和数的转换
这里介绍两个函数
parseInt(string[, radix])和parseFloat(String)
如果parseInt不给进制的参数的时候默认是十进制