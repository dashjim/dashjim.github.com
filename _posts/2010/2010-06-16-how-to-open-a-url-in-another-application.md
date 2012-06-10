---
layout: post
title: How to open a url in another application
categories:
- Programming
tags:
- objc
- Cocoa
---

我们经常希望在网页中通过特定schema的连接关联打开相关的程序进行一些操作,比如qq的聊天链接等.
在Cocoa中,这个操作属于Launch Services的一部分.
还有我们平时文档关联特定的程序进行打开这样的操作也属于Launch Services的范畴.
在系统中存在一个Launch Services Database,它包含了”什么样的文件可以通过什么样的程序打开,或者什么样的URL可以通过什么样的程序打开的” 这些信息.

下面我们还是来重点谈URL和Application关联的问题.

#### 1.URL注册

首先我们得让程序告诉操作系统程序自己所关联的URL的schema.
这个我们可以在Info.plist中添加相关信息.

{% highlight xml %}
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>MyURLHandler</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>myurl</string>
            </array>
        </dict>
    </array>
{% endhighlight %}

添加这些之后,重新编译运行程序,系统后台运行的程序会将刚刚的对应的url和程序的关联信息写进Launch Services Database,这个时候,页面中的 myurl://xxx 这样的url会通过你的程序来处理了.
注:

CFBundleURLTypes中的CF的意思是Core Foundation

Mac OS X通过如下几种方式进行注册.
1. 当用户登录后,会有一个后台运行的程序对Application目录进行扫描,发现文档绑定或者url绑定的信息,并将其复制到Launch Services Database
2. 当打开一个新的文件夹,然后Finder发现某个Application,Finder会将相关程序的关联信息写入Launch Services Database
3. 当用户打开某个没有关联的文档的时候,系统会弹出一个程序选择对话框,选择之后,会将相关关联写入Launch Services Database

#### 2.URL接受和处理

刚刚我们对URL进行注册了,点击之后,系统会发送一个事件消息给程序,所以第一我们得设置一个处理器来接受相关事件.
下面的代码一般我们写在AppDelegate中,比如可以写在applicationDidFinishLaunching函数中.当程序启动完成时运行这段代码.

{% highlight objc %}
    [[NSAppleEventManager sharedAppleEventManager]  
     setEventHandler:self  
     andSelector:@selector(handleURLEvent:withReplyEvent:)  
     forEventClass:kInternetEventClass  
     andEventID:kAEGetURL];
{% endhighlight %}

然后定义handleURLEvent:withReplyEvent:这个方法

{% highlight objc %}
- (void)handleURLEvent:(NSAppleEventDescriptor*)event withReplyEvent:(NSAppleEventDescriptor*)replyEvent
{
    NSLog(@"The url is %@",[event descriptorAtIndex:1] stringValue]);
}
{% endhighlight %}
