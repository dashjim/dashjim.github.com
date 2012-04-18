---
layout: post
title: iBatis 自动生成主键问题
categories:
- Programming
tags:
- Java
- iBatis
- Database
---

今天在使用iBatis的时候遇到了一些主键自动生成的问题，之前的一些项目使用的都是Oracle数据库，而这次我使用的是Mysql。
所以遇到了问题。  
问题：在插入一条记录的时候，要获得插入记录的ID，在Mysql中主键是使用了Autoincrement.但是在Sqlmap中使用selectKey获得的总是不正确。  
原因：经过查找原因，发现Mysql和Oracle的主键生成机制是不一样的。  
在主流的数据库中，主键生成有两种方式，一种是预生成(pre-generate)主键的，如Oracle和PostgreSQL；有些是事后生成(post-generate)主键的，如MySQL和 SQL Server。但是不管是哪种方式，我们都可以用iBATIS的
节点来获取语句所产生的主键,只是使用的时候有点不一样。  
解决：  
下面给出例子，假设我们往数据库的Product表中插入数据。  

{% highlight sql %}
<!--—Oracle SEQUENCE Example -->

<![CDATA[
SELECT STOCKIDSEQUENCE.NEXTVAL AS ID FROM DUAL
]]>
</selectKey>
<![CDATA[
insert into PRODUCT (PRD_ID,PRD_DESCRIPTION)
values (#id#,#description#)
]]>
</insert>

<!—- Mysql LAST_INSERT_ID() Example -->

<!--[CDATA[
insert into PRODUCT (PRD_DESCRIPTION)
values (#description#)
]]-->

<!--[CDATA[
SELECT LAST_INSERT_ID() as value
]]-->
<!--— Microsoft SQL Server IDENTITY Column Example -->

<!--[CDATA[
insert into PRODUCT (PRD_DESCRIPTION)
values (#description#)
]]-->

<!--[CDATA[
SELECT @@IDENTITY AS ID
]]-->
{% endhighlight %}
   

在上面的代码中我们将selectKey放在insert语句的不同的位置来区分是预生成主键还是事后生成主键，当然我们可以指定selectKey的type属性来指定，type=”pre” 或者 type=”post”,举例如下  

{% highlight sql %}
<!--— Mysql LAST_INSERT_ID() Example -->
<!--[CDATA[
SELECT LAST_INSERT_ID() as value
]]-->
<!--[CDATA[
insert into PRODUCT (PRD_DESCRIPTION)
values (#description#)
]]>
{% endhighlight %}
