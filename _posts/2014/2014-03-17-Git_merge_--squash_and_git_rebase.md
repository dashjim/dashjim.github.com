---
layout: post-en
title: git merge --squash and git rebase explained
categories:
- Common Tec
tags:
- Git
---

> One advantage for Git comes from its powerful branch management capability, but it will be hard to maintain the commit history between different branches. As Linus said that [Clear and Clean is important for the commit history](http://blog.sevenche.com/2014/02/Linus-Torvalds-rules-for-using-Git/), here in this article I am going to demonstrate how `git merge --squash`, `git merge`, and `git rebase` will affect the commit history.

### `git merge` and `git merge --squash`

In below example I am going to merge `dev3` into `dev2` and `dev4` by using merge with and without `--squash` parameter. 

** Initial status **

![](/media/pic2014/0317-2.png)

**merge with `--squash` test**

```
git checkout dev4
git merge --squash dev3
git commit -a
```

![git merge](/media/pic2014/0317-3.png)

We can see changed files in working directory and after commit we don't see `fbcb87a` and `b85fcb7` in the history of `dev4`

**Plain merge **

```
git checkout dev2
git merge dev3
```

![git plain merge](/media/pic2014/0317-4.png)

Now `dev4` and `dev2` have the same content, but we cannot see `dev4` contains commits form `dev3`, but `dev2` has the information. 

** Conclusion **

`--squash` will abandon the merge history, so you will not know what was merged. Only use it when you don't want these commit history!

------------------------

### Rebase

`git rebase` acts like automatically `cherrypick` commits into current branch and then reapply the commits in current branch. See below example.

** Before rebase **

![Before rebase](/media/pic2014/0317-0.png)

** rebase **

```
git checkout dev
git rebase master
```

** After rebase **

> Notice: dev commit ccd4673 changed to 9d76e0b

![After rebase](/media/pic2014/0317-1.png)

** Conclusion**

Rebase do not like merge - which will cause a commit, and from the tree you cannot see when the dev is split out and when it is merged back. - So Linus calls it is a _clean_ for history.