/**
 * Created by FanTaSyLin on 2016/10/20.
 */

(function () {

    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var _ = require('lodash');

    /**
     * LayerGroup Module
     * 图层分组 Module 为 Worldview 添加图层模态框提供分组数据
     * @type {"mongoose".mongoose.Schema|"mongoose"._mongoose.Schema}
     */
    var LayerGroupSchema = new Schema({
        /**
         * 图层分组描述名
         */
        name: {type: String},

        /**
         * 图层分组的底图路径
         */
        pictureUrl: {type: String},

        /**
         * 图层分组类型 Hazards-灾害类, Science-科研类
         */
        type: {type: String},

        /**
         * 图层分组名称  用于界面显示的字段
         */
        typeName: {type: String},

        /**
         * 图层列表
         */
        layers: [{
            /**
             * 图层ID
             */
            layerID: {type: String},


            index: {type: Number},
            /**
             * 图层描述名
             */
            layerName: {type: String}
        }]
    });

    /**
     * 初始化Schema数据
     * @param body
     */
    LayerGroupSchema.methods.initData = function (body) {
        var self = this;
        for (var prop in body) {
            self[prop] = body[prop];
        }
    };

    //内容正确性校验
    LayerGroupSchema.methods.reportVerify = function (body) {

        return reportVerify(body);
    };
    module.exports = mongoose.model('LayerGroup', LayerGroupSchema);


    //是否存在各个必须字段 update使用
    function reportVerify(body) {
        if (_.isNull(body) || _.isUndefined(body)) {
            return false;
        }
        //校验update
        if (_.isUndefined(body.name) ||
            _.isUndefined(body.pictureUrl) ||
            _.isUndefined(body.layers) ||
            _.isUndefined(body.type) ||
            _.isUndefined(body.typeName)) {
            return false;
        } else {
            return true;
        }
    }
})();