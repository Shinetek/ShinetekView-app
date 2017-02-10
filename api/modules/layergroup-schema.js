/**
 * Created by FanTaSyLin on 2016/10/20.
 */

(function () {

    'use strict'

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

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
         * 图层列表
         */
        layers: [{
            /**
             * 图层ID
             */
            layerID: {type: String},

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
        for(var prop in body) {
            self[prop] = body[prop];
        }
    }

    module.exports = mongoose.model('LayerGroup', LayerGroupSchema);

})();