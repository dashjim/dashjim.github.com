---
layout: post
title: Git reflog 机制
categories:
- Programming
tags:
- git
---
###使用git reflog查看引用变化
[git reflog](https://www.kernel.org/pub/software/scm/git/docs/git-reflog.html)是对reflog进行管理的命令，那么什么是reflog呢？   
reflog是git用来记录引用变化的一种机制，比如记录分支的变化或者是HEAD引用的变化。 
比如在某git库中运行git reflog,当git reflog命令不指定引用的时候默认列出HEAD的reflog。

	2ab4043 (HEAD, refs/heads/master, refs/heads/a) HEAD@{0}: checkout: moving from master to a
	2ab4043 (HEAD, refs/heads/master, refs/heads/a) HEAD@{1}: commit (merge): Merge branch 'mybranch'
	bf98582 HEAD@{2}: rebase: aborting
	bf98582 HEAD@{3}: checkout: moving from 7e9938d9f5b9f7835359ca87da8a329781ed74b6 to master
	7e9938d (refs/remotes/origin/mybranch, refs/heads/mybranch) HEAD@{4}: checkout: moving from master to 7e9938d9f5b9f7835359ca87da8a329781ed74b6^0
	bf98582 HEAD@{5}: reset: moving to bf985821e12129ea3dc9d4150792b8dae798773c
	be93372 (refs/remotes/origin/master) HEAD@{6}: commit: add merge detail to read me
	3eeedca HEAD@{7}: commit (merge): Merge branch 'mybranch'
	bf98582 HEAD@{8}: reset: moving to bf985821e12129ea3dc9d4150792b8dae798773c
	00fa1f0 HEAD@{9}: commit (merge): Merge branch 'mybranch'
	bf98582 HEAD@{10}: reset: moving to bf985821e12129ea3dc9d4150792b8dae798773c
	663feb9 HEAD@{11}: commit: merge mybranch
	bf98582 HEAD@{12}: reset: moving to bf985821e12129ea3dc9d4150792b8dae798773c
	aa73004 HEAD@{13}: commit: merge issue
	bf98582 HEAD@{14}: commit: modify readme file
	cd2eddb HEAD@{15}: checkout: moving from mybranch to master
	7e9938d (refs/remotes/origin/mybranch, refs/heads/mybranch) HEAD@{16}: commit: modiy readme add issueFile
	cd2eddb HEAD@{17}: checkout: moving from master to mybranch
	cd2eddb HEAD@{18}: commit: prepare files
	b39fed8 HEAD@{19}: commit (initial): first commit
  
这里涉及到一个修订版本引用的语法,比如 HEAD@{0}代表HEAD当前的值，HEAD@{2}代表HEAD两次变化之前的值。详情的语法可以参看这里 [https://www.kernel.org/pub/software/scm/git/docs/gitrevisions.html](https://www.kernel.org/pub/software/scm/git/docs/gitrevisions.html)。   
上面的输出结果为HEAD所有的变化历史，每一条记录包含了变化所对应的git操作，比如commit，checkout，rebase，merge等，以及变化的详情内容。      
git reflog有时候可以帮助你找到丢失掉的commit，比如你在某个detached HEAD（即不在任何分支只是在某个历史的commit的节点上）的时候进行了一次commit，然后你切换到另一个分支想把刚才的东西合并进来，这个时候突然意识到刚才的那次提交找不到了，这时你就可以通过HEAD@{1}引用到刚才的提交了，或者通过git reflog找到对应commit的sha1值，然后进行merge。
<br>

###reflog文件格式
那么git系统是如何存储reflog的呢？这里继续拿HEAD来举例，git会将变化记录到HEAD对应的reflog文件中，其路径为.git/logs/HEAD，文件是一个纯文本文件。分支的reflog文件都放在.git/logs/refs目录下的子目录中。
下面是HEAD的reflog文件的内容：

    0000000000000000000000000000000000000000 b39fed82cd3225eb524f6f0184c0ba49a4f6952c 卢克 <kejinlu@gmail.com> 1366871718 +0800	commit (initial): first commit
    b39fed82cd3225eb524f6f0184c0ba49a4f6952c cd2eddb41a632f68b0655366d5ca99f4701bb9b4 卢克 <kejinlu@gmail.com> 1366871885 +0800	commit: prepare files
    cd2eddb41a632f68b0655366d5ca99f4701bb9b4 cd2eddb41a632f68b0655366d5ca99f4701bb9b4 卢克 <kejinlu@gmail.com> 1366871950 +0800	checkout: moving from master to mybranch
    cd2eddb41a632f68b0655366d5ca99f4701bb9b4 7e9938d9f5b9f7835359ca87da8a329781ed74b6 卢克 <kejinlu@gmail.com> 1366872039 +0800	commit: modiy readme add issueFile
    7e9938d9f5b9f7835359ca87da8a329781ed74b6 cd2eddb41a632f68b0655366d5ca99f4701bb9b4 卢克 <kejinlu@gmail.com> 1366872046 +0800	checkout: moving from mybranch to master
    cd2eddb41a632f68b0655366d5ca99f4701bb9b4 bf985821e12129ea3dc9d4150792b8dae798773c 卢克 <kejinlu@gmail.com> 1366872107 +0800	commit: modify readme file
    bf985821e12129ea3dc9d4150792b8dae798773c aa7300408b6865b105d196c1acf60dc83ffccef1 卢克 <kejinlu@gmail.com> 1366872272 +0800	commit: merge issue
    aa7300408b6865b105d196c1acf60dc83ffccef1 bf985821e12129ea3dc9d4150792b8dae798773c 卢克 <kejinlu@gmail.com> 1366872623 +0800	reset: moving to bf985821e12129ea3dc9d4150792b8dae798773c
    bf985821e12129ea3dc9d4150792b8dae798773c 663feb94a406a8d3600f2d24bf4dafc565a5f9da 卢克 <kejinlu@gmail.com> 1366872760 +0800	commit: merge mybranch
    663feb94a406a8d3600f2d24bf4dafc565a5f9da bf985821e12129ea3dc9d4150792b8dae798773c 卢克 <kejinlu@gmail.com> 1366872810 +0800	reset: moving to bf985821e12129ea3dc9d4150792b8dae798773c
    bf985821e12129ea3dc9d4150792b8dae798773c 00fa1f0727bca42305b2a7c5dc53f44c33a17a96 卢克 <kejinlu@gmail.com> 1366872883 +0800	commit (merge): Merge branch 'mybranch'
    00fa1f0727bca42305b2a7c5dc53f44c33a17a96 bf985821e12129ea3dc9d4150792b8dae798773c 卢克 <kejinlu@gmail.com> 1366873467 +0800	reset: moving to bf985821e12129ea3dc9d4150792b8dae798773c
    bf985821e12129ea3dc9d4150792b8dae798773c 3eeedca7ea0b821088faba84b3157493eae4e13d 卢克 <kejinlu@gmail.com> 1366873579 +0800	commit (merge): Merge branch 'mybranch'
    3eeedca7ea0b821088faba84b3157493eae4e13d be933721a15b18605aaf9d4d9f5c5eff3281b9b4 卢克 <kejinlu@gmail.com> 1366874038 +0800	commit: add merge detail to read me
    be933721a15b18605aaf9d4d9f5c5eff3281b9b4 bf985821e12129ea3dc9d4150792b8dae798773c 卢克 <kejinlu@gmail.com> 1366882601 +0800	reset: moving to bf985821e12129ea3dc9d4150792b8dae798773c
    bf985821e12129ea3dc9d4150792b8dae798773c 7e9938d9f5b9f7835359ca87da8a329781ed74b6 卢克 <kejinlu@gmail.com> 1366882618 +0800	checkout: moving from master to 7e9938d9f5b9f7835359ca87da8a329781ed74b6^0
    7e9938d9f5b9f7835359ca87da8a329781ed74b6 bf985821e12129ea3dc9d4150792b8dae798773c 卢克 <kejinlu@gmail.com> 1366882688 +0800	checkout: moving from 7e9938d9f5b9f7835359ca87da8a329781ed74b6 to master
    bf985821e12129ea3dc9d4150792b8dae798773c bf985821e12129ea3dc9d4150792b8dae798773c 卢克 <kejinlu@gmail.com> 1366882792 +0800	rebase: aborting
    bf985821e12129ea3dc9d4150792b8dae798773c 2ab4043c6c4c9f59e7756cb7fb5df4fdf467fe4b 卢克 <kejinlu@gmail.com> 1366882860 +0800	commit (merge): Merge branch 'mybranch'
    2ab4043c6c4c9f59e7756cb7fb5df4fdf467fe4b 2ab4043c6c4c9f59e7756cb7fb5df4fdf467fe4b 卢克 <kejinlu@gmail.com> 1366958770 +0800	checkout: moving from master to a

从上面HEAD的reflog的log文件的内容可以看到，每一个reflog的entry都包含了变化前commit节点的sha1值以及变化后的commit节点的sha1值，如果你阅读了git的源码你会看到这两个值对应的变量名为osha1（old sha1）和nsha1（new sha1），第一次commit对应变化的old sha1值为全0的特殊值；每一个entry还包含了用户名，email ，变化的时间戳以及变化的具体内容。

<br>
###reflog高级操作
在git中一个对象一般都会被别的对象或者引用引用到。如果一个对象不再被任何对象或者引用直接引用到，那么这个对象就成了一个悬空对象dangling object。Dangling object在git库中基本没有大的作用了，如果你不去管它，会根据过期失效的策略最终被垃圾回收机制清理掉。   
如果从某个引用或者对象开始去遍历对象的有向图，无法达到某个指定对象，那么可以说这个指定对象unreachable from this reference or object。   
如果一个对象unreachable from任何其他对象和引用，那么它便是悬空对象了。   

之前我们提到，reflog entry会记录old sha1，new sha1的值，所以reflog 也算作对这两个sha1对应的对象的引用者。所以有时候虽然某个commit对象无法从任何一个引用引用到，但是它却不是真正的悬空对象，原因就是还有reflog对它的引用。所以有时候为了清理无用的对象，需要删除一些reflog entry。   

`git reflog delete ref@{specifier}` 可以用来删除指定的reflog entry，使得它从历史中消失，这个时候reflog并不是引用变化的真实历史了。前面讲了，每一个reflog entry都包含两个sha1，老sha1和新sha1，如果删除中间的某条entry的时候，就相当于断开了这种新老的关联，产生了gap，如何解决这个问题呢？可以在delete的时候加上`--rewrite选项`，它的作用就是使得删除掉的记录后面的entry的old sha1为现在前一条entry的new sha1值。   

还有一种删除reflog entry的方式是使用其过期机制，`git reflog expire [--expire=<time>] [--expire-unreachable=<time>] <refs>`，如果不指定其中的相关时间的话，则使用git配置的 `gc.reflogExpire` 和 `gc.reflogExpireUnreachable`如果配置没有显式的配置则使用默认值，分别为90天和两周。   


