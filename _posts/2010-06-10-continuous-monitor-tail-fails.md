---
layout: post
title: tail -f 不起作用了？！
categories:
- Programming
tags:
- Linux
---

#### 问题描述

在测试tail -f的时候，发现一个奇怪的现象,首先 我在一个窗口中
tail -f test.txt 
然后在另一个窗口中用vim编辑这个文件，增加了几行字符，并保存，这个时候发现第一个窗口中并没有变化，没有将最新的内容显示出来。

#### 查找原因

然后我查看了以下tail的帮助，看到了下面的内容

> -F same as –follow=name –retry

我就加上-F，重复上面的实验过程，
发现这次有变化了，但是是完全的重新加载了一次，

> tail: `test.txt’ has been replaced; following end of new file

这个提示表明，tail原来跟踪的文件被替换了，所以重新加载了一次。

这个时候把目光转移到vim。
这个时候重新实验，tail -f test.txt，然后vim编辑，保存。
通过lsof|grep test.txt(列出打开test.txt文件的进程)
发现tail -f跟踪的文件在vim编辑后是被删除掉了。

保存前

{% highlight bash %}
luke@luke-desktop:~/Desktop$ lsof|grep test.txt
tail      10158       luke    3r      REG                8,2        0    4984552 /home/luke/Desktop/test.txt
vim       10173       luke    4u      REG                8,2    12288    4981647 /home/luke/Desktop/.test.txt.swp
{% endhighlight %}

vim保存后
{% highlight bash %}
luke@luke-desktop:~/Desktop$ lsof|grep test.txt
tail      10158       luke    3r      REG                8,2        0    4984552 /home/luke/Desktop/test.txt~ (deleted)
vim       10173       luke    4u      REG                8,2    12288    4981647 /home/luke/Desktop/.test.txt.swp
{% endhighlight %}

这个时候再去细读了下tail的帮助文件。

> With –follow (-f), tail defaults to following the file descriptor, which means that even if a tail’ed file is renamed, tail will continue to track its end. This default behavior is not desirable when you really want to track the actual name of the file, not the file descriptor (e.g., log rotation). Use –follow=name in that case. That causes tail to track the named file by reopening it periodically to see if it has been removed and recreated by some other program.

看了之后明白了一切。

#### 结论

当使用vim编辑保存一个文件之后，vim创建了一个新的文件，老的文件被删除，所以他们的inode不一样了。
而tail -f 默认情况下是根据文件描述符来进行文件跟踪的，而文件描述符创建的时候又是依赖于inode的，所以vim保存之后不会被tail -f发现（因为是新的inode)。

PS:我们可以通过下面的方式来进行测试
echo testest>>test.txt