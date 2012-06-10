---
layout: post
title: 关于Form的GET和POST
categories:
- Programming
tags:
- HTML
---

关于Form的get和post提交的方法,大家应该都知道是什么概念,
get的本意是为了从服务器端获取数据,post是为了向服务器端发送数据.

而我比较疑惑的是,form的action地址后面带的参数是不是在get的时候是无效的呢?
也就说:

{% highlight html %}
<form action="/helloform/hello?age=22" method="get"> 
	<input type="submit" />
</form>
 {% endhighlight %}

当提交表单之后,服务器端是无法获取age=22这个值的.

带着这样的疑问,我通过Maven构建了一个非常简单的例子,这个例子只涉及一个Servlet类和一个jsp文件.

经过实践最后得出了结论

* form默认的提交方式是get,所以很多时候需要我们自己指定method为post
* 使用get的时候,action=后面自己写的参数是无法带到服务器端的,且get方式提交form的时候,是将form中的键值以参数的方式拼到url后面的.
* post方式提交的表单是可以获取action后面自己写的参数的.
* 如果表单中存在同名的项,我们可以通过request.getParameterValues(“XXX”)的方式获得一个名称为XXX的值的数组.