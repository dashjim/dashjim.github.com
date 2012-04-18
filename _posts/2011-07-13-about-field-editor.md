---
layout: post
title: 关于Field Editor
categories:
- Programming
tags:
- Mac
- Cocoa
---

### 1.介绍
在Cocoa 中，每一个窗口中的所有NSControl对象(包括按钮，输入框NSTextField…)，都公用一个称之为Field Editor的对象(其实就是一个NSTextView的单例)。

同一时间只可能有一个NSControl对象处于active状态。所以一个窗口会存在一个公用的Field Editor来处理界面中的所有NSControl对象的输入以及键盘响应。
当一个NSControl对象Active的时候，一个Field Editor会被插入到responder chain中并作为first responder，所以这个时候你获取first responder并不是你的那个Text Field 而是这个Field Editor对象。
这个时候view的层次是这样的，Field Editor的superview是一个_NSKeyboardFocusClipView对象，_NSKeyboardFocusClipView对象的superview才是Text Field。
且Field Editor的delegate被设置成text field。

当你用鼠标点击一个输入框，使其从一般状态进去编辑状态的时候，
First Responder先是这个输入框，然后瞬间交给FieldEditor。所以如果你想测试这个，你可以写一个NSTextField的子类，并在becomeFirstResponder和resignFirstResponder中打log，这个时候你会发现 这两个方法会被连续的调用，之后Field Editor成为了FirstResponder。然后你将焦点再次转移到别的控件，这个时候Field Editor的resignFirstResponder会被调用，然后再在另一个NSControl中进行着上面的过程。

### 2.Field Editor的delegate方法
其实就是NSTextViewDelegate中定义的那些方法
比如你想改变编辑时按 方向键的行为，你就需要subclass nstextfield并实现下面的方法，
{% highlight objc %}
-(BOOL)textView:(NSTextView *)aTextView doCommandBySelector:(SEL)aSelector
{% endhighlight %}

### 3.自定义的Field Editor
有时候，我们可能需要自定义输入框编辑状态下的外观或者行为，这个时候可能需要使用我们自己定义的Field Editor了，
这里有两个方法，一个是subclass一个nswindow，然后覆盖下面的方法
{% highlight objc %}
- (NSText *)fieldEditor:(BOOL)createFlag forObject:(id)anObject
{% endhighlight %}

返回自定义的Field Editor，
或者在NSWindowControl中实现一个nswindow的delegate方法
{% highlight objc %}
- (id)windowWillReturnFieldEditor:(NSWindow *)sender toObject:(id)anObject
{% endhighlight %}

这里你可以返回你自定义的Field Editor，如果某些情况下还是需要使用系统默认的Field Editor，那么返回nil就可以了。
