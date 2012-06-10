---
layout: post
title: Regular Expression In Python
categories:
- Programming
tags:
- Python
---

> 本篇文章主要讲解一下Python中正则表达式的使用,这里并不会给你讲解正则表达式本身的相关知识,本文假设你已经对正则表达式有了一定的了解.

在Python中正则表达式的功能包含在re这个模块中,所以使用前你需要
import re

本文从几个方面介绍一下Python中使用正则表达式的注意点:

原始字符串(Raw String)
在Python中有一种比较特殊的字符串,在字符串的前面有r或者R,这种字符串中”\”不再有转义字符的作用了,而就是其本身.
这种原始字符串主要是为了正则表达式而设计的,也就是为了增强其可读性.

字符串中一些特殊字符需要转义,如”\”,tab键,换行,回车等,而正则表达式中也有需要转义的字符如”\”,”\b”,”\w”等等.
所以如果使用普通字符串表示正则表达式的pattern的话,会使用难以阅读.

举个简单的例子:
比如要匹配一个以\word开头的字符串,如果要写成正则表达式的话,因为\w是转义字符,故这里需要对\进行转义,也就是正则表达式为”\\word”,但是写成字符串本身的时候,”\是需要转义”的,所以最后,使用python普通字符串表示的话就应该是”\\\\word”
(正则表达式一次转义,字符串本身一次转义)
但是如果使用原始字符串的话,就不需要为字符串本身作转义了.可以直接写成r”\\word”

几个函数
re模块中有几个很长用的函数
–匹配和搜索–
re.match(pattern,string[, flags])
re.search(pattern,string[, flags])
这两个函数有点类似,不同点就是,match必须是从string的第一个字符开始就和partten匹配,而search是搜索整个string
举个例子

{% highlight python %}
    print re.match(r'<a.*?/>','<a href="http://hityou.net"/>')
    print re.match(r'<a.*?/>','I am a python guy ! <a href="http://hityou.net"/>')
    print re.search(r'<a.*?/>','I am a python guy ! <a href="http://hityou.net"/>')
{% endhighlight %}


还有一个用于搜索的函数是re.findall(pattern,string[, flags])
其作用是搜索整个字符串便将匹配到的结果以list的形式返回

–替换函数–
这里只介绍re.sub(pattern,repl,string,[, count])
其实普通的替换功能大家都知道,我这里讲一下替换子表达式的方式
{% highlight python %}
str=' I am a python guy ! '
print re.sub(r'',r'\1',str)
{% endhighlight %}

这里所做的功能是将字符串中的html格式的链接替换成链接本身,其中r’\1′表明替换成正则表达式的第一个子表达式(正则表达式中括号中的为子表达式)