/**
 * Created by FanTaSyLin on 2016/10/18.
 */

(function () {

    "use strict";

    angular.module("Worldview")
        .controller("WorldviewController", WorldviewController);

    WorldviewController.$inject = ["WorldviewServices", "$cookies"];

    function WorldviewController(WorldviewServices, $cookies) {

        var self = this;
        var BASEINDEXFORBASE = 100; //基础图层的基准z-index
        var BASEINDEXFOROVER = 300; //产品图层的基准z-index
        var projectList = [];

        //数据存在列表 - 维护所有分钟间隔产品的数组
        var timeLineListDataAll = [];

        var timeLine = new TimeLine();
        var layerMenu = angular.element(document.getElementById("layerMenu"));
        var timeLineElm = angular.element(document.getElementById("timeLine"));
        var sliderFps = angular.element(document.getElementById("slider-fps")).slider();
        /*var overlaysZone = angular.element(document.getElementById('overlays-zone'));*/

        self.currentTab = "Layer";
        // self.currentTab_LayerMenuModal = {};
        self.overLays = [];
        self.baseLays = [];
        /**标记菜单是否折叠 0 显示 1 隐藏 2动画模式 20170517*/
        self.isMenuCollapse = 0;
        /*top tab group list*/
        self.tabGroups = [];
        self.currentTabGroup = {};
        /*模态框中的 灾害类图层分组列表*/
        //self.allLayGroups_POS = [];
        /*模态框中的 科研类图层分组列表*/
        //self.allLayGroups_GEO = [];

        /*模态框中的 常用图层列表*/
        self.frequentlyLayers = [];

        /*模态框中的 数据排列形式  Collapse  Tile*/
        self.layerMenuType = "Tile";
        /*模态框 面包屑导航条 当前产品组*/
        self.currentGroup = {};
        self.currentLayer = {};
        self.currentInst = {};
        /*是否显示video面板*/
        self.isShownVideoPanel = false;

        /*video帧频*/
        self.fpsNum = 2;
        /*video play 标识: -1 stop; 0 pause; 1 play*/
        self.isVideoPlayed = -1;
        /*video 循环 标识*/
        self.isLooped = false;
        /*video latest24 标识*/
        self.isLatest24 = false;
        /**/
        self.topsideLayer = null;
        /*video 动画起始时间*/
        self.videoStartTime = moment(new Date());
        /*video 动画结束时间*/
        self.videoEndTime = moment(new Date());


        /*功能标签选择*/
        self.selectTab = _selectTab;
        self.selectTab_LayerMenuModal = _selectTab_LayerMenuModal;
        /*判断是否选中某个功能标签*/
        self.isSelectedTab = _isSelectedTab;
        self.isSelectedTab_LayerMenuModal = _isSelectedTab_LayerMenuModal;
        /*折叠菜单栏*/
        self.collapseMenu = _collapseMenu;
        self.extendMenu = _extendMenu;

        /*数据初始化*/
        self.init = _init;
        /*点击图层的眼睛 控制是否显示该图层*/
        self.eyeClick = _eyeClick;
        /*点击打开Layer选择菜单*/
        self.showLayerMenu = _showLayerMenu;

        // self.sortableOptions = _sortableOptions;
        /*在模态框中选择了一个图层项*/
        self.selectLayerItem = _selectLayerItem;
        /*在layer之下选则仪器*/
        self.selectInstonAboveLayer = _selectInstonAboveLayer;
        self.isInstSelected = _isInstSelected;
        /*添加产品到图层 （或者移除产品到图层）*/
        self.addThisProject = _addThisProject;
        /*移除选中的图层*/
        self.removeThisLayer = _removeThisLayer;
        /*打开video面板*/
        self.showVideoPanel = _showVideoPanel;


        /*播放video*/
        self.playVideo = _playVideo;
        /*停止video*/
        self.stopVideo = _stopVideo;
        /*设置video动画的时间范围*/
        self.setVideoTimeRange = _setVideoTimeRange;
        /*设置video动画播放最近24小时的数据*/
        self.playVideoLatest24 = _playVideoLatest24;

        /*   打开截图pannel*/
        self.showScreenShots = _showScreenShots;

        /*等待框显示*/
        self.isWaitingShow = false;

        /* 当前是否 3D模式*/
        self.isShown3D = false;

        /*用于显示当前动画状态*/
        self.showAnimeTitle = "";

        //关闭事件 调用刷新cookies
        window.onbeforeunload = function (e) {
            e = e || window.event;
            //刷新图层cookies
            _refreshLaysCookies();
            return;
        };

        _init();

        //时间轴控件发生日期改变时 重新加载所有图层
        timeLineElm.on("DateTimeChange", function (event, selectDate) {
            _refreshLayers();
        });

        /*帧频改变时 调整数值显示*/
        sliderFps.on("slideStop", function (slideEvt) {
            angular.element(document.getElementById("slider-fps-num")).text(slideEvt.value);
            self.fpsNum = slideEvt.value;
        });


        /**
         * 拖拽指令函数
         *
         * 不用function的形式 是因为 如果写成以下形式 则不会触发任何事件
         * this.sortableOptions = _sortableOptions;
         * function _sortableOptions() {
         *     return {
         *         stop: function (e, ui) {
         *             alert("stop");
         *             _refreshLayers();
         *         }
         *     }
         * }
         */
        self.sortableOptions = {
            // 完成拖拽动作
            stop: function (e, ui) {
                //触发openlayer控件的刷新
                _refreshLayers();
            }

        };

        /**
         * 停止播放动画
         * 清除所有动画预加载图层
         * @private
         */
        function _stopVideo() {
            if (self.isVideoPlayed > -1) {
                self.isVideoPlayed = -1;
                var layerNames = _pauseAnime();
                if (layerNames !== null && layerNames !== undefined) {
                    layerNames.forEach(function (item) {
                        ShinetekView.SatelliteView.removeLayer(item);
                    });
                }
                //对opanlayer 中待加载的所有数值清零20170518
                ShinetekView.SatelliteView.clearAnimate();
            }
            if (self.isMenuCollapse != 0) {
                self.isMenuCollapse = 0;
            }
            if (self.isWaitingShow) {
                self.isWaitingShow = false;
            }
        }

        /**
         * 设置video动画播放最近24小时的数据
         * @private
         */
        function _playVideoLatest24() {
            //1 设置标志, 时间范围区域 disable
            //2 获取播放图层的数据列表
            //3 根据最新数据计算动画的时间范围
            //4 在timeline中设置播放范围
            self.isLatest24 = !self.isLatest24;
            if (self.isLatest24) {
                if (self.baseLays.length < 1) return alert("请先添加一个产品");
                // self.topsideLayer = self.baseLays[0];
                _getTopLayer();
                self.videoStartTime = timeLine.getLatestDate(self.topsideLayer.projectName + self.topsideLayer._id, "minute").add(-24, "h");
                self.videoEndTime = timeLine.getLatestDate(self.topsideLayer.projectName + self.topsideLayer._id, "minute");
            }
        }


        /**
         * 设置video动画的时间范围
         * @param {String} unit 单位（Y=年; M=月; D=日)
         * @param {String} opt 操作方式 (plus=加; minus=减)
         * @param {Object} targetTime 目标时间
         * @private
         */
        function _setVideoTimeRange(unit, opt, targetTime) {

            if (self.isLatest24) return;

            var x;
            if (opt === 'plus') {
                x = 1;
            } else {
                x = -1;
            }
            if (unit === 'm') {
                x = 5 * x;
            }
            targetTime.add(x, unit)
        }

        /**
         * 播放动画
         * @private
         */
        function _playVideo() {
            //开始动画 隐藏菜单栏
            self.isMenuCollapse = 2;
            var orgFlg = self.isVideoPlayed;
            if (self.baseLays.length < 1) return alert("请先添加一个产品");


            //  self.topsideLayer = self.baseLays[0];
            if (orgFlg === -1 || orgFlg === 0) {
                self.isVideoPlayed = 1;
            } else if (orgFlg === 1) {
                self.isVideoPlayed = 0;
            }

            if (orgFlg === -1 && self.isVideoPlayed === 1) {
                //1 获取数据列表
                //2 启动动画
                _getTopLayer();
                if (self.isLatest24) {
                    _playLatestVideo(self.topsideLayer, null, orgFlg);
                } else {
                    _playNextVideo(self.topsideLayer, null, orgFlg);
                }
            } else if (orgFlg === 0 && self.isVideoPlayed === 1) {
                //1 继续动画
                if (self.isLatest24) {
                    _playLatestVideo(self.topsideLayer, null, orgFlg);
                } else {
                    _playNextVideo(self.topsideLayer, null, orgFlg);
                }

            } else if (orgFlg === 1 && self.isVideoPlayed === 0) {
                //1 暂停动画
                _pauseAnime();
                self.isMenuCollapse = 0;
            }

            /**
             * 播放最新的video
             * @param {Object} layerModule
             * @param {String} layerName
             * @param {Number} orgFlg
             * @private
             */
            function _playLatestVideo(layerModule, layerName, orgFlg) {
                if (self.baseLays.length < 1)
                    return alert("请先添加一个产品");
                // self.topsideLayer = self.baseLays[0];

                //只有在停止的时候 -->暂停的时候 不进行最上层 查找转化
                if (orgFlg != 0) {
                    _getTopLayer();
                }

                if (layerName !== null) {
                    ShinetekView.SatelliteView.removeLayer(layerName);
                }

                if (layerModule !== undefined) {
                    _getDataExistList(layerModule, function (m_timeLineList) {
                        timeLine.AddMinuteData(m_timeLineList);
                        self.videoStartTime = timeLine.getLatestDate(self.topsideLayer.projectName + self.topsideLayer._id, "minute").add(-24, "h");
                        self.videoEndTime = timeLine.getLatestDate(self.topsideLayer.projectName + self.topsideLayer._id, "minute");
                        var dateList = timeLine.getDataList(self.topsideLayer.projectName + self.topsideLayer._id, self.videoStartTime, self.videoEndTime, 'minute', self.topsideLayer.projectUrl);
                        var timespan = Math.floor(1000 / self.fpsNum);
                        if (orgFlg === -1) {
                            _initAnime(dateList);
                        }
                        _startAnime(timespan, function (err, layerName) {
                            if (self.isLooped) {
                                setTimeout(function () {
                                    _playLatestVideo(layerModule, layerName, -1);
                                }, 5000);
                            }
                        });
                    });
                }
            }

            /**
             * 循环播放
             * @param {Object} layerModule
             * @param {String} layerName
             * @param orgFlg
             * @private
             */
            function _playNextVideo(layerModule, layerName, orgFlg) {
                //1 移除最后加载的图层
                //2 重新读取控制参数
                //3 播放动画
                if (self.baseLays.length < 1)
                    return alert("请先添加一个产品");
                //self.topsideLayer = self.baseLays[0];
                //使用 函数查找最上面的可见图层
                //只有在暂停的情况下 才不再次确认最新图层
                if (orgFlg != 0) {
                    _getTopLayer();
                }
                if (layerName !== null) {
                    ShinetekView.SatelliteView.removeLayer(layerName);
                }
                var dateList = timeLine.getDataList(self.topsideLayer.projectName + self.topsideLayer._id, self.videoStartTime, self.videoEndTime, 'minute', self.topsideLayer.projectUrl);
                var timespan = Math.floor(1000 / self.fpsNum);
                if (orgFlg === -1) {
                    _initAnime(dateList);
                }
                _startAnime(timespan, function (err, layerName) {
                    if (self.isLooped) {
                        setTimeout(function () {
                            _playNextVideo(layerModule, layerName, -1);
                        }, 5000);
                    }
                });
            }
        }

        /**
         * 显示video面板
         */
        function _showVideoPanel() {
            self.isShownVideoPanel = !self.isShownVideoPanel;
        }

        /**
         * 显示截图面板 并向
         * @private
         */
        function _showScreenShots() {
            // self.isShownScreenShotPanel = !self.isShownScreenShotPanel;
            _getTopLayer();
            if (self.topsideLayer != null) {
                //获取当前最高图层信息

                var m_ShptAPI = '';
                if (self.topsideLayer.screenshotUrl) {
                    m_ShptAPI = self.topsideLayer.screenshotUrl;
                    /*     console.log("截图配置URL:");
                     console.log(self.topsideLayer.screenshotUrl);*/
                }
                else {
                    /*   console.log('当前截图图层为空！');*/
                }

                var m_ShotParam = self.topsideLayer.screenshotparam;
                //获取当前选择时间
                var m_TimeNow = moment(timeLine.GetShowDate()).utc();
                //年月日替换
                if (m_ShptAPI.indexOf('yyyy') > 0) {
                    m_ShptAPI = m_ShptAPI.replace('yyyy', m_TimeNow.format("YYYY"));
                }
                if (m_ShptAPI.indexOf('MM') > 0) {
                    m_ShptAPI = m_ShptAPI.replace('MM', m_TimeNow.format("MM"));
                }
                if (m_ShptAPI.indexOf('dd') > 0) {
                    m_ShptAPI = m_ShptAPI.replace('dd', m_TimeNow.format("DD"));
                }
                if (m_ShptAPI.indexOf('hh') > 0) {
                    m_ShptAPI = m_ShptAPI.replace('hh', m_TimeNow.format("HH"));
                }
                if (m_ShptAPI.indexOf('mm') > 0) {
                    m_ShptAPI = m_ShptAPI.replace('mm', m_TimeNow.format("mm"));
                }
                //向init传递参数
                //  console.log(m_ShptAPI);
                screenshots.init(m_ShptAPI, m_ShotParam);
            }
            else {
                // console.log("显示图层为空！");
                screenshots.init('', '');
            }
        }

        self.is3Dinit = false;
        self.switch3D = _switch3D;
        /*3D 切换函数*/
        function _switch3D() {
            console.log("_switch3D");
            if (self.isShown3D === false) {
                //当前为2D 显示 切换显示3D
                //_clearLayers();
                self.isShown3D = true;
                document.getElementsByClassName("glyphicon-mapType")[0].innerText = "2D";
                ShinetekView.SatelliteView.setMapFun("3D");
                //若未进行初始化 则 初始化
                if (!self.is3Dinit) {
                    ShinetekView.SatelliteView.init("http://10.24.10.108/IMAGEL2/GBAL/");
                    //将初始化 标志位
                    self.is3Dinit = true;
                    _refreshLayers();
                }
                else {
                    //若已经初始化 则移除当前所有显示图层 并重新刷新加载
                    ShinetekView.SatelliteView.removeAllLayer();
                    _refreshLayers();
                }
            }
            else {
                self.isShown3D = false;
                document.getElementsByClassName("glyphicon-mapType")[0].innerText = "3D";
                ShinetekView.SatelliteView.setMapFun("2D");
                _refreshLayers();
            }


            //  ShinetekView.Ol3Opt.init("http://10.24.10.108/IMAGEL2/GBAL/");


        }

        /* 切换时 删除所有当前图层*/
        function _clearLayers() {

            self.overLays.forEach(function (layModule) {
                _removeLayFromWMS(layModule);

            });
            self.overLays = [];
            self.baseLays.forEach(function (layModule) {
                _removeLayFromWMS(layModule);

            });
            self.baseLays = [];
        }

        /**
         * 重载所有已添加的图层
         * @private
         */
        function _refreshLayers() {
            var tmpList = [];
            //记住一条 图层列表 先进后出 才能保证 后加的在先加的之上；
            self.overLays.forEach(function (layModule) {
                //_removeLayFromWMS(layModule);
                //_addLayToWMS(layModule);
                tmpList.unshift(layModule);
            });
            self.baseLays.forEach(function (layModule) {
                //_removeLayFromWMS(layModule);
                //_addLayToWMS(layModule);
                tmpList.unshift(layModule);
            });
            for (var i = 0; i < tmpList.length; i++) {
                _removeLayFromWMS(tmpList[i]);
                _addLayToWMS(tmpList[i]);
            }
        }

        /**
         * 根据当前baseLays 重新设置顺序
         * @private
         */
        function _ResetDatOrder() {
            //根据图层顺序
            var newListOrder = [];
            self.baseLays.forEach(function (layModule) {
                var m_DataItem = [];
                m_DataItem.DataName = layModule.projectName + layModule._id;
                m_DataItem.Layeris_Show = layModule.isShow;
                newListOrder.push(m_DataItem);
            });
            //重设
            timeLine.ReSetLayerList(newListOrder);
        }

        /**
         * 刷新 保存 cookies 中图层信息的属性 关闭网页时调用
         * @private
         */
        function _refreshLaysCookies() {
            //删除原有图层cookies
            $cookies.remove("overLays");
            $cookies.remove("baseLays");
            //设置cookies时效
            var expireTime = new Date();
            expireTime.setDate(expireTime.getDate() + 7000);
            //加入新图层信息
            $cookies.putObject("overLays", self.overLays, {
                'expires': expireTime
            });
            $cookies.putObject("baseLays", self.baseLays, {
                'expires': expireTime
            });
        }

        /**
         * 从 layerList 移除 layer 对象
         * @param {Object} layer 目标图层对象
         * @param {Array} layerList 所属数组
         */
        function _removeThisLayer(layer, layerList) {
            //修复从cookies中获取的lay与当前列表lay不一致导致的取消显示后，列表勾选不取消的bug
            projectList.forEach(function (lay) {
                if (layer._id === lay._id) {
                    lay.isSelected = false;
                }
            });
            layer.isSelected = false;
            for (var i = 0; i < layerList.length; i++) {
                if (layer._id === layerList[i]._id) {
                    layerList.splice(i, 1);
                }
            }
            //移除
            _removeLayFromWMS(layer);
            //移除TimeLine
        }


        function _addThisProject(project) {
            project.isSelected = !project.isSelected;

            /**
             * TODO: 对应的图层列表也应该发生变化
             * 1. 添加到图层时 应判断是加入到 overLays 还是 baseLays中
             */
            if (project.layType === 'BASELAYERS') {
                if (project.isSelected === true) {
                    //增加
                    project.isShow = true;
                    self.baseLays.unshift(project);
                    _addLayToWMS(project);
                } else {
                    //移除
                    for (var i = 0; i < self.baseLays.length; i++) {
                        if (project._id === self.baseLays[i]._id) {
                            self.baseLays.splice(i, 1);
                        }
                    }
                    _removeLayFromWMS(project);
                }
            } else {
                if (project.isSelected === true) {
                    //增加
                    project.isShow = true;
                    self.overLays.unshift(project);
                    _addLayToWMS(project);
                } else {
                    //移除
                    for (var i = 0; i < self.overLays.length; i++) {
                        if (project._id === self.overLays[i]._id) {
                            self.overLays.splice(i, 1);
                        }
                    }
                    _removeLayFromWMS(project);
                }
            }
        }

        function _selectInstonAboveLayer(inst) {
            self.currentInst = inst;
            self.currentProjectList = inst.projectList;
        }

        function _isInstSelected(instName) {
            return (self.currentInst === undefined) ? false : self.currentInst.instName === instName;
        }

        function _selectLayerItem(layer, group) {
            self.layerMenuType = 'Collapse';
            self.currentGroup = group;
            self.currentLayer = layer;
            //默认第一个仪器被选中
            self.currentInst = (layer.group === undefined || layer.group.instGroupList.length < 1) ? undefined : layer.group.instGroupList[0];
            //每次点击 都要在$cookies.frequentlyUsed 中增加依次计数
            _frequentlyCount(layer, group.type);
        }

        function _frequentlyCount(layer, satType) {
            var frequentlyUsed = $cookies.getObject('frequently-used');
            frequentlyUsed.forEach(function (item) {
                if (item.layerName === layer.layerName && item.satType === satType) {
                    item.frequently++;
                }
            });
            var expireTime = new Date();
            expireTime.setDate(expireTime.getDate() + 7000);
            $cookies.putObject('frequently-used', frequentlyUsed, {
                'expires': expireTime
            });
        }

        /**
         * 初始化图层列表
         * @param cb
         * @private
         */
        function _initLayerMenuModal(cb) {
            WorldviewServices.getLayerGroupList(function (data) {
                self.tabGroups.splice(0, self.tabGroups.length);
                data.data.forEach(function (item) {
                    if (item.pictureUrl === "") {
                        item.pictureUrl = 'publics/Black.png';
                    }
                    var isExistTabGroup = false;
                    for (var i = 0; i < self.tabGroups.length; i++) {
                        if (self.tabGroups[i].type === item.type) {
                            self.tabGroups[i].allLayGroups.push(item);
                            isExistTabGroup = true;
                            break;
                        }
                    }
                    if (!isExistTabGroup) {
                        var tabGroup = {
                            type: item.type,
                            typeName: item.typeName,
                            allLayGroups: [],
                            frequentlyLayers: []
                        };
                        tabGroup.allLayGroups.push(item);
                        self.tabGroups.push(tabGroup);
                    }
                });
                if (self.tabGroups !== null && self.tabGroups !== undefined && self.tabGroups.length > 0) {
                    self.currentTabGroup = self.tabGroups[0];
                }
                // console.log(JSON.stringify(self.tabGroups));

                /**
                 * 初始化常用图层
                 * cookie 如果不存在常用图层 则创建一个
                 */
                _initFrequentlyLayers();


                //获取实际产品列表
                WorldviewServices.getProjectInfoList(function (data) {

                    projectList = [];

                    //为每一个产品对象增加 [isSelected]属性
                    //为每个产品对象增加一个 z-index 属性
                    data.data.forEach(function (item) {
                        item = _addAttributeToLayObj(item);
                        projectList.push(item);
                    });


                    //1. 为分组生成仪器列表
                    var layerGroupList = _groupProjectList(data);

                    //2. 将结果放入对应的分组
                    for (var xi = 0; xi < self.tabGroups.length; xi++) {
                        self.tabGroups[xi].allLayGroups.forEach(function (item) {
                            for (var i = 0; i < item.layers.length; i++) {
                                var layer = item.layers[i];
                                for (var j = 0; j < layerGroupList.length; j++) {
                                    var layerGroup = layerGroupList[j];
                                    if (layer.layerName === layerGroup.layerName && layerGroup.satType === item.type) {
                                        layer.group = layerGroup;
                                        layer.instString = '';
                                        var instGroup = layerGroup.instGroupList;
                                        instGroup.forEach(function (inst) {
                                            layer.instString += inst.instName + ' ';
                                        });
                                        break;
                                    }
                                }
                            }
                        });
                        // 同时放入常用图层分组
                        self.tabGroups[xi].frequentlyLayers.forEach(function (item) {
                            for (var j = 0; j < layerGroupList.length; j++) {
                                var layerGroup = layerGroupList[j];
                                if (item.layerName === layerGroup.layerName && layerGroup.satType === item.satType) {
                                    item.group = layerGroup;
                                    item.instString = '';
                                    var instGroup = layerGroup.instGroupList;
                                    instGroup.forEach(function (inst) {
                                        item.instString += inst.instName + ' ';
                                    });
                                    break;
                                }
                            }
                        });
                    }
                    if (cb !== undefined) {
                        cb();
                    }

                }, function (res) {

                });

            }, function (res) {

            });
        }

        /**
         * 为每一个产品对象增加属性
         * @param projectObj
         * @private
         */
        function _addAttributeToLayObj(projectObj) {

            /**
             * 为每一个产品对象增加 [isSelected]属性
             * 该属性用于控制产品对象是否被选中加入图层列表中。
             * @type {boolean}
             */
            projectObj.isSelected = false;

            /**
             * 该属性用于控制产品对象在openlayer中显示或隐藏。
             * 默认为 显示
             */
            projectObj.isShow = true;

            /**
             * 为每个产品对象增加一个 z-index 属性
             * 该选项用于在加入图层列表后标识应处于的层级
             * @type {number}
             */
            projectObj.zIndex = 0;

            return projectObj;
        }

        /**
         * 初始化常用图层列表
         * @param {type} name description
         */
        function _initFrequentlyLayers() {
            var frequentlyUsed = $cookies.getObject('frequently-used');
            if (frequentlyUsed === undefined) {
                // cookie 如果不存在常用图层 则创建一个
                var frequentlyUsed = [];

                for (var xi = 0; xi < self.tabGroups.length; xi++) {
                    self.tabGroups[xi].allLayGroups.forEach(function (item) {
                        for (var i = 0; i < item.layers.length; i++) {
                            var layer = item.layers[i];
                            var isExistLayer = false;
                            for (var j = 0; j < frequentlyUsed.length; j++) {
                                if (frequentlyUsed[j].layerName === layer.layerName && frequentlyUsed[j].satType === layer.satType) {
                                    isExistLayer = true;
                                    break;
                                }
                            }
                            if (isExistLayer === false) {
                                layer.frequently = 0;
                                layer.satType = item.type;
                                frequentlyUsed.push(layer);
                            }
                        }
                    });
                }

                var expireTime = new Date();
                expireTime.setDate(expireTime.getDate() + 7000);
                $cookies.putObject('frequently-used', frequentlyUsed, {
                    'expires': expireTime
                });
            } else {
                // filter data by satType
                for (var xi = 0; xi < self.tabGroups.length; xi++) {
                    var tmp = [];
                    var satType = self.tabGroups[xi].type;
                    frequentlyUsed.forEach(function (item) {
                        if (item.satType === satType) {
                            tmp.push(item);
                        }
                    });
                    tmp.sort(function (a, b) {
                        return -(a.frequently - b.frequently);
                    });
                    self.tabGroups[xi].frequentlyLayers.splice(0, self.frequentlyLayers.length);
                    var maxLength = (tmp.length > 5) ? 5 : tmp.length;
                    for (var k = 0; k < maxLength; k++) {
                        if (tmp[k].frequently != 0) {
                            self.tabGroups[xi].frequentlyLayers.push(tmp[k]);
                        }
                    }
                }

                // frequentlyUsed.sort(function (a, b) {
                //     return -(a.frequently - b.frequently);
                // });
                // self.frequentlyLayers.splice(0, self.frequentlyLayers.length);
                // var maxLength = (frequentlyUsed.length > 5) ? 5 : frequentlyUsed.length;
                // for (var k = 0; k < maxLength; k++) {
                //     if (frequentlyUsed[k].frequently != 0) {
                //         self.frequentlyLayers.push(frequentlyUsed[k]);
                //     }
                // }
            }
        }

        /**
         * 初始化图层组、卫星仪器、产品的分组列表
         *
         * @param {any} data
         * @returns
         */
        function _groupProjectList(data) {
            //1. 为分组生成仪器列表

            var instGroup = {
                instName: '',
                projectList: []
            };

            var layerGroup = {
                layerName: '',
                instString: '',
                instGroupList: []
            };

            var layerGroupList = [];

            data.data.forEach(function (item) {
                var isExistLayerGroup = false;
                for (var i = 0; i < layerGroupList.length; i++) {
                    var tmpLayerGroup = layerGroupList[i];
                    if (tmpLayerGroup.layerName === item.layerName && tmpLayerGroup.satType === item.satType) {
                        isExistLayerGroup = true;
                        //存在 此layerGroup 则看看instName 是否存在
                        var isExistInstGroup = false;
                        for (var j = 0; j < tmpLayerGroup.instGroupList.length; j++) {
                            var tmpInstGroup = tmpLayerGroup.instGroupList[j];
                            if (tmpInstGroup.instName === (item.satID + '/' + item.instID)) {
                                isExistInstGroup = true;
                                //存在 此instGroup 看看project 是否存在
                                var isExistProject = false;
                                for (var k = 0; k < tmpInstGroup.projectList.length; k++) {
                                    var tmpProject = tmpInstGroup.projectList[k];
                                    if (tmpProject.projectName === item.projectName) {
                                        //存在 此project
                                        isExistProject = true;
                                        break;
                                    }
                                }

                                if (isExistProject === false) {
                                    //不存在 此project
                                    tmpInstGroup.projectList.push(item);
                                }
                            }
                        }

                        if (isExistInstGroup === false) {
                            //不存在 此instGroup 创建新的 instGroup
                            var tmpInstGroup = {
                                instName: item.satID + '/' + item.instID,
                                satType: item.satType,
                                projectList: []
                            }

                            tmpInstGroup.projectList.push(item);
                            tmpLayerGroup.instGroupList.push(tmpInstGroup);
                        }
                    }
                }
                if (isExistLayerGroup === false) {
                    //不存在 此layerGroup 创建新的 layerGroup
                    var tmpLayerGroup = {
                        layerName: item.layerName,
                        satType: item.satType,
                        instGroupList: []
                    }

                    var tmpInstGroup = {
                        instName: item.satID + '/' + item.instID,
                        projectList: []
                    }

                    tmpInstGroup.projectList.push(item);
                    tmpLayerGroup.instGroupList.push(tmpInstGroup);
                    layerGroupList.push(tmpLayerGroup);
                }
            });

            return layerGroupList;
        }

        /**
         * 点击显示图层选择模态框
         */
        function _showLayerMenu() {
            layerMenu.modal({
                backdrop: 'static',
                keyboard: false
            });
        }

        /**
         * 点击加载或隐藏图层
         * @param layModule
         * @private
         */
        function _eyeClick(layModule) {
            layModule.isShow = !layModule.isShow;
            _setVisibilityFromWMS(layModule);
            _ResetDatOrder();
        }

        /**
         * 往控件中添加图层
         * @param layModule
         * @private
         */
        function _addLayToWMS(layModule) {
            console.log('_addLayToWMS');
            //var timeSelect = moment(timeLine.GetShowDate()).utc();
            var timeFindJson = timeLine.findDataExistList(layModule.projectName + layModule._id);
            var timeSelectStr = timeFindJson.TimeStrReturn;
            console.log("isFindExist:" + timeFindJson.isFindExist);
            var projectUrl = layModule.projectUrl;
            projectUrl = projectUrl.replace('yyyyMMddHHmmss', timeSelectStr);
            ShinetekView.SatelliteView.addLayer(layModule._id, layModule.layerName, projectUrl, "false", layModule.mapType);
            console.log('timeSelectStr:' + timeSelectStr);
            /* var projectUrl = layModule.projectUrl;
             if (projectUrl.indexOf('yyyy') > 0) {
             projectUrl = projectUrl.replace('yyyy', moment(timeLine.GetShowDate()).utc().format("YYYY"));
             }
             if (projectUrl.indexOf('MM') > 0) {
             projectUrl = projectUrl.replace('MM', moment(timeLine.GetShowDate()).utc().format("MM"));
             }
             if (projectUrl.indexOf('dd') > 0) {
             projectUrl = projectUrl.replace('dd', moment(timeLine.GetShowDate()).utc().format("DD"));
             }
             if (projectUrl.indexOf('hh') > 0) {
             projectUrl = projectUrl.replace('hh', moment(timeLine.GetShowDate()).utc().format("HH"));
             }
             if (projectUrl.indexOf('mm') > 0) {
             projectUrl = projectUrl.replace('mm', moment(timeLine.GetShowDate()).utc().format("mm"));
             }

             ShinetekView.SatelliteView.addLayer(layModule._id, layModule.layerName, projectUrl, "false", layModule.mapType);
             */

            // 待测试 如果为OVERLAYERS图层 则使用 原IndexZ 添加3000 liuyp
            if (layModule.layType === "OVERLAYERS") {
                // var m_id=layModule._id
                /*
                 var layadd = 3000;
                 if (ShinetekView.Ol3Opt.getZIndex(layModule._id)) {
                 layadd = ShinetekView.Ol3Opt.getZIndex(layModule._id) + 3000;
                 }
                 ShinetekView.Ol3Opt.setZIndex(layModule._id, layadd);*/
            }
            if (layModule.isShow === false) {
                _setVisibilityFromWMS(layModule);
            }
            //只对base的数据进行排序
            if (layModule.layType !== "OVERLAYERS") {
                //获取数据存在列表
                _getDataExistList(layModule, function (m_timeLineList) {
                    //根据列表反向查找， 再次添加
                    console.log(m_timeLineList);
                    timeLine.AddMinuteData(m_timeLineList);
                    _ResetDatOrder();

                    /*   var TimeBeginStr = _FindTimeBegin(m_timeLineList, timeSelect);
                     var projectUrl = layModule.projectUrl;
                     projectUrl = projectUrl.replace('yyyyMMddHHmmss', TimeBeginStr);
                     console.log('projectUrl:' + projectUrl);
                     ShinetekView.SatelliteView.addLayer(layModule._id, layModule.layerName, projectUrl, "false", layModule.mapType);

                     */
                });

                //获取图层调色板
                _getProjectPalette(layModule, function (err, paletteModule) {
                    if (err) {
                        console.log(err);
                    }
                    if (paletteModule !== undefined) {
                        var paletteDivID = "palette" + layModule._id;
                        var palette = new Palette();
                        palette.init_palette(paletteDivID, paletteModule);
                    }
                });
            }
        }

        /**
         * 获取产品调色板
         * @param {Object} layModule
         * @param {Function} next
         */
        function _getProjectPalette(layModule, next) {
            if (layModule.paletteUrl === undefined || layModule.paletteUrl === "") {
                next(null, undefined);
            } else {
                WorldviewServices.getProjectPalette(layModule.paletteUrl, function (res) {
                    next(null, res);
                }, function (res) {
                    next(new Error("获取调色板失败，请检查产品配置"), undefined);
                });
            }
        }

        /**
         * 从WMS控件中移除图层
         * @param layModule
         * @private
         */
        function _removeLayFromWMS(layModule) {
            ShinetekView.SatelliteView.removeLayer(layModule._id, layModule.mapType);


            //对基准图进行操作不影响数据图层
            if (layModule.layType != "OVERLAYERS") {
                //_removeDataExistList(layModule);
            }
        }

        /**
         * 根据传入的图层 控制其显示与隐藏
         *
         * @param {any} layModule
         */
        function _setVisibilityFromWMS(layModule) {
            ShinetekView.SatelliteView.setVisibility(layModule._id, layModule.mapType);
        }


        /**
         * 根据传入的图层对象 获取其数据存在列表 添加年月日全数据
         * @param {Object} layModule 图层对象（产品对象）
         * @param {Function} next callback
         * @callback next
         */
        function _getDataExistList_H8(layModule, next) {
            if (layModule.dataListUrl === '') {
                return;
            }
            WorldviewServices.getDataExistList(layModule.dataListUrl, function (data) {
                var m_timeLineListMinutes = [];
                //    var timeLineObj = {};
                if (data.dataList_Minute !== undefined && data.dataList_Minute.length > 0) {

                    //分钟数据
                    var timeLineObj_Min = {
                        DataName: layModule.projectName + layModule._id,
                        DataInfo: data.dataList_Minute,
                        Layeris_Show: true
                    };
                    //日数据
                    var timeLineObj_Day = {
                        DataName: layModule.projectName + layModule._id,
                        DataInfo: data.dataList_Day,
                        Layeris_Show: true
                    };
                    //月数据
                    var timeLineObj_Month = {
                        DataName: layModule.projectName + layModule._id,
                        DataInfo: data.dataList_Month,
                        Layeris_Show: true
                    };
                    //年数据
                    var timeLineObj_Year = {
                        DataName: layModule.projectName + layModule._id,
                        DataInfo: data.dataList_Year,
                        Layeris_Show: true
                    };
                    m_timeLineListMinutes.push(timeLineObj_Min);
                    m_timeLineListMinutes.push(timeLineObj_Day);
                    m_timeLineListMinutes.push(timeLineObj_Month);
                    m_timeLineListMinutes.push(timeLineObj_Year);
                    next(m_timeLineListMinutes);
                }
            }, function (data) {
                var m_timeLineListMinutes = [];
                //失败也需要使用名称进行占位
                //分钟数据
                var timeLineObj_Min = {
                    DataName: layModule.projectName + layModule._id,
                    DataInfo: [],
                    Layeris_Show: true
                };
                //日数据
                var timeLineObj_Day = {
                    DataName: layModule.projectName + layModule._id,
                    DataInfo: [],
                    Layeris_Show: true
                };
                //月数据
                var timeLineObj_Month = {
                    DataName: layModule.projectName + layModule._id,
                    DataInfo: [],
                    Layeris_Show: true
                };
                //年数据
                var timeLineObj_Year = {
                    DataName: layModule.projectName + layModule._id,
                    DataInfo: [],
                    Layeris_Show: true
                };
                m_timeLineListMinutes.push(timeLineObj_Min);
                m_timeLineListMinutes.push(timeLineObj_Day);
                m_timeLineListMinutes.push(timeLineObj_Month);
                m_timeLineListMinutes.push(timeLineObj_Year);
                next(m_timeLineListMinutes);
            });
        }

        function _getDataExistList(layModule, next) {
            console.log('_getDataExistList');
            if (layModule.dataListUrl === '') {
                return;
            }
            WorldviewServices.getDataExistList(layModule.dataListUrl, function (data) {
                console.log('get data ok');
                var m_timeLineListMinutes = [];
                //    var timeLineObj = {};
                if (data && data.length > 0) {

                    //分钟数据
                    var timeLineObj_Min = {
                        DataName: layModule.projectName + layModule._id,
                        DataInfo: data,
                        Layeris_Show: true
                    };
                    m_timeLineListMinutes.push(timeLineObj_Min);
                    timeLineListDataAll.push(timeLineObj_Min);
                    next(m_timeLineListMinutes);
                }
            }, function (data) {
                var m_timeLineListMinutes = [];
                //失败也需要使用名称进行占位
                //整体数据
                var timeLineObj_Min = {
                    DataName: layModule.projectName + layModule._id,
                    DataInfo: [],
                    Layeris_Show: true
                };
                m_timeLineListMinutes.push(timeLineObj_Min);
                timeLineListDataAll.push(timeLineObj_Min);
                next(m_timeLineListMinutes);
            });
        }

        /**
         * 移除当前显示的列表
         * @param layModule
         * @private
         */
        function _removeDataExistList(layModule) {
            //移除函数
            timeLine.RemoveLayerDataByName(layModule.projectName + layModule._id);
        }

        /**
         * 根据传入的图层列表 初始化map控件
         * @param lays (self.baseLays + self.overLays)
         * @private
         */
        function _initMap() {
            //根据配置初始化底图
            ShinetekView.SatelliteView.init(Config_Total.BASETILEURL);
            //ShinetekView.Ol3Opt.init(Config_Total.BASETILEURL);
            //初始化截图框
            $("#snapshot").load("lib/screenshot/photo.html", function () {
                // screenshots.init("http://img1.3lian.com/2015/w7/98/d/22");
            });
        }


        /**
         * 生成一个初始化的lays清单。
         * @returns {Array}
         * @private
         */
        function _initLays() {

            /**
             * 一定在这里要注意图层的顺序
             * 由于OpenLayer无法控制
             */

            projectList.forEach(function (lay) {

                if (lay.isDefault === true) {
                    if (lay.layType === 'BASELAYERS') {
                        self.baseLays.push(lay);
                    } else
                        self.overLays.push(lay);
                    lay.isSelected = true;
                    _addLayToWMS(lay);
                }
            });
        }

        /**
         * 从cookie中获取上次保存的列表
         * @private
         */
        function _initLaysbycondition() {
            //baseLays 获取cookies
            var m_baseLays = $cookies.getObject('baseLays');
            var m_overLays = $cookies.getObject('overLays');
            if (m_baseLays === null || m_overLays === null) {
                _initLays();
            } else {
                //修改为缓存图层为空时，自动添加新图层
                if (m_baseLays.length > 0 || m_overLays.length > 0) {
                    //进行初始化 根据 cookies 进行初始化
                    _initLaysFromCookies();
                } else {
                    //根据数据库基础数据信息进行初始化
                    _initLays();
                }
            }
        }

        /**
         * 根据cookies初始化图层列表
         * @private
         */
        function _initLaysFromCookies() {
            //baseLays 获取cookies
            var m_baseLays = $cookies.getObject('baseLays');
            var m_overLays = $cookies.getObject('overLays');
            //若Cookies m_baseLays 不为空 加入列表 并加入界面显示
            if (m_baseLays) {
                //遍历添加数据
                m_baseLays.forEach(function (lay) {
                    //判断当前现有列表中 是否存在缓存数据
                    var is_In = false;
                    self.baseLays.forEach(function (layBase) {
                        ////使用——id 判断 唯一性标识
                        if (layBase._id === lay._id) {
                            is_In = true;
                        }
                    });
                    if (!is_In) {
                        self.baseLays.push(lay);
                        _addLayToWMS(lay);
                    }
                });
            }
            //若Cookies m_overLays 不为空 加入列表 并加入界面显示
            if (m_overLays) {
                m_overLays.forEach(function (lay) {
                    //判断当前现有列表中 是否存在缓存数据 与配置中的设置部分叠加
                    var is_In = false;
                    self.overLays.forEach(function (layBase) {
                        //使用——id 判断 唯一性标识
                        if (layBase._id === lay._id) {
                            is_In = true;
                        }
                    });
                    if (!is_In) {
                        self.overLays.push(lay);
                        _addLayToWMS(lay);
                    }
                });
            }

            //遍历显示列表
            projectList.forEach(function (lay) {
                self.baseLays.forEach(function (inlay) {
                    if (inlay._id === lay._id) {
                        lay.isSelected = true;
                    }
                });
                self.overLays.forEach(function (inlay) {
                    if (inlay._id === lay._id) {
                        lay.isSelected = true;
                    }
                });
            });
        }

        /**
         * 时间轴初始化
         * @private
         */
        function _initTimeLine() {
            timeLine.init("timeLine", "DAY");
        }

        /**
         * 初始化函数
         * @private
         */
        function _init() {

            //初始化video动画播放时间范围
            var tmp = moment(new Date());
            self.videoEndTime = moment(tmp.add(1, "h").format("YYYY-MM-DD HH:00:00"));
            self.videoStartTime = moment(tmp.add(-1, "d").format("YYYY-MM-DD HH:00:00"));

            //初始化图层列表
            _initLayerMenuModal(function () {

                try {
                    //根据默认图层初始化openlayer
                    _initMap();

                    //根据当前COOKIES条件对图层信息进行初始化，若当前不存在图层信息缓存，则使用数据库返回默认配置信息刷新
                    _initLaysbycondition();
                } catch (err) {
                }
                finally {
                    //初始化时间轴控件
                    _initTimeLine();
                    _getTopLayer();
                }
            });


        }


        function _isSelectedTab(tabName) {
            return self.currentTab === tabName;
        }

        function _selectTab(tabName) {
            self.currentTab = tabName;
        }

        function _isSelectedTab_LayerMenuModal(tabGroupModule) {
            // if (self.currentTabGroup === undefined) {
            //     self.currentTabGroup = self.tabGroups[0];
            // }
            return self.currentTabGroup === tabGroupModule;
        }

        function _selectTab_LayerMenuModal(tabGroupModule) {
            self.currentTabGroup = tabGroupModule;
        }

        /**
         * 折叠菜单栏 1隐藏
         */
        function _collapseMenu() {
            self.isMenuCollapse = 1;
        }

        /**
         * 展开菜单栏 0显示
         */
        function _extendMenu() {
            self.isMenuCollapse = 0;
        }

        //需要进行动画的数据信息
        self.animedata = [];

        //定时器 动画控制 相关变量 以下变量均为未进行部分 即下一个循环需要进行的部分
        var anime_timer;
        //移除图层的num 初始化 -- 0 （初始化 未进行移除，将要移除第0层数据）
        var remove_layer_num = 0;
        //当前现实图层num 初始化 -- 1 （初始化 显示图层0）
        var show_layer_num = 1;
        //添加图层num 初始化 -- 4 （初始化 添加 0 1 2 3 层，将要添加层数：4）
        var add_layer_num = 4;

        /**
         * 点击暂停开始等调用事件
         * @private
         */
        function _anime_Begin(timespan, callback) {
            //获取动画长度
            var m_NumMax = self.animedata.length;
            var m_DataAll = self.animedata;
            //对定时器赋值
            anime_timer = setInterval(function () {
                //若下一个图层加载成功，则进行添加和移除
                if (ShinetekView.SatelliteView.oGetStatus()) {
                    self.isWaitingShow = false;
                    //判断移除值域
                    if (remove_layer_num < m_NumMax) {
                        //移除上一层的显示
                        ShinetekView.SatelliteView.removeLayer(m_DataAll[remove_layer_num].LayerTimeName, "TMS");
                        remove_layer_num++;
                    }

                    //判断当前显示值域
                    if (show_layer_num < m_NumMax) {
                        var m_TimeStr = "";
                        //字符串拼接 反向获取数值
                        if (self.topsideLayer != null) {
                            var m_baseUrl = self.topsideLayer.projectUrl;
                            var m_targetUrl = m_DataAll[show_layer_num].LayerTimeUrl;
                            //查找年
                            if (m_baseUrl.indexOf("yyyy") >= 0) {
                                m_TimeStr = m_targetUrl.substr(m_baseUrl.indexOf("yyyy"), 4);
                            }
                            if (m_baseUrl.indexOf('MM') > 0) {
                                m_TimeStr = m_TimeStr + "-" + m_targetUrl.substr(m_baseUrl.indexOf("MM"), 2);
                            }
                            if (m_baseUrl.indexOf('dd') > 0) {
                                m_TimeStr = m_TimeStr + "-" + m_targetUrl.substr(m_baseUrl.indexOf("dd"), 2);
                            }
                            if (m_baseUrl.indexOf('hh') > 0) {
                                m_TimeStr = m_TimeStr + " " + m_targetUrl.substr(m_baseUrl.indexOf("hh"), 2);
                            }
                            if (m_baseUrl.indexOf('mm') > 0) {
                                m_TimeStr = m_TimeStr + ":" + m_targetUrl.substr(m_baseUrl.indexOf("mm"), 2);
                            }
                        }
                        //拼接当前显示的title信息 使用<br> 换行

                        self.showAnimeTitle = self.topsideLayer.projectName + "(" + show_layer_num + "/" + m_DataAll.length + ")";
                        var m_ShowTitle = "星标:" + self.topsideLayer.satID + " <br>"
                            + "仪器:" + self.topsideLayer.instID + "<br>"
                            + "产品:" + self.topsideLayer.projectName + "<br>"
                            + "时次:" + m_TimeStr;
                        ShinetekView.SatelliteView.setScreenTitle(m_ShowTitle);
                        show_layer_num++;
                        //   ShinetekView.Ol3Opt.setScreenTitle(show_layer_num);
                        if (show_layer_num === m_NumMax) {
                            //结束当前定时器
                            _pauseAnime();
                            callback(null, m_DataAll[show_layer_num - 1].LayerTimeName);
                            return;
                        }
                    }
                    //判断添加值域
                    if (add_layer_num < m_NumMax) {
                        //设置当前图层状态为显示模式
                        ShinetekView.SatelliteView.addLayer(m_DataAll[add_layer_num].LayerTimeName, "TMS3", m_DataAll[add_layer_num].LayerTimeUrl, "false", "TMS"); //0
                        ShinetekView.SatelliteView.setZIndex(m_DataAll[add_layer_num].LayerTimeName, m_DataAll[add_layer_num].LayerTimeIndexZ);
                        add_layer_num++;
                    }
                }
                else {
                    self.isWaitingShow = true;
                    // console.log("当前所有图层 未加载完成 标志位:" + m_Flag);
                }
            }, timespan);
        }

        /**
         * 点击暂停时钟
         * @private
         */
        function _pauseAnime() {
            clearInterval(anime_timer);
            var m_showList = [];

            //移除当前显示的信息 暂停的时候个人认为不需要删除显示
            // ShinetekView.Ol3Opt.setScreenTitle(" ");
            //根据当前的 remove_layer_num add_layer_num
            //遍历获取 当前所有 已经添加 但是未被移除的图层名称
            for (var w = remove_layer_num; w <= add_layer_num; w++) {
                if (w < self.animedata.length) {
                    m_showList.push(self.animedata[w].LayerTimeName);
                }
            }
            return m_showList;
        }

        /**
         * 初始化动画 - 预加载图层
         * @param JsonData json数据内容（TimeLine 返回的,需要处理）
         * @param next
         * @private
         */
        function _initAnime(JsonData) {
            //存储 JsonData
            var m_TotalList = [];
            self.animedata = [];
            //去重复
            var m_UrlList = JsonData.UrlList;
            var m_proid = JsonData._id;
            var index_z_max = 550;
            if (JsonData != undefined &&
                m_UrlList != undefined && m_UrlList.length > 0 &&
                m_proid != undefined) {
                //遍历 存在数据 的URL的列表
                for (var t = 0; t < m_UrlList.length; t++) {
                    var m_itemInfo = [];
                    m_itemInfo.LayerTimeUrl = m_UrlList[t];
                    m_itemInfo.LayerTimeName = m_proid + "_" + t;
                    m_itemInfo.LayerTimeIndexZ = index_z_max + m_UrlList.length - t;
                    m_TotalList.push(m_itemInfo);
                }
                self.animedata = m_TotalList;
            }
            //var m_HidenList = [];
            //初始化值
            remove_layer_num = 0;
            show_layer_num = 1;
            add_layer_num = 2;
            // var m_NumNow = self.animedata.length;
            //20170517 修改最小动画范围小于 4的情况
            if (self.animedata.length < add_layer_num) {
                console.warn("当前设置动画最小帧数为:" + add_layer_num + "。\n当前选择时间范围内，有效数据数为：" + self.animedata.length);
                add_layer_num = self.animedata.length;
            }
            for (var i = remove_layer_num; i < add_layer_num; i++) {
                ShinetekView.SatelliteView.addLayer(self.animedata[i].LayerTimeName, "TMS3", self.animedata[i].LayerTimeUrl, "false", "TMS");
                ShinetekView.SatelliteView.setZIndex(self.animedata[i].LayerTimeName, self.animedata[i].LayerTimeIndexZ);
            }

        }

        /**
         * 开始动画
         * @param timespan 时间间隔 毫秒为单位 int 例如500
         * @param next
         * @private
         */
        function _startAnime(timespan, next) {
            //判断 timespan 若非数字类型
            if (typeof timespan != "number") {
                timespan = parseInt(timespan);
            }
            //开始此次循环
            if (timespan > 0) {
                _anime_Begin(timespan, next);
            }
        }


        /**
         * 获取当前最新的URL
         * @private
         */
        function _getTopLayer() {
            var m_flag = false;
            if (self.baseLays != null) {
                for (var i = 0; i < self.baseLays.length; i++) {
                    if (!m_flag) {
                        if (self.baseLays[i].isShow === true) {
                            self.topsideLayer = self.baseLays[i];
                            m_flag = true;
                            return true;
                        }
                    }
                }
            }
            if (!m_flag) {
                self.topsideLayer = null;
                return false;
            }

        }

        /**
         * 获取当前 字段及  layModule  范围内数据开始时间
         * @param layModule
         */
        function _getLayerUrlReplace(layModule) {
            var projectUrl = layModule.projectUrl;
            var BaseTimeStr = timeLine.GetShowDate();

            if (projectUrl.indexOf('yyyy') > 0) {
                projectUrl = projectUrl.replace('yyyy', moment(timeLine.GetShowDate()).utc().format("YYYY"));
            }
            return projectUrl;

        }

        /**
         * 查找当前匹配的时间段
         * @param dataInfoList
         * @param dataStr
         * @returns {*}
         * @private
         */
        function _FindTimeBegin(dataInfoList, dataStr) {
            console.log('_FindTimeBegin');
            var dataStrNew = dataStr.format('YYYYMMDDHHmmss');
            var isFind = false;
            if (dataInfoList.length > 0) {
                dataInfoList.forEach(function (dataInfoItem) {
                    //若没有找到匹配
                    if (!isFind) {
                        var beginTimem = moment.utc(dataInfoItem.BeginTime);
                        var endTimem = moment.utc(dataInfoItem.EndTime);
                        var timeSelect = moment.utc(dataStr);
                        if (timeSelect.isBetween(beginTimem, endTimem)) {
                            dataStrNew = beginTimem.format('YYYYMMDDHHmm') + "00";
                            isFind = true;
                            console.log("Find Begin!");
                        }
                    }
                });
            }
            console.log("dataStrNew:" + dataStrNew);
            return dataStrNew;

        }
    }


})
();
