/**
 * Created by johm-z on 2017/4/24.
 */
var Shinetek = {};
Shinetek.showMode = "2D";
Shinetek.Ol3Opt = {

    setMapFun: function (showType) {
        if (showType == "2D" || showType == "3D") {
            Shinetek.showMode = showType;
        }
        /*  var o2_3tool_sel = document.getElementsByClassName("glyphicon-mapType")[0].innerHTML;
         var omap2D = document.getElementsByClassName("map2D")[0];
         var omap3D = document.getElementsByClassName("map3D")[0];
         /!*    require.config({
         baseUrl: 'lib/Cesium/Source',
         waitSeconds: 60
         });*!/
         // Shinetek3D.CesiumOpt.init("http://10.24.10.108/IMAGEL2/GBAL/");
         //console.log(o2_3tool_sel);
         if (o2_3tool_sel == "2D") {
         document.getElementsByClassName("glyphicon-mapType")[0].innerHTML = "3D";
         omap2D.style.display = "block";
         omap3D.style.display = "none";
         Shinetek.showMode = "2D";

         }
         else if (o2_3tool_sel == "3D") {
         document.getElementsByClassName("glyphicon-mapType")[0].innerHTML = "2D";
         omap2D.style.display = "none";
         omap3D.style.display = "block";
         Shinetek.showMode = "3D";
         }*/
    },

    getMapFun: function () {
        if (Shinetek.showMode == "3D") {
            return "0";
        }
        else {
            return "1";
        }
    },

    init: function (url) {
        if (Shinetek.showMode == "3D") {
            Shinetek3D.CesiumOpt.init(url);
        }
        else {
            Shinetek2D.Ol3Opt.init(url);
        }
        // console.log("initALL");

        /*    $(".map3D").load("http://10.24.4.121:4080/newmap2.html",function () {
         })*/

    },

    addLayer: function (nameFun, nameLayer, oURL, isBase, WorT) {
        this.getMapFun() == "1" ? Shinetek2D.Ol3Opt.addLayer(nameFun, nameLayer, oURL, isBase, WorT) : Shinetek3D.CesiumOpt.addLayer(nameFun, nameLayer, oURL, isBase, WorT);
    }
    ,

    removeLayer: function (nameFun, WorT) {
        this.getMapFun() == "1" ? Shinetek2D.Ol3Opt.removeLayer(nameFun, WorT) : Shinetek3D.CesiumOpt.removeLayer(nameFun, WorT);
    },

    setVisibility: function (nameFun, WorT) {
        this.getMapFun() == "1" ? Shinetek2D.Ol3Opt.setVisibility(nameFun, WorT) : Shinetek3D.CesiumOpt.setVisibility(nameFun, WorT);
    }
    ,

    setZIndex: function (nameFun, zIndex) {
        this.getMapFun() == "1" ? Shinetek2D.Ol3Opt.setZIndex(nameFun, zIndex) : Shinetek3D.CesiumOpt.setZIndex(nameFun, zIndex);
    }
    ,

    getZIndex: function (nameFun) {
        this.getMapFun() == "1" ? Shinetek2D.Ol3Opt.getZIndex(nameFun) : Shinetek3D.CesiumOpt.getZIndex(nameFun);
    }
    ,

    getRe: function () {
        this.getMapFun() == "1" ? Shinetek2D.Ol3Opt.getRe() : Shinetek3D.CesiumOpt.getRe();
    }
    ,

    getZoom: function () {
        this.getMapFun() == "1" ? Shinetek2D.Ol3Opt.getZoom() : Shinetek3D.CesiumOpt.getZoom();
    }
    ,

    newResolution: function (res) {
        this.getMapFun() == "1" ? Shinetek2D.Ol3Opt.newResolution(res) : Shinetek3D.CesiumOpt.newResolution(res);
    }
    ,

    setScreenTitle: function (nameLayer) {
        this.getMapFun() == "1" ? Shinetek2D.Ol3Opt.setScreenTitle(nameLayer) : Shinetek3D.CesiumOpt.setScreenTitle(nameLayer);
    }
    ,

    oGetStatus: function () {
        if (this.getMapFun() == "1") {
            return Shinetek2D.Ol3Opt.oGetStatus()
        } else {
            return Shinetek3D.CesiumOpt.oGetStatus();
        }
    },
    removeAllLayer: function () {
        //todo 目前使用 3D模式清除
        if (this.getMapFun() == "0") {
            return Shinetek3D.CesiumOpt.removeSomeLayer("");
            // return Shinetek3D.CesiumOpt.removeSomeLayer("");
        }
    }


};