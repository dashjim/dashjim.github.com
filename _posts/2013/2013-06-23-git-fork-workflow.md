---
layout: post
title: Git fork workflow
categories:
- Programming
tags:
- git
---

1.Fork     
2.Add upstream repo   

	git clone <forked repo url>
	cd <repo foder>
	git remote add upstream <origin repo url>
	
	
	
3.Fetch upsteam and merge   

	git checkout master
	git fetch upstream
	git merge upstream/master
	git push origin master