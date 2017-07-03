/**
 * Created by fanli on 2017/7/3.
 */

var Shinetek = {};
Shinetek.cesiumObj = new Object();
Shinetek.CesiumOpt = {
	init: function (url) {
		console.log("Shinetek.CesiumOpt init");
		//  console.log(url);
		/*  var tms0 = new Cesium.createTileMapServiceImageryProvider({
		 url: url,
		 fileExtension: 'png'
		 });*/
		/*var tms0 = new Cesium.UrlTemplateImageryProvider({
		 url:url,
		 credit : '© Analytical Graphics, Inc.',
		 tilingScheme : new Cesium.GeographicTilingScheme(),
		 maximumLevel : 5
		 });*/

		var viewer = new Cesium.Viewer('cesiumContainer', {
			animation: false,//是否创建动画小器件，左下角仪表
			baseLayerPicker: false,//是否显示图层选择器      //需设置
			fullscreenButton: false,//是否显示全屏按钮
			geocoder: false,//是否显示geocoder小器件，右上角查询按钮
			homeButton: true,//是否显示Home按钮
			infoBox: false,//是否显示信息框
			sceneModePicker: true,//是否显示3D/2D选择器
			selectionIndicator: false,//是否显示选取指示器组件
			timeline: false,//是否显示时间轴
			navigationHelpButton: false,//是否显示右上角的帮助按钮
			//scene3DOnly : true,//如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
			clock: new Cesium.Clock(),//用于控制当前时间的时钟对象
			selectedImageryProviderViewModel: undefined,//当前图像图层的显示模型，仅baseLayerPicker设为true有意义
			imageryProviderViewModels: Cesium.createDefaultImageryProviderViewModels(),//可供BaseLayerPicker选择的图像图层ProviderViewModel数组
			selectedTerrainProviderViewModel: undefined,//当前地形图层的显示模型，仅baseLayerPicker设为true有意义
			terrainProviderViewModels: Cesium.createDefaultTerrainProviderViewModels(),//可供BaseLayerPicker选择的地形图层ProviderViewModel数组
			fullscreenElement: document.body,//全屏时渲染的HTML元素,
			useDefaultRenderLoop: true,//如果需要控制渲染循环，则设为true
			targetFrameRate: undefined,//使用默认render loop时的帧率
			showRenderLoopErrors: false,//如果设为true，将在一个HTML面板中显示错误信息
			automaticallyTrackDataSourceClocks: true,//自动追踪最近添加的数据源的时钟设置
			contextOptions: undefined,//传递给Scene对象的上下文参数（scene.options）
			sceneMode: Cesium.SceneMode.SCENE3D,//初始场景模式
			mapProjection: new Cesium.WebMercatorProjection(),//地图投影体系
			dataSources: new Cesium.DataSourceCollection(), //需要进行可视化的数据源的集合
			terrainExaggeration: 2.0,//地形图设置
			/*      imageryProvider: tms0*/
			/*skyBox : new Cesium.SkyBox({
			 sources : {
			 positiveX : 'Cesium-1.7.1/Skybox/px.jpg',
			 negativeX : 'Cesium-1.7.1/Skybox/mx.jpg',
			 positiveY : 'Cesium-1.7.1/Skybox/py.jpg',
			 negativeY : 'Cesium-1.7.1/Skybox/my.jpg',
			 positiveZ : 'Cesium-1.7.1/Skybox/pz.jpg',
			 negativeZ : 'Cesium-1.7.1/Skybox/mz.jpg'
			 }
			 }),//用于渲染星空的SkyBox对象*/
		});
		window.viewer = viewer;
		//添加月球数据
		var radius = Cesium.Math.LUNAR_RADIUS * 2;
		viewer.scene.moon = new Cesium.Moon({
			ellipsoid: new Cesium.Ellipsoid(radius, radius, radius)  //3474800   100000000
		});

		//地形图
		/*
		 var cesiumTerrainProviderMeshes = new Cesium.CesiumTerrainProvider({
		 url : 'https://assets.agi.com/stk-terrain/world',
		 requestWaterMask : true,
		 requestVertexNormals : true
		 });
		 viewer.terrainProvider = cesiumTerrainProviderMeshes;
		 viewer.camera.setView({
		 destination : new Cesium.Cartesian3(277096.634865404, 5647834.481964232, 2985563.7039122293),
		 xorientation : {
		 heading : 4.731089976107251,
		 pitch : -0.32003481981370063
		 }
		 });
		 viewer.scene.globe.enableLighting = true;*/


		/*var terrainProvider = new Cesium.CesiumTerrainProvider( {
		 url : 'https://assets.agi.com/stk-terrain/world'
		 } );
		 viewer.terrainProvider = terrainProvider;*/

		var tmsLayers = viewer.scene.imageryLayers;
		window.tmsLayers = tmsLayers;
		var wmsLayers = viewer.imageryLayers;
		window.wmsLayers = wmsLayers;
		var rwms = viewer.scene.globe.imageryLayers;
		window.rwms = rwms;

		//鼠标滑动显示经纬度
		//this.getPosition();
		this.getLonLat();

		//设置显示区域
		this.setView();


		if (!url) {
			console.log("add");
			//   Shinetek3D.CesiumOpt.addLayer("_lkjw9sdj9jlaksjdlweiqw", "基础基础图层", "http://10.24.10.108/IMAGEL2/GBAL/", "false", "WMS");
		}


		// Start off looking at Australia.
		/* viewer.camera.setView({
		 destination: Cesium.Rectangle.fromDegrees(114.591, -45.837, 148.970, -5.730)
		 });*/
	},

	/**
	 * 添加图层
	 * @param nameFun  操作图层显示隐藏的函数名
	 * @param nameLayer
	 * @param oURL  图层的url地址
	 * @param isBase
	 * @param WorT
	 */
	addLayer: function (nameFun, nameLayer, oURL, isBase, WorT) {
		console.log("3D add!");
		console.log(nameFun);
		if (WorT === "WMS") {
			var layer = new Cesium.WebMapServiceImageryProvider({
				url: oURL,
				layers: 'Hydrography:bores',
				parameters: {
					transparent: true,
					format: 'image/png'
				}
			});
			wmsLayers.addImageryProvider(layer);
			Shinetek.cesiumObj[nameFun] = layer;

			/* var wms = new Cesium.UrlTemplateImageryProvider({
			 url : 'https://programs.communications.gov.au/geoserver/ows?tiled=true&' +
			 'transparent=true&format=image%2Fpng&exceptions=application%2Fvnd.ogc.se_xml&' +
			 'styles=&service=WMS&version=1.1.1&request=GetMap&' +
			 'layers=public%3AMyBroadband_Availability&srs=EPSG%3A3857&' +
			 'bbox={westProjected}%2C{southProjected}%2C{eastProjected}%2C{northProjected}&' +
			 'width=256&height=256',
			 rectangle : Cesium.Rectangle.fromDegrees(96.799393, -43.598214999057824, 153.63925700000001, -9.2159219997013)
			 });*/
		}
		else if (WorT === "WMTS") {
			var layer = new Cesium.WebMapTileServiceImageryProvider({
				//全球矢量地图服务
				url: oURL,
				//路网
				/* "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",*/
				// 全球影像地图服务
				/*url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",*/
				//全球影像中文注记服务
				/*url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",*/
				//全球矢量中文注记服务
				/*url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",*/
				layer: "tdtVecBasicLayer",
				style: "default",
				format: "image/jpeg",
				tileMatrixSetID: "GoogleMapsCompatible",
				show: "false",
			});
			wmsLayers.addImageryProvider(layer);
			Shinetek.cesiumObj[nameFun] = layer;
		}
		else if (WorT === "TMS") {
			//若为天地图 则对后缀名称进行修改
			oURL.indexOf("tianditu") > -1 ? oPhoto = "png" : oPhoto = "jpg";
			var layer = new Cesium.ImageryLayer(
				new Cesium.createTileMapServiceImageryProvider({
					url: oURL,
					fileExtension: oPhoto,
					tileMatrixLabels:["1","2","3","4","5","6","7"]
				})
			);
			tmsLayers.add(layer);

			Shinetek.cesiumObj[nameFun] = layer;
			//设置图层的透明度
			//nameFun.alpha = 0.5;
			//设置图层的亮度
			//nameFun.brightness = 2.0;
		}
		else if (WorT === "KML") {

		}
		else if (WorT === "GEOJSON") {
			console.log("GEOJSON");
			Cesium.GeoJsonDataSource.load(oURL, {
				stroke: Cesium.Color.BLUE,
				fill: Cesium.Color.TRANSPARENT,
				strokeWidth: 3,
				markerSymbol: '?'
			}).then(function (myDataSource) {
				// Add it to the viewer
				window.viewer.dataSources.add(myDataSource);
				// Remember the data source by ID so we can delete later
				// loadedGeometries[geometryID] = myDataSource;
				Shinetek.cesiumObj[nameFun] = myDataSource;
				console.log("add layer " + nameFun);
			});
			//window.viewer.dataSources.add(layer);
			// tmsLayers.add(layer);
			/*console.log(window.viewer.dataSources);*/


			//Shinetek.cesiumObj[nameFun] = layer;
		}
		else if (WorT == "Tile_Coordinates") {
			var layer = new Cesium.TileCoordinatesImageryProvider();
			tmsLayers.add(layer);
			Shinetek.cesiumObj[nameFun] = layer;
		}
	},

	/**
	 * 移除图层
	 * @param nameFun
	 * @param WorT
	 */
	removeLayer: function (nameFun, WorT) {

		if (WorT == "GEOJSON") {
			try {
				var layer = Shinetek.cesiumObj[nameFun];
				window.viewer.dataSources.remove(layer, true);
				delete Shinetek.cesiumObj[nameFun];
			} catch (err) {
				console.log(err);
			}
		}
		else {
			try {

				var layer = Shinetek.cesiumObj[nameFun];
				//viewer.scene.imageryLayers
				tmsLayers.remove(layer, true);
				delete Shinetek.cesiumObj[nameFun];
			} catch (err) {
				console.log(err);
			}
		}
	},

	/**
	 * 匹配部分名字删除图层
	 * @param nameFun
	 */
	removeSomeLayer: function (nameFun) {

		var myName = nameFun;
		var layers = Shinetek.cesiumObj;
		//遍历当前图层 并对其进行移除
		for (var m_layer in layers) {
			if (m_layer.indexOf(myName) > -1) {
				Shinetek.CesiumOpt.removeLayer(m_layer, "WorT");
			}
		}
	},

	/**
	 * 移除所有图层
	 */
	removeAll: function () {
		//  tmsLayers.removeAll(true);
		//  window.cesiumObj = new Object();
		var layers = Shinetek.cesiumObj;
		for (m_layer in layers) {
			Shinetek.CesiumOpt.removeLayer(m_layer, "WorT");
		}
		Shinetek.cesiumObJ = new Object();
	},

	/**
	 * 显示隐藏图层
	 * @param nameFun
	 * @param WorT
	 */
	setVisibility: function (nameFun, WorT) {
		this.indexOf(nameFun);
		var nameFunStatus = tmsLayers.get(this.indexOf(nameFun)).show;
		nameFunStatus == true ? tmsLayers.get(this.indexOf(nameFun)).show = false : tmsLayers.get(this.indexOf(nameFun)).show = true;
	},

	/**
	 * 获取图层在集合中的索引值
	 * @param obj 集合
	 * @param para 图层名
	 * @returns {number} 索引
	 */
	getObjIndex: function (obj, para) {
		var i = 0;
		var index = -1;
		if (para in obj) {
			for (var o in obj) {
				if (o == para) {
					index = i;
				} else {
					i++;
				}
			}
		}
		return index;
	},

	/**
	 * 获取图层在集合中的索引值
	 * @param nameFun 图层名
	 */
	indexOf: function (nameFun) {
		//var layer = window.cesiumObj[nameFun];
		var layer = Shinetek.cesiumObj[nameFun];
		return tmsLayers.indexOf(layer);
	},

	/**
	 * 设置图层的z-Index的值
	 * @param nameFun
	 * @param zIndex
	 */
	setZIndex: function (nameFun, zIndex) {

		var layer = Shinetek.cesiumObj[nameFun];
		tmsLayers.add(layer, zIndex);
	},

	/**
	 * 根据索引获取图层信息
	 * @param nameFun
	 */
	getZIndex: function (nameFun) {
		//    var layer = window.cesiumObj[nameFun];
		// var index = this.indexOf(nameFun);

		var index = Shinetek.cesiumObj.indexOf(nameFun);
		tmsLayers.get(index);
		console.log(tmsLayers.get(index));
		return tmsLayers.get(index);
	},

	/**
	 * 获取经纬度、高度信息
	 */
	getPosition: function () {
		//得到当前三维场景
		var scene = window.viewer.scene;
		//得到当前三维场景的椭球体
		var ellipsoid = scene.globe.ellipsoid;
		var entity = viewer.entities.add({
			label: {
				show: false
			}
		});
		var longitudeString = null;
		var latitudeString = null;
		var height = null;
		var cartesian = null;
		// 定义当前场景的画布元素的事件处理
		var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
		//设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
		handler.setInputAction(function (movement) {
			//通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
			cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
			if (cartesian) {
				//将笛卡尔坐标转换为地理坐标
				var cartographic = ellipsoid.cartesianToCartographic(cartesian);
				//将弧度转为度的十进制度表示
				longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
				latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
				//获取相机高度
				height = Math.ceil(viewer.camera.positionCartographic.height);
				entity.position = cartesian;
				entity.label.show = true;
				entity.label.text = '(' + longitudeString + ', ' + latitudeString + "," + height + ')';
			} else {
				entity.label.show = false;
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		//设置鼠标滚动事件的处理函数，这里负责监听高度值变化
		handler.setInputAction(function (wheelment) {
			height = Math.ceil(viewer.camera.positionCartographic.height);
			entity.position = cartesian;
			entity.label.show = true;
			entity.label.text = '(' + longitudeString + ', ' + latitudeString + "," + height + ')';
		}, Cesium.ScreenSpaceEventType.WHEEL);
	},

	/**
	 * 获取经纬度
	 */
	getLonLat: function () {
		var scene = window.viewer.scene;
		var handler;
		var entity = viewer.entities.add({
			label: {
				show: false,
				showBackground: true,
				font: '14px monospace',
				horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
				verticalOrigin: Cesium.VerticalOrigin.TOP,
				pixelOffset: new Cesium.Cartesian2(15, 0)
			}
		});

		// Mouse over the globe to see the cartographic position
		handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
		handler.setInputAction(function (movement) {
			var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
			if (cartesian) {
				var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
				var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
				var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);

				entity.position = cartesian;
				entity.label.show = true;
				entity.label.text =
					'Lon: ' + ('   ' + longitudeString).slice(-7) + '\u00B0' +
					'\nLat: ' + ('   ' + latitudeString).slice(-7) + '\u00B0';
			} else {
				entity.label.show = false;
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	},

	/**
	 * 地图渲染结束事件
	 * @returns {string}
	 */
	oGetStatus: function () {
		var olMapLoadStatus = "true";
		return olMapLoadStatus;
	},

	/**
	 * 设置显示区域
	 */
	setView: function () {
		viewer.camera.setView({
			destination: Cesium.Cartesian3.fromDegrees(108.90, 34.49, 10103520)
		});
	},

	/**
	 * 播放动画时设置产品标题
	 * @param nameLayer
	 */
	setScreenTitle: function (nameLayer) {


	},

}

