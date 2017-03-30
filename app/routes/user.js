/**
 * Created by FanTaSyLin on 2016/11/21.
 */

(function () {

    'use strict';

    var Router = require('express').Router;

    module.exports = function () {
        var router = new Router();
        //主界面
        router.route('/worldview').get(_startApp);
        //主界面3
        //router.route('/worldview3').get(_startApp3);
        //测试动画demo
        router.route('/worldview_trans').get(_startApp_trans);
        //配置界面
        router.route('/worldview_config').get(_startConfigAPP);
        return router;
    };

    function _startApp(req, res, next) {
        res.sendfile('app/worldview.html');
    }

    function _startApp3(req, res, next) {
        res.sendfile('app/worldview.html');
    }

    function _startApp_trans(req, res, next) {
        res.sendfile('app/Timer_demo.html');
    }

    function _startConfigAPP(req, res, next) {
        res.sendfile('app/worldview_config.html');
    }

})();