---
layout: post
title: Flex Associative arrays
categories:
- Programming
tags:
- Flex
---

关联数组有时候也称为”哈希”或”映射”，由key和value组成。
关联数组是key和value的无序集合。

在ActionScript3中引入了名为”字典”的高级关联数组。
字典是 flash.utils 包中 Dictionary 类的实例，使用的键可以为任意数据类型，
但通常为 Object 类的实例。即字典的key不局限于 String 类型的值。

关联数组的key分类有以下2种。

### 1.key为字符串
在 as3中有两种创建关联数组的方法。

##### a.使用 Object 构造函数
Object 类的实例在功能上等同于关联数组。

如：

{% highlight as %}
var luke:Object = {name:"Luke", age:22};
trace(luke["name"], luke["age"]);
// 输出：luke 22
//其实这些key和value的对在对象中是其属性和属性值
{% endhighlight %}

如在声明数组时不需要初始化，则以[] 或者 .的方式 添加值。
如：
{% highlight as %}
var luke:Object = new Object();
luke["name"] = "Luke";
luke.age = "22";
{% endhighlight %}

##### b.用 Array 构造函数，如果将关联数组声明为 Array 类型，则将无法使用对象文本初始化该数组。

{% highlight as %}
var luke:Array = new Array();
monitorInfo["type"] = "Flat Panel";
monitorInfo["resolution"] = "1600 x 1200";
trace(monitorInfo["type"], monitorInfo["resolution"]);
// 输出： Flat Panel 1600 x 1200
{% endhighlight %}

用 Array 构造函数创建关联数组没有什么优势。即使使用 Array 构造函数或 Array 数据类型，
也不能将 Array 类的 Array.length 属性或任何方法用于关联数组。
最好将 Array 构造函数用于创建索引数组。

即不赞成用array做字典以及哈希组织数据。

### 2.key为对象
用 Dictionary 类创建使用对象而非字符串作为键的关联数组。

如，考虑这样一个应用程序，它可根据 Sprite 对象与特定容器的关联确定 Sprite 对象的位置。
可以使用 Dictionary 对象，将每个 Sprite 对象映射到一个容器。

如下例子：

{% highlight as %}
import flash.display.Sprite;
import flash.utils.Dictionary;

var groupMap:Dictionary = new Dictionary();

// 作为键名的对象
var spr1:Sprite = new Sprite();
var spr2:Sprite = new Sprite();
var spr3:Sprite = new Sprite();

// 用作值的对象
var groupA:Object = new Object();
var groupB:Object = new Object();

// 在字典中创建新的键-值对。
groupMap[spr1] = groupA;
groupMap[spr2] = groupB;
groupMap[spr3] = groupB;

if (groupMap[spr1] == groupA)
{
trace("spr1 is in groupA");
}
if (groupMap[spr2] == groupB)
{
trace("spr2 is in groupB");
}
if (groupMap[spr3] == groupB)
{
trace("spr3 is in groupB");
}
{% endhighlight %}
