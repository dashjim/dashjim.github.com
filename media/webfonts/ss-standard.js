/*
* Symbolset
* www.symbolset.com
* Copyright © 2012 Oak Studios LLC
* 
* Upload this file to your web server
* and place this before the closing </body> tag.
* <script src="webfonts/ss-standard.js"></script>
*/

if (/(MSIE [7-9]\.|Opera.*Version\/(11|12)\.|Chrome\/([5-9]|10)\.|Version\/(4)[\.0-9]+ Safari\/|Version\/(4|5\.0)[\.0-9]+? Mobile\/.*Safari\/)/.test(navigator.userAgent)) {

  if (typeof ss_legacy !== 'function') {

    /* domready.js */
    !function(a,b){typeof module!="undefined"?module.exports=b():typeof define=="function"&&typeof define.amd=="object"?define(b):this[a]=b()}("ss_ready",function(a){function m(a){l=1;while(a=b.shift())a()}var b=[],c,d=!1,e=document,f=e.documentElement,g=f.doScroll,h="DOMContentLoaded",i="addEventListener",j="onreadystatechange",k="readyState",l=/^loade|c/.test(e[k]);return e[i]&&e[i](h,c=function(){e.removeEventListener(h,c,d),m()},d),g&&e.attachEvent(j,c=function(){/^c/.test(e[k])&&(e.detachEvent(j,c),m())}),a=g?function(c){self!=top?l?c():b.push(c):function(){try{f.doScroll("left")}catch(b){return setTimeout(function(){a(c)},50)}c()}()}:function(a){l?a():b.push(a)}})
    
    var ss_legacy = function(node) {
      
      if (!node instanceof Object) return false;
      
      if (node.length) {
        for (var i=0; i<node.length; i++) {
          ss_legacy(node[i]);
        }
        return;
      };
      
      if (node.value) {
        node.value = ss_liga(node.value);
      } else if (node.nodeValue) {
        node.nodeValue = ss_liga(node.nodeValue);
      } else if (node.innerHTML) {
        node.innerHTML = ss_liga(node.innerHTML);
      }
        
    };
    
    var ss_getElementsByClassName = function(node, classname) {
      var a = [];
      var re = new RegExp('(^| )'+classname+'( |$)');
      var els = node.getElementsByTagName("*");
      for(var i=0,j=els.length; i<j; i++)
          if(re.test(els[i].className))a.push(els[i]);
      return a;
    };
    
    var ss_liga = function(that) {
      var re = new RegExp(ss_keywords.join('|'),"gi");
      return that.replace(re, function(v) { 
        return ss_icons[v.toLowerCase()];
      });
    };
    
    ss_ready(function() {
      if (document.getElementsByClassName) {
        ss_legacy(document.getElementsByClassName('ss-icon'));
      } else {
        ss_legacy(ss_getElementsByClassName(document.body, 'ss-icon'));
      }
    });
  
  }
  
  var ss_set={'notifications disabled':'\uD83D\uDD15','notificationsdisabled':'\uD83D\uDD15','notification disabled':'\uD83D\uDD15','notificationdisabled':'\uD83D\uDD15','telephone disabled':'\uE300','telephonedisabled':'\uE300','writing disabled':'\uE071','pencil disabled':'\uE071','calendar remove':'\uF071','remove calendar':'\uF071','writingdisabled':'\uE071','calendar check':'\uF072','pencildisabled':'\uE071','removecalendar':'\uF071','cloud download':'\uEB00','navigate right':'\u25BB','calendarremove':'\uF071','phone disabled':'\uE300','medium battery':'\uEA11','check calendar':'\uF072','battery medium':'\uEA11','female avatar':'\uD83D\uDC67','mediumbattery':'\uEA11','phonedisabled':'\uE300','navigateright':'\u25BB','navigate left':'\u25C5','call disabled':'\uE300','notifications':'\uD83D\uDD14','empty battery':'\uEA13','bell disabled':'\uD83D\uDD15','checkcalendar':'\uF072','clouddownload':'\uEB00','shopping cart':'\uE500','navigate down':'\uF501','batterymedium':'\uEA11','battery empty':'\uEA13','calendarcheck':'\uF072','emptybattery':'\uEA13','femaleavatar':'\uD83D\uDC67','navigatedown':'\uF501','battery high':'\uEA10','shoppingcart':'\uE500','rotate right':'\u21BB','battery full':'\uD83D\uDD0B','mobile phone':'\uD83D\uDCF1','add calendar':'\uF070','full battery':'\uD83D\uDD0B','skip forward':'\u23ED','fast forward':'\u23E9','cloud upload':'\uEB40','belldisabled':'\uD83D\uDD15','navigateleft':'\u25C5','batteryempty':'\uEA13','notification':'\uD83D\uDD14','high battery':'\uEA10','calldisabled':'\uE300','calendar add':'\uF070','credit card':'\uD83D\uDCB3','battery low':'\uEA12','batteryfull':'\uD83D\uDD0B','rotateright':'\u21BB','information':'\u2139','addcalendar':'\uF070','photographs':'\uD83C\uDF04','calendaradd':'\uF070','mobilephone':'\uD83D\uDCF1','rotate left':'\u21BA','male avatar':'\uD83D\uDC64','skipforward':'\u23ED','batteryhigh':'\uEA10','low battery':'\uEA12','fastforward':'\u23E9','female user':'\uD83D\uDC67','thumbs down':'\uD83D\uDC4E','highbattery':'\uEA10','cloudupload':'\uEB40','videocamera':'\uD83D\uDCF9','volume high':'\uD83D\uDD0A','high volume':'\uD83D\uDD0A','fullbattery':'\uD83D\uDD0B','navigate up':'\uF500','remove date':'\uF071','navigation':'\uE670','femaleuser':'\uD83D\uDC67','cell phone':'\uD83D\uDCF1','screenshot':'\u2316','down right':'\u2B0A','directions':'\uE672','rotateleft':'\u21BA','disapprove':'\uD83D\uDC4E','eyedropper':'\uE200','check date':'\uF072','thumbsdown':'\uD83D\uDC4E','visibility':'\uD83D\uDC40','attachment':'\uD83D\uDCCE','creditcard':'\uD83D\uDCB3','microphone':'\uD83C\uDFA4','removedate':'\uF071','connection':'\uEB85','volume low':'\uD83D\uDD09','lowbattery':'\uEA12','low volume':'\uD83D\uDD09','volumehigh':'\uD83D\uDD0A','smartphone':'\uD83D\uDCF1','highvolume':'\uD83D\uDD0A','half heart':'\uE1A0','maleavatar':'\uD83D\uDC64','navigateup':'\uF500','pull quote':'\u201C','photograph':'\uD83C\uDF04','batterylow':'\uEA12','male user':'\uD83D\uDC64','pullquote':'\u201C','dashboard':'\uF000','musicnote':'\u266B','skip back':'\u23EE','stopwatch':'\u23F1','checkmark':'\u2713','crosshair':'\u2316','cellphone':'\uD83D\uDCF1','down left':'\u2B0B','pie chart':'\uE570','bar chart':'\uD83D\uDCCA','volumelow':'\uD83D\uDD09','lowvolume':'\uD83D\uDD09','telephone':'\uD83D\uDCDE','checkdate':'\uF072','half star':'\uE1A1','briefcase':'\uD83D\uDCBC','halfheart':'\uE1A0','thumbs up':'\uD83D\uDC4D','backspace':'\u232B','downright':'\u2B0A','paperclip':'\uD83D\uDCCE','envelope':'\u2709','database':'\uE7A0','barchart':'\uD83D\uDCCA','add date':'\uF070','skipback':'\u23EE','maleuser':'\uD83D\uDC64','location':'\uE6D0','facetime':'\uE320','end call':'\uE300','signpost':'\uE672','notebook':'\uD83D\uDCD3','dropdown':'\u25BE','halfstar':'\uE1A1','favorite':'\u22C6','subtract':'\u002D','computer':'\uD83D\uDCBB','settings':'\u2699','thumbsup':'\uD83D\uDC4D','bookmark':'\uD83D\uDD16','keywords':'\uE100','trashcan':'\uE0D0','previous':'\u25C5','pictures':'\uD83C\uDF04','download':'\uEB01','insecure':'\uD83D\uDD13','unlocked':'\uD83D\uDD13','up right':'\u2B08','navigate':'\uE670','downleft':'\u2B0B','question':'\u2753','contract':'\uEE01','calendar':'\uD83D\uDCC6','document':'\uD83D\uDCC4','piechart':'\uE570','typeface':'\uED01','upright':'\u2B08','forward':'\u27A1','airplay':'\uE800','picture':'\uD83C\uDF04','checked':'\u2713','shuffle':'\uD83D\uDD00','windows':'\uE202','compose':'\uD83D\uDCDD','retweet':'\uF600','columns':'\uE9A2','desktop':'\uD83D\uDCBB','adddate':'\uF070','display':'\uD83D\uDCBB','monitor':'\uD83D\uDCBB','package':'\uD83D\uDCE6','approve':'\uD83D\uDC4D','private':'\uD83D\uDD12','dictate':'\uD83C\uDFA4','caution':'\u26D4','warning':'\u26A0','refresh':'\u21BB','visible':'\uD83D\uDC40','battery':'\uD83D\uDD0B','speaker':'\uD83D\uDD08','dislike':'\uD83D\uDC4E','syncing':'\uEB82','loading':'\uEB83','avatars':'\uD83D\uDC65','up left':'\u2B09','comment':'\uD83D\uDCAC','printer':'\u2399','endcall':'\uE300','keyword':'\uE100','compass':'\uE671','pencil':'\u270E','photos':'\uD83C\uDF04','eraser':'\u2710','volume':'\uD83D\uDD08','cursor':'\uE001','videos':'\uD83D\uDCF9','upleft':'\u2B09','locate':'\uE670','locked':'\uD83D\uDD12','laptop':'\uEA00','tablet':'\uEA01','remove':'\u002D','hyphen':'\u002D','attach':'\uD83D\uDCCE','record':'\u25CF','upload':'\uEB41','iphone':'\uD83D\uDCF1','mobile':'\uD83D\uDCF1','rewind':'\u23EA','avatar':'\uD83D\uDC64','target':'\u25CE','sample':'\uE200','secure':'\uD83D\uDD12','delete':'\u2421','unlock':'\uD83D\uDD13','layers':'\uE202','camera':'\uD83D\uDCF7','expand':'\u2922','action':'\uEE00','repeat':'\uD83D\uDD01','layout':'\uEDA0','folder':'\uD83D\uDCC1','tagged':'\uE100','search':'\uD83D\uDD0E','public':'\uD83D\uDD13','images':'\uD83C\uDF04','replay':'\u21BA','timer':'\u23F1','print':'\u2399','quote':'\u201C','write':'\u270E','erase':'\u2710','right':'\u27A1','trash':'\uE0D0','heart':'\u2665','share':'\uEE00','visit':'\uEE00','nodes':'\uEB85','zelda':'\uE1A0','cloud':'\u2601','phone':'\uD83D\uDCDE','reply':'\u21A9','email':'\u2709','alert':'\u26A0','merge':'\uEB81','inbox':'\uD83D\uDCE5','users':'\uD83D\uDC65','globe':'\uD83C\uDF0E','earth':'\uD83C\uDF0E','minus':'\u002D','world':'\uD83C\uDF0E','clock':'\u23F2','music':'\u266B','check':'\u2713','audio':'\u266B','eject':'\u23CF','sound':'\uD83D\uDD08','close':'\u2421','image':'\uD83C\uDF04','photo':'\uD83C\uDF04','video':'\uD83D\uDCF9','pause':'\uE8A0','call':'\uD83D\uDCDE','play':'\u25B6','bell':'\uD83D\uDD14','view':'\uD83D\uDC40','stop':'\u25A0','skip':'\u23ED','back':'\u2B05','undo':'\u21BA','grid':'\uE9A0','rows':'\uE9A1','time':'\u23F2','left':'\u2B05','text':'\uED00','look':'\uD83D\uDC40','date':'\uD83D\uDCC6','ipad':'\uEA01','cell':'\uD83D\uDCF1','link':'\uD83D\uDD17','home':'\u2302','down':'\u2B07','cart':'\uE500','plus':'\u002B','user':'\uD83D\uDC64','talk':'\uD83D\uDCAC','chat':'\uD83D\uDCAC','fork':'\uEB80','redo':'\u21BB','mail':'\u2709','info':'\u2139','move':'\uE070','gear':'\u2699','sync':'\uEB82','crop':'\uE201','star':'\u22C6','work':'\uD83D\uDCBC','help':'\u2753','wifi':'\uEB84','love':'\u2665','list':'\uED50','like':'\uD83D\uDC4D','next':'\u25BB','flag':'\u2691','tags':'\uE100','page':'\uD83D\uDCC4','file':'\uD83D\uDCC4','lock':'\uD83D\uDD12','font':'\uED01','box':'\uD83D\uDCE6','ban':'\uD83D\uDEAB','tag':'\uE100','out':'\uEE00','fax':'\uD83D\uDCE0','rss':'\uE310','key':'\uD83D\uDD11','add':'\u002B','map':'\uE673','pin':'\uD83D\uDCCD','mic':'\uD83C\uDFA4','eye':'\uD83D\uDC40','cog':'\u2699','up':'\u2B06'};

  if (typeof ss_icons !== 'object' || typeof ss_icons !== 'object') {
    var ss_icons = ss_set; 
    var ss_keywords = [];
    for (var i in ss_set) { ss_keywords.push(i); };
  } else {
    for (var i in ss_set) { ss_icons[i] = ss_set[i]; ss_keywords.push(i); }
  };
  
};
