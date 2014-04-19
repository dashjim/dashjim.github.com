---
layout: post
title: 如何在Linux下实现QoS
categories:
- Technology
tags:
- Telephone
---

QoS本身是一个比较大的话题，但是毫无疑问，对于音频，视频应用来说QoS的作用是巨大的。有工程师跟我说过在实施时加不加QoS有很大的差别。这里特别提醒一下QoS要在网络的所有结点上启用才能发挥最大效果（结点包括，路由器，服务器等），最起码也要保证加在比较繁忙的结点上，不然没有多大意义。
下面是在Linux服务器上通过iptables给相关端口加上高优先级的脚本。大家可以举一反三给特定的IP包加上优先级。

```

LOGFILE=/tmp/logs/iptables.log
SERVICE=`which service`
IPTABLES_STATUS=`$SERVICE iptables status 2> /dev/null | head -n 1`
if [ `rpm -qa iptables|grep -c iptables` -eq 0 -o -z "$IPTABLES_STATUS" ]; then
   echo `date +"%F %T"` " - IPTABLES NOT INSTALLED!! QoS NOT SET!!\n" >> $LOGFILE
   exit 1
fi
if [ `echo "$IPTABLES_STATUS" | grep -c stopped` -gt 0 ]; then
   echo `date +"%F %T"` " - IPTABLES is stopped and will be started!\n" >> $LOGFILE
fi

IPTABLES="$(which iptables)"

# RESET DEFAULT POLICIES
$IPTABLES -P INPUT ACCEPT
$IPTABLES -P FORWARD ACCEPT
$IPTABLES -P OUTPUT ACCEPT
$IPTABLES -t nat -P PREROUTING ACCEPT
$IPTABLES -t nat -P POSTROUTING ACCEPT
$IPTABLES -t nat -P OUTPUT ACCEPT
$IPTABLES -t mangle -P PREROUTING ACCEPT
$IPTABLES -t mangle -P OUTPUT ACCEPT

# FLUSH ALL RULES, ERASE NON-DEFAULT CHAINS
$IPTABLES -F
$IPTABLES -X
$IPTABLES -t nat -F
$IPTABLES -t nat -X
$IPTABLES -t mangle -F
$IPTABLES -t mangle -X

# ADD QoS RULES
$IPTABLES -t mangle -A OUTPUT -p tcp --sport 1935 -j DSCP --set-dscp 0x22
$IPTABLES -t mangle -A OUTPUT -p tcp --sport 443 -j DSCP --set-dscp 0x22
$IPTABLES -t mangle -A OUTPUT -p tcp --sport 5060 -j DSCP --set-dscp 0x22
$IPTABLES -t mangle -A OUTPUT -p tcp --sport 5061 -j DSCP --set-dscp 0x22
$IPTABLES -t mangle -A OUTPUT -p tcp --dport 5060 -j DSCP --set-dscp 0x22
$IPTABLES -t mangle -A OUTPUT -p tcp --dport 5061 -j DSCP --set-dscp 0x22

echo "******" `date +"%F %T"` "******" >> $LOGFILE
$SERVICE iptables save >> $LOGFILE
echo "$IPTABLES -t mangle -L" >> $LOGFILE
```   
其原理非常简单，就是给所有通过某端口的包加上(`mangle`)特定标志(`dscp 0x22`)，这样经过的节点只要支持QoS都会给于相应的优先级。脚本中的`dscp 0x22`是针对Avaya和北电的产品的，不同厂商的产品可能使用不同的数字，请参考单独的页面介绍[Notes on QOS for videoconferencing](http://andrew.triumf.ca/vidconf_QOS.html)。加完后你的`ipdables`看起来应该是这个样子。然后你的包就会优先被处理了。

```
Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination
************************************
****** 2013-11-27 16:06:20 ******
iptables: Saving firewall rules to /etc/sysconfig/iptables: ESC[60G[ESC[0;32m  OK  ESC[0;39m]
/sbin/iptables -t mangle -L
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination

Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
DSCP       tcp  --  anywhere             anywhere            tcp spt:macromedia-fcs DSCP set 0x22
DSCP       tcp  --  anywhere             anywhere            tcp spt:https DSCP set 0x22
DSCP       tcp  --  anywhere             anywhere            tcp spt:sip DSCP set 0x22
DSCP       tcp  --  anywhere             anywhere            tcp spt:sip-tls DSCP set 0x22
DSCP       tcp  --  anywhere             anywhere            tcp dpt:sip DSCP set 0x22
DSCP       tcp  --  anywhere             anywhere            tcp dpt:sip-tls DSCP set 0x22

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination
```