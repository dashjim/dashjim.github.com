---
layout: post
title: iOS Cookie使用
categories:
- Programming
tags:
- Objc
- Cocoa
- iOS
- Mac
---

关于Cookie的标准和原理这里就不细说，这里只说说在iOS平台下如何进行Cookie相关的编程。    
和Mac上不同，在iOS平台上各个App都有自己的Cookie，App之间不共享Cookie。    
一个Cookie对应一个NSHTTPCookie实体，并通过NSHTTPCookieStorage进行管理。    
那些需要持久化的Cookie是存放在 `~/Library/Cookies/Cookies.binarycookies` 文件中的，二进制格式。   

Cookie生成的有两个途径，一个是访问一个网页，这个网页返回的HTTP Header中有Set-Cookie指令进行Cookie的设置；还有一种途径就是客户端通过代码手动设置Cookie。

	NSMutableDictionary *cookieProperties = [NSMutableDictionary dictionary];
	[cookieProperties setObject:@"name" forKey:NSHTTPCookieName];
	[cookieProperties setObject:@"value" forKey:NSHTTPCookieValue];
	[cookieProperties setObject:@"www.taobao.com" forKey:NSHTTPCookieDomain];
	[cookieProperties setObject:@"/" forKey:NSHTTPCookiePath];
	[cookieProperties setObject:@"0" forKey:NSHTTPCookieVersion];
	[cookieProperties setObject:@"30000" forKey:NSHTTPCookieMaximumAge];
	NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:cookieProperties];
    [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:cookie];
	//删除cookie的方法为deleteCookie:

在通过`setCookie:`进行设置cookie的时候，会覆盖name,domain,path都相同的cookie的。    
至于cookie会不会持久化到cookie文件中主要看这个cookie的生命周期，和Max-Age或者Expires有关。    
