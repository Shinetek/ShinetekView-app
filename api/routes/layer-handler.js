/**
 * Created by FanTaSyLin on 2016/10/20.
 */

(function () {

    'use strict';

    var LayerGroupSchema = require('./../modules/layergroup-schema.js');
    var ProjectInfoSchema = require('./../modules/projectinfo-schema.js');
    var _ = require('lodash');

    module.exports = function (server, BASEPATH) {

        /**
         * POST - insert
         * PUT - update
         * GET - find
         */

        /**
         * 获取图层分组列表 ./layer-group
         */
        server.get({
            path: BASEPATH + '/layer-group',
            version: '0.0.1'
        }, _getLayerGroupList);

        /**
         * 修改图层分组
         */
        server.post({
            path: BASEPATH + '/layer-group/update',
            version: '0.0.1'
        }, _updateLayerGroup);


        /**
         * 插入一个新的图层分组
         */
        server.post({
            path: BASEPATH + '/layer-group',
            version: '0.0.1'
        }, _insertLayerGroup);

        /**
         * 删除的图层分组
         */
        server.post({
            path: BASEPATH + '/layer-group/delete',
            version: '0.0.1'
        }, _deleteLayerGroup);


        /**
         * 获取产品信息列表
         */
        server.get({
            path: BASEPATH + '/projectinfo',
            version: '0.0.1'
        }, _getProjectInfoList);

        /**
         * 插入一个新的产品信息
         */
        server.post({
            path: BASEPATH + '/projectinfo',
            version: '0.0.1'
        }, _insertProjectInfo);

        /**
         * 插入一个新的产品信息
         */
        server.post({
            path: BASEPATH + '/projectinfo/update',
            version: '0.0.1'
        }, _updateProjectInfo);


        /**
         * 根据ID 删除一个产品信息
         */
        server.post({
            path: BASEPATH + '/projectinfo/delete',
            version: '0.0.1'
        }, _deleteProjectInfo);


        //插入产品信息--增
        function _insertProjectInfo(req, res, next) {
            if (_.isUndefined(req.body)) {
                return res.end(JSON.stringify({
                    status: 'Invalid body',
                    data: null
                }));
            }
            var schema = new ProjectInfoSchema();
            schema.initData(req.body);
            schema.save(function (err) {
                if (err) {
                    return res.end(JSON.stringify({
                        status: 'Invalid body',
                        data: null
                    }));
                }

                return res.end(JSON.stringify({
                    status: 'success',
                    data: null
                }));
            });
        }

        //删除产品信息 --删
        function _deleteProjectInfo(req, res, next) {
            if (_.isUndefined(req.body)) {
                return next('Invalid params');
            }
            var body = req.body;
            try {
                //若ID存在 则对当前ID进行删除
                if (!_.isUndefined(body._id)) {
                    //如果body内数据正确
                    var conditions = {_id: body._id};
                    ProjectInfoSchema
                        .remove(conditions, function (err) {
                            if (err) {
                                return next(err);
                            } else {
                                res.end();
                            }
                        });
                } else {
                    return next('Invalid body!body should have _id');
                }
            }
            catch (err) {
                return next(err);
            }
        }

        //更新产品信息--改
        function _updateProjectInfo(req, res, next) {

            if (_.isUndefined(req.body)) {
                return next('Invalid params');
            }
            var body = req.body;
            try {
                var projectInfo = new ProjectInfoSchema();
                if (projectInfo.reportVerify(body)) {

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
                            return next(err);
                        } else {
                            res.end();
                        }
                    });
                } else {
                    return next('Invalid body');
                }
            }
            catch (err) {
                return next(err);
            }
        }

        //获取产品信息--查
        function _getProjectInfoList(req, res, next) {
            ProjectInfoSchema
                .find()
                .exec(function (err, doc) {
                    var result = {
                        status: (err) ? err.msg : 'success',
                        data: doc
                    };
                    res.end(JSON.stringify(result));
                });
        }

        //插入产品分组信息--增
        function _insertLayerGroup(req, res, next) {
            if (_.isUndefined(req.body)) {
                return res.end(JSON.stringify({
                    status: 'Invalid body',
                    data: null
                }));
            }

            var schema = new LayerGroupSchema();
            schema.initData(req.body);
            schema.save(function (err) {
                if (err) {
                    return res.end(JSON.stringify({
                        status: 'Invalid body',
                        data: null
                    }));
                }

                return res.end(JSON.stringify({
                    status: 'success',
                    data: null
                }));
            });
        }

        //删除图层分组信息--删
        function _deleteLayerGroup(req, res, next) {
            if (_.isUndefined(req.body)) {
                return res.end(JSON.stringify({
                    status: 'Invalid body',
                    data: null
                }));
            }
            var body = req.body;
            try {
                if (!_.isUndefined(body._id)) {
                    //如果body内数据正确
                    var conditions = {_id: body._id};
                    LayerGroupSchema
                        .remove(conditions, function (err) {
                            if (err) {
                                return next(err);
                            } else {
                                res.end();
                            }
                        });
                } else {
                    return next('Invalid body!body should have _id');
                }
            }
            catch (err) {
                return next(new DBOptionError(415, err));
            }
        }

        //更新图层分组信息--改
        function _updateLayerGroup(req, res, next) {
            if (_.isUndefined(req.body)) {
                return res.end(JSON.stringify({
                    status: 'Invalid body',
                    data: null
                }));
            }
            var body = req.body;


            try {
                var layerGroupinfo = new LayerGroupSchema();
                //内容校验
                if (layerGroupinfo.reportVerify(body)) {
                    //如果body内数据正确
                    var layers = [];
                    for (var i = 0; i < body.layers.length; i++) {
                        var m_Layer = {};
                        m_Layer.index = body.layers[i].index;
                        m_Layer.layerName = body.layers[i].layerName;
                        layers.push(m_Layer);
                    }
                    console.log(layers);


                    LayerGroupSchema.update({
                        _id: body._id
                    }, {
                        $set: {
                            name: body.name,
                            pictureUrl: body.pictureUrl,
                            layers: layers,
                            type: body.type,
                            typeName: body.typeName
                        }
                    }, function (err) {
                        res.end();
                        if (err) {
                            return next(err);
                        } else {
                            return next();
                        }
                    });
                } else {
                    return next('Invalid body');
                }
            }
            catch (err) {
                return next(new DBOptionError(415, err));
            }
        }

        //获取入产品分组信息--查
        function _getLayerGroupList(req, res, next) {
            LayerGroupSchema
                .find()
                .exec(function (err, doc) {
                    var result = {
                        status: (err) ? err.msg : 'success',
                        data: doc
                    };
                    res.end(JSON.stringify(result));
                });
        }


    }

})
();