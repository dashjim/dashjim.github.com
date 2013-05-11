---
layout: post
title: Git修订版本
categories:
- Programming
tags:
- git
---
在git中修订版本其实就是commit对象的名字，这个名字可以直接是sha1的哈希或者指向这个哈希的引用（比如分支或者tag）。git使用中，修订版本或者修订版本范围的指定是一个非常重要的知识点，因为很多git命令都需要接收这样的参数，即修订版本或者修订版本的范围。
指定修订版本往往是为了从这个指定的修订版本开始向回遍历所有的修订版本进行相关操作，而指定修订版本范围则是为了只对范围中的修订版本进行单独操作。
关于修订版本及其范围的指定方式可以在这里找到：[https://www.kernel.org/pub/software/scm/git/docs/gitrevisions.html](https://www.kernel.org/pub/software/scm/git/docs/gitrevisions.html)。

