---
layout: post
title: iOS持久化
categories:
- Programming
tags:
- iOS
- Objc
---

* 文件系统
* 归档和序列化
* 数据库

---

##1.文件系统
不管是Mac OS X 还是iOS的文件系统都是建立在UNIX文件系统基础之上的。

###1.1 沙盒模型   
在iOS中，一个App的读写权限只局限于自己的沙盒目录中。

>**沙盒模型到底有哪些好处呢?**  
>安全：别的App无法修改你的程序或数据  
>保护隐私：别的App无法读取你的程序和数据  
>方便删除：因为一个App所有产生的内容都在自己的沙盒中，所以删除App只需要将沙盒删除就可以彻底删除程序了
 
 iOS App沙盒中的目录
 
* App Bundle ,如xxx.app 其实是一个目录，里面有app本身的二进制数据以及资源文件 
* Documents, 存放程序产生的文档数据 
* Library , 下面默认包含下面两个目录 Caches Preferences
* tmp, 临时文件目录
  
如果我们想在程序中获取上面某个目录的路径，应该如何实现呢？
下面就讲讲路径的获取，
通过`NSPathUtilities.h `中的`NSSearchPathForDirectoriesInDomains`函数，我们便可以获取我们想要的路径。
此函数具体声明如下:

>NSArray *NSSearchPathForDirectoriesInDomains(NSSearchPathDirectory directory, NSSearchPathDomainMask domainMask, BOOL expandTilde);   
>**directory** 目录类型 比如Documents目录 就是NSDocumentDirectory   
>**domainMask** 在iOS的程序中这个取NSUserDomainMask   
>**expandTilde** YES，表示将~展开成完整路径

注意函数返回的类型为数组，在iOS中一般这个数组中只包含一个元素，所以直接取lastObject即可。


###1.2 NSFileManager
NSFileManager提供一个类方法获得一个单例。

{% highlight objc %}
/* Returns the default singleton instance.*/
+ (NSFileManager *)defaultManager;
{% endhighlight %}

下面罗列了NSFileManager的常用方法

* 新建目录  
{% highlight objc %}
- (BOOL)createDirectoryAtPath:(NSString *)path withIntermediateDirectories:(BOOL)createIntermediates attributes:(NSDictionary *)attributes error:(NSError **)error;
{% endhighlight %}

createIntermediates这个参数一般为YES，表示如果目录路径中间的某个目录不存在则创建之,如果是NO的话，则要保证所创建目录的父目录都必须已经存在

* 获取目录下的所有文件
{% highlight objc %}
- (NSArray *)contentsOfDirectoryAtPath:(NSString *)path error:(NSError **)error;
{% endhighlight %}

如果目录为空，则返回空数组

* 其他的一些方法
{% highlight objc %}
- (BOOL)copyItemAtPath:(NSString *)srcPath toPath:(NSString *)dstPath error:(NSError **)error;
- (BOOL)moveItemAtPath:(NSString *)srcPath toPath:(NSString *)dstPath error:(NSError **)error;
- (BOOL)linkItemAtPath:(NSString *)srcPath toPath:(NSString *)dstPath error:(NSError **)error;
- (BOOL)removeItemAtPath:(NSString *)path error:(NSError **)error;
{% endhighlight %}

