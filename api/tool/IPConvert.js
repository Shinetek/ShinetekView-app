/**
 * Created by lenovo on 2017/4/7.
 * 自动处理数据库中 图像数据对应IP
 */
(function () {
    console.log("=====================IP转换开始=====================");
    //载入转化配置
    var m_config = require("../config.json");

    var m_BeforeIP = m_config.ConvertIP.BeforeIP;
    var m_AfterIP = m_config.ConvertIP.AfterIP;
    // var LayerGroupSchema = require('./modules/layergroup-schema.js');
    var ProjectInfoSchema = require('../modules/projectinfo-schema.js');
    var mongoose = require('mongoose');

    //数据库配置
    const MONGOOSE_URI = m_config.MongodbUrl;

    //连接数据库操作
    (function () {

        var opt_Mongoose = {
            server: {
                auto_reconnect: false,
                poolSize: 100
            }
        };

        mongoose.connect(MONGOOSE_URI, opt_Mongoose);

        mongoose.connection.on('error', function (err) {
            console.log('Mongoose connection error: %s', err.stack);
        });

        mongoose.connection.on('open', function () {
            console.log('Mongoose connected to the Worldview-Mongo' + ":" + MONGOOSE_URI);
        });

        mongoose.connection.on('disconnected', function () {
            console.log('Mongoose to the Worldview-Mongo  connection disconnected');

        });

        mongoose.Promise = global.Promise;


    })();

    ReplaceIP(m_BeforeIP, m_AfterIP);

    console.log("由" + m_BeforeIP + "转化为：" + m_AfterIP);

    /**
     * 数据库IP批量转换函数
     * @param BeforeIP
     * @param AfterIP
     * @constructor
     */
    function ReplaceIP(BeforeIP, AfterIP) {
        var m_upList = [];
        //通过api连接数据库
        get_LayList(function (err, data) {
            if (err) {
                console.log("基础图层数据获取失败！" + err.toString());
                return false;
            }
            else {
                var m_LayerList = data.data;
                // console.log(m_LayerList);
                for (let i = 0; i < m_LayerList.length; i++) {
                    //获取 转化之后的图层列表
                    var m_UpInfo = get_newLayerInfo(m_LayerList[i], BeforeIP, AfterIP);
                    m_upList.push(m_UpInfo);
                    console.log(m_UpInfo);
                    updateInfo(m_UpInfo, function (err, data) {
                        if (err) {
                            console.log(data._id + " 更新失败！");
                            console.log(" 失败信息：" + err);
                        }
                        else {
                            console.log(data._id + data.projectName + " 更新完成！");
                        }
                    });
                }
                //遍历对 m_upList 进行更新
            }
        });
    }

    /**
     * 获取图层列表
     * @param callback 异步返回函数。
     */
    function get_LayList(callback) {
        ProjectInfoSchema
            .find()
            .exec(function (err, doc) {
                if (err) {
                    callback(err, null);
                }
                else {
                    console.log("数据库连接成功");
                    var result = {
                        status: (err) ? err.msg : 'success',
                        data: doc
                    };
                    callback(null, result)
                }
            });
    }

    /**
     * 对数据model中的所有url进行匹配转化
     * @param LayerInfo 数据model
     * @param BeforeIP 初始ip
     * @param AfterIP 结束ip
     */
    function get_newLayerInfo(LayerInfo, BeforeIP, AfterIP) {
        //设置正则转化
        var reg_Before = new RegExp(BeforeIP, "g");

        //产品路径
        if (LayerInfo.projectUrl != null) {
            LayerInfo.projectUrl = LayerInfo.projectUrl.replace(reg_Before, AfterIP);
        }

        //数据API
        if (LayerInfo.dataListUrl != null) {
            LayerInfo.dataListUrl = LayerInfo.dataListUrl.replace(reg_Before, AfterIP);
        }

        //数据位置api
        if (LayerInfo.projectUrl != null) {
            LayerInfo.projectUrl = LayerInfo.projectUrl.replace(reg_Before, AfterIP);
        }

        //调色板API
        if (LayerInfo.paletteUrl != null) {
            LayerInfo.paletteUrl = LayerInfo.paletteUrl.replace(reg_Before, AfterIP);
        }

        //截图url screenshotUrl
        if (LayerInfo.screenshotUrl != null) {
            LayerInfo.screenshotUrl = LayerInfo.screenshotUrl.replace(reg_Before, AfterIP);
        }

        //动画获取 animeUrl
        if (LayerInfo.animeUrl != null) {
            LayerInfo.animeUrl = LayerInfo.animeUrl.replace(reg_Before, AfterIP);
        }

        return LayerInfo;
    }


    function updateInfo(LayerInfo, next) {
        var body = LayerInfo;
        try {
            var projectInfo = new ProjectInfoSchema();
            //正确性检验
            if (projectInfo.reportVerify(LayerInfo)) {
                //如果body内数据正确
                ProjectInfoSchema.update({
                    _id: body._id
                }, {
                    $set: {
                        layerName: body.layerName,
                        satID: body.satID,
                        instID: body.instID,
                        satType: body.satType,
                        projectName: body.projectName,
                        layType: body.layType,
                        projectUrl: body.projectUrl,
                        mapType: body.mapType,
                        isDefault: body.isDefault,
                        dataListUrl: body.dataListUrl,
                        paletteUrl: body.paletteUrl,
                        screenshotUrl: body.screenshotUrl,
                        screenshotparam: body.screenshotparam,
                        animeUrl: body.animeUrl
                    }
                }, function (err) {
                    if (err) {
                        return next(err, LayerInfo);
                    }
                    else {
                        return next(null, LayerInfo);
                    }
                });
            } else {
                return next('Invalid body', LayerInfo);
            }
        }
        catch (err) {
            return next(err, LayerInfo);
        }

    }

    console.log("=====================IP转换结束=====================");

})();