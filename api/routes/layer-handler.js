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


        //更新图层分组信息
        function _updateLayerGroup(req, res, next) {
            if (_.isUndefined(req.body)) {
                return res.end(JSON.stringify({
                    status: 'Invalid body',
                    data: null
                }));
            }
            var body = req.body;

            try {
                // if (recodeSchema.reportVerify(body)) {}
            }
            catch (err) {
                return next(new DBOptionError(415, err));
            }
        }

        //更新产品分组信息
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


        //删除产品分组信息
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


    }

})
();