/**
 * Created by FanTaSyLin on 2016/11/21.
 */

(function () {

    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var _ = require('lodash');

    var projectInfoSchema = new Schema({

        /**
         * 对应 layergroup 中的 layers.layerName 图层名称
         */
        layerName: {type: String},

        /**
         * 星标 与仪器 组合成 {星标}/{仪器} 显示。eg: Aqua/MODIS
         */
        satID: {type: String},
        /**
         * 卫星类型 POS 极轨 GEO静止
         */
        satType: {type: String},
        /**
         * 图层类型 OVERLAYERS
         */
        layType: {type: String},
        /**
         * 地图类型 TMS
         */
        mapType: {type: String},
        /**
         * 是否为默认的图层
         */
        isDefault: {type: Boolean},
        /**
         * 数据是否存在的API 返回TimeLine格式使用的
         */
        dataListUrl: {type: String},

        /**
         * 仪器 与星标 组合成 {星标}/{仪器} 显示。eg: Aqua/MODIS
         */
        instID: {type: String},
        /**
         * 产品名称
         */
        projectName: {type: String},
        /**
         * 产品资源路径 图片服务器路径
         */
        projectUrl: {type: String}
    });

    projectInfoSchema.methods.initData = function (body) {
        var self = this;
        for (var prop in body) {
            self[prop] = body[prop];
        }
    };
    projectInfoSchema.methods.reportVerify = function (body) {

        return reportVerify(body);
    };
    module.exports = mongoose.model('ProjectInfo', projectInfoSchema);

    //是否存在各个必须字段 update使用
    function reportVerify(body) {

        if (_.isNull(body) || _.isUndefined(body)) {
            return false;
        }

        if (_.isUndefined(body.dataListUrl) ||
            _.isUndefined(body.isDefault) ||
            _.isUndefined(body.mapType) ||
            _.isUndefined(body.projectUrl) ||
            _.isUndefined(body.layType) ||
            _.isUndefined(body.projectName) ||
            _.isUndefined(body.satType) ||
            _.isUndefined(body.instID) ||
            _.isUndefined(body.satID) ||
            _.isUndefined(body.layerName)) {

            return false;
        } else {

            return true;
        }

    }
})();