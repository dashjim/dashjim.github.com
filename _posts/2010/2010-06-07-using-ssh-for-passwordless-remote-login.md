---
layout: post
title: SSH免密码远程登录设置
categories:
- Web
tags:
- 安全
- Linux
---

由于这几天需要写一个线上日志查询的小系统。打算使用ssh远程登录进行相关log文件的操作。
为了操作的方便，就找了一个ssh的java实现 jsch http://www.jcraft.com/jsch/
然后写了一些代码进行测试。
后来发现实际环境中，需要通过 public key 的方式进行ssh的登录验证。
所以我在测试环境上需要配置下。

这里写一下配置的过程。
假设有A机器和B机器，A机器通过非密码的方式登录B机器，

### 1.生成密钥对

这个时候我们来到A机器进行相关操作
一般情况下，我们的公钥私钥都是放在 ~/.ssh目录下的
如果没有的话，需要自己生成，

{% highlight bash %}
luke@luke-desktop:~/.ssh$ ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/home/luke/.ssh/id_rsa):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/luke/.ssh/id_rsa.
Your public key has been saved in /home/luke/.ssh/id_rsa.pub.
The key fingerprint is:
9a:34:fd:c6:9f:3d:81:f5:be:f1:e5:df:a1:25:bb:2c luke@luke-desktop
The key's randomart image is:
+--[ RSA 2048]----+
|                 |
|                 |
|                 |
|       .      .  |
|      o S    o . |
|     . + o  . . .|
|      o   +  . *.|
|         . E.o*.B|
|            +=ooB|
+-----------------+
luke@luke-desktop:~/.ssh$ ls
id_rsa  id_rsa.pub  known_hosts
{% endhighlight %}

其中id_rsa为私钥 id_rsa.pub为公钥，

至于known_hosts文件，它是用来保存以前远程登录过的主机的公钥的

### 2.在远程机器中添加本地机器的公钥

现在我们需要做的是将A机器的公钥加入到B机器的authorized_keys文件中（可以直接拷贝粘贴，如果 authorized_keys文件不存在的话，就在B机器中新建~/.ssh/authorized_keys），然后开启开启B机器的 PubkeyAuthentication的选项

vi /etc/ssh/sshd_config   
设置下面的选项：  
PubkeyAuthentication yes  
重启sshd   service sshd restart  
  
这个时候就可以在A机器上ssh登录B 机器了，现在不需要输入用户对应的linux密码了，但是需要输入创建私钥的时候所输入的passphrase，但是这个密码无须在网络上进行传输了。

### 3.使用ssh-add
我们可以通过ssh-add命令将私钥的密码交给ssh-agent进行管理，这样我们登录远程机器的时候，就会直接使用缓存起来的passphrase，而不会让你每次手动的输入。

### 4.其他
一开始发现，本机登录远程机器在登录的时候相当慢，后来发现和两个选项有关
{% highlight bash %}
#GSSAPIAuthentication yes
UseDNS no
{% endhighlight %}

还有一个有点悲剧的事情就是我为了重新验证设置的正确性，将本地的密钥对全部删除后，重新生成了一对，结果发现服务器端被我限死成公钥方式的登录，我一想，这下可彻底的悲剧了，登录不了阿。不过灵机一动，翻出以前的一个邮件，有一个系统急救的方法，就是通过一个跳板机器，然后vnc直接连如XEN虚拟机，然后在公钥验证的下面将密码验证方式设置为yes，重启sshd服务，然后重启从本地登录，重复上面的设置过程，恩，虚惊一场阿，不过下次修改删除操作还是先做好备份才靠谱。