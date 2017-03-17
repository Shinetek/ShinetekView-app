
/**
 * Created by johm-z on 2017/1/16.
 */

//注：使用Jcrop截图，需引入jquery.Jcrop.css、jquery.js、jquery.Jcrop.js
var screenshots={
    /**
     * 初始化
     * @param url
     */
    init:function(url){
        var oCamera=document.getElementsByClassName("camera")[0];
        var oSnapshot=document.getElementById("snapshot");
        var api;
        /**
         * 点击照相机截图图片时调用的函数
         */
        oCamera.onclick=function () {
            //显示截图下载框
            oSnapshot.style.display="block";
            //创建Jcrop截图
            $('#map').Jcrop({     //ol-viewport     //ol-unselectable
                bgOpacity: 0.5,
                bgColor:"black",
                addClass: 'jcrop-normal',
                onChange:   screenshots.showCoords,
                onSelect:   screenshots.showCoords,
                onRelease:  screenshots.clearCoords,
            },function(){
                api = this;
                api.setSelect([130,65,130+350,65+285]);
                api.setOptions({ bgFade: true });
                api.ui.selection.addClass('jcrop-selection');
            });

            $('#coords').on('change','input',function(e){
             var x1 = $('#x1').val(),
             x2 = $('#x2').val(),
             y1 = $('#y1').val(),
             y2 = $('#y2').val();
             jcrop_api.setSelect([x1,y1,x2,y2]);
             });

        };

        var oBut=document.getElementById("down");
        /**
         * 点击DownLoad下载所截图片时需要的信息
         */
        oBut.onclick=function(){
            //获取到需要传递的参数（星标、仪器、经纬度、分辨率）
            //获取经纬度
            var leftTopXY = $('#topLeft').val(),
                bottomRightXY = $('#bottomRight').val();
            console.log(leftTopXY);
            console.log(bottomRightXY);
            //获取地图分辨率
            var oRe=Shinetek.Ol3Opt.getRe();
            console.log(Shinetek.Ol3Opt.getRe());
            //获取所选分辨率
            var oselOne=document.getElementById("wv-image-resolution");
            var ore=oselOne.options[oselOne.selectedIndex].text;
            console.log(ore);
            //获取所选图片格式
            var oselTwo=document.getElementById("wv-image-format");
            var oformat=oselTwo.options[oselTwo.selectedIndex].text;
            console.log(oformat);
            //获取星标仪器
            /*var oDiv=document.getElementById("baselays-zone").getElementsByTagName("div")[0].getElementsByTagName("div")[0].getElementsByTagName("div")[1];
             var oPro=oDiv.getElementsByTagName("p")[0].innerHTML;
             var oStar=oDiv.getElementsByTagName("p")[0].innerHTML;*/
            //生成新的url地址
            var oUrl=url+"22"+".jpg";
            console.log(oUrl);
            //出现浏览器下载框
            screenshots.oDownLoad(oUrl);
        }


        var oDetermine=document.getElementById("determine");
        /**
         * 点击确定选框
         */
        oDetermine.onclick=function(){
            var leftTopXY = $('#topLeft').val(),
                bottomRightXY = $('#bottomRight').val();
            //获取左上角的经纬度，并转化成屏幕坐标
            var topArray=new Array();
            topArray=leftTopXY.split(",");
            for(var i=0;i<topArray.length;i++){

            }
            var topx=topArray[0];
            var topy=topArray[1];
            var topXY=map.getPixelFromCoordinate([topx,topy],1);

            //获取右下角的经纬度，并转化成屏幕坐标
            var bottomArray=new Array();
            bottomArray=bottomRightXY.split(",");
            for(var i=0;i<bottomArray.length;i++){

            }
            console.log(bottomArray);
            var bottomx=bottomArray[0];
            var bottomy=bottomArray[1];
            var bottomXY=map.getPixelFromCoordinate([bottomx,bottomy],1);
            console.log(topXY);console.log(bottomXY);
            var oNew=topXY.concat(bottomXY);
            console.log(oNew);
            api.setSelect(oNew);

        }
        /**
         * 点击“取消”调用的函数
         */
        $('#release').click(function(e) {
            //取消Jcrop
            //api.release();
            api.destroy();
            //不显示截图下拉框
            oSnapshot.style.display="none";
        });
    },

    // Simple event handler, called from onChange and onSelect
    // event handlers, as per the Jcrop invocation above
    /**
     * 实时显示截图框的大小信息（宽高，各边的像素值，经纬度值）
     * @param c
     */
    showCoords:function(c){
        $('#x1').val(c.x);
        $('#y1').val(c.y);
        $('#x2').val(c.x2);
        $('#y2').val(c.y2);
        $('#w').val(c.w);
        $('#h').val(c.h);

        var x1 = $('#x1').val(),
            x2 = $('#x2').val(),
            y1 = $('#y1').val(),
            y2 = $('#y2').val();
        //屏幕坐标转换为经纬度坐标
        var leftTopXY=map.getCoordinateFromPixel([x1,y1],1);
        var bottomRightXY=map.getCoordinateFromPixel([x2,y2],1);
        $('#topLeft').val(leftTopXY);
        $('#bottomRight').val(bottomRightXY);
    },

    /**
     * 清除截图下拉框中各值的内容
     */
    clearCoords:function(){
      //  $('#coords input').val('');

      //  this.release();
       /* console.log("clearCoords");
        api.animateTo(
            [300,200,300,200],
            function(){
                console.log("1111");
                this.release();
               // $(e.target).closest('.btn-group').find('.active').removeClass('active');
            }
        );*/
    },

    /**
     * 判断浏览器类型
     * @returns {*}
     */
    myBrowser:function () {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1;
        if (isOpera) {
            return "Opera"
        }; //判断是否Opera浏览器
        if (userAgent.indexOf("Firefox") > -1) {
            return "FF";
        } //判断是否Firefox浏览器
        if (userAgent.indexOf("Chrome") > -1){
            return "Chrome";
        }
        if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        } //判断是否Safari浏览器
        if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
            return "IE";
        }; //判断是否IE浏览器
        if (userAgent.indexOf("Trident") > -1) {
            return "Edge";
        } //判断是否Edge浏览器
    },

    /**
     *IE调用浏览器下载功能的方法
     * @param imgURL  需下载的图片地址，同时也是下载图片的名称
     * @constructor
     */
    SaveAs5:function (imgURL) {
        var oPop = window.open(imgURL,"","width=1, height=1, top=5000, left=5000");
        for(; oPop.document.readyState != "complete"; )
        {
            if (oPop.document.readyState == "complete")break;
        }
        oPop.document.execCommand("SaveAs");
        oPop.close();
    },

    /**
     * 兼容各浏览器的调用浏览器下载
     * @param url
     */
    oDownLoad:function (url) {
        var odownLoad=document.getElementById("downLoad");
        if (screenshots.myBrowser()==="IE"||screenshots.myBrowser()==="Edge"){
            //IE
            odownLoad.href="#";
            var oImg=document.createElement("img");
            oImg.src=url;
            oImg.id="downImg";
            var odown=document.getElementById("down");
            odown.appendChild(oImg);
            screenshots.SaveAs5(document.getElementById('downImg').src)
        }else{
            //!IE
            odownLoad.href=url;
            odownLoad.download="";
        }
    },
}