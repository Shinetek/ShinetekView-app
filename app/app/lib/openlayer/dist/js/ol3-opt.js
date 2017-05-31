/**
 * Created by johm-z on 2017/1/16.
 */
var obj = new Object();
var map;
var styleCache = {};
var Shinetek2D = {};
var olMapLoadStatus = false;

var tileAllNum = 0;
var tileLoadStart = 0;
var tileLoadEnd = 0;
var tileLoadError = 0;
Shinetek2D.Ol3Opt = {
    /**
     * 地图初始化函数
     * @param url 地图初始化时基底图层的地址
     */
    init: function (url) {
        map = new ol.Map({
            layers: [
                // 加载底图
                /*Shinetek.Ol3Opt.addLayer("BaseLayer","baseLayer",url,"true","TMS"),*/
            ],
            target: 'map',
            controls: ol.control.defaults({
                attribution: false
            }).extend([
                new ol.control.FullScreen(), //全屏
                new ol.control.MousePosition({
                    undefinedHTML: 'outside',
                    projection: 'EPSG:4326',
                    coordinateFormat: function (coordinate) {
                        return ol.coordinate.format(coordinate, '{x}, {y}', 5);
                    }
                }), //经纬度坐标
                /*new ol.control.OverviewMap(),*/ //鸟瞰图
                new ol.control.ScaleLine(), // 比例尺
                new ol.control.ZoomSlider(), //滚动轴
                new ol.control.ZoomToExtent(), //回到最大
            ]),
            /* logo:{src: '../img/face_monkey.png', href: 'http://www.openstreetmap.org/'},*/
            view: new ol.View({
                projection: 'EPSG:4326',
                center: [105, 34],
                zoom: 4,
                minZoom: 0,
                maxZoom: 10,
                // 设置地图中心范围
                /*extent: [102, 29, 104, 31],*/
                // 设置成都为地图中心
                /*center: [104.06, 30.67],*/
                resolutions: [0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.0219726562, 0.010986328125, 0.0054931640625, 0.00274658203125], //设置分辨率
                extent: [-180, -90, 180, 90]
            })
        });
        /*//地图渲染未开始事件
         map.on('precompose',function (e) {
         var olMapLoadStatus="false";
         window.olMapLoadStatus=olMapLoadStatus;
         });
         //地图渲染中事件
         map.on('postcompose',function (e) {
         var olMapLoadStatus="false";
         window.olMapLoadStatus=olMapLoadStatus;
         });
         //地图渲染结束
         map.on('postrender',function (e) {
         var olMapLoadStatus="true";
         window.olMapLoadStatus=olMapLoadStatus;
         });*/

        /*var oAllScreen=document.getElementsByClassName("ol-overlaycontainer-stopevent")[0];
         oAllScreen.onclick=function (e) {
         e = e || window.event;
         e.target = e.target || e.srcElement;
         e.preventDefault ? e.preventDefault() : e.returnValue = false;
         var oScreenF=document.getElementsByClassName("ol-full-screen-false")[0];
         var oScreenT=document.getElementsByClassName("ol-full-screen-true")[0];
         if (e.target==oScreenF){
         var newProductTitleF=document.createElement("div");
         newProductTitleF.className="productTitle";
         var newProductP=document.createElement("p");
         newProductTitleF.appendChild(newProductP);
         oAllScreen.appendChild(newProductTitleF);
         }else if (e.target==oScreenT){
         var newProductTitleT=document.getElementsByClassName("productTitle")[0];
         oAllScreen.removeChild(newProductTitleT);
         }
         };*/

        //监听地图窗口的变化，判断是否为全屏模式，并设置全屏产品标题栏是否显示
        map.on('change:size', function (e) {
            var oAllScreen = document.getElementsByClassName("ol-overlaycontainer-stopevent")[0];
            var oScreenBut = document.getElementsByClassName("ol-full-screen")[0].getElementsByTagName("button")[0];
            if (oScreenBut.className == "ol-full-screen-false") {
                if (document.getElementsByClassName("productTitle")[0]) {
                    var newProductTitleT = document.getElementsByClassName("productTitle")[0];
                    oAllScreen.removeChild(newProductTitleT);
                } else {

                }
            } else if (oScreenBut.className == "ol-full-screen-true") {
                if (document.getElementsByClassName("productTitle")[0]) {

                } else {
                    var newProductTitleF = document.createElement("div");
                    newProductTitleF.className = "productTitle";
                    var newProductP = document.createElement("p");
                    newProductTitleF.appendChild(newProductP);
                    oAllScreen.appendChild(newProductTitleF);
                }
            }
        });

        //鼠标移动
        map.on('pointermove', function (e) {
            var ool_zoomslider_thumb = document.getElementsByClassName("ol-zoomslider-thumb")[0];
            ool_zoomslider_thumb.setAttribute("title", Shinetek2D.Ol3Opt.getZoom());
        });

        //地图缩放
        Shinetek2D.Ol3Opt.mapZoom(map);

        //地图缩放和移动时候，重置播放动画的变量
        var view = map.getView();
        view.on('change:center', function (e) {
            Shinetek2D.Ol3Opt.clearAnimate();
        });
        view.on('change:resolution', function (e) {
            Shinetek2D.Ol3Opt.clearAnimate();
        });
    },

    /**
     * TMS瓦片拼接规则
     * @param nameFun 图层对象名
     * @param nameLayer 图层名
     * @param oURL 图层地址
     * @param isBase 是否为基底图层
     * @param WorT 图层格式WMS/TMS/KML
     * @returns {ol.layer.Tile}
     */
    addTile: function (nameFun, nameLayer, oURL, isBase, WorT) {
        //判断如果为TMS天地图，则使用png格式
        if (oURL.indexOf("tianditu") > -1) {
            var urlTemplate = oURL + "{z}/{x}/{y}.png";
        }
        //其他TMS图使用jpg格式
        else {
            var urlTemplate = oURL + "{z}/{x}/{y}.jpg";
        }
        var layer = new ol.layer.Tile({
            source: new ol.source.TileImage({
                projection: 'EPSG:4326',
                tileGrid: new ol.tilegrid.TileGrid({
                    origin: ol.extent.getBottomLeft(new ol.proj.get("EPSG:4326").getExtent()),    // 设置原点坐标
                    resolutions: [0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.0219726562, 0.010986328125, 0.0054931640625, 0.00274658203125  /*, 0.00244140625*/], //设置分辨率
                    /*extent: [-180, -90, 180, 90],*/
                    tileSize: [256, 256]
                }),
                wrapX: false,
                tileUrlFunction: function (tileCoord, pixelRatio, projection) {
                    var z = tileCoord[0];
                    var x = tileCoord[1];
                    /*var y = Math.pow(2, z) + tileCoord[2];*/
                    var y = tileCoord[2];
                    // wrap the world on the X axis
                    var n = Math.pow(2, z + 1); // 2 tiles at z=0
                    x = x % n;
                    if (x * n < 0) {
                        // x and n differ in sign so add n to wrap the result
                        // to the correct sign
                        x = x + n;
                    }
                    window.tileAllNum++;
                    return urlTemplate.replace('{z}', z.toString())
                        .replace('{y}', y.toString())
                        .replace('{x}', x.toString());
                }
            })
        });
        layer.getSource().on('tileloadstart', function () {
           // window.tileLoadStart++;
        });
        layer.getSource().on('tileloadend', function () {
            window.tileLoadEnd++;
        });
        layer.getSource().on('tileloaderror', function () {
            window.tileLoadError++;
        });
        //判断如果是基底图层只需要返回一个url地址即可
        if (isBase == "true") {
            return layer;
        }
        //如果是叠加图层,则需要返回添加图层的函数
        else if (isBase == "false") {
            window.obj[nameFun] = layer;
            var m_LayerADD = map.addLayer(layer);
            return m_LayerADD;
        }
    },

    /**
     * KML火点图样式
     * @param feature
     * @returns {*}
     */
    styleFunction: function (feature) {
        // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
        // standards-violating <magnitude> tag in each Placemark.  We extract it from
        // the Placemark's name instead.
        var name = feature.get('name');
        var magnitude = parseFloat(name.substr(2));
        var radius = 5 + 20 * (magnitude - 5);
        var style = styleCache[radius];
        if (!style) {
            style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 153, 0, 0.4)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255, 204, 0, 0.2)',
                        width: 1
                    })
                })
            });
            styleCache[radius] = style;
        }
        return style;
    },

    /**
     * 添加图层（TMS/WMS/KML）
     * @param nameFun 图层对象名，添加、隐藏、删除图层时使用
     * @param nameLayer 图层名
     * @param oURL 图层地址
     * @param isBase 是否为基底图层
     * @param WorT 判断图层格式是WMS/TMS/KML
     * @returns {*}
     */
    addLayer: function (nameFun, nameLayer, oURL, isBase, WorT) {
        //判断不同的图层格式调用不同的加载方式
        if (WorT === "WMS") {
            var layer = new ol.layer.Tile({
                title: nameLayer,
                source: new ol.source.TileWMS({
                    url: oURL,
                    wrapX: false,
                    /* params: {
                     'VERSION': '1.1.1',
                     LAYERS: 'lzugis:capital',
                     STYLES: '',
                     tiled:true,
                     },*/
                    params: {'LAYERS': 'ne:ne'},
                    serverType: 'geoserver',
                    crossOrigin: 'anonymous'
                })
            });
            window.obj[nameFun] = layer;
            var m_LayerADD = map.addLayer(layer);
            return m_LayerADD;
        }
        else if (WorT === "TMS") {
            return Shinetek2D.Ol3Opt.addTile(nameFun, nameLayer, oURL, isBase, WorT);
        }
        else if (WorT === "KML") {
            //火点的俩种加载方式
            //方法一
            var layer = new ol.layer.Heatmap({
                source: new ol.source.Vector({
                    //1.生成的KML文件，保存到此网页文件所在的目录
                    //2.也可以直接使用生成这个文件的链接，动态生成数据文件
                    url: oURL,
                    projection: 'EPSG:4326',
                    format: new ol.format.KML({
                        extractStyles: false
                    }),
                    wrapX: true,
                }),
                blur: 5,
                radius: 5,
            });
            window.obj[nameFun] = layer;
            var m_LayerADD = map.addLayer(layer);
            return m_LayerADD;

            /*//方法二
             var layer = new ol.layer.Vector({
             source: new ol.source.Vector({
             url: oURL,      //https://openlayers.org/en/v3.20.1/examples/data/kml/2012_Earthquakes_Mag5.kml
             format: new ol.format.KML({
             extractStyles: false
             })
             }),
             style:WMS.styleFunction
             });
             window.obj[nameFun]=layer;
             var m_LayerADD=map.addLayer(layer);
             return m_LayerADD;*/
        }
        else if (WorT === "XYZ") {
            var layer = new ol.layer.Tile({
                title: nameLayer,
                source: new ol.source.XYZ({
                    url: oURL,
                    /*WMS.addLayer("WMS1","天地图路网","http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}","false","XYZ");*/
                    /*WMS.addLayer("WMS2","天地图文字标注","http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}","false","XYZ");*/
                })
            });
            window.obj[nameFun] = layer;
            var m_LayerADD = map.addLayer(layer);
            return m_LayerADD;
        }
        else if (WorT === "GEOJSON") {
            var layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    format: new ol.format.GeoJSON(),
                    url: oURL,
                }),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'blue',
                        lineDash: [4],
                        width: 1.3
                    }),
                    /*fill: new ol.style.Fill({
                     color: 'rgba(0, 0, 0, 0)'
                     })*/
                })
            });
            window.obj[nameFun] = layer;
            var m_LayerADD = map.addLayer(layer);
            return m_LayerADD;
        }
    },

    /**
     * 移除图层
     * @param nameFun 图层对象名
     * @param WorT 图层格式WMS/TMS/KML
     */
    removeLayer: function (nameFun, WorT) {
        var WorT = WorT;
        var layer = window.obj[nameFun];
        map.removeLayer(layer);
        delete window.obj[nameFun];
    },

    /**
     * 匹配部分名字进行删除图层
     * @param nameFun 图层名的部分
     */
    removeSomeLayer: function (nameFun) {
        //console.log(map.getLayers());
        var layer = window.obj[nameFun];
        var myName = nameFun;
        var layers = window.obj;
        /*console.log(layers)*/
        for (i in layers) {
            if (myName.indexOf(i) >= 0) {
                map.removeLayer(i)
            }
        }
    },

    /**
     *  显示隐藏图层
     * @param nameFun 图层对象名
     * @param WorT 图层格式WMS/TMS/KML
     */
    setVisibility: function (nameFun, WorT) {
        var WorT = WorT;
        var layer = window.obj[nameFun];
        (layer.getVisible() == true) ? layer.setVisible(false) : layer.setVisible(true);
    },

    //监听图片开始加载
    oStart: function (nameFun) {
        var layer = window.obj[nameFun];
        layer.getSource().on('tileloadstart', function (event) {
            alert("111")
        });
    },

    //监听图片结束加载
    oEnd: function (nameFun) {
        var layer = window.obj[nameFun];
        layer.getSource().on('tileloadend', function (event) {
            alert("222")
        });
    },

    //地图渲染结束事件
    oGetStatus: function () {
        /*console.log(window.tileAllNum);
         console.log(window.tileLoadEnd);
         console.log(window.tileLoadError);*/
        if (window.tileAllNum <= window.tileLoadEnd + window.tileLoadError) {
            console.log("true");

            Shinetek2D.Ol3Opt.clearAnimate();
            return true;
        } else {

            return false;
        }
    },

    //刷新图层
    oRefresh: function () {
        map.updateSize();
    },

    /**
     * 获取图层当前z-index值
     * @param nameFun 图层对象名
     */
    getZIndex: function (nameFun) {
        var layer = window.obj[nameFun];
        return layer.getZIndex();
    },

    /**
     * 设置图层z-index值
     * @param nameFun 图层对象名
     * @param zIndex 新的z-index值
     */
    setZIndex: function (nameFun, zIndex) {
        var layer = window.obj[nameFun];
        layer.setZIndex(zIndex);
    },

    /*// Create the graticule component 经纬度网格
     graticule : new ol.Graticule({
     // the style to use for the lines, optional.
     strokeStyle: new ol.style.Stroke({
     color: 'rgba(255,120,0,0.9)',
     width: 2,
     lineDash: [0.5, 4]
     })
     }),
     graticule.setMap(map);*/

    /**
     * 移动到固定位置
     */
    moveToChengDu: function () {
        var view = map.getView();
        // 设置地图中心为成都的坐标，即可让地图移动到成都
        view.setCenter(ol.proj.transform([104.06, 30.67], 'EPSG:4326', 'EPSG:3857'));
        map.render();
    },

    /**
     * 显示固定范围
     */
    fitToChengdu: function () {
        // 让地图最大化完全地显示区域[104, 30.6, 104.12, 30.74]
        map.getView().fit([104, 30.6, 104.12, 30.74], map.getSize());
    },

    /**
     * 经纬度网格
     */
    graticule: function () {
        var graticule = new ol.Graticule({
            // the style to use for the lines, optional.
            strokeStyle: new ol.style.Stroke({
                color: 'rgba(255,120,0,0.9)',
                width: 2,
                lineDash: [0.5, 4],
            }),
        });
        graticule.setMap(map);
    },

    /**
     *获取分辨率等信息
     */
    getRe: function () {
        return map.getView().getResolution();
    },

    /**
     * 获取当前的zoom值
     */
    getZoom: function () {
        return map.getView().getZoom();
    },

    /**
     * 地图缩放事件
     * 此事件郭总项目中的圆盘图使用
     */
    mapZoom: function (map) {
        /*var view=map.getView();
         Shinetek.Ol3Opt.newResolution(Shinetek.Ol3Opt.getRe());

         view.on('change:resolution',function(e){
         var res=map.getView().getResolution();
         /!* alert(res+'zoom了');*!/
         var oResParent=document.getElementsByClassName("ol-scale-line ol-unselectable")[0];
         //清空上一个div
         var oResParent_child=oResParent.childNodes;
         if (oResParent_child.length=="1"){


         }
         else if (oResParent_child.length!=="1"){
         var oldmyResolution=document.getElementsByClassName("myResolution");
         for (var i=0;i<oldmyResolution.length;i++){

         oResParent.removeChild(oldmyResolution[i]);
         }
         }
         /!*console.log(oResParent_child.length);*!/

         //创建div
         Shinetek.Ol3Opt.newResolution(res);
         });*/
    },

    /**
     * 创建、显示分辨率信息
     */
    newResolution: function (res) {
        var oResParent = document.getElementsByClassName("ol-scale-line ol-unselectable")[0];
        var myResolution = document.createElement("div");
        myResolution.className = "myResolution";
        //resolutions:[/*0.703125, 0.3515625,*/ 0.17578125, 0.087890625, 0.0439453125, 0.0219726562, 0.010986328125, 0.0054931640625/*, 0.00244140625,0.001220703125,0.0006103515625*/], //设置分辨率
        switch (res) {
            case 0.17578125:
            {
                res = "16000M";
                break;
            }
            case 0.087890625:
            {
                res = "8000M";
                break;
            }
            case 0.0439453125:
                res = "4000M";
                break;
            case 0.0219726562:
            {
                res = "2000M";
                break;
            }
            case 0.010986328125:
            {
                res = "1000M";
                break;
            }
            case 0.0054931640625:
            {
                res = "500M";
                break;
            }
            case 0.00274658203125:
            {
                res = "250M";
                break;
            }
            default:
            {
                res = "";
                break;
            }

        }
        myResolution.innerHTML = "分辨率：" + res;
        oResParent.appendChild(myResolution);
    },

    /**
     * 播放动画时设置产品标题
     * @param nameLayer
     */
    setScreenTitle: function (nameLayer) {
        var oScreenBut = document.getElementsByClassName("ol-full-screen")[0].getElementsByTagName("button")[0];
        if (oScreenBut.className == "ol-full-screen-false") {

        } else if (oScreenBut.className == "ol-full-screen-true") {
            var oTitleP = document.getElementsByClassName("productTitle")[0].getElementsByTagName("p")[0];
            oTitleP.innerHTML = nameLayer;
        }
    },

    /**
     * 重置动画播放的锁
     */
    clearAnimate: function () {
        window.tileAllNum = 0;
        window.tileLoadEnd = 0;
        /*    http://10.24.10.96/FY3B_MERSI_321/MERSI/yyyyMMdd/*/
        window.tileLoadError = 0;
    }
}

