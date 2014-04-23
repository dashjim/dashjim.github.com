---
layout: post
title: 发明人Linus Torvalds给出的Git使用建议
categories:
- Technology
tags:
- Git
---


> **导读**  


> - 博主自己大约花了二十分钟用来阅读本文，如果你时间不够，请先收藏。  
> - 本文分为两部分，第一部分较为概略，一般要读到第二部分时才能明白前面说的是什么。  
> - 本文精彩的论述了什么时候用rebase，什么时候不能用。同时分析了使用Pull,Merge,Push的时机。

###引言
如何更好的使用Git？作为Git的发明人Torvalds会给出什么样的建议呢？
[Linus Torvalds的博客](http://torvalds-family.blogspot.sg/)和他的Mail list里提到过使用Git的一些注意事项。（该Blog可能国内被墙）

现在开始挖坟啦！话说2009年的某一天Linux 2.6.31内核的分枝合并工作进行的很顺利（你知道现在Linux内核的版本号吗？），Torvalds的心情大好于是就写下一篇与Git有一点点关系的[blog](http://torvalds-family.blogspot.sg/2009/06/happiness-is-warm-scm.html)，然后后面有两个人在回复里问Git应该怎么用呢？

###问题
>As a Git n00b, would be nice to see a post on what these "rules that work" are.   

Linus Torvalds刚好心情大好就给整理了一下。

###Linus回答

It's basically a matter of finding the right balance on a couple of different axises:

"clean history":

Balancing the need to clean up after mistakes (aka "rewriting history") using tools like 'git rebase', but then not doing it so much that you actually rewrite other peoples commits or lose all sight of the important history (like the fact that you tested one particular test, and if you then rewrite the history, all your testing is now dubious).

"Merging too much vs too little":

Merging is nice, because if you have concurrent development, a merge will tie the two branches together and allows you to test and develop on top of both changes.

But the downside is that merging too eagerly means that two separate branches that are for two different features are now tied together, and you can never separate the two (at least without re-doing the whole history).

So merging too much results in a very messy history, where you can't see what the actual different "topics" were. And it results in a tree where upstream (that is - me) can't review and pull the features one by one.

There's a few rants and rules about this that I did on the mailing lists last merge window. See for example [rant](http://www.mail-archive.com/dri-devel@lists.sourceforge.net/msg39091.html)

###另一个Mail List里的意见
上面写的有些概括，这里其实是对上文的解释。

###邮件上下文
> My plans from now on are just to send you non-linear trees, whenever I 
> merge a patch into my next tree thats when it stays in there, I'll pull 
> Eric's tree directly into my tree and then I'll send the results, I 
> thought we cared about a clean merge history but as I said without some 
> document in the kernel tree I've up until now had no real idea what you 
> wanted.

###Linus回答
> 注意Linus的原文就是用_Markdown_格式写的，下面是原文，我没有加入任何Markdown格式。说明Linus在写邮件的时候是极为注意细节的。大家可以去查看[原文的Raw格式](http://www.mail-archive.com/dri-devel@lists.sourceforge.net/msg39091.html)   
> 另外如果下文提到的_rebase_你不是特别清楚的话，请参考:[git merge --squash and git rebase explained](http://http://blog.sevenche.com/2014/03/Git_merge_--squash_and_git_rebase/)

   
I want clean history, but that really means (a) clean and (b) history.

People can (and probably should) rebase their _private_ trees (their own 
work). That's a _cleanup_. But never other peoples code. That's a "destroy 
history"

So the history part is fairly easy. There's only one major rule, and one 
minor clarification:

 - You must never EVER destroy other peoples history. You must not rebase 
   commits other people did. Basically, if it doesn't have your sign-off 
   on it, it's off limits: you can't rebase it, because it's not yours.

   Notice that this really is about other peoples _history_, not about 
   other peoples _code_. If they sent stuff to you as an emailed patch, 
   and you applied it with "git am -s", then it's their code, but it's 
   _your_ history.

   So you can go wild on the "git rebase" thing on it, even though you 
   didn't write the code, as long as the commit itself is your private 
   one.

 - Minor clarification to the rule: once you've published your history in 
   some public site, other people may be using it, and so now it's clearly 
   not your _private_ history any more.

   So the minor clarification really is that it's not just about "your 
   commit", it's also about it being private to your tree, and you haven't 
   pushed it out and announced it yet.

That's fairly straightforward, no?

Now the "clean" part is a bit more subtle, although the first rules are 
pretty obvious and easy:

 - Keep your own history readable

   Some people do this by just working things out in their head first, and 
   not making mistakes. but that's very rare, and for the rest of us, we 
   use "git rebase" etc while we work on our problems. 

   So "git rebase" is not wrong. But it's right only if it's YOUR VERY OWN 
   PRIVATE git tree.

 - Don't expose your crap.

   This means: if you're still in the "git rebase" phase, you don't push 
   it out. If it's not ready, you send patches around, or use private git 
   trees (just as a "patch series replacement") that you don't tell the 
   public at large about.

It may also be worth noting that excessive "git rebase" will not make 
things any cleaner: if you do too many rebases, it will just mean that all 
your old pre-rebase testing is now of dubious value. So by all means 
rebase your own work, but use _some_ judgement in it.

NOTE! The combination of the above rules ("clean your own stuff" vs "don't 
clean other peoples stuff") have a secondary indirect effect. And this is 
where it starts getting subtle: since you most not rebase other peoples 
work, that means that you must never pull into a branch that isn't already 
in good shape. Because after you've done a merge, you can no longer rebase 
you commits.

Notice? Doing a "git pull" ends up being a synchronization point. But it's 
all pretty easy, if you follow these two rules about pulling:

 - Don't merge upstream code at random points. 

   You should _never_ pull my tree at random points (this was my biggest 
   issue with early git users - many developers would just pull my current 
   random tree-of-the-day into their development trees). It makes your 
   tree just a random mess of random development. Don't do it!

   And, in fact, preferably you don't pull my tree at ALL, since nothing 
   in my tree should be relevant to the development work _you_ do. 
   Sometimes you have to (in order to solve some particularly nasty 
   dependency issue), but it should be a very rare and special thing, and 
   you should think very hard about it.

   But if you want to sync up with major releases, do a

        git pull linus-repo v2.6.29

   or similar to synchronize with that kind of _non_random_ point. That 
   all makes sense. A "Merge v2.6.29 into devel branch" makes complete 
   sense as a merge message, no? That's not a problem.

   But if I see a lot of "Merge branch 'linus'" in your logs, I'm not 
   going to pull from you, because your tree has obviously had random crap 
   in it that shouldn't be there. You also lose a lot of testability, 
   since now all your tests are going to be about all my random code.

 - Don't merge _downstream_ code at random points either.

   Here the "random points" comment is a dual thing. You should not mege 
   random points as far as downstream is concerned (they should tell you 
   what to merge, and why), but also not random points as far as your tree 
   is concerned.

   Simple version: "Don't merge unrelated downstream stuff into your own 
   topic branches."

   Slightly more complex version: "Always have a _reason_ for merging 
   downstream stuff". That reason might be: "This branch is the release 
   branch, and is _not_ the 'random development' branch, and I want to 
   merge that ready feature into my release branch because it's going to 
   be part of my next release".

See? All the rules really are pretty simple. There's that somewhat subtle 
interaction between "keep your own history clean" and "never try to clean 
up _other_ proples histories", but if you follow the rules for pulling, 
you'll never have that problem.

Of course, in order for all this to work, you also have to make sure that 
the people you pull _from_ also have clean histories.

And how do you make sure of that? Complain to them if they don't. Tell 
them what they should do, and what they do wrong. Push my complaints down 
to the people you pull from. You're very much allowed to quote me on this 
and use it as an explanation of "do this, because that is what Linus 
expects from the end result".

                        Linus
###总结
Linus特别注意提交历史的干净与可读，其中给出了rebase应该的使用场境。

> 附本文相关文章--[Git-学习路线图及中文资料推荐](http://blog.sevenche.com/2014/02/Git-%E5%AD%A6%E4%B9%A0%E8%B7%AF%E7%BA%BF%E5%9B%BE%E5%8F%8A%E4%B8%AD%E6%96%87%E8%B5%84%E6%96%99%E6%8E%A8%E8%8D%90/)
