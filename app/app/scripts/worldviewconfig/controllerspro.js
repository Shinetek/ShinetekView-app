/**
 * Created by lenovo on 2016/11/22.
 */

(function () {

    "use strict";
    angular.module('WVConfig', [])
        .controller('ProdConfigController', ProductInfoCtrl)
        .controller('LayerConfigController', LayerInfoCtrl);

    //产品信息控制
    function ProductInfoCtrl($scope) {

        //初始化示例
        //未经过处理的产品
        $scope.groupInfoALL = {};
        //用于显示及各种操作的
        $scope.ProdInfonum = 0;
        //
        $scope.groupInfoList = [];
        //产品url
        $scope.GetInfoUrl = Config_Total.BASEPATH + '/projectinfo';
        //更新产品URL
        $scope.UpdateProdInfoUrl = Config_Total.BASEPATH + '/projectinfo/update';
        //删除产品 url
        $scope.DeleteProdInfoUrl = Config_Total.BASEPATH + '/projectinfo/delete';

        //排序条件
        $scope.orderProp = 'satID';

        $scope.worldviewUrl = "#";
        //初始化数据
        $scope.InitData = function () {
            //获取数据
            $scope.GetInfoALL();

            //获取主界面url
            $scope.worldviewUrl = window.location.href.substring(0, (window.location.href.length - 7));
        };

        //获取所有信息
        $scope.GetInfoALL = function () {
            $.ajax({
                url: $scope.GetInfoUrl,
                type: "get",
                dataType: "json",
                async: true,
                success: function (data) {
                    //数据成功获取 则进行处理生成list
                    $scope.UpdateDataInfo(data);
                },
                error: function (err) {
                    console.log("数据获取失败:" + err);
                    console.log(" 请检查api：" + $scope.GetInfoUrl)
                }
            });
        };

        //更新 -- 更新产品数据显示
        $scope.UpdateDataInfo = function (newData) {
            $scope.groupInfoALL = newData;
            //清空原有数据
            $scope.groupInfoList = [];
            //获取长度
            try {
                $scope.ProdInfonum = newData.data.length;
            } catch (err) {
                $scope.ProdInfonum = 0;
            }
            for (var i = 0; i < $scope.ProdInfonum; i++) {
                var item = newData.data[i];
                $scope.groupInfoList.push(item);
            }
            $scope.$digest();

        };


        //初始化
        $scope.InitData();

        /* 修改部分 */
        /**
         * 修改 -- 修改数据Model
         * @type {null}
         */
        $scope.ChangeModelData = null;

        /**
         * 修改 -- 修改model 赋值
         * @param ChangeModel
         * @constructor
         */
        $scope.ChangeModelFunc = function (ChangeModel) {
            //赋值
            $scope.ChangeModelData = ChangeModel;
        };

        /**
         * 修改 --点击修改按钮 提交修改Model
         * @constructor
         */
        $scope.SubmitChangeFunc = function () {

            if (!VaildCheck($scope.ChangeModelData)) {
                return false;
            }
            //$scope.ChangeModelData 数组处理
            //分割显示
            var m_paramlist = $scope.ChangeModelData.screenshotparam.toString().split(',');
            $scope.ChangeModelData.screenshotparam = [];
            m_paramlist.forEach(function (m_param) {
                $scope.ChangeModelData.screenshotparam.push(m_param);
            });
            var PostData = JSON.stringify($scope.ChangeModelData);
            if ($scope.ChangeModelData != null) {
                //POST
                $.ajax({
                    type: 'POST',
                    url: $scope.UpdateProdInfoUrl,
                    data: PostData,
                    contentType: "application/json",
                    success: function (data, textStatus, jqXHR) {
                        alert("修改成功!");
                        $('#ChangeModal').modal('hide');
                        $scope.GetInfoALL();
                    },
                    error: function (err) {
                        $scope.GetInfoALL();
                        // alert(err);
                        //alert("数据添加失败!\n err:" + err + "\n请检查 POST api：" + $scope.UpdateProdInfoUrl);
                    },
                    dataType: "json"
                });
            }
            //成功之后关闭对话框
            $('#ChangeModal').modal('hide');
        };

        /* 新增部分 */

        /**
         * 修改 -- 数据Model
         * @type {null}
         */
        $scope.AddModelData = {};

        /**
         * 新增 -- 修改model 赋值
         * @constructor
         */
        $scope.AddModelFunc = function () {
            //初始化model
            $scope.AddModelData = {
                "layerID": "",
                "layerName": "",
                "satID": "",
                "instID": "",
                "projectName": "",
                "projectID": "",
                "projectUrl": ""
            };
        };

        /**
         * 修改 --点击修改按钮 提交新的Model
         * @constructor
         */
        $scope.SubmitAddFunc = function () {
            console.log('SubmitAddFunc');
            var PostData = JSON.stringify($scope.AddModelData);
            console.log(PostData);
            if (!VaildCheck($scope.AddModelData)) {
                return false;
            }
            //非空校验 所有值都不能为空

            if ($scope.AddModelData != null) {
                //POST
                $.ajax({
                    type: 'POST',
                    url: $scope.GetInfoUrl,
                    data: PostData,
                    contentType: "application/json",
                    success: function (data, textStatus, jqXHR) {
                        alert("添加成功!");
                        $('#AddModal').modal('hide');
                        $scope.GetInfoALL();
                        //alert("添加成功");
                        $scope.AddModelFunc();
                    },
                    error: function (err) {
                        alert("数据添加失败!\n err:" + err + "\n请检查 POST api：" + $scope.GetInfoUrl);
                    },
                    dataType: "json"

                });
            }
        };

        /**
         * model 有效性校验函数 若均非空 返回true
         * @param m_Model
         * @returns {boolean}
         * @constructor
         */
        var VaildCheck = function (m_Model) {
            console.log(m_Model);
            if (m_Model.satID == null) {
                alert("卫星标识不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }
            if (m_Model.satType == null) {
                alert("卫星类型不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }

            if (m_Model.instID == null) {
                alert("仪器名称不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }

            if (m_Model.isDefault == null) {
                alert("默认显示不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }

            if (m_Model.projectName == null) {
                alert("产品名称不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }
            if (m_Model.projectUrl == null) {
                alert("产品路径不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }
            if (m_Model.layerName == null) {
                alert("layerName不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }
            if (m_Model.layType == null) {
                alert("layType不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }
            if (m_Model.mapType == null) {
                alert("mapType不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }
            if (m_Model.dataListUrl == null) {
                alert("dataListUrl不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }
            if (m_Model.paletteUrl == null) {
                alert("paletteUrl不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }
            if (m_Model.screenshotUrl == null) {
                alert("screenshotUrl不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }
            if (m_Model.screenshotparam == null) {
                alert("screenshotparam不能为空！（若暂时无数据，可使用空格代替）");
                return false;
            }
            if (m_Model.animeUrl == null) {
                alert("animeUrl不能为空。（若暂时无数据，可使用空格代替）");
                return false;
            }
            else {
                return true;
            }
        };

        /**
         * 删除当前选择的产品
         * @constructor
         */
        $scope.DeleteProd = function (ChangeModel) {
            if (!confirm("确认要删除" + ChangeModel.satID + "  " + ChangeModel.projectName + "?")) {
                //alert("false");
                return false;
                //  window.event.returnValue = false;
            }
            var PostData = JSON.stringify(ChangeModel);
            if (ChangeModel != null) {
                //POST
                $.ajax({
                    type: 'POST',
                    url: $scope.DeleteProdInfoUrl,
                    data: PostData,
                    contentType: "application/json",
                    success: function (data, textStatus, jqXHR) {
                        //alert("删除完成");
                        $scope.GetInfoALL();
                    },
                    error: function (err) {
                        //alert("数据删除失败");
                        $scope.GetInfoALL();
                    },
                    dataType: "json"
                });
            }
        };
    }

    //图层信息控制
    function LayerInfoCtrl($scope) {
        //所有的图层分组信息

        $scope.layerInfoName = "11212";
        $scope.layerInfoALL = {};

        //分组url
        $scope.GetGroupInfoUrl = Config_Total.BASEPATH + '/layer-group';


        //获取分组信息
        $scope.GetGroupInfo = function () {
            $.ajax({
                url: $scope.GetGroupInfoUrl,
                type: "get",
                dataType: "json",
                async: true,
                success: function (data) {
                    //数据成功获取 则进行处理生成list
                    $scope.UpdateGroupDataInfo(data.data);
                },
                error: function (err) {
                    console.log("数据获取失败，请检查api" + $scope.GetGroupInfoUrl);
                }
            });
        };

        //更新 更新LayerBase显示
        $scope.UpdateGroupDataInfo = function (newData) {
            var m_LayerList = [];
            $scope.layerInfoALL = newData;
            $scope.$digest();
        };

        //更新图层列表
        $scope.setLayerInfo = function (layerInfo) {
        }


    }

    function PM2_List($scope) {

    }
})();