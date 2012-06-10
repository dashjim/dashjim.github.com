---
layout: post
title: Git原理浅析
categories:
- Tools
tags:
- Git
- Linux
---

git的底层从其本质上讲是一个内容寻址文件系统,然后基于这个内容寻址文件系统实现了一套vcs(版本控制系统)的高层接口,方便我们使用.当然git也提供了底层接口,便于我们使用之做出符合自己需求的系统.

我们把文件内容交给git进行管理,总得有一个地方来存放这些内容是吧!
是的,在git中,所有的文件内容都保存在git仓库的objects目录中.

#### 初始化git库

我们初始化一个git仓库有两种方式,git init和git –bare init
这两者的区别是,前者会在当前目录下生成一个.git目录(此目录即为git库的目录),而当前目录为我们的工作目录,一般是checkout后的文件,我们编程时所读写的内容都在此目录下.
后者的bare的意思就是裸的意思,也就是直接把当前目录当作git库的目录,这个一般用在远程git库上,因为我们在远程git库上没有checkout的需求,只是用作单纯的git库
git库还有个优点就是直接拷贝到另一个地方就可以直接用了,只要你的相应的机器上安装了git即可.

#### git对象

git中一个非常重要的概念就是git对象,我们可以把git系统想象成一个强大的key-value存储,每一个对象都对应着一个40位的哈希值.通过这个哈希值我们便可以很容易的取得对象(当然我们可以为这些哈希值取一些有意义的别名,方便我们使用).我们可以把这个哈希值看作指针.而对应的对象就是指针所指向的实体.对象和对象之间还可以通过通过指针进行一些关联的操作.
git对象可分为四种类型:

- blob对象 用来存放文件数据  
- tree对象 对应着目录,tree的内容为blob对象的指针或者其他tree对象的指针
- commit对象 每一次commit都会产生一个新的commit对象,其包含了一个指向tree对象的指针,指向前一次commit对象的指针,还包含了commit的时间,作者和注释等信息,就相当于为项目做了一次snapshot,通过commit对象我们可以跟踪到前一次commit对象,这样就可以实现log功能了
- tag对象 一种特殊的commit对象   

git库目录
接下来分析git库目录中各个文件的作用
{% highlight bash %}
Lukes-MacBook:test.git Luke$ ls -al
total 32
drwxr-xr-x  11 Luke  staff   374 Jun  4 20:21 .
drwxr-xr-x  24 Luke  staff   816 Jun  4 20:21 ..
-rw-r--r--   1 Luke  staff    23 Jun  4 20:21 HEAD (当前分支的指针)
drwxr-xr-x   2 Luke  staff    68 Jun  4 20:21 branches
-rw-r--r--   1 Luke  staff    85 Jun  4 20:21 config
-rw-r--r--   1 Luke  staff    73 Jun  4 20:21 description
drwxr-xr-x  12 Luke  staff   408 Jun  4 20:21 hooks (可以实现在特定操作的前或者后触发一些动作)
drwxr-xr-x   3 Luke  staff   102 Jun  4 20:21 info
drwxr-xr-x  64 Luke  staff  2176 Jun  4 20:21 objects (blob,tree,commit,tag 对象)
-rw-r--r--   1 Luke  staff    85 Jun  4 20:21 packed-refs
drwxr-xr-x   4 Luke  staff   136 Jun  4 20:21 refs (指向各个分支的指针)
{% endhighlight %}


objects保存的时候,以40位哈希值的前两位作为子目录的名称,后38位作为对象的文件名
git系统会定期对所有的objects进行打包操作,这样可以减少磁盘占用空间
git中最新版本的都是直接保存的,以前版本是通过引用最新的文件以及差异进行获取的,这是因为大都数时候我们对最新的分支代码更为关注