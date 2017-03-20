/**
 * Created by lenovo on 2017/3/9.
 * 调色板handler
 */
(function () {

    'use strict';

    var palette_module = require('./../modules/palette_module.js');
    var _ = require('lodash');

    module.exports = function (server, BASEPATH) {
        /**
         * 获取 json 形式的调色板信息  /palettejson/:proType/:procbname
         * var m_proType = req.params.proType;
         * var m_procbname = req.params.procbname;
         */
        server.get({
            path: BASEPATH + '/palettejson/:proType/:procbname',
            version: '0.0.1'
        }, palette_module._getpalettejson);
    }

})
();

