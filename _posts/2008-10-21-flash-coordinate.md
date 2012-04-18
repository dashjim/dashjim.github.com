---
layout: post
title: Flash中不同类型的坐标
categories:
- Programming
tags:
- Flex
---

在鼠标事件中经常碰到坐标这个概念，在Flash中有三种坐标的表示方式，大家也是经常容易混淆的。
下面是本人画的一个示意图：  
![Flash坐标系](http://farm6.staticflickr.com/5117/6929479758_eb58a961d7_d.jpg)

* 第一种是本地坐标，本地坐标指定的像素位置随组件的左上角而变化。MouseEvent中可以由localX,localY获得  
* 第二种是全局坐标，全局坐标指定的像素位置随舞台的左上角，即应用窗口的最外侧边缘而变化。，MouseEvent中可以由stageX,stageY获得  
* 第三种是内容坐标，内容坐标指定的像素位置随组件内容的左上角而变化，并包括组件的所有内容区域，甚至包括当前剪切掉但必须能够通过滚动组件访问的任何区域。  

DisplayObject中提供了本地坐标和全局坐标互相转换的方法，  
Container中提供了内容坐标和本地坐标，全局坐标互相转换的方法。  