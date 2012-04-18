---
layout: post
title: Java自定义Annotation
categories:
- Programming
tags:
- Java
- Annotation
---

Annotation注解（也称Meta Data元数据）为我们在代码中添加信息提供一个形式化的方法，是我们在后面的某个时刻方便的使用这些数据。  
JavaSE5中自带了一些Annotation，可以分为两类，  
标准注解，目前Java自带的有三个@Override,@Deprecated,@Suppress   Warning  
元注解  
元注解是用来注解其他Annotation的，用的比较多的有两个  
@Target 表示该注解可以用于什么地方。其取值的类型为java.lang.  annotation.ElementType枚举类型  
@Retention 表示需要在什么级别保存该注解,取值为RetentionPolicy枚举类型  
  
整个Annotation的使用过程可以分成三块，Annotation的定义，Annotation的使用，和Annotation的处理器。  

### 1.首先我们可以看一下如何定义一个Annotation  

{% highlight java %}
package com.luke.hello;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

//用于域的声明
@Target(ElementType.FIELD)
//VM在运行期间也会保存annotation的信息，所以可以使用反射机制来读取之
@Retention(RetentionPolicy.RUNTIME)
public @interface Hello {
public String echo() default("Hello,I am a field!");
}

{% endhighlight %}


### 2.我们将这个刚刚定义的Annotation拿来使用

{% highlight java %}
package com.luke.test;
import com.luke.hello.Hello;
public class Book {
@Hello(echo="Hello,I am the name of the book!")
public String name;
}
{% endhighlight %}

### 3.写一个处理器类来对Annotatin进行处理，这里要使用到Java的反射机制了呢

{% highlight java %}
package com.luke;

import java.lang.reflect.Field;
import com.luke.hello.Hello;
import com.luke.test.Book;

public class BookFileldTracker {
public static void trackBook(Class<?> cl){
for(Field f:cl.getDeclaredFields()){
Hello h = f.getAnnotation(Hello.class);
if(h!=null)
{
System.out.println(h.echo());
}
}
}
public static void main(String[] args){
trackBook(Book.class);
}
}
{% endhighlight %}
