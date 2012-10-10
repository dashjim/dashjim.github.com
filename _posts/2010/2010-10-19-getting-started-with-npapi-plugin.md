---
layout: post
title: NPAPI插件编程起步
categories:
- Programming
tags:
- NPAPI
- Mac
- C
---

2012-10-10 更新：[https://code.google.com/p/chromium/issues/detail?id=139816](https://code.google.com/p/chromium/issues/detail?id=139816) Chrome22之后貌似完全放弃10.5 Carbon之类的支持，所以Event Model需要进行设置，否则NPAPI插件在Chrome22下无法加载。NPP_New函数中进行如此设置
{% highlight c %}
    browser->setvalue(instance, 
    NPPVpluginEventModel, 
    (void *)NPEventModelCocoa);
{% endhighlight %}

----

如果想学习NPAPI方面的知识，Mozila的官方wiki无疑是一个最佳的入口，[https://wiki.mozilla.org/NPAPI](https://wiki.mozilla.org/NPAPI)   
FireBreath则可以作为实践的开端，[https://github.com/firebreath/FireBreath](https://github.com/firebreath/FireBreath)   
融会贯通后便可以尝试从零开始写自己的插件了。   

-----

最近需要写一个Mac平台上的简单的跨浏览器的插件，需要在js中调用本地方法，而npapi满足此要求。
NPAPI就是Netscape Plugin Application Programming Interface的缩写了，虽然Netscape已经去了，但是这个却被沿用下来，在各大浏览器中都得以实现。还是纪念下曾经的浏览器的鼻祖啊。

在网络上搜索了很长时间，一直没有找到合适的满足自己需求的代码例子。且这方面的文档也少的可怜。
还是先提一下，有两个系列的文章还是不错，虽然或许可能也不完全正确，但是帮助理解npapi的编程模型是非常有帮助的：

http://colonelpanic.net/category/plugindev/npapi-plugindev/
http://rintarou.dyndns.org/category/browser/plugin

下面是我寻找解决方法的过程
一开始找到mozilla的一篇官方文档：Writing a plugin for Mac OS X，这里面提到了了官方的代码库中有demo，于是就跑到公司checkout下mozilla的分支。并看了下里面的一个mac的例子.
不过这个例子没有使用npruntime的东西，加上一开始的时候对npapi不熟悉，就继续搜索.
在google， stackoverflow，github, google codes 中不停的搜索，结果甚少，最后找到一个npruntime的例子，Call Native API from Google Chrome Extension on Mac OS X只可惜编译后只能在mac的chrome下运行。
后来又找到了Firebreath这个跨平台的浏览器NPAPI插件开发框架，可以通过python和cmake的配合，生成适合不同操作系统的浏览器插件的工程，于是就测试了，果真生成xcode项目后，编译，然后测试了下js调用插件的方法，还真能在各个浏览器（测试了三个比较常用的safari，chrome，firefox）下运行。但是无奈由于包含一些高级的程序代码其最小编译后的大小都2m+对于一个功能单一的插件来讲，无疑是让人无法接受的，所以继续找demo.
后来找到了npsimple-win32 这个windows下的vs的项目，我将其移植到mac上，编译运行后，唯独在safari下无法运行，悲剧的一塌糊涂，对于一个npapi不同的浏览器在实现的具体细节上竟然有细微的差别，真是太变态鸟。
最后无奈之下，将Weikit开源项目中的例子弄出来，然后和npruntime的相关代码进行整合，发现在safari，chrome可以运行在firefox中没法运行，好吧，至少现在两个例子的并集是完整的，我就将两个代码进行查看，最终找出了问题的所在，在safari下需要启动CoreGraphics，而在firefox下scriptable的NPObject的hasProperty和getProperty必须设置，可能在firefox下调用某函数，先去scriptable NPObject中找有没有这个名字的属性，然后在找方法吧。
最后终于写出了一个简单的例子
{% highlight c %}
#import <WebKit/npapi.h>
#import <WebKit/npfunctions.h>
#import <WebKit/npruntime.h>



// Browser function table，可以通过它来得到浏览器提供的功能
static NPNetscapeFuncs* browser;
static const char *plugin_method_name_open = "open";

////////////////////////////////////
/*******各种接口的声明*********/
//在NPAPI编程的接口中你会发现有NP_打头的，有NPP_打头的，有NPN_打头的
//NP是npapi的插件库提供给浏览器的最上层的接口
//NPP即NP Plugin是插件本身提供给浏览器调用的接口，主要被用来填充NPPluginFuncs的结构体
//NPN即NP Netscape ,是浏览器提供给插件使用的接口，这些接口一般都在NPNetscapeFuncs结构体中

//Mach-o entry points,浏览器和创建交流的最上层的接口
NPError NP_Initialize(NPNetscapeFuncs *browserFuncs);
NPError NP_GetEntryPoints(NPPluginFuncs *pluginFuncs);
void NP_Shutdown(void);

//NPP Functions
NPError NPP_New(NPMIMEType pluginType, NPP instance, uint16_t mode, int16_t argc, char* argn[], char* argv[], NPSavedData* saved);
NPError NPP_Destroy(NPP instance, NPSavedData** save);
NPError NPP_SetWindow(NPP instance, NPWindow* window);
NPError NPP_NewStream(NPP instance, NPMIMEType type, NPStream* stream, NPBool seekable, uint16_t* stype);
NPError NPP_DestroyStream(NPP instance, NPStream* stream, NPReason reason);
int32 NPP_WriteReady(NPP instance, NPStream* stream);
int32 NPP_Write(NPP instance, NPStream* stream, int32 offset, int32 len, void* buffer);
void NPP_StreamAsFile(NPP instance, NPStream* stream, const char* fname);
void NPP_Print(NPP instance, NPPrint* platformPrint);
int16_t NPP_HandleEvent(NPP instance, void* event);
void NPP_URLNotify(NPP instance, const char* URL, NPReason reason, void* notifyData);
NPError NPP_GetValue(NPP instance, NPPVariable variable, void *value);
NPError NPP_SetValue(NPP instance, NPNVariable variable, void *value);

//Functions for scriptablePluginClass
bool plugin_has_method(NPObject *obj, NPIdentifier methodName);
bool plugin_invoke(NPObject *obj, NPIdentifier methodName, const NPVariant *args, uint32_t argCount, NPVariant *result);
bool hasProperty(NPObject *obj, NPIdentifier propertyName);
bool getProperty(NPObject *obj, NPIdentifier propertyName, NPVariant *result);
////////////////////////////////////

static struct NPClass scriptablePluginClass = {
    NP_CLASS_STRUCT_VERSION,
    NULL,
    NULL,
    NULL,
    plugin_has_method,
    plugin_invoke,
    NULL,
    hasProperty,
    getProperty,
    NULL,
    NULL,
};

//接口的实现
NPError NP_Initialize(NPNetscapeFuncs* browserFuncs)
{
    browser = browserFuncs;
    return NPERR_NO_ERROR;
}

NPError NP_GetEntryPoints(NPPluginFuncs* pluginFuncs)
{
    pluginFuncs->version = 11;
    pluginFuncs->size = sizeof(pluginFuncs);
    pluginFuncs->newp = NPP_New;
    pluginFuncs->destroy = NPP_Destroy;
    pluginFuncs->setwindow = NPP_SetWindow;
    pluginFuncs->newstream = NPP_NewStream;
    pluginFuncs->destroystream = NPP_DestroyStream;
    pluginFuncs->asfile = NPP_StreamAsFile;
    pluginFuncs->writeready = NPP_WriteReady;
    pluginFuncs->write = (NPP_WriteProcPtr)NPP_Write;
    pluginFuncs->print = NPP_Print;
    pluginFuncs->event = NPP_HandleEvent;
    pluginFuncs->urlnotify = NPP_URLNotify;
    pluginFuncs->getvalue = NPP_GetValue;
    pluginFuncs->setvalue = NPP_SetValue;
    
    return NPERR_NO_ERROR;
}


void NP_Shutdown(void)
{
    
}



bool plugin_has_method(NPObject *obj, NPIdentifier methodName) {
    // This function will be called when we invoke method on this plugin elements.
    NPUTF8 *name = browser->utf8fromidentifier(methodName);
    bool result = strcmp(name, plugin_method_name_open) == 0;
    browser->memfree(name);
    return result;
}
bool plugin_invoke(NPObject *obj, NPIdentifier methodName, const NPVariant *args, uint32_t argCount, NPVariant *result) {
    // Make sure the method called is "open".
    NPUTF8 *name = browser->utf8fromidentifier(methodName);
    if(strcmp(name, plugin_method_name_open) == 0) {
        browser->memfree(name);
        BOOLEAN_TO_NPVARIANT(false, *result);
        // Meke sure the arugment has at least one String parameter.
        if(argCount > 0 && NPVARIANT_IS_STRING(args[0])) {
            // Build CFURL object from the arugment.
            NPString str = NPVARIANT_TO_STRING(args[0]);
            CFURLRef url = CFURLCreateWithBytes(NULL, (const UInt8 *)str.UTF8Characters, str.UTF8Length, kCFStringEncodingUTF8, NULL);
            if(url) {
                // Open URL with the default application by Launch Service.
                OSStatus res = LSOpenCFURLRef(url, NULL);
                CFRelease(url);
                BOOLEAN_TO_NPVARIANT(res == noErr, *result);
            }
        }
        return true;
    }
    browser->memfree(name);
    return false;
}

bool hasProperty(NPObject *obj, NPIdentifier propertyName) {
    return false;
}

bool getProperty(NPObject *obj, NPIdentifier propertyName, NPVariant *result) {
    return false;
}



//NPP Functions Implements
NPError NPP_New(NPMIMEType pluginType, NPP instance, uint16_t mode, int16_t argc, char* argn[], char* argv[], NPSavedData* saved)
{
    // Create per-instance storage
    //obj = (PluginObject *)malloc(sizeof(PluginObject));
    //bzero(obj, sizeof(PluginObject));
    
    //obj->npp = instance;
    //instance->pdata = obj;
    
    if(!instance->pdata) {
        instance->pdata = browser->createobject(instance, &scriptablePluginClass);
    }
    // Ask the browser if it supports the CoreGraphics drawing model
    NPBool supportsCoreGraphics;
    if (browser->getvalue(instance, NPNVsupportsCoreGraphicsBool, &supportsCoreGraphics) != NPERR_NO_ERROR)
        supportsCoreGraphics = FALSE;
    
    if (!supportsCoreGraphics)
        return NPERR_INCOMPATIBLE_VERSION_ERROR;
    
    // If the browser supports the CoreGraphics drawing model, enable it.
    browser->setvalue(instance, NPPVpluginDrawingModel, (void *)NPDrawingModelCoreGraphics);
    
    return NPERR_NO_ERROR;
}

NPError NPP_Destroy(NPP instance, NPSavedData** save)
{
    
    // If we created a plugin instance, we'll destroy and clean it up.
    NPObject *pluginInstance=instance->pdata;
    if(!pluginInstance) {
        browser->releaseobject(pluginInstance);
        pluginInstance = NULL;
    }
    
    return NPERR_NO_ERROR;
}

NPError NPP_SetWindow(NPP instance, NPWindow* window)
{
    return NPERR_NO_ERROR;
}
 

NPError NPP_NewStream(NPP instance, NPMIMEType type, NPStream* stream, NPBool seekable, uint16_t* stype)
{
    *stype = NP_ASFILEONLY;
    return NPERR_NO_ERROR;
}

NPError NPP_DestroyStream(NPP instance, NPStream* stream, NPReason reason)
{
    return NPERR_NO_ERROR;
}

int32 NPP_WriteReady(NPP instance, NPStream* stream)
{
    return 0;
}

int32 NPP_Write(NPP instance, NPStream* stream, int32 offset, int32 len, void* buffer)
{
    return 0;
}

void NPP_StreamAsFile(NPP instance, NPStream* stream, const char* fname)
{
}

void NPP_Print(NPP instance, NPPrint* platformPrint)
{

}


int16_t NPP_HandleEvent(NPP instance, void* event)
{
    return 0;
}

void NPP_URLNotify(NPP instance, const char* url, NPReason reason, void* notifyData)
{

}

NPError NPP_GetValue(NPP instance, NPPVariable variable, void *value)
{
    NPObject *pluginInstance=NULL;
    switch(variable) {
        case NPPVpluginScriptableNPObject:
            // If we didn't create any plugin instance, we create it.
            pluginInstance=instance->pdata;
            if (pluginInstance) {
                browser->retainobject(pluginInstance);
            }
            *(NPObject **)value = pluginInstance;
            break;
        default:
            return NPERR_GENERIC_ERROR;
    }
    
    return NPERR_NO_ERROR;
}

NPError NPP_SetValue(NPP instance, NPNVariable variable, void *value)
{
    return NPERR_GENERIC_ERROR;
}
{% endhighlight %}

测试代码

{% highlight html %}
<html>
<head>
<script>
function run() {
    var plugin = document.getElementById("pluginId");
    plugin.open("http://www.geeklu.com");
}
</script>
</head>
<body >
<embed width="0" height="0" type="test/x-open-with-default-plugin" id="pluginId">
<button onclick="run()">run</button>
</body>
</html>
{% endhighlight %}
