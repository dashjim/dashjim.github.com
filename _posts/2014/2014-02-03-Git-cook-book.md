---
layout: post-en
title: Git Cook Book
categories:
- Common Tec
tags:
- Git
---

     



本文始于自己Evernote，由于大部分原本是英文记录的，所以干脆全部用英文。
> Most of the content comes from my Evernote, therefore, this post will be updated once I have more on my note and your contribution is highly appropriated. 
----------

### How to see simple git log?
-------------
``` 
git log --oneline
git log --oneline --graph --decorate
git config --global alias.pl "log --oneline --graph --decorate"
git log --oneline -3
```
### How to see log in another branch?
-------------
```
git log origin/master..
```
### How to search keywords in commit comment (across all branches)?
-------------
If you want to know how a feature was implemented, you can start by search the keywords in the log history.
`--grep` can bring you the entire commit message instead of ONE line which contains the keywords
```
git log --all --grep='a keyword'
```
### How to see history of one file?
-------------
```
git log -- [filename] (show the log history)
git log -p filename (git generate the patches for each log entry)
gitk [filename] (Show the content changed)
git log --follow <filename> (Show rename)
```
### How to only produce one commit for a merge?
-----------
Usually all local commit history will be merged to the target branch. Below command only produce a new commit for the merge.
```
git merge --squash bugfix
git commit -m 'fix bug'
```

### How to only see local commit log?
-----------
```
git log --no-merges master..
```
### How to revert to a commit?
----------------
```
git reset --hard 4a155e5
and then 
git push -f origin master
```
**Notice: git revert will not work here!**

### How to find a lost commit?
--------------
As a last resort in case your commit is dangling and not connected to history at all, you can search the reflog itself with the `-g` flag (short for `--walk-reflogs`)

```
git log -g --grep='Build 0051'
```
**Be aware that the reflog only contains the local history.**
### How to know which branch is the most recent?
--------------------
Sort the branches by commit time.

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
**Show local branches only:**

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
```
git clean -f
```
But beware... there's no going back. Use -n or --dry-run to preview the damage you'll do.
 `git-clean`  Remove untracked files from the working tree 
If you want to also remove directories, run `git clean -f -d`
If you just want to remove ignored files, run `git clean -f -X`
If you want to remove ignored as well as non-ignored files, run `git clean -f -x`
Note the case difference on the X for the two latter commands.

### How to know the remote branch names?
-------------
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
 
