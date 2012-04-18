---
layout: post
title: Flex之DataGrid
categories:
- Programming
tags:
- Flex
- Adobe
- ActionScript
---

最近一直在使用ActionScript3进行编码，也学到了不少的新的知识，虽然觉得Flex3现在还不是很成熟，但我相信，Flex4出来后应该还是有不错的前景的。

在Flex中，控件既可以使用mxml的标记来描述，也可以写在ActionScript的代码里，但是归根结底，mxml最终还是被编译成as代码的，写成mxml只是为了编程的方便而已。

今天我就来谈一谈DataGrid这个控件吧。

DataGrid 控件提供以下功能：

- 列可以具有不同宽度或同一固定宽度
- 用户可以在运行时调整其尺寸的列
- 用户可以在运行时对其重新排序的列
- 可选择自定义列标题
- 对任意列使用自定义项目渲染器以显示除文本之外的数据的功能
- 支持通过单击列对数据进行排序

一个DataGrid控件既可以使用mxml标签的形式书写，也可以使用as3的代码写出来。

如下面所示，是使用mxml标签来进行描述的，其中medals是个XML类型的对象。

	<mx:DataGrid id=“dg” dataProvider=“{medals.children()}”>
	<mx:columns>
	<mx:DataGridColumn dataField=“@name” headerText=“国家”/>
	<mx:DataGridColumn dataField=“@gold” headerText=“金牌”/>
	<mx:DataGridColumn dataField=“@silver” headerText=“银牌”/>
	<mx:DataGridColumn dataField=“@copper” headerText=“铜牌”/>
	<mx:DataGridColumn dataField=“@total” headerText=“总计”/>
	</mx:columns>
	</mx:DataGrid>

如果使用as3的代码怎么写呢，首先得写在一个函数里。

{% highlight as3 %}
	public function genDataGrid():void
	{
	var dg:DataGrid = new DataGrid();
	dg.dataProvider = medals.children();
	var countryColumn:DataGridColumn = new DataGridColumn();
	countryColumn.dataField = “@name”;
	countryColumn.headerText = “国家”;
	var goldColumn:DataGridColumn = new DataGridColumn();
	goldColumn.dataField=“@gold”;
	goldColumn.headerText = “金牌”;
	dg.columns = dg.columns.slice(0,0).concat(countryColumn).concat(goldColumn);
	panel.addChild(dg);
	}
	{% endhighlight %}