
/**
 * Created by johm-z on 2017/1/16.
 */

//注：使用Jcrop截图，需引入jquery.Jcrop.css、jquery.js、jquery.Jcrop.js


var screenshots={
    /**
     * 初始化
     * @param url
     */
    init:function(url,resolution ){
        var oSnapshot=document.getElementById("snapshot");
        var oBut=document.getElementById("screenDownLoad");
        var api;
        oSnapshot.style.display="block";

        /*//清空已有的option
        var owv_resolution=document.getElementById("wv-image-resolution");
        for (var i=owv_resolution.childNodes.length-1;i>=0;i--) {
            var childNode = owv_resolution.childNodes[i];
            owv_resolution.removeChild(childNode);
        }
        //将新分辨率写入页面中
        var owv_resolution=document.getElementById("wv-image-resolution");
        for (var i=0;i<resolution.length;i++){
            var option = document.createElement('option');
            option.innerHTML=resolution[i];
            owv_resolution.appendChild(option);
        }*/

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
            api.setSelect([530,165,530+350,165+285]);
            api.setOptions({ bgFade: true });
            api.ui.selection.addClass('jcrop-selection');
        });

        /*$('#coords').on('change','input',function(e){
         var topLeftX = $('#topLeft').val(),
             topLeftY = $('#topLefty').val(),
             bottomRightX = $('#bottomRight').val(),
             bottomRightY = $('#bottomRighty').val();
         api.setSelect([topLeftX,topLeftY,bottomRightX,bottomRightY]);
         });*/

        /**
         * 点击DownLoad下载所截图片时需要的信息
         */
        console.log(url);
        window.downUrl=url;
        oBut.onclick=function(){
            console.log(downUrl);
            //获取到需要传递的参数（星标、仪器、经纬度、分辨率）
            //获取经纬度
            var toplon = $('#topLeft').val(),
                bottomlon = $('#bottomRight').val(),
                toplat = $('#topLefty').val(),
                bottomlat = $('#bottomRighty').val();

            //获取所选分辨率
            var oselOne=document.getElementById("wv-image-resolution");
            var ore=oselOne.options[oselOne.selectedIndex].text;
            console.log(ore);
            //获取所选图片格式
            var oselTwo=document.getElementById("wv-image-format");
            var oformat=oselTwo.options[oselTwo.selectedIndex].text;
            console.log(oformat);
            //生成新的url地址
            var reg_toplat = new RegExp("{{tlat}}", "g");
            var url = downUrl.replace(reg_toplat, toplat);
            var reg_toplon = new RegExp("{{tlon}}", "g");
            url = url.replace(reg_toplon, toplon);
            var reg_bottomlat = new RegExp("{{blat}}", "g");
            url = url.replace(reg_bottomlat, bottomlat);
            var reg_bottomlon = new RegExp("{{blon}}", "g");
            url = url.replace(reg_bottomlon, bottomlon);
            var oUrl=url;
            console.log(oUrl);
            //出现浏览器下载框
            screenshots.oDownLoad(oUrl);
    }


        var oDetermine=document.getElementById("determine");
        /**
         * 点击确定选框
         */
        oDetermine.onclick=function(){
            //获取经纬度，并转化成屏幕坐标
            var leftTopX = $('#topLeft').val(),
                bottomRightX = $('#bottomRight').val();
                leftTopY = $('#topLefty').val(),
                bottomRightY = $('#bottomRighty').val();

            var topXY=map.getPixelFromCoordinate([leftTopX,leftTopY],1);
            var bottomXY=map.getPixelFromCoordinate([bottomRightX,bottomRightY],1);
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
        leftTopX=leftTopXY[0];
        leftTopY=leftTopXY[1];
        bottomRightX=bottomRightXY[0];
        bottomRightY=bottomRightXY[1];

        leftTopX=screenshots.formatNum(leftTopX);
        leftTopY=screenshots.formatNum(leftTopY);
        bottomRightX=screenshots.formatNum(bottomRightX);
        bottomRightY=screenshots.formatNum(bottomRightY);

        $('#topLeft').val(leftTopX);
        $('#bottomRight').val(bottomRightX);
        $('#topLefty').val(leftTopY);
        $('#bottomRighty').val(bottomRightY);
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

    clearRes:function(){
        var owv_resolution=document.getElementById("wv-image-resolution");
        var owv_option=owv_resolution.getElementsByTagName("option");
        console.log(owv_option);
        console.log(owv_option.length);
        for (var i=0;i<owv_option.length;i++){
            owv_resolution.removeChild(owv_option[0]);
        }
    },

    /**
     * 将浮点数四舍五入，取小数点后1位
     * @param x
     * @returns {Number}
     */
    formatNum:function round(x){
        var f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x*10)/10;
        return f;
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
        var odownLoad=document.getElementById("screenDownLoad");
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