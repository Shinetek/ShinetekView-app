/**
 * Created by liuym on 2017/1/22.
 */
(function () {
    var restify = require('restify');
    var commonFunc = require('./lib/shkutil');

    var port = (process.argv[2]) ? process.argv[2] : 4004;
    var dateReg = /[0-9]{4,5}/;
    if (!dateReg.test(port)) {
        port = 3002;
    }
    var localIP = commonFunc.getLoacalIP();
    // var localIP = '10.24.156.2';
    var server = restify.createServer({
        name: 'FirePoint--GetKMLServer'
    });
    server.use(restify.queryParser());
    server.use(restify.CORS());
    server.use(
        function crossOrigin(req, res, next) {
            'use strict';
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            return next();
        });

    var PATH = '/firepoint';

    var FirePointKML = require('./modules/FirePointKML.js');

    var GeoJson = require('./modules/geojson.js');

    // datastatusFuncSta._TimingCalculation();
    /**
     *  获取火点信息
     */
    server.get({path: PATH + '/:sat/:sensor/:date/:fullname', version: '0.0.1'}, FirePointKML._GetKMLFile);


    /**
     *获取GEOJson
     */
    server.get({path: '/GEOJson/:fullname', version: '0.0.1'}, GeoJson._GetGEOJsonFile);

    server.listen(port, localIP, function () {
        console.log('%s listening at %s ', server.name, server.url);
    });


})();