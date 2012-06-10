---
layout: post
title: iPhone中Png图片格式的研究
categories:
- OS
tags:
- iPhone
- png
- iOS
---

有时候我们看到一个App，想看看他的一些界面是如何实现的，这个时候需要查看一下它的图片资源，不过iOS的png图片编译后一般的图片阅读器都是没法查看的，本文将告诉的原因和转换出原图的方法（得安装XCode）。

> ipa 解压，将png相关文件夹拷贝出来，在命令行下使用/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/pngcrush -revert-iphone-optimizations xxx.png yyy.png

我们都知道一个编译好的iPhone app 其中的png图片一般普通的图片阅读器是无法直接读取的，这是因为XCode在编译的过程中，将图片进行了优化，实际上它已经不是一个png图片了。
这边有一些apple iPhone png自己格式的一些说明
[http://iphonedevwiki.net/index.php/CgBI_file_format](http://iphonedevwiki.net/index.php/CgBI_file_format)

在Png数据中，我们最关心的莫过于png的数据块，其中包含了png每一个像素的信息，当然了为了减少存储空间，这些像素信息都是压缩保存的。而且是使用zlib进行压缩的，压缩后 包含zlib header 信息，还有由于解压验证的crc信息。
而iPhone的CgBI格式的png则将原始的png图片作如下变化:

* 增加一个新的关键块 CgBI Chunk 四个字节
* zlib的header和CRC信息全部从IDAT中移除
* 红蓝交换，每一个像素（RGBA）中的R和B进行调换变成BGRA ，解压后每一个像素有四个字节组成，也就是将每一个像素的 第一个字节和第三个字节调换
* 透明像素处理 Premultiplied Alpha,这个的意思是为了图像加载变得更快，预先将Alpha的信息乘到像素的颜色信息中去，这样后期计算的时候就可以减少CPU或者GPU计算了
  
把一个正常的PNG图片优化成iPhone 的png图片格式可以使用XCode自带的工具 `/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/pngcrush -iphone`
还有一个第三方的开源工具也可以
[https://github.com/DHowett/pincrush](https://github.com/DHowett/pincrush)

如果你想把一个经过优化后的图片还原成普通图片阅读器可以查看的png图片，就是对上面的过程进行反向处理。
现在可以找到的第三方的转换的一般有如下几个
ipin.py(Python版本) [http://www.axelbrz.com.ar/?mod=iphone-png-images-normalizer](http://www.axelbrz.com.ar/?mod=iphone-png-images-normalizer)
iPhonePNG（C版本） [http://www.newsfirerss.com/blog/?p=176](http://www.newsfirerss.com/blog/?p=176)

经过本人测试，上面的这些转换工具都没有对图片alpha相关信息的做任何处理，也可能是别的原因，有一些图片转换后的结果和原始图片还是有出入的。

编译后如果使用第三方的python或者C版本的代码来转换，转换后的图片都是这样的，感觉边角的像素有点问题，不过大部分情况下 ，图片都是ok的


我尝试通过修改第三方的代码，想将Premultiplied Alpha 还原过去，但是还是存在各种问题，最终没有结果。  
只能最终采用XCode自带的工具进行转换 ｀/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/pngcrush -revert-iphone-optimizations 1.png 2.png｀  
这个pngcrush是apple改自开源的pngcrush 只可惜苹果修改后的版本却没有开源出来。
   
为了避免每次都需要在命令行中进行操作，你可以通过automator新建一个shell的service


{% highlight bash %}
for path in "$@"
do
mv "$path" "$path".tmp
/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/pngcrush -revert-iphone-optimizations "$path".tmp "$path"
rm "$path".tmp
done
{% endhighlight %}
当然你可以修改脚本，并可以作用于文件和文件夹，对目标进行判断，文件夹则递归文件夹中的png文件进行逐个处理。