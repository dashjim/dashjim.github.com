---
layout: post
title: SQLite Autoincrement
categories:
- Programming
tags:
- SQLite
---

在SQLite3的表中每一行记录都有一个ROWID的隐藏字段，
你在sql中可以通过ROWID,_ROWID_, OID这三个名称来访问这个隐藏字段,他们都是等价的。  
但是你可以定义一个显式的字段作为这个隐藏字段的别名。  
比如你创建表的时候定义一个名为uid的字段，字段类型为 INTEGER PRIMARY KEY ，那么这个字段就为这个隐藏字段的别名了。
你插入记录的时候可以显式的为uid提供一个值，但是也可以不提供，或者插入一个NULL，这个时候SQLite3的引擎会自动算出这个字段的值了。
默认的ROWID的select算法是将表中已经存在的最大的ROWID的值加1，如果到表中最大的ROWID已经达了64位整数的最大值，那么系统随机的取值，然后看对应的id是否在用，如果在用则放弃，继续找，经过一定次数的尝试，如果还没有找到，则报错。    
  
但是如果你将字段的类型定义为 INTEGER PRIMARY KEY AUTOINCREMENT 那么这个时候ROWID的select算法就和默认的不一样了。这时候，ROWID也是自增的，但是自增的ROWID的得保证当前数据库的当前表中之前一直没用过，即使你插入过100行记录，ROWID分别位1到100，这个时候你将这100条记录都删除掉，这个时候你再插入的时候，ROWID是从101开始的，而在默认的情况的下，还是从1开始的。  

参考地址 ： [http://www.sqlite.org/autoinc.html](http://www.sqlite.org/autoinc.html)