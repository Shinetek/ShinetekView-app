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
        var timeLineListMinutes = [];
        //数据存在列表 - 维护所有日间隔产品的数组
        var timeLineListDay = [];
        //数据存在列表 - 维护所有月间隔产品的数组
        var timeLineListMonth = [];
        //数据存在列表 - 维护所有年间隔产品的数组
        var timeLineListYear = [];

        var timeLine = new TimeLine();
        var layerMenu = angular.element(document.getElementById("layerMenu"));
        var timeLineElm = angular.element(document.getElementById("timeLine"));
        var sliderFps = angular.element(document.getElementById("slider-fps")).slider();
        /*var overlaysZone = angular.element(document.getElementById('overlays-zone'));*/

        self.currentTab = "Layer";
        self.currentTab_LayerMenuModal = "POS";
        self.overLays = [];
        self.baseLays = [];
        /**标记菜单是否折叠 */
        self.isMenuCollapse = false;
        /*模态框中的 灾害类图层分组列表*/
        self.allLayGroups_POS = [];
        /*模态框中的 科研类图层分组列表*/
        self.allLayGroups_GEO = [];

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
        /*video play 标识*/
        self.isVideoPlayed = false;
        /*video 循环 标识*/
        self.isLooped = false;
        /*video latest24 标识*/
        self.isLatest24 = false;
        /**/
        self.topsideLayer = {};
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
        /*设置video动画的时间范围*/
        self.setVideoTimeRange = _setVideoTimeRange;
        /*设置video动画播放最近24小时的数据*/
        self.playVideoLatest24 = _playVideoLatest24;

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
                self.topsideLayer = self.baseLays[0];
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
                x = 15 * x;
            }
            targetTime.add(x, unit)
        }

        /**
         * 播放动画
         * @private
         */
        function _playVideo() {
            self.isVideoPlayed = !self.isVideoPlayed;
            if (self.isVideoPlayed) {
                //1 获取数据列表
                //2 启动动画
                _playNextVideo(null);
            } else {
                _stopAnime(function (layerNames) {
                    if (layerNames !== null || layerNames !== undefined) {
                        layerNames.forEach(function (item) {
                            Shinetek.Ol3Opt.removeLayer(item);
                        });
                    }
                });
            }

            function _playNextVideo(layerName) {
                //1 移除最后加载的图层
                //2 重新读取控制参数
                //3 播放动画
                if (layerName !== null) {
                    Shinetek.Ol3Opt.removeLayer(layerName);
                }
                var dateList = timeLine.getDataList(self.topsideLayer.projectName + self.topsideLayer._id, self.videoStartTime, self.videoEndTime, 'minute', self.topsideLayer.projectUrl);
                var timespan = Math.floor(1000 / self.fpsNum);
                _startAnime(dateList, timespan, function (err, layerName) {
                    if (self.isLooped) {
                        setTimeout(function () {
                            _playNextVideo(layerName);
                        }, 3000);
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
         * 重载所有已添加的图层
         * @private
         */
        function _refreshLayers() {
            var tmpList = [];
            timeLineListMinutes = [];
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
                if (layer._id == lay._id) {
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
            _frequentlyCount(layer.layerName);
        }

        function _frequentlyCount(layerName) {
            var frequentlyUsed = $cookies.getObject('frequently-used');
            frequentlyUsed.forEach(function (item) {
                if (item.layerName === layerName) {
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
                self.allLayGroups_POS.splice(0, self.allLayGroups_POS.length);
                self.allLayGroups_GEO.splice(0, self.allLayGroups_GEO.length);
                data.data.forEach(function (item) {
                    if (item.type === 'POS') {
                        if (item.pictureUrl === "") {
                            item.pictureUrl = 'publics/Black.png'
                        }
                        self.allLayGroups_POS.push(item);
                    } else if (item.type === 'GEO') {
                        if (item.pictureUrl === "") {
                            item.pictureUrl = 'publics/Black.png'
                        }
                        self.allLayGroups_GEO.push(item);
                    }
                });

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
                    self.allLayGroups_POS.forEach(function (item) {
                        for (var i = 0; i < item.layers.length; i++) {
                            var layer = item.layers[i];
                            for (var j = 0; j < layerGroupList.length; j++) {
                                var layerGroup = layerGroupList[j];
                                if (layer.layerName === layerGroup.layerName && layerGroup.satType === 'POS') {
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

                    self.allLayGroups_GEO.forEach(function (item) {
                        for (var i = 0; i < item.layers.length; i++) {
                            var layer = item.layers[i];
                            for (var j = 0; j < layerGroupList.length; j++) {
                                var layerGroup = layerGroupList[j];
                                if (layer.layerName === layerGroup.layerName && layerGroup.satType === 'GEO') {
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

                    //3. 别忘了常用图层列表
                    self.frequentlyLayers.forEach(function (layer) {
                        for (var j = 0; j < layerGroupList.length; j++) {
                            var layerGroup = layerGroupList[j];
                            if (layer.layerName === layerGroup.layerName) {
                                layer.group = layerGroup;
                                layer.instString = '';
                                var instGroup = layerGroup.instGroupList;
                                instGroup.forEach(function (inst) {
                                    layer.instString += inst.instName + ' ';
                                });
                                break;
                            }
                        }
                    });
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
                self.allLayGroups_POS.forEach(function (item) {
                    for (var i = 0; i < item.layers.length; i++) {
                        var layer = item.layers[i];
                        var isExistLayer = false;
                        for (var j = 0; j < frequentlyUsed.length; j++) {
                            if (frequentlyUsed[j].layerName === layer.layerName) {
                                isExistLayer = true;
                                break;
                            }
                        }
                        if (isExistLayer === false) {
                            layer.frequently = 0;
                            frequentlyUsed.push(layer);
                        }
                    }
                });
                self.allLayGroups_GEO.forEach(function (item) {
                    for (var i = 0; i < item.layers.length; i++) {
                        var layer = item.layers[i];
                        var isExistLayer = false;
                        for (var j = 0; j < frequentlyUsed.length; j++) {
                            if (frequentlyUsed[j].layerName === layer.layerName) {
                                isExistLayer = true;
                                break;
                            }
                        }
                        if (isExistLayer === false) {
                            layer.frequently = 0;
                            frequentlyUsed.push(layer);
                        }
                    }
                });

                var expireTime = new Date();
                expireTime.setDate(expireTime.getDate() + 7000);
                $cookies.putObject('frequently-used', frequentlyUsed, {
                    'expires': expireTime
                });
            } else {
                frequentlyUsed.sort(function (a, b) {
                    return -(a.frequently - b.frequently);
                });
                self.frequentlyLayers.splice(0, self.frequentlyLayers.length);
                var maxLength = (frequentlyUsed.length > 5) ? 5 : frequentlyUsed.length;
                for (var k = 0; k < maxLength; k++) {
                    if (frequentlyUsed[k].frequently != 0) {
                        self.frequentlyLayers.push(frequentlyUsed[k]);
                    }
                }
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
                var isExistLayerGroup = false
                for (var i = 0; i < layerGroupList.length; i++) {
                    var tmpLayerGroup = layerGroupList[i];
                    if (tmpLayerGroup.layerName === item.layerName && tmpLayerGroup.satType === item.satType) {
                        isExistLayerGroup = true;
                        //存在 此layerGroup 则看看instName 是否存在
                        var isExistInstGroup = false
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
            var projectUrl = layModule.projectUrl;
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
            Shinetek.Ol3Opt.addLayer(layModule._id, layModule.layerName, projectUrl, "false", layModule.mapType);
            if (layModule.isShow === false) {
                _setVisibilityFromWMS(layModule);
            }
            //只对base的数据进行排序
            if (layModule.layType != "OVERLAYERS") {
                //获取数据存在列表
                _getDataExistList(layModule, function (m_timeLineList) {
                    timeLine.AddMinuteData(m_timeLineList);
                    _ResetDatOrder();
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
            Shinetek.Ol3Opt.removeLayer(layModule._id, layModule.mapType);
            //对基准图进行操作不影响数据图层
            if (layModule.layType != "OVERLAYERS") {
                _removeDataExistList(layModule);
            }
        }

        /**
         * 根据传入的图层 控制其显示与隐藏
         *
         * @param {any} layModule
         */
        function _setVisibilityFromWMS(layModule) {
            Shinetek.Ol3Opt.setVisibility(layModule._id, layModule.mapType);
        }


        /**
         * 根据传入的图层对象 获取其数据存在列表 添加年月日全数据
         * @param {Object} layModule 图层对象（产品对象）
         * @param {Function} next callback
         * @callback next
         */
        function _getDataExistList(layModule, next) {
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
            Shinetek.Ol3Opt.init(Config_Total.BASETILEURL);
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
            if (m_baseLays == null || m_overLays == null) {
                _initLays();
            } else {
                /*
                 console.log(m_baseLays);
                 console.log(m_overLays);
                 */
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
                            //  console.log("存在");
                            is_In = true;
                        }
                        //  else   console.log("不存在");
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
            timeLine.Init("timeLine", "MINUTE");
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

                //根据默认图层初始化openlayer
                _initMap();

                //根据当前COOKIES条件对图层信息进行初始化，若当前不存在图层信息缓存，则使用数据库返回默认配置信息刷新
                _initLaysbycondition();

                //初始化时间轴控件
                _initTimeLine();

            });


        }


        function _isSelectedTab(tabName) {
            return self.currentTab === tabName;
        }

        function _selectTab(tabName) {
            self.currentTab = tabName;
        }

        function _isSelectedTab_LayerMenuModal(tabName) {
            return self.currentTab_LayerMenuModal === tabName;
        }

        function _selectTab_LayerMenuModal(tabName) {
            self.currentTab_LayerMenuModal = tabName;
        }

        /**
         * 折叠菜单栏
         */
        function _collapseMenu() {
            self.isMenuCollapse = true;
        }

        /**
         * 展开菜单栏
         */
        function _extendMenu() {
            self.isMenuCollapse = false;
        }


        //需要进行动画的数据信息
        self.animedata = [];

        //定时器 动画控制 相关变量
        var anime_timer;
        //移除图层的num
        var remove_layer_num;
        //当前现实图层num
        var show_layer_num;
        //添加图层num
        var add_layer_num;

        /**
         * 点击暂停开始等调用事件
         * @private
         */
        function _anime_Begin(timespan, callback) {
            var m_NumMax = self.animedata.length;
            var m_DataAll = self.animedata;
            //对定时器赋值
            anime_timer = setInterval(function () {
                //是否加载成功
                var m_Flag = Shinetek.Ol3Opt.oGetStatus();
                //若下一个图层加载成功，则进行添加和移除
                if (Shinetek.Ol3Opt.oGetStatus()) {

                    //移除上一层的显示
                    Shinetek.Ol3Opt.removeLayer(m_DataAll[remove_layer_num].LayerTimeName, "TMS");
                    remove_layer_num++;
                    //若当前显示为最后一张
                    if (show_layer_num == (m_NumMax - 1)) {
                        console.log("当前URL：" + m_DataAll[show_layer_num].LayerTimeUrl + " the end");
                        //结束当前定时器
                        _stopAnime();
                        //返回最上层名字 用于移除当前动画图层使用
                        callback(m_DataAll[show_layer_num].LayerTimeName);
                        return;
                    } else {
                        //显示当前动画到了哪一张
                        console.log("当前URL：" + m_DataAll[show_layer_num].LayerTimeUrl);
                        //若添加的图层非最后一张
                        if (add_layer_num <= (m_NumMax - 1)) {
                            //设置当前图层状态为显示模式
                            Shinetek.Ol3Opt.addLayer(m_DataAll[add_layer_num].LayerTimeName, "TMS3", m_DataAll[add_layer_num].LayerTimeUrl, "false", "TMS"); //0
                            Shinetek.Ol3Opt.setZIndex(m_DataAll[add_layer_num].LayerTimeName, m_DataAll[add_layer_num].LayerTimeIndexZ);
                            add_layer_num++;
                        }
                        show_layer_num++;
                    }
                }
                else {
                    console.log("载入false:" + m_Flag);
                }
            }, timespan);
        }

        /**
         * 点击暂停时钟
         * @private
         */
        function _stopAnime() {
            console.log("循环停止");
            window.clearInterval(anime_timer);
            var m_showList = [];
            //根据当前的 remove_layer_num add_layer_num
            //遍历获取 当前所有 已经添加 但是未被移除的图层名称 测试ok 我的确加了那么多层QAQ
            for (var w = remove_layer_num; w < add_layer_num; w++) {
                m_showList.push(self.animedata[w].LayerTimeName);
            }
            return m_showList;
        }

        /**
         * 被调用的开始动画函数
         * @param JsonData json数据内容（TimeLine 返回的,需要再处理）
         * @param callback
         * @param timespan 时间间隔 毫秒为单位 int 例如500
         * @private
         */
        function _startAnime(JsonData, timespan, callback) {
            //存储 JsonData
            var m_TotalList = [];
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

            remove_layer_num = 0;
            show_layer_num = 1;
            add_layer_num = 2;
            for (var i = remove_layer_num; i < 4; i++) {
                Shinetek.Ol3Opt.addLayer(self.animedata[i].LayerTimeName, "TMS3", self.animedata[i].LayerTimeUrl, "false", "TMS");
                Shinetek.Ol3Opt.setZIndex(self.animedata[i].LayerTimeName, self.animedata[i].LayerTimeIndexZ);

                add_layer_num++;
            }
            //判断 timespan 若非数字类型
            if (typeof timespan != "number") {
                timespan = parseInt(timespan);
            }
            //开始此次循环
            if (timespan > 0) {
                _anime_Begin(timespan, callback);
            }
        }


        /*//测试timeline
         this._getTimelineDate = _getTimelineDate;
         function _getTimelineDate() {

         //获取最新数据部分 test
         var m_latestDate = timeLine.getLatestDate("云类型58ab95802f3b4377bc1cbd1d", "minute");
         console.log("m_latestDate:" + m_latestDate);

         //获取动画列表部分 test
         /!*  var m_UrlLisst = timeLine.getDataList("云类型58ab95802f3b4377bc1cbd1d", new Date("2017-03-19 00:00+0000"),
         new Date("2017-03-20 00:00+0000"), "minute", 'http://10.24.10.108/IMAGEL2/CLM/yyyyMMdd_hhmm/');

         _init_Anime(m_UrlLisst, 500, function (m_LastLayer) {
         console.log("所有循环完成！m_LastLayer：" + m_LastLayer);
         });*!/
         }*/

    }

})
();