---
layout: post
title: focusOut事件
categories:
- Programming
tags:
- Flex
---

focusOut事件是指焦点离开某控件时触发的事件，这个比较简单，只是举个比较简单的例子：

{% highlight as3 %}
<?xml version="1.0" encoding="utf-8"?>
<mx:Application xmlns:mx="http://www.adobe.com/2006/mxml" 
creationComplete="initEvent()">
<mx:Script>
<![CDATA[
public function initEvent():void
{
panelWidth.addEventListener(FocusEvent.FOCUS_OUT,focusOut);
this.addEventListener(MouseEvent.CLICK,mouseClick);
}
public function focusOut(event:FocusEvent):void
{
panel.width = parseInt(panelWidth.text,10);
}
public function mouseClick(event:MouseEvent):void
{
panelWidth.focusManager.deactivate();
}
]]>
</mx:Script>
<mx:Panel id="panel">
</mx:Panel>
<mx:Label text="宽" />
<mx:TextInput id="panelWidth"/>
</mx:Application>
{% endhighlight %}

此例子中涉及了Application 表单的 creationComplete 事件，这个一般用来对事件的注册进行初始化。  
  
还有就是deactivate可以使控件失去焦点。(focusManager还需学习)