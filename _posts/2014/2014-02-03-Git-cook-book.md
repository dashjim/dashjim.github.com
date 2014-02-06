---
layout: post-en
title: Git Cookbook
categories:
- Common Tec
tags:
- Git
---

> 本文始于自己的Evernote，由于大部分原本是英文记录的，所以干脆全部用英文。

> Most of the content comes from my Evernote, therefore, this post will be updated once I have more notes, and you are highly welcome to contribute your notes to this article or point out any mistake.

### How to see simple git log?

-------------
The following let you to see only one line comment for each commit.

```
git log --oneline
git log --oneline -3
```
Below command let you to display Gitk-alike tree to your shell screen. And `--global alias.pl` allows you to use the short form of command. like `$ git pl`.

```
git log --oneline --graph --decorate
git config --global alias.pl "log --oneline --graph --decorate"
```
Usage:

![](/media/pic2014/0203-1.png)
### How to see log in another branch?
-------------
```shell
git log origin/master..
```
### How to search keywords in commit comment (across all branches)?
-------------
If you want to know how a feature was implemented you can start by search the keywords in the log history and then diff it. From my experience, most of times this method is faster than search in the IDE.

```
git log --all --grep='a keyword'
```
**Note**
`--grep` can bring you the entire commit message instead of ONE line which contains the keywords. This command is better than the shell `grep` command `git log --all |grep 'keyword'` because the later only gives you one line result and you cannot see ALL comment of a commit.
### How to see history of one file?
-------------
You have many options to achieve that goal.

```
git log -- [filename] (show the log history)
git log -p filename (Diff the code; git generate the patches for each log entry)
gitk [filename] (Show the content changed)
git log --follow <filename> (Show rename)
```
### How to only produce one commit for a merge?
-----------
Think about you have a dev branch and a main branch and you have a lot of commits in your dev branch, but when merge code you don't want all those comment history goes to the main branch(the main branch history could be more meaningful). use `--squash` to only produce one new commit for the merge.

```
git merge --squash bugfix
git commit -m 'fix bug'
```

### How to only see local commit log?
-----------
The following gives you two ways to see that.

```
git log --no-merges master..
git log -g
```

### How to revert to a commit?
----------------

```
git reset --hard 4a155e5
and then 
git push -f origin master
```
**Notice** git revert will not work here! `git revert` can only revert one commit. If you have commit `11,22,33,44,` and you `git revert 22` then you will have commit `11,33,44`, but if you `git reset --hard 22` and commit, then you could only have `11` in your commit history.

### How to find a lost commit?
--------------
Sometimes we could lost our commit(For example you are working on a detached HEAD). As a last resort in case your commit is dangling and not connected to history at all, you can search the reflog itself with the `-g` flag (short for `--walk-reflogs`)

```
git log -g --grep='Build 0051'
```
**This is because that the reflog contains the local history.**
After you get the SHA-1 for you commit. You can check it out.

### How to know which branch is the most recent?
--------------------
Once you cloned a huge repo, and a lot of branch can be found within it - some of them are not active because the feature development was completed. How to know which branch to use? My way is to sort these branches by commit time, so we know which branch is fresh.

```
git config --global alias.latest "for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short)'"
```

**Usage:**

```
$ cd ~/Code/rails/rails && git latest
2012-11-19 origin/master
2012-11-19 origin/HEAD
2012-11-19 master
2012-11-19 origin/3-2-stable
2012-11-03 origin/encrypted_cookies
2012-11-03 origin/attributes_perf
... snipped ...

```
Show local branches only:

```
git config --global alias.latest "for-each-ref --sort=-committerdate refs/heads --format='%(committerdate:short) %(refname:short)'" 
```
### How to change the remote HEAD
------------
```
git branch -a
remotes/origin/HEAD -> origin/gh-pages
remotes/origin/gh-pages
remotes/origin/master

git remote set-head origin master
git branch -a
remotes/origin/HEAD -> origin/master
remotes/origin/gh-pages
remotes/origin/master
```
### How to delete a remote git branch?
-------------
```
git push origin --delete <branchName>
```
### How to delete the merge orig file?
-------------
Some automatically generated `*.orig` files will be left in your working folder after a successful merge. One quick way to delete them could be

```
git clean -f
```

**Beware** There's no going back. Use `-n` or `--dry-run` to preview the damage you'll do.
 `git-clean`  Remove untracked files from the working tree 
If you want to also remove directories, run `git clean -f -d`
If you just want to remove ignored files, run `git clean -f -X`
If you want to remove ignored as well as non-ignored files, run `git clean -f -x`
Note the case difference on the X for the two latter commands.

### How to know the remote branch names?
-------------
OK, you got a huge repository, maybe the first step is to know the remote branch names.

```
git branch -r
```
### How to rename a file?

```
$ git mv README README.md
$ git commit -m "renamed"
$ git push origin master
```

### How to pull a remote branch?
-------------
Before you can start working locally on a remote branch, you need to fetch it as called out in answers below.
To fetch a branch, you simply need to:

```
git fetch origin
git branch -r
```

This will fetch all of the remote branches for you. With the remote branches in hand, you now need to check out the branch you are interested in, giving you a local working copy:

```
git checkout -b test origin/test
```
 
