/**
 * Created by FanTaSyLin on 2016/10/18.
 */

(function () {

    'use strict';

    var express = require('express');
    var path = require('path');
    var morgan = require('morgan');
    var onFinished = require('on-finished');
    var debug = require('debug')('Worldview:' + process.pid);

    debug('Initializing express');
    debug('Initializing express');
    var app = express();

    debug('Attaching plugins');
    var bodyParser = require('body-parser');
    var cookieParser = require('cookie-parser');
    var unless = require('express-unless');
    app.use(morgan('dev'));
    app.use(express.static(path.join(__dirname, './app')));
    /*app.use(express.static(path.join(__dirname, './app/publics')));*/
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use('*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By", ' 3.2.1');
        if (req.method == "OPTIONS")
            res.send(200); //让options请求快速返回
        else
            next();
    });
    app.use(function (req, res, next) {
        onFinished(res, function (err) {
            debug("[%s] finished request", req.connection.remoteAddress);
        });
        next();
    });
    app.use("/", require('./routes/user.js')());
    app.all("*", function (req, res, next) {
        next(new Error("404"));
    });
    app.use(function (err, req, res, next) {
        var code = 500;
        var msg = err.stack || {message: "Internal Server Error 1"};
        switch (err.name) {
            case "UnauthorizedError":
            case "UnauthorizedAccessError":
                code = err.status;
                msg = undefined;
                return res.redirect('/auth');
                break;
            case "BadRequestError":
            case 'NotFoundError':
                code = err.status;
                msg = err.inner;
                break;
            default:
                break;
        }
        return res.status(code).json(msg);
    });

    debug("Creating HTTP server on port: %s", 4000);
    require('http').createServer(app).listen(4000, function () {
        console.log("HTTP Server listening on port: %s, in %s mode", 4000, app.get('env'));
    });
})();