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

关于Cookie的标准和原理这里就不细说了，这里只说说在iOS平台下如何进行Cookie相关的编程。    
和Mac上不同，在iOS平台上各个App都有自己的Cookie，App之间不共享Cookie。    
一个Cookie对应一个NSHTTPCookie实体，并通过NSHTTPCookieStorage进行管理。    
那些需要持久化的Cookie是存放在 `~/Library/Cookies/Cookies.binarycookies` 文件中的，二进制格式。   

Cookie生成的有两个途径，一个是访问一个网页，这个网页返回的HTTP Header中有Set-Cookie指令进行Cookie的设置，这里Cookie的本地处理其实是由WebKit进行的；还有一种途径就是客户端通过代码手动设置Cookie。

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

<br>
不过NSHTTPCookieStorage存在一个问题，setCookie或者deleteCookie后并不会立即进行持久化，而是有几秒的延迟。如果在持久化之前App接收到SIGKILL信号，App退出，那么会导致cookie相关操作的丢失。在模拟器调试的过程中，XCode重启App的时发给App的就是SIGKILL，不过真正的生产环境中很少有这种情况。   
但是有时候为了可靠性，我们还是会将cookie信息保存一份到User Defaults，需要用的时候load进来。关于cookie操作丢失的详情可以查看这里[NSHTTPCookieStorage looses cookies on SIGKILL](http://openradar.appspot.com/radar?id=2776403) 
