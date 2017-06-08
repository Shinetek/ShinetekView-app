/**
 * Created by johm-z on 2017/5/8.
 */
//var webHost="http://123.56.135.196:4080/";
var webHost="http://127.0.0.1:4080/";
appinit = {
    initCss:function (options) {
        var cssStyles = "";
        if (options.length !=="undefined"){
            for (var i=0;i<options.length;i++){
                cssStyles += '<link href="' +webHost+options[i] +'" rel="stylesheet" type ="text/css"/>'
                document.write(cssStyles);
            }
        }
    },

    initJs:function(options){
        var scriptLinks = "";
        if(options.length!==undefined){
            for (var i=0;i<options.length;i++){
                scriptLinks += '<script type="text/javascript" src="'+ webHost+options[i] +'"/>'
                document.write(scriptLinks);
            }
        }
    }
}