更多的可以查看文档 [NSFileManager Class Reference](http://developer.apple.com/library/mac/#documentation/Cocoa/Reference/Foundation/Classes/NSFileManager_Class/Reference/Reference.html)。

在实际项目中，我们一般会写一个工具类来负责项目中所有的路径操作。

##2. 归档（Archives） 和 序列化（Serializations）
我们经常听到“序列化”，“反序列化”这样的字眼，其实“序列化”的意思就是将对象转换成字节流以便保存或传输，“反序列化”便是一个相反的过程，从字节流转到对象。   

在这节中涉及到一种文件类型plist，plist就是Property List 的缩写,即所谓的属性列表，属性列表有两种数据格式，一种是XML的，方便阅读和编辑；另一种是二进制的，节省存储空间，以及提高效率。

在Objective-C中这个对象和字节流的互转分成两类:   

* **归档** 普通自定义对象和字节流之间的转换
* **序列化** 某些特定类型（NSDictionary, NSArray, NSString, NSDate, NSNumber，NSData）的数据和字节流之间(通常将其保存为plist文件)的转换

不过本质上讲上述两种都是对象图([Object Graph](http://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/Archiving/Articles/objectgraphs.html#//apple_ref/doc/uid/20001293-CJBDFIBI))和字节流之间的转换.
Apple关于序列化和归档的编程指南: [Archives and Serializations Programming Guide](http://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/Archiving/Archiving.html) 。

###2.1 归档
如果我们需要将自定义的一个对象保存到文件，应该如何做呢？   
这里引入两个东西：一个是NSCoding协议 ；另一个是NSKeyedArchiver，NSKeyedArchiver其实继承于NSCoder，可以以键值对的方式将对象的属性进行序列化和反序列化。      
具体的过程可以这样描述 **通过NSKeyedArchiver 可以将实现了NSCoding协议的对象 和 字节流 相互转换** 。   

像一些框架中的数据类型如NSDictionary,NSArray,NSString... 都已经实现了NSCoding协议，所以可以直接对他们进行归档操作。   

这里来一个比较完整的例子，一个Address类，一个User类，User类下有个Address类型的属性。

**Address类**
{% highlight objc %}
@interface Address : NSObject<NSCoding>{
    NSString *country;
    NSString *city;
}
@property(nonatomic,copy) NSString *country;
@property(nonatomic,copy) NSString *city;
@end
//////////////////////////////////////////////////////
#import "Address.h"

@implementation Address
@synthesize country;
@synthesize city;

- (void)encodeWithCoder:(NSCoder *)aCoder{
    [aCoder encodeObject:country forKey:@"country"];
    [aCoder encodeObject:city forKey:@"city"];
}

- (id)initWithCoder:(NSCoder *)aDecoder{
    if (self = [super init]) {
        [self setCountry:[aDecoder decodeObjectForKey:@"country"]];
        [self setCity:[aDecoder decodeObjectForKey:@"city"]];
    }
    return self;
}

@end
{% endhighlight %}


**User类**
{% highlight objc %}
#import <Foundation/Foundation.h>
#import "Address.h"
@interface User : NSObject<NSCoding>{
    NSString *_name;
    NSString *_password;

    Address *_address;
}
@property(nonatomic,copy) NSString *name;
@property(nonatomic,copy) NSString *password;
@property(nonatomic,retain) Address *address;

@end
/////////////////////////////////////////////////////////
#import "User.h"

@implementation User
@synthesize name = _name;
@synthesize password = _password;
@synthesize address = _address;

- (void)encodeWithCoder:(NSCoder *)aCoder{
    [aCoder encodeObject:_name forKey:@"name"];
    [aCoder encodeObject:_password forKey:@"password"];
    [aCoder encodeObject:_address forKey:@"address"];
}
- (id)initWithCoder:(NSCoder *)aDecoder{
    if (self = [super init]) {
        [self setName:[aDecoder decodeObjectForKey:@"name"]];
        [self setPassword:[aDecoder decodeObjectForKey:@"password"]];
        [self setAddress:[aDecoder decodeObjectForKey:@"address"]];
    }
    return self;
}
@end
{% endhighlight %}
	
**使用示例**
{% highlight objc %}
Address *myAddress = [[[Address alloc] init] autorelease];
myAddress.country = @"中国";
myAddress.city = @"杭州";
 
User *user = [[[User alloc] init] autorelease];
user.name = @"卢克";
user.password = @"lukejin";
user.address = myAddress;

[NSKeyedArchiver archiveRootObject:user toFile:@"/Users/Luke/Desktop/user"];

id object = [NSKeyedUnarchiver unarchiveObjectWithFile:@"/Users/Luke/Desktop/user"];
NSLog(@"Object Class : %@",[object class]);
{% endhighlight %}

通过查看文件内容可以发现，保存的是plist的二进制数据格式。
转成XML可以看到如下内容:
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/	PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>$archiver</key>
	<string>NSKeyedArchiver</string>
	<key>$objects</key>
	<array>
		<string>$null</string>
		<dict>
			<key>$class</key>
			<dict>
				<key>CF$UID</key>
				<integer>8</integer>
			</dict>
			<key>address</key>
			<dict>
				<key>CF$UID</key>
				<integer>4</integer>
			</dict>
			<key>name</key>
			<dict>
				<key>CF$UID</key>
				<integer>2</integer>
			</dict>
			<key>password</key>
			<dict>
				<key>CF$UID</key>
				<integer>3</integer>
			</dict>
		</dict>
		<string>卢克</string>
		<string>lukejin</string>
		<dict>
			<key>$class</key>
			<dict>
				<key>CF$UID</key>
				<integer>7</integer>
			</dict>
			<key>city</key>
			<dict>
				<key>CF$UID</key>
				<integer>6</integer>
			</dict>
			<key>country</key>
			<dict>
				<key>CF$UID</key>
				<integer>5</integer>
			</dict>
		</dict>
		<string>中国</string>
		<string>杭州</string>
		<dict>
			<key>$classes</key>
			<array>
				<string>Address</string>
				<string>NSObject</string>
			</array>
			<key>$classname</key>
			<string>Address</string>
		</dict>
		<dict>
			<key>$classes</key>
			<array>
				<string>User</string>
				<string>NSObject</string>
			</array>
			<key>$classname</key>
			<string>User</string>
		</dict>
	</array>
	<key>$top</key>
	<dict>
		<key>root</key>
		<dict>
			<key>CF$UID</key>
			<integer>1</integer>
		</dict>
	</dict>
	<key>$version</key>
	<integer>100000</integer>
</dict>
</plist>
{% endhighlight %}



###2.2 序列化
在实际的项目中，我们一般是将NSDictionary或NSArray的对象保存到文件或者从文件读取成对象。
当然这种只是适用于数据量不是很大的应用场景。
NSDictionary和NSArray 都有一个写入文件的方法
{% highlight objc %}	
- (BOOL)writeToFile:(NSString *)path atomically:(BOOL)useAuxiliaryFile;
{% endhighlight %}

NSDictionary和NSArray会直接写成plist文件。

####2.2.1 序列化的方式
序列化可以通过两种途径来进行

#####使用数据对象自带的方法
写文件
{% highlight objc %}	
NSMutableDictionary *dataDictionary = [[[NSMutableDictionary alloc] init] autorelease];
 [dataDictionary setValue:[NSNumber numberWithInt:222] forKey:@"intNumber"];
 [dataDictionary setValue:[NSArray arrayWithObjects:@"1",@"2", nil] forKey:@"testArray"];
 [dataDictionary writeToFile:@"/Users/Luke/Desktop/test.plist" atomically:YES];
{% endhighlight %}
   
写完的文件内容如下:
{% highlight xml %}	
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>intNumber</key>
	<integer>222</integer>
	<key>testArray</key>
	<array>
		<string>1</string>
		<string>2</string>
	</array>
</dict>
</plist>
{% endhighlight %}
   
   从文件读取
{% highlight objc %}	   
NSDictionary *dictionaryFromFile = [NSDictionary dictionaryWithContentsOfFile:@"/Users/Luke/Desktop/test.plist"];
{% endhighlight %}

##### 使用NSPropertyListSerialization类
通过NSPropertyListSerialization类可以将数据对象直接转成NSData或者直接写到文件或者流中去.
{% highlight objc %}	   
NSMutableDictionary *dataDictionary = [[[NSMutableDictionary alloc] init] autorelease];
[dataDictionary setValue:[NSNumber numberWithInt:222] forKey:@"intNumber"];
[dataDictionary setValue:[NSArray arrayWithObjects:@"1",@"2", nil] forKey:@"testArray"];

NSString *error;
NSData *xmlData = [NSPropertyListSerialization dataFromPropertyList:dataDictionary
                                                           format:NSPropertyListXMLFormat_v1_0
                                                 errorDescription:&error];
if(xmlData) {
    NSLog(@"No error creating XML data.");
    [xmlData writeToFile:@"/Users/Luke/Desktop/test2.plist" atomically:YES];
}
else {
    if (error) {
        NSLog(@"error:%@", error);
        [error release];
    }
}
{% endhighlight %}

读取
{% highlight objc %}	   
	NSDictionary *dictionaryFromFile = (NSDictionary *)[NSPropertyListSerialization 
 	                                                   propertyListWithData:[NSData dataWithContentsOfFile:@"/Users/Luke/Desktop/test2.plist"] 
	                                                    options:0
	                                                    format:NULL
	                                                    error:&error];
{% endhighlight %}
	                                                    

	                                                   
####2.2.2 User Defaults
User Defaults 顾名思义就是一个用户为系统以及程序设置的默认值。每个用户都有自己的一套数据，用户和用户之间没法共享的。

我们都知道每一个程序都会保存一些设置数据，比如记住上次窗口的位置和大小，记住是否弹出某些提示信息等。苹果提供了一个统一的解决方案，就是每一个app都有一个plist文件专门用以保存偏好设置数据。
plist文件名默认是程序Bundle identifier,扩展名为plist.

除了程序自己的设置外，系统还有一些全局的或者其它的一些设置，也属于User Defaults的范畴，User Defaults的持久化数据都保存在 `~/Library/Preferences` 目录中.

这里有一点简要的说一下，User Defaults  中存放的key value分放在多个Domain中，取的时候按一定的次序取查找，次序如下:

*  **The Argument Domain**   程序启动的时候以参数的方式传入的
*  **The Application Domain** 通过NSUserDefaults往里面写数据的时候默认就是写到这个Domain的，通过Bundle identifier来标识
* **The Global Domain** 用户的全局的设置（系统的偏好设置）会放在这个Domain下，比如用户的语言设置，滚动条的设置等，里面的设置会对所有的程序起作用。
* **The Languages Domains**
* **The Registration Domain**  这个domain里面的key value是提供默认值的，一般会在程序启动的设置进行设置，他们都不会被持久化到文件的。当某个key对应的值在上面的那些domain中都不存在的时候，就到这里找。

Mac系统还为user defaults提供了很好的命令行工具，`defaults` 你可以通过下面的方式查看具体使用方式

	man defaults
	
可以通过`defaults domains`查看当前用户的所有的domain，通过 `defaults read NSGlobalDomain` 读取 **The Global Domain** 中的所有值。


 **NSUserDefaults** 类来读写Preferences设置，而无需考虑文件位置等细节问题。

**NSUserDefaults** 用起来和 **NSDictionary** 很相似，多了一个Domain的概念在里面。
**NSUserDefaults** 一样提供了一个获取单例的方法.
	
	+ (NSUserDefaults *)standardUserDefaults
	  
NSUserDefaults提供了一系列的接口来根据key获取对应的value，搜索的次序按照上面提及到的次序在各个Domain中进行查找。还提供了一系列的 Setting Default Values的方法，这些设置的值都是在 **The Application Domain** 下的.当然也提供了修改其他Domain下的值的方法，只是需要整体的设置。
	



##3.数据库
Mac上自带安装了SQLite3 ,如果你之前接触过关系型数据库，你可以通过命令行来对SQLite进行初步的认识
{% highlight bash %}	   
$ sqlite3 test.db
SQLite version 3.7.5
Enter ".help" for instructions
Enter SQL statements terminated with a ";"
sqlite>create table if not exists names(id integer primary key asc, name text); 
sqlite> insert into names(name) values('Luke');
sqlite> select * from names;
1|Luke
sqlite> 
{% endhighlight %}

那如果在代码中使用SQLite呢？

* 添加sqlite的动态链接库 libsqlite3.0.dylib
* 引入头文件 #import "sqlite3.h"

这样之后你便可以通过C的接口来操作数据库了

{% highlight objc %}	   
sqlite3 *database;//sqlite3的类型其实只是一个结构体struct
NSArray *documentsPaths=NSSearchPathForDirectoriesInDomains(NSDocumentDirectory 
                                                         , NSUserDomainMask 
                                                         , YES); 
NSString *databaseFilePath=[[documentsPaths objectAtIndex:0] stringByAppendingPathComponent:@"luke.db"];

//打开数据库
if (sqlite3_open([databaseFilePath UTF8String], &database)==SQLITE_OK) { 
    NSLog(@"open sqlite db ok."); 
    char *errorMsg; 
    const char *createSql="create table if not exists names (id integer primary key asc,name text)";
    //创建表
    if (sqlite3_exec(database, createSql, NULL, NULL, &errorMsg)==SQLITE_OK) { 
        NSLog(@"create ok."); 
    }else {
        NSLog(@"error: %s",errorMsg); 
        sqlite3_free(errorMsg);
    }
    
    
    //插入数据
    const char *insertSql="insert into names (name) values(\"Luke\")"; 
    if (sqlite3_exec(database, insertSql, NULL, NULL, &errorMsg) == SQLITE_OK) { 
        NSLog(@"insert ok."); 
    }else {
        NSLog(@"error: %s",errorMsg); 
        sqlite3_free(errorMsg); 
    }
    
    
    const char *selectSql="select id,name from names"; 
    sqlite3_stmt *statement; 
    if (sqlite3_prepare_v2(database, selectSql, -1, &statement, nil) == SQLITE_OK) { 
        NSLog(@"select ok.");
    }
    
    while (sqlite3_step(statement)==SQLITE_ROW) { 
        int _id=sqlite3_column_int(statement, 0); 
        char *name=(char *)sqlite3_column_text(statement, 1); 
        NSString *nameString = [NSString stringWithCString:name encoding:NSUTF8StringEncoding];
        NSLog(@"row>>id %i, name %@",_id,nameString); 
    }
    
    sqlite3_finalize(statement);
    
}

sqlite3_close(database);
{% endhighlight %}

你会发现这完全是C语言编程，和Objective-C的代码混在一起格格不入，也很不方便，所以便有人开发了开源的sqlite c接口的wrapper
 
+ FMDB [https://github.com/ccgus/fmdb](https://github.com/ccgus/fmdb)
+ EGODatabase  [https://github.com/enormego/egodatabase](https://github.com/ccgus/fmdb) (部分代码来自FMDB，thread safe)

具体的使用方法，各自的文档都写的比较清楚。
FMDB不支持多线程同时使用同一个数据库连接进行操作，否则会有线程安全问题，有可能导致数据库文件损坏。EGODatabase则引入了多线程的支持，部分代码借鉴了FMDB，两者在使用上非常的相似。另EGODatabase提供了异步数据库操作的支持，将数据库操作封装成数据库请求（其继承于NSOperation），数据库请求创建好了，丢到一个OperationQueue中被异步的进行执行，当请求数据完成之后 ，相应的delegate方法会被调用，然后你可以在主线程更新显示了.