---
layout: post
title: Jenkins CI Used For Mac App Dev
categories:
- SE
tags:
- Jenkins
- Hudson
- CI
---

### 介绍

在开发一个软件的过程中，测试或者项目经理经常需要得到软件的最新版本。  
如果每次都是开发手动编译给他们，有点浪费时间，也不科学。  
所以这个任务可以交给计算机来作，每当你有代码提交的时候或者每当系统定期检测到有代码更新的时候，系统自动进行编译打包，并可以通过浏览器来下载最新的软件版本。  
你也许会说，这个不是持续集成的一部分么？哈哈，的确是。  
  
这里使用的CI（持续集成）软件是 Jenkins CI，以前叫做Hudson ci后来迫于oracle的相关政策，年初的时候改名了。[https://github.com/jenkinsci](https://github.com/jenkinsci)  这里是其代码。   
其实CI囊括的东西远远不止自动编译了，还可以有代码提交后的自动化测试，生成各种测试报告，自动打包部署等等。   

### 安装配置及使用

这里要说的是开发一个mac软件，想要使用Jenkins进行定期编译打包应该怎么做。  
首先你得有一台mac server或者一台普通的mac机器做服务器。  

下载Jenkins [http://jenkins-ci.org/](http://jenkins-ci.org/) 可以直接下载mac系统的安装包。  
安装好了之后，会在Applications目录下多一个Jenkins的目录，里面就一个war包，jenkins.war  
这个时候你可以启动Jenkins服务了  
进去/Applications/Jenkins目录，运行 java -jar jenkins.war –httpPort=9080 –ajp13Port=9009   （当然你可以通过nohup的方式使得其在后台运行）你也可以不指定http和ajp的端口，使用默认的值，默认的http端口是8080  
启动好了之后就可以通过浏览器 访问[http://localhost:9080/](http://localhost:9080/)  
  
系统的一些设置都在 Manage Jenkins 选项中，你可以在插件管理的界面中选择安装一些插件。  
比如帐号权限管理的插件，Git支持的插件，这里就先不要权限管理了。直接安装一个git插件。  
  
然后进入主界面，新建一个Job，  
勾选第一个Build a free-style software project，下一步中填写项目描述，源码管理处选择Git，然后填写Git库地址以及分支
Build Triggers 可以选择定期执行
Build这边，由于是Mac项目，不像Java项目可以有Ant或者Maven这些三方的构建工具。
命令行编译XCode的项目只能通过XCode自带的命令行工具来，所以只能选shell脚本的方式，这边的输入框中可以写脚本，也可以将具体的脚本写在项目中随项目一起提交到git库中，这里只负责一些环境变量的设置以及脚本的调用。

{% highlight bash %}
REVISION="${GIT_COMMIT:0:7}"
FOLDER="#${BUILD_NUMBER}.Rev.${REVISION}"
export ARCHIVE_DIR="/Users/Luke/Test/${FOLDER}"
mkdir -p "$ARCHIVE_DIR"
Scripts/build.sh CONFIGURATION TARGET APPNAME
{% endhighlight %}
xcodebuild的具体用法可以参考官方的文档


获取脚本传递过来的参数并算好项目的路径以及编译之后app的路径
{% highlight bash %}
xcodebuild -target "${TARGET}" -configuration "${CONFIGURATION}"
{% endhighlight %}

编译成功之后，进行zip打包并移到ARCHIVE_DIR中  
Post-build Actions 就是build结束后的后继操作，比如可以将编译结果邮件发送给相应的人员。  