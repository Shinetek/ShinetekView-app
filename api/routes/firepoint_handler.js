/**
 * Created by liuyp on 2017/4/25.
 * 火点数据获取 handler
 *  */
module.exports = function (server, BASEPATH) {

    /**
     * 获取图层分组列表 ./layer-group
     */
    server.get({
        path: BASEPATH + '/layer-group',
        version: '0.0.1'
    }, _getLayerGroupList);
};