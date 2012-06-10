---
layout: post
title: Flex反射机制
categories:
- Programming
tags:
- Flex
---

这里用到一个类flash.utils.getDefinitionByName，其作用是返回由name参数指定的类的类对象引用，然后我们就可以根据这个类的类引用实例化该类。
不过有个缺陷， 使用getDefinitionByName方法获得的类必须是在发布的时候被编译到swf文中的,否则就会报错:”ReferenceError: Error #1065: 变量 <类的名字> 未定义。”
且即使你import了某个类，是没有用的，需要定义一个这个类的引用才可以解决问题。