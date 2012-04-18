---
layout: post
title: Flex中Tree的dragDropHandler方法详解
categories:
- Programming
tags:
- Flex
---

首先通过isDefaultPrevented来判断事件是否调用过preventDefault来取消默认的事件，当然不是所有事件都可以取消，
hideDropFeedback(event);在拖拽的过程中有一个小黑线来指示当前放置的位置，调用这个函数，当drop后将黑线隐藏掉，
接下来重要的就是数据的处理了，如何获得数据了，event.dragSource.hasFormat(“treeItems”)是用来判断dragSource中时候有名字为treeItems的数据，取数据的话就是用dataForFormat，其类型是一个Array类型的。
如果是内部拖动的话，就要判断一下，以防止将自己拖进自己的子节点中。
判断的方法是取得目标的所有父节点，然后与被拖拽的节点进行比较，若拖动的节点为目标位置的父节点的话就直接返回