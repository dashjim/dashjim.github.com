---
layout: post
title: 初试Python
categories:
- Programming
tags:
- Python
---

上周末一个同事姐姐，说他每周都要整理一封excel表格，去掉其中的空行并把某一列的内容拆分成两列，然后做统计。
其实这个需求本可以做成一个系统的，她也向上提了需求，可由于资源问题，一直没有做。
当然如果每次人肉做的话，得花几个钟头，因为数据量是有点大的。
数据的格式基本如下  

2009-4-23 23:16,xxxxx ,116.10.174.655 (地区)
代表的分别是时间，用户名，IP地址地区
所要作的就是将地区单独出去，然后根据地区来统计
2009-4-23 23:16,xxxxx ,116.10.174.655 ，地区

所以就用python写了下面的几行代码
{% highlight python %}
fr=open('./data.csv')
fw=open('./ok.csv','w')
for line in fr.readlines():
	if(len(line) > 10):
		line = line.replace('(',',')
		line = line.replace(')','')
	fw.write(line)
fr.close()
fw.close()
{% endhighlight %}

文件名都是写死的，转换好了之后再保存为xls的就可以了，非常的快。