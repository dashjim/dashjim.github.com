---
layout: post
title: Python脚本实例 包括xml,json,http,编码
categories:
- Programming
tags:
- Python
---

这几天在研究python相关的一些东西,其中涉及的内容包括:

xml的解析,json的解析,urllib的使用,urllib的使用,python中中文编码的问题等

项目托管在Google上，地址是http://code.google.com/p/ipmobile/source/checkout

当然一切都来源于实际工作嘛,首先引入缘由,情景是这样的:

有一个Excel表格,有注册日期,用户ID,注册IP,注册手机号这几个字段,
但现在需要获取注册IP所在的地址 以及手机号所属地区等信息,
并根据这些信息进行分类统计等工作  

当然如果在没有编码人员介入的情况下,
需要一个个的到一些网络上的页面上查出地址的信息,然后填到excel里,
而这完全是重复劳动,完全可以抽象并做出系统,在没有人力进行系统开发的情况下,
可以使用简单的脚本进行替代,
本文中,本人使用python脚本进行了相关研究和实验性的工作.用Python写出的代码的可读性非常的高的
首先是一个简单的例子使用过的是有道的接口获取IP和手机号码的地址的

{% highlight python %}
#!/usr/bin/env python
#coding=utf-8

"""
getinfo.py
Created by Luke on 2009-04-29.
Copyright (c) 2009 Alibaba. All rights reserved.
"""

import urllib
from xml2dict import XML2Dict
import codecs


def gbk2utf8(xml):
    return xml.decode("gbk").encode("utf8").replace('gbk', 'utf-8');

def get_ip_info(ip):
    url="http://www.yodao.com/smartresult-xml/search.s?type=ip&q=%s"%ip
    return  gbk2utf8(urllib.urlopen(url).read())

def get_mobile_info(mobile):
    url="http://www.yodao.com/smartresult-xml/search.s?type=mobile&q=%s"%mobile
    return gbk2utf8(urllib.urlopen(url).read())


def main():
    fr = open('x.csv')
    wr = codecs.open('y.csv','w','gbk')
    xml = XML2Dict()
    for line in fr.readlines():
        line = line.rstrip('\n')
        items = line.split(',')
        ip_item = items[2]
        mobile_item = items[3]
        ip_dict = xml.fromstring(get_ip_info(ip_item))
        mobile_dict = xml.fromstring(get_mobile_info(mobile_item))
        new_line=''
        if ip_dict.smartresult!=None:
            new_line = items[0]+','+items[1]+','+items[2]+','
                                         +ip_dict.smartresult.product.location.encode("gbk")
        else:
            new_line = items[0]+','+items[1]+','+items[2]+','
        if mobile_dict.smartresult!=None:
            new_line = new_line+','+items[3]+','
                                         +mobile_dict.smartresult.product.location.encode("gbk")+'\n'
        else:
            new_line = new_line+','+items[3]+','+'\n'
        print new_line.decode("gbk")
        wr.write(new_line.decode("gbk"))
    fr.close();
    wr.close();


if __name__ == '__main__':
    main()
{% endhighlight %}

这段代码从有道那获得的结果是xml编码格式为gbk的,所以在编码上我将其先转换成utf8的,然后再通过xml2dict将其转换成Python的字典结构,这样我就可以直接读取节点的值了.
这段代码还使用了urllib模块还有读文件写文件的相关知识点,总体来说还是很简单的,主要就是字符串的拼接了,这里的文件格式都是csv的很容易就可以编程excel的格式

但是问题来了,有的IP地址在有道这里查不出来,而在ip138这个网站上可以查出来,后来试了好多,发现IP138的数据库的数据貌似全一些,但是IP138没有提供任何数据读取的API,那怎么办呢?嘿嘿,那就用最那个的办法了,在脚本里解析使用正则表达式处理html,解析出想要的结果,代码如下:
{% highlight python %}
"""
ip138poster.py
Created by Luke on 2009-05-04.
Copyright (c) 2009 Alibaba. All rights reserved.
"""

import httplib,urllib;  #加载模块
import re

class Ip138Poster:

    def __init__(self):
        #定义一些文件头
        self.headers = {"Content-Type":"application/x-www-form-urlencoded",
                    "Connection":"Keep-Alive","Referer":"http://www.ip138.com/ips.asp"};
        #与网站构建一个连接
        self.conn = httplib.HTTPConnection("www.ip138.com");

    def post(self,ip_addr):
        #定义需要进行发送的数据
        params = urllib.urlencode({'ip':ip_addr,'action':'2'});
        #开始进行数据提交   同时也可以使用get进行
        self.conn.request(method="POST",url="/ips8.asp",
                                            body=params,headers=self.headers);
        #返回处理后的数据
        response = self.conn.getresponse();
        #判断是否提交成功
        if response.status == 200:
            s=response.read()
            print s.decode("gbk")
            lis = re.findall(r"(?<=<li>).*?(?=</li>)",s)
            return lis

    def get_main_data(self,ip_addr):
        ##下面的十六进制的值为"本站主数据："的unicode
        self.main_data_parttern = r"(?<=\xe6\x9c\xac\xe7\xab\x99\xe4\xb8\xbb\xe6\x95\xb0\xe6\x8d\xae\xef\xbc\x9a).*"
        list = self.post(ip_addr)
        if len(list)>0:
            main_data = re.findall(self.main_data_parttern,list[0].decode("gbk").encode("utf8"))
        if len(main_data)>0:
            ret_value = main_data[0]
        return ret_value.decode("utf8")



    def __del__(self):
        #关闭连接
        self.conn.close()



##由于需要匹配中文，所以需要转换，然后再匹配
def UTF2Hex(s):
    temp = s.encode("UTF-8").encode("hex")
    line = ""
    for i in range(0,len(temp)-1,2):
        line += "\\x" + temp[i] + temp[i+1]
    return line

def GBK2Hex(s):
    temp = s.encode("GBK").encode("hex")
    line = ""
    for i in range(0,len(temp)-1,2):
        line += "\\x" + temp[i] + temp[i+1]
    return line


if __name__ == '__main__':
    poster = Ip138Poster()
    print poster.get_main_data("121.0.29.231")
{% endhighlight %}


这里我还提供一个json的可选方案,可惜的是目前我没有发现国内的可以使用json协议获取ip地址信息的API(SOAP的万网好像有个),所以IP的API是使用国外的,手机号码信息查询国内是有API的,可以直接使用,代码非常非常简单,如下:

{% highlight python %}
#!/usr/bin/env python
# encoding: utf-8
"""
locatingsystem.py

Created by Luke on 2009-05-04.
Copyright (c) 2009 Alibaba.com. All rights reserved.
"""

import sys
import os
import urllib
import json

class LocatingSystem:
    def get_ip_json(self,ip):
        url="http://iplocationtools.com/ip_query.php?ip=%s&output=json"%ip
        return json.read(urllib.urlopen(url).read())

    def get_mobile_json(self,mobile):
        url="http://api.showji.com/locating/?m=%s&output=json"%mobile
        return json.read(urllib.urlopen(url).read())

def main():
    ls = LocatingSystem()
    print ls.get_ip_json("134.34.54.56")
    print ls.get_mobile_json("13819127490")


if __name__ == '__main__':
    main()
{% endhighlight %}

