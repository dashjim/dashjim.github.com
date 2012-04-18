---
layout: post
title: 从URL启动程序：也谈谈旺旺的页面启动
categories:
- Programming
tags:
- Software
---

## 一.引子

很多时候为了方便，我们都需要从页面上启动一些本地的程序，比如QQ，MSN，Skype等。
我们先拿QQ来举例，QQ提供了一个QQ在线状态的服务，[QQ在线状态服务](http://wp.qq.com)

我们可以将自己的“QQ在线状态” 放置在自己的个人博客或者空间中，方便他人知道你是否在线，
如果想和你聊天的话，只需要点下图标便会调出QQ进行聊天了。

## 二.原理剖析

下面将循序渐进的讲解IM在线状态以及链接到程序的实现原理

### 1.如何从浏览器中调出程序

我们都知道，一般情况下，浏览器中是无法直接和本机的其他的程序进行交互的，在IE中，我们可以通过ActiveX对象的方式进行。但是这个方式只适用于IE浏览器，另一种比较通用的方式便是URL协议的方式，我们将某种URL的协议注册给某个程序来进行处理，比如将tencent://这样的协议注册给QQ程序来进行处理，当浏览器需要访问这样的协议的时候就转给QQ程序进行处理。这种URL协议的方式是可以跨平台的，比如在Windows上你需要添加注册表项；而在Mac系统中上，你需要在对应的Application的属性列表文件 info.plist 中增加URL处理协议项CFBundleURLTypes，当你将程序丢入Applications目录，或者自动被Mac系统扫描到的时候，会将URL以及相应的App注册到对应的数据库中。
一些细节可以查看这里 [Register protocol](http://kb.mozillazine.org/Register_protocol)

### 2.等等，我还不知道系统中有没有安装相应程序

如果我们不考虑应用的健壮性，那么我们可以直接在页面上这么搞
{% highlight html %}
<a href="tencent://message/?Menu=yes&uin=435882010&Site=&Service=201&sigT=...">
<img src="你想显示的图标的地址"/>
</a>
{% endhighlight %}

这样当你点这个图标的时候，就会呼出QQ程序，但是如果我根本没有安装程序呢？那么什么都不会出现。  
所以我们需要在启动url协议之前，检测处理相应url协议的程序是否安装了，如果没有安装就跳到软件的下载页面或者软件的web版。  
那么现在的问题就是如何检测本机是否已经安装了对应程序，和1中类似，在IE中我们可以通过ActiveX的方式来检测，但是在其他浏览器中我们无法进行，我们肯定需要浏览器和本地api进行交互，好在我们有NPAPI这个跨平台跨浏览器的标准接口，所以我们可以开发一个浏览器的插件，使用js和npapi插件进行交互，npapi插件再调用本地api来检查程序是否安装(比如在windows中查看注册表，或者mac中查看系统是否有程序能够响应相应的URL)。然后js中根据判断的返回值来进行下一步操作。  
PS：腾讯的QQ目前好像只支持IE上的URL启动，而没有通过NPAPI插件的方式解决跨浏览器的问题。  

### 3.判断是否在线，以便显示在线状态

这个其实蛮好办的，需要一个服务器端的一个接口，可以传过去一个uid，然后返回一个图片地址，或者在线状态都可以，
然后根据服务器端返回的结果进行不同的显示即可。比如qq在线状态的图标是这样的

{% highlight html %}
<img border="0" src="http://wpa.qq.com/pa?
p=2:435882010:41&r=0.2603091907221824" 
alt="点击这里给我发消息" title="点击这里给我发消息">
{% endhighlight %}

### 4.总结
 
当图标外层是链接的时候，一般链接的target属性的值为_blank，请求的地址为服务器的一个url，服务器根据url传递的uid和其他的一些参数，返回一段新的html，新的htm中包含了自动运行的js，执行完了之后,就会将新的页面自动关闭，所以你看到的就是一闪而过一个新的页面，然后相应的程序便得到了响应了，返回的js通过一定的函数方法来检测是否安装，然后判断，以及将window.location赋值为相应的url，以便启动程序来处理请求。

如果附在图片上的为事件的话，那么就是将相关js已经包含在本页中了，点击之，便交给js函数来处理了。

## 三.旺旺URL启动的分裂与纠结

大家使用旺旺大概都是在购物的时候才会使用到，当然内部员工例外。
不过这样足够了，旺旺的定位其实就是电子商务，只是她令人不爽的地方太多了。

首先旺旺版本多，淘宝版的旺旺，中文站的旺旺，英文站的旺旺ATM(Alibaba TradeManager)
虽然最新版本的旺旺整合了淘宝旺旺，阿里旺旺中文站，但是帐户体系还是分开的，
很明显这些由于公司在一开始策略上的失误，即使为了不同网站的用户进行个性化定制IM的功能，但是账户体系也不应该分开，而应该统一起来。
不同的旺旺帐号，通过uid的前缀进行区分，比如淘宝的帐号前缀就是cntaobao
好了还是来说说URL启动的事情吧。
旺旺主要用于电子商务活动中的即使通讯，所以我们在浏览某个产品的网页的时候，可能很快就会感兴趣，所以就有从页面中点击一下直接和店主进行沟通的欲望，所以从URL启动旺旺其实是一个很必要的需求。
通过上一节我们都知道了如何从页面的URL启动一个程序，旺旺也是通过同样的方式来进行的。
最新版的旺旺的url协议是aliim:的方式，不过在老版本里是wangwang:这样的协议，更有甚者还有和yahoo相关的协议比如yahooWW:这样的协议也出现在一些js中。

### 1.淘宝页面中的URL启动

旺旺在这方便有一个专门的服务叫做“旺旺点灯” [旺旺点灯](http://promotion.koubei.com/s/www/wangwang/index.html)
这里有一些demo
[wangwang_demo](http://assets.taobaocdn.com/tbra/dpl/modules/wangwang_demo.html)
目前在淘宝中发现三类启动的方式
最新版本的webww的方式，具体的js脚本可以看这里，正式使用的时候是这个的压缩版 http://a.tbcdn.cn/p/header/webww.js，这个js中是使用了淘宝的js框架kissy进行了重写的。你可以搜索aliim进行相关代码的查看，这个的实现原理是，首先在html页面种，写一些特定id的元素比如

{% highlight html %}
<span class="ww-light ww-large" data-nick="truen%E6%97%97%E8%88%B0%E5%BA%97" 
data-tnick="truen%E6%97%97%E8%89%A6%E5%BA%97" data-encode="true" data-display="inline">
<a href="http://www.taobao.com/webww/?ver=1&touid=cntaobaotruen%E6%97%97%E8%88%B0%E5%BA%97&
siteid=cntaobao&status=2&portalId=&
gid=b2be10ade26ceb489a62d1b95eba0619&itemsId=" target="_blank" 
class="ww-inline ww-online" title="点此可以直接和卖家交流选好的宝贝，或相互交流网购体验，还支持语音视频噢。"><span>旺旺在线</span>
</a>
</span>
{% endhighlight %}

最外层的span将在相关js加载的时候动态的进行渲染，显示成旺旺是否在线的图标以及附加上相关的单击事件，这样你单击图标的时候，便会由js来进行处理。这个webww的js从代码中看还支持firefox和chrome的npapi插件。当然如果发现本机没有安装旺旺的情况下，这里会将你调转到web版旺旺的页面。
淘宝的页面中还发现力另外两类的调用方式，一般出现在店铺的伙计的链接上，
> http://amos1.taobao.com/msg.ww?v=2&uid=andostore安都专卖:小梅
或者
> http://amos.im.alisoft.com/msg.aw?v=2&uid=591mmm旗舰店:19号&site=cntaobao&s=2&charset=utf-8
这两类都是链接的方式，点击之后返回一个新的html，通过新的html中的自动运行的js来处理请求。方式和QQ在线状态的方式类似。只是我通过IE上的插件或者firebug调试发现，这个没有支持npapi插件，只由ie下的支持。

### 2.中文站旺旺URL启动

中文站页面上的旺旺在线状态基本都是使用直接js事件的方式进行的，
目前我发现三个不同的地方使用不同的js进行了旺旺的调用,可以在js文件中搜索aliim进行相关代码的查看
企业在线 [企业在线](http://img.s.aliimg.com/pm/js/itbu/pm/jsserver/launcher-v2.js)
联系方式 [联系方式](http://style.china.alibaba.com/js/app/winport/pages/detail/winport-merge.js)
搜索结果页面 [搜索结果页面](http://style.china.alibaba.com/js/app/search/v2.0/screens/selloffer.img-v3.js)
也基本只支持IE下的。

### 3.国际站ATM的URL启动

这个有些奇怪，通过查看国际站中的相关js，没有发现aliim:协议的踪影，
后来发现，它并没有使用aliim协议，而是直接通过IE下ActiveX以及插件的方式直接和ATM进行通讯。
而且发现，国际站中的旺旺的id在页面中都是加密过后的结果。

### 4.总结

从上面罗列的这些情况可以看出，旺旺的url启动方式分支较多，且js没有进行统一。
而且各个系统中各自管各自的,在上层没有一个人来推动旺旺的统一。
也许将来这个状况会有所改善，只是走了这么久了，很多人不愿意发生改变，且改变起来“代价”觉得很高。