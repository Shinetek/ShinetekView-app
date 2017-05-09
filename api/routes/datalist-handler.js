/**
 * Created by FanTaSyLin on 2016/12/12
 *
 * 提供获取数据列表的API
 */


/// <reference path="./../../typings/index.d.ts" />

(function () {

    'use strict';

    var moment = require('moment');
    var FTP = require('ftp');
    var _ = require('lodash');
    var mysql = require('mysql');
    var config = require('../config.json');
    var fs = require("fs");

    module.exports = function (server, BASEPATH) {

        /**
         * 获取数据列表
         */
        server.get({
            path: BASEPATH + '/data-list',
            verison: '0.0.1'
        }, _getDataList);

        //静止卫星从数据库中获取
        server.get({
            path: BASEPATH + '/datalist/:SatID/:InstID/:ProdName/:Resolution',
            verison: '0.0.1'
        }, _getDataListByCondition);

        //日合成产品数据获取 以天为基准 向上向下兼容
        server.get({
            path: BASEPATH + '/datalistday/:SatID/:InstID/:ProdName/:Resolution',
            verison: '0.0.1'
        }, _getDataListByConditionDay);

        //极轨卫星从文件中获取 FTPFileName 参数 为FTP上文件名称
        server.get({
            path: BASEPATH + '/datalist/POS/:FTPFileName',
            verison: '0.0.1'
        }, _getDataLitsByFTPFile);


        //从本地文件中获取！POS极轨卫星
        server.get({
            path: BASEPATH + '/datalist/POSFile/:FTPFileName',
            verison: '0.0.1'
        }, _getDataListFilePath);
    };

    //测试数据返回
    function _getDataList(req, res, next) {
        //临时
        var dataList = [];
        var tmpStr = moment(new Date()).add('hour', -8).format('YYYY-MM-DD HH');
        var start = new Date(tmpStr + ':00');
        for (var i = 0; i < 20; i++) {
            dataList.push(moment(start).add('minutes', -10 * i).format('YYYY-MM-DD HH:mm'));
        }

        var result = {
            dataList_Minute: dataList,
            dataList_Day: [],
            dataList_Month: [],
            dataList_Year: []
        };

        res.end(JSON.stringify(result));
        next();

    }

    //静止卫星获取数据 FY4A 分钟版本
    function _getDataListByCondition(req, res, next) {

        if (_.isUndefined(req.params.SatID)
            || _.isUndefined(req.params.InstID)
            || _.isUndefined(req.params.ProdName)
            || _.isUndefined(req.params.Resolution)) {
            res.end("请确认参数如下格式：/datalist/:SatID/:InstID/:ProdName/:Resolution"
                + "1SatID:" + req.params.SatID
                + "2InstID:" + req.params.InstID
                + "3ProdName:" + req.params.ProdName
                + "4Resolution:" + req.params.Resolution);
            next();
        }
        //获取Select 语句
        var m_SQL = " SELECT  DISTINCT(DataTime) FROM ProductInfo  " +
            " where  SatID ='" + req.params.SatID
            + "' and InstrumentName ='" + req.params.InstID
            + "' and ProductName ='" + req.params.ProdName
            + "' and Resolution =" + req.params.Resolution
            + " and IsExitFlag = 1 order by CreatTime desc"
            + " limit 1000";

        var client = mysql.createConnection({
            host: config.MYSQL.host,
            user: config.MYSQL.user,
            password: config.MYSQL.password,
            database: config.MYSQL.database
        });

        client.connect();
        client.query(m_SQL, function selectCb(err, results, fields) {
                if (err) {
                    throw err;
                    res.end(JSON.stringify(err));
                    next();
                }
                if (results) {
                    var dataList_Min = [];
                    var dataList_Day = [];
                    var dataList_Month = [];
                    var dataList_Year = [];
                    console.log(results.length);
                    for (var i = 0; i < results.length; i++) {
                        //加入数据
                        var m_Item = results[i].DataTime;
                        switch (m_Item.length) {
                            case 4:
                            {   //年
                                var m_Str_Year = m_Item.substring(0, 4);
                                dataList_Year.push(m_Str_Year);
                                break;
                            }
                            case 6:
                            {
                                //年
                                var m_Str_Year = m_Item.substring(0, 4);
                                dataList_Year.push(m_Str_Year);
                                //月
                                var m_Str_Month = m_Item.substr(0, 4) + "-" + parseInt(m_Item.substr(4, 2)).toString();
                                dataList_Month.push(m_Str_Month);
                                break;
                            }
                            case 8:
                            {
                                //年
                                var m_Str_Year = m_Item.substring(0, 4);
                                dataList_Year.push(m_Str_Year);
                                //月
                                var m_Str_Month = m_Item.substr(0, 4) + "-" + parseInt(m_Item.substr(4, 2)).toString();
                                dataList_Month.push(m_Str_Month);
                                //日
                                var m_Str_Day = m_Item.substr(0, 4) + "-" + m_Item.substr(4, 2) + "-" + m_Item.substr(6, 2);                                // console.log(m_Str_Day);
                                dataList_Day.push(m_Str_Day);
                                /* var m_Str_Minute1 = m_Item.substr(0, 4) + "-" + m_Item.substr(4, 2) + "-" + m_Item.substr(6, 2)
                                 + " 00" + ":" + "00";
                                 dataList_Min.push(m_Str_Minute1);*/
                                break;
                            }
                            case 13:
                            {
                                //年
                                var m_Str_Year = m_Item.substring(0, 4);
                                dataList_Year.push(m_Str_Year);
                                //月
                                var m_Str_Month = m_Item.substr(0, 4) + "-" + parseInt(m_Item.substr(4, 2)).toString();
                                dataList_Month.push(m_Str_Month);
                                dataList_Month.push("2016-12");
                                dataList_Month.push("2016-2");
                                //天
                                var m_Str_Day = m_Item.substr(0, 4) + "-" + m_Item.substr(4, 2) + "-" + m_Item.substr(6, 2);
                                dataList_Day.push(m_Str_Day);
                                //分钟模式转化
                                var m_Str_Minute = m_Item.substr(0, 4) + "-" + m_Item.substr(4, 2) + "-" + m_Item.substr(6, 2)
                                    + " " + m_Item.substr(9, 2) + ":" + m_Item.substr(11, 2);

                                dataList_Min.push(m_Str_Minute);
                                break;
                            }
                            default:
                            {
                                console.log(m_Item);
                                break;
                            }
                        }

                    }
                    dataList_Min = _.sortBy(dataList_Min);
                    dataList_Day = _.uniq(dataList_Day);
                    dataList_Month = _.uniq(dataList_Month);
                    dataList_Year = _.uniq(dataList_Year);
                    console.log(dataList_Min.length);
                    //整体加入完成后返回
                    var result = {
                        dataList_Minute: dataList_Min,
                        dataList_Day: dataList_Day,
                        dataList_Month: dataList_Month,
                        dataList_Year: dataList_Year
                    };

                    res.end(JSON.stringify(result));
                    next();
                }
                client.end();
            }
        );
        client.on('error', function (err) {
            client.end();
        });


    }


    function _getDataListByConditionDay(req, res, next) {

        if (_.isUndefined(req.params.SatID)
            || _.isUndefined(req.params.InstID)
            || _.isUndefined(req.params.ProdName)
            || _.isUndefined(req.params.Resolution)) {
            res.end("请确认参数如下格式：/datalist/:SatID/:InstID/:ProdName/:Resolution。"
                + "1SatID:" + req.params.SatID
                + "2InstID:" + req.params.InstID
                + "3ProdName:" + req.params.ProdName
                + "4Resolution:" + req.params.Resolution);
            next();
        }
        //获取Select 语句
        var m_SQL = " SELECT  DISTINCT(DataTime) FROM ProductInfo  "
            + " where  SatID ='" + req.params.SatID
            + "' and InstrumentName ='" + req.params.InstID
            + "' and ProductName ='" + req.params.ProdName
            + "' and Resolution =" + req.params.Resolution
            + " and IsExitFlag = 1 order by CreatTime desc"
            + " limit 1000";

        var client = mysql.createConnection({
            host: config.MYSQL.host,
            user: config.MYSQL.user,
            password: config.MYSQL.password,
            database: config.MYSQL.database
        });

        client.connect();
        client.query(m_SQL, function selectCb(err, results, fields) {
                if (err) {
                    throw err;
                    res.end(JSON.stringify(err));
                    next();
                }
                if (results) {
                    var dataList_Min = [];
                    var dataList_Day = [];
                    var dataList_Month = [];
                    var dataList_Year = [];
                    console.log(results.length);
                    for (var i = 0; i < results.length; i++) {
                        //加入数据
                        var m_Item = results[i].DataTime;
                        switch (m_Item.length) {
                            case 4:
                            {   //年
                                var m_Str_Year = m_Item.substring(0, 4);
                                dataList_Year.push(m_Str_Year);
                                break;
                            }
                            case 6:
                            {
                                //年
                                var m_Str_Year = m_Item.substring(0, 4);
                                dataList_Year.push(m_Str_Year);
                                //月
                                var m_Str_Month = m_Item.substr(0, 4) + "-" + parseInt(m_Item.substr(4, 2)).toString();
                                dataList_Month.push(m_Str_Month);
                                break;
                            }
                            case 8:
                            {
                                /*日模式 需要向下兼容*/
                                //年
                                var m_Str_Year = m_Item.substring(0, 4);
                                dataList_Year.push(m_Str_Year);
                                //月
                                var m_Str_Month = m_Item.substr(0, 4) + "-" + parseInt(m_Item.substr(4, 2)).toString();
                                dataList_Month.push(m_Str_Month);
                                //日
                                var m_Str_Day = m_Item.substr(0, 4) + "-" + m_Item.substr(4, 2) + "-" + m_Item.substr(6, 2);                                // console.log(m_Str_Day);
                                dataList_Day.push(m_Str_Day);
                                /* var m_Str_Minute1 = m_Item.substr(0, 4) + "-" + m_Item.substr(4, 2) + "-" + m_Item.substr(6, 2)
                                 + " 00" + ":" + "00";
                                 dataList_Min.push(m_Str_Minute1);*/
                                break;
                            }
                            case 13:
                            {
                                //年
                                var m_Str_Year = m_Item.substring(0, 4);
                                dataList_Year.push(m_Str_Year);
                                //月
                                var m_Str_Month = m_Item.substr(0, 4) + "-" + parseInt(m_Item.substr(4, 2)).toString();
                                dataList_Month.push(m_Str_Month);
                                //天
                                var m_Str_Day = m_Item.substr(0, 4) + "-" + m_Item.substr(4, 2) + "-" + m_Item.substr(6, 2);
                                dataList_Day.push(m_Str_Day);
                                //分钟模式转化
                                var m_Str_Minute = m_Item.substr(0, 4) + "-" + m_Item.substr(4, 2) + "-" + m_Item.substr(6, 2)
                                    + " " + m_Item.substr(9, 2) + ":" + m_Item.substr(11, 2);

                                dataList_Min.push(m_Str_Minute);
                                break;
                            }
                            default:
                            {
                                console.log(m_Item);
                                break;
                            }
                        }

                    }
                    dataList_Year = _.uniq(dataList_Year);
                    dataList_Month = _.uniq(dataList_Month);
                    dataList_Day = _.uniq(dataList_Day);
                    // console.log(dataList_Day);
                    dataList_Day.forEach(function (m_Str_Day) {
                        //扩充为分钟 一天为288个时次
                        // console.log("m_Str_Day:" + m_Str_Day);
                        for (var time = 0; time < 288; time++) {
                            var m_Str_Min = moment(new Date(m_Str_Day)).utc().add('minutes', 5 * time).format('YYYY-MM-DD HH:mm');
                            dataList_Min.push(m_Str_Min);
                        }
                    });
                    dataList_Min = _.uniq(dataList_Min);
                    dataList_Min = _.sortBy(dataList_Min);
                    //整体加入完成后返回
                    var result = {
                        dataList_Minute: dataList_Min,
                        dataList_Day: dataList_Day,
                        dataList_Month: dataList_Month,
                        dataList_Year: dataList_Year
                    };

                    res.end(JSON.stringify(result));
                    next();
                }
                client.end();
            }
        );
        client.on('error', function (err) {
            client.end();
        });


    }

    //极轨卫星-数据存在文件 FTP配置
    var FTPConfig = {
        'host': config.POS_FTP.host,
        'port': config.POS_FTP.port,
        'user': config.POS_FTP.user,
        'password': config.POS_FTP.password
    };

    //极轨卫星通过FTP 文件获取数据存在 使用路径为当前路径
    //http://10.24.4.130:4001/api/datalist/POS/liuyptest.txt
    function _getDataLitsByFTPFile(req, res, next) {
        var FtpPath = config.POS_FTP.path;
        var m_FileName = req.params.FTPFileName;
        //如果合法则进行操作
        if (!_.isUndefined(m_FileName) && m_FileName.length > 0) {
            var client = new FTP();
            client.on('ready', function () {
                    client.get(FtpPath + m_FileName,
                        function (err, stream) {
                            if (err) {
                                client.end();
                                res.end();
                                next();
                                return;
                            }
                            stream.once('close', function () {
                                client.end();
                            });
                            var concat = require('concat-stream');
                            //对流进行处理函数
                            var reverseStream = concat(function (text) {
                                //  var m_DataList1 = text.toString();
                                //将日期分割为列表形式
                                var m_DataList = text.toString().split("\n\r\n");
                                var dataList_Min = [];
                                var dataList_Day = [];
                                var dataList_Month = [];
                                var dataList_Year = [];
                                if (m_DataList != undefined && m_DataList.length > 0) {

                                    //循环添加
                                    for (var len = 0; len < m_DataList.length; len++) {
                                        var m_Item = m_DataList[len];
                                        if (m_Item.length == 8) {
                                            //切割加入年月日
                                            //年
                                            var m_Str_Year = m_Item.substring(0, 4);
                                            dataList_Year.push(m_Str_Year);
                                            //月
                                            var m_Str_Month = m_Item.substr(0, 4) + "-" + parseInt(m_Item.substr(4, 2)).toString();
                                            dataList_Month.push(m_Str_Month);
                                            //日
                                            var m_Str_Day = m_Item.substr(0, 4) + "-" + m_Item.substr(4, 2) + "-" + m_Item.substr(6, 2);                                // console.log(m_Str_Day);
                                            dataList_Day.push(m_Str_Day);
                                        }
                                    }
                                    //去重复 年月日 去重复
                                    dataList_Day = _.uniq(dataList_Day);
                                    dataList_Month = _.uniq(dataList_Month);
                                    dataList_Year = _.uniq(dataList_Year);
                                    //对每日的数据进行处理扩充为分钟模式 针对去重复后的进行 减少计算次数
                                    dataList_Day.forEach(function (m_Str_Day) {
                                        //扩充为分钟 一天为288个时次
                                        for (var time = 0; time < 288; time++) {
                                            var m_Str_Min = moment(new Date(m_Str_Day)).utc().add('minutes', 5 * time).format('YYYY-MM-DD HH:mm');
                                            dataList_Min.push(m_Str_Min);
                                        }
                                    });

                                    //整体加入完成后返回
                                    var result = {
                                        dataList_Minute: dataList_Min,
                                        dataList_Day: dataList_Day,
                                        dataList_Month: dataList_Month,
                                        dataList_Year: dataList_Year
                                    };
                                    //console.log(result);
                                    res.end(JSON.stringify(result));
                                    next();
                                }
                            });
                            stream.pipe(reverseStream);
                        }
                    );
                }
            );
            client.on('error', function (err) {
                client.end();
            });
            client.connect(FTPConfig);
        } else {
            //若参数错误
            res.end();
            next();
        }
    }


    //从本地文件中获取数据存在状态
    function _getDataListFilePath(req, res, next) {
        var m_Path = config.POSFilePath;

        var m_FileName = req.params.FTPFileName;
        var m_File = m_Path + "/" + m_FileName;

          // m_File = "D://File_2017//GIT//ShinetekView-app//api//test//" + m_FileName;
        // console.log(m_File);
        if (fs.existsSync(m_File)) {
           // console.log("m_File ok:" + m_File);
            //文件读取
            var m_FileStr = fs.readFileSync(m_File, 'utf8');

            var m_DataList = m_FileStr.toString().split("\u0000\n\u0000");
            m_DataList = _.uniq(m_DataList);
            console.log(m_DataList);
            var dataList_Min = [];
            var dataList_Day = [];
            var dataList_Month = [];
            var dataList_Year = [];
            if (m_DataList != undefined && m_DataList.length > 0) {

                //循环添加
                for (var len = 0; len < m_DataList.length; len++) {
                    var m_Item = m_DataList[len];
                    if (m_Item.length == 8) {
                        //切割加入年月日
                        //年
                        var m_Str_Year = m_Item.substring(0, 4);
                        dataList_Year.push(m_Str_Year);
                        //月
                        var m_Str_Month = m_Item.substr(0, 4) + "-" + parseInt(m_Item.substr(4, 2)).toString();
                        dataList_Month.push(m_Str_Month);
                        //日
                        var m_Str_Day = m_Item.substr(0, 4) + "-" + m_Item.substr(4, 2) + "-" + m_Item.substr(6, 2);                                // console.log(m_Str_Day);
                        dataList_Day.push(m_Str_Day);
                    }
                }
                //去重复 年月日 去重复
                dataList_Day = _.uniq(dataList_Day);
                dataList_Month = _.uniq(dataList_Month);
                dataList_Year = _.uniq(dataList_Year);
                //对每日的数据进行处理扩充为分钟模式 针对去重复后的进行 减少计算次数
                dataList_Day.forEach(function (m_Str_Day) {
                    //扩充为分钟 一天为288个时次
                    for (var time = 0; time < 288; time++) {
                        var m_Str_Min = moment(new Date(m_Str_Day)).utc().add('minutes', 5 * time).format('YYYY-MM-DD HH:mm');
                        dataList_Min.push(m_Str_Min);
                    }
                });

                //整体加入完成后返回
                var result = {
                    dataList_Minute: dataList_Min,
                    dataList_Day: dataList_Day,
                    dataList_Month: dataList_Month,
                    dataList_Year: dataList_Year
                };
                //console.log(result);
                res.end(JSON.stringify(result));
                next();

            }
        }
        else {
            res.end();
            next();
        }
    }
})
();

