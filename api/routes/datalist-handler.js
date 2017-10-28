/**
 * Created by FanTaSyLin on 2016/12/12
 *
 * 提供获取数据列表的API
 */


/// <reference path="./../../typings/index.d.ts" />
var moment = require('moment');
var FTP = require('ftp');
var _ = require('lodash');
var mysql = require('mysql');
var config = require('../config.json');
var fs = require("fs");
var concat = require('concat-stream');

(function () {


    module.exports = function (server, BASEPATH) {

        /**
         * 获取数据列表
         */
        server.get({
            "path": BASEPATH + '/data-list',
            "verison": '0.0.1'
        }, _getDataList);

        //静止卫星从数据库中获取
        server.get({
            "path": BASEPATH + '/datalist/:SatID/:InstID/:ProdName/:Resolution',
            "verison": '0.0.1'
        }, _getDataListByCondition);

        //日合成产品数据获取 以天为基准 向上向下兼容
        server.get({
            "path": BASEPATH + '/datalistday/:SatID/:InstID/:ProdName/:Resolution',
            "verison": '0.0.1'
        }, _getDataListByConditionDay);

        //极轨卫星从文件中获取 FTPFileName 参数 为FTP上文件名称
        server.get({
            "path": BASEPATH + '/datalist/POS/:FTPFileName',
            "verison": '0.0.1'
        }, _getDataLitsByFTPFile);

        //日合成产品数据获取 以天为基准 向上向下兼容
        server.get({
            "path": BASEPATH + '/datalistfy4a/:SatID/:InstID/:ProdName/:ObserveType/:Resolution',
            "verison": '0.0.1'
        }, _getDataListByFY4A);

        //从本地文件中获取！POS极轨卫星
        server.get({
            "path": BASEPATH + '/datalist/POSFile/:FTPFileName',
            "verison": '0.0.1'
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
            "dataList_Minute": dataList,
            "dataList_Day": [],
            "dataList_Month": [],
            "dataList_Year": []
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
        var _SQL = " SELECT  DISTINCT(DataTime) FROM ProductInfo  " +
            " where  SatID ='" + req.params.SatID
            + "' and InstrumentName ='" + req.params.InstID
            + "' and ProductName ='" + req.params.ProdName
            + "' and Resolution =" + req.params.Resolution
            + " and IsExitFlag = 1 order by CreatTime desc"
            + " limit 1000";

        var client = mysql.createConnection({
            "host": config.MYSQL.host,
            "user": config.MYSQL.user,
            "password": config.MYSQL.password,
            "database": config.MYSQL.database
        });

        client.connect();
        client.query(_SQL, function selectCb(err, results) {
                if (err) {
                    // throw err;
                    res.end(JSON.stringify(err));
                    next();
                }
                if (results) {


                    var DataListALL = _getDataListByDataLength(results);
                    var dataList_Year = DataListALL.dataList_Year;
                    var dataList_Month = DataListALL.dataList_Month;
                    var dataList_Day = DataListALL.dataList_Day;
                    var dataList_Min = DataListALL.dataList_Min;

                    dataList_Min = _.sortBy(dataList_Min);
                    dataList_Day = _.uniq(dataList_Day);
                    dataList_Month = _.uniq(dataList_Month);
                    dataList_Year = _.uniq(dataList_Year);
                    //整体加入完成后返回
                    var result = {
                        "dataList_Minute": dataList_Min,
                        "dataList_Day": dataList_Day,
                        "dataList_Month": dataList_Month,
                        "dataList_Year": dataList_Year
                    };

                    res.end(JSON.stringify(result));
                    next();
                }
                client.end();
            }
        );
        client.on('error', function (err) {
            if (err) {
                client.end();
            }
        });


    }


    //从本地文件目录中获取 数据存在 TXT 文件
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
        var _SQL = " SELECT  DISTINCT(DataTime) FROM ProductInfo  "
            + " where  SatID ='" + req.params.SatID
            + "' and InstrumentName ='" + req.params.InstID
            + "' and ProductName ='" + req.params.ProdName
            + "' and Resolution =" + req.params.Resolution
            + " and IsExitFlag = 1 order by CreatTime desc"
            + " limit 1000";

        var client = mysql.createConnection({
            "host": config.MYSQL.host,
            "user": config.MYSQL.user,
            "password": config.MYSQL.password,
            "database": config.MYSQL.database
        });

        client.connect();
        client.query(_SQL, function selectCb(err, results) {
                if (err) {
                    //throw err;
                    res.end(JSON.stringify(err));
                    next();
                }
                if (results) {
                    var dataList_Min = [];
                    var dataList_Day = [];
                    var dataList_Month = [];
                    var dataList_Year = [];
                    console.log(results.length);

                    var DataListALL = _getDataListByDataLength(results);
                    dataList_Year = DataListALL.dataList_Year;
                    dataList_Month = DataListALL.dataList_Month;
                    dataList_Day = DataListALL.dataList_Day;

                    dataList_Year = _.uniq(dataList_Year);
                    dataList_Month = _.uniq(dataList_Month);
                    dataList_Day = _.uniq(dataList_Day);
                    //将以年为单位的时间 扩充为分钟
                    dataList_Day.forEach(function (_StrDay) {
                        //扩充为分钟 一天为288个时次
                        for (var time = 0; time < 288; time++) {
                            var m_Str_Min = moment(new Date(_StrDay)).utc().add('minutes', 5 * time).format('YYYY-MM-DD HH:mm');
                            dataList_Min.push(m_Str_Min);
                        }
                    });
                    dataList_Min = _.uniq(dataList_Min);
                    dataList_Min = _.sortBy(dataList_Min);
                    //整体加入完成后返回
                    var result = {
                        "dataList_Minute": dataList_Min,
                        "dataList_Day": dataList_Day,
                        "dataList_Month": dataList_Month,
                        "dataList_Year": dataList_Year
                    };

                    res.end(JSON.stringify(result));
                    next();
                }
                client.end();
            }
        );
        client.on('error', function (err) {
            if (err) {
                client.end();
            } else {
                client.end();
            }
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

                            //对流进行处理函数
                            var reverseStream = concat(function (text) {
                                //  var _DataList1 = text.toString();
                                //将日期分割为列表形式
                                var _DataList = text.toString().split("\n\r\n");
                                var dataList_Min = [];
                                var dataList_Day = [];
                                var dataList_Month = [];
                                var dataList_Year = [];
                                if (_DataList && _DataList.length > 0) {

                                    //循环添加
                                    for (var len = 0; len < _DataList.length; len++) {
                                        var _Item = _DataList[len];
                                        if (_Item.length === 8) {
                                            //切割加入年月日
                                            //年
                                            var _StrYear = _Item.substring(0, 4);
                                            dataList_Year.push(_StrYear);
                                            //月
                                            var _StrMonth = _Item.substr(0, 4) + "-" + parseInt(_Item.substr(4, 2)).toString();
                                            dataList_Month.push(_StrMonth);
                                            //日
                                            var _StrDay = _Item.substr(0, 4) + "-" + _Item.substr(4, 2) + "-" + _Item.substr(6, 2);
                                            dataList_Day.push(_StrDay);
                                        }
                                    }
                                    //去重复 年月日 去重复
                                    dataList_Day = _.uniq(dataList_Day);
                                    dataList_Month = _.uniq(dataList_Month);
                                    dataList_Year = _.uniq(dataList_Year);
                                    //对每日的数据进行处理扩充为分钟模式 针对去重复后的进行 减少计算次数
                                    dataList_Day.forEach(function (_DayStr) {
                                        //扩充为分钟 一天为288个时次
                                        for (var time = 0; time < 288; time++) {
                                            var m_Str_Min = moment(new Date(_DayStr)).utc().add('minutes', 5 * time).format('YYYY-MM-DD HH:mm');
                                            dataList_Min.push(m_Str_Min);
                                        }
                                    });

                                    //整体加入完成后返回
                                    var result = {
                                        "dataList_Minute": dataList_Min,
                                        "dataList_Day": dataList_Day,
                                        "dataList_Month": dataList_Month,
                                        "dataList_Year": dataList_Year
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
                if (err) {
                    client.end();
                }
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
        var _Path = config.POSFilePath;

        var m_FileName = req.params.FTPFileName;
        var m_File = _Path + "/" + m_FileName;

        // m_File = "D://File_2017//GIT//ShinetekView-app//api//test//" + m_FileName;

        if (fs.existsSync(m_File)) {
            //文件读取
            var m_FileStr = fs.readFileSync(m_File, 'utf8');

            var _DataList = m_FileStr.toString().split("\u0000\n\u0000");
            _DataList = _.uniq(_DataList);
            var dataList_Min = [];
            var dataList_Day = [];
            var dataList_Month = [];
            var dataList_Year = [];
            if (_DataList && _DataList.length > 0) {
                //循环添加
                for (var len = 0; len < _DataList.length; len++) {
                    var _Item = _DataList[len];
                    if (_Item.length === 8) {
                        //切割加入年月日
                        //年
                        var _StrYear = _Item.substring(0, 4);
                        dataList_Year.push(_StrYear);
                        //月
                        var _StrMonth = _Item.substr(0, 4) + "-" + parseInt(_Item.substr(4, 2)).toString();
                        dataList_Month.push(_StrMonth);
                        //日
                        var _StrDay = _Item.substr(0, 4) + "-" + _Item.substr(4, 2) + "-" + _Item.substr(6, 2);
                        dataList_Day.push(_StrDay);
                    }
                }
                //去重复 年月日 去重复
                dataList_Day = _.uniq(dataList_Day);
                dataList_Month = _.uniq(dataList_Month);
                dataList_Year = _.uniq(dataList_Year);
                //对每日的数据进行处理扩充为分钟模式 针对去重复后的进行 减少计算次数
                dataList_Day.forEach(function (DayItemStr) {
                    //扩充为分钟 一天为288个时次
                    for (var time = 0; time < 288; time++) {
                        var m_Str_Min = moment(new Date(DayItemStr)).utc().add('minutes', 5 * time).format('YYYY-MM-DD HH:mm');
                        dataList_Min.push(m_Str_Min);
                    }
                });

                //整体加入完成后返回
                var result = {
                    "dataList_Minute": dataList_Min,
                    "dataList_Day": dataList_Day,
                    "dataList_Month": dataList_Month,
                    "dataList_Year": dataList_Year
                };
                res.end(JSON.stringify(result));
                next();
            }
        } else {
            res.end();
            next();
        }
    }

    //http://10.24.4.121:4001/api/datalistfy4a/FY4A/AGRIX/PRJ/TEST/1000
    function _getDataListByFY4A(req, res, next) {
        //从数据库中获取 FY4A版本 的 全状态数据 。
        if (_.isUndefined(req.params.SatID)
            || _.isUndefined(req.params.InstID)
            || _.isUndefined(req.params.ProdName)
            || _.isUndefined(req.params.Resolution)
            || _.isUndefined(req.params.ObserveType)) {
            res.end("请确认参数如下格式：/datalist/:SatID/:InstID/:ProdName/:ObserveType/:Resolution"
                + "1SatID:" + req.params.SatID
                + "2InstID:" + req.params.InstID
                + "3ProdName:" + req.params.ProdName
                + "4ObserveType:" + req.params.ObserveType
                + "5Resolution:" + req.params.Resolution);
            next();
        }
        //获取Select 语句
        var _SQL = " SELECT  * FROM ProductInfo  " +
            " where  SatID ='" + req.params.SatID
            + "' and InstrumentName ='" + req.params.InstID
            + "' and ProductName ='" + req.params.ProdName
            + "' and Resolution =" + req.params.Resolution
            + " and ObserveType ='" + req.params.ObserveType
            + "' and IsExitFlag = 1 order by CreatTime desc"
            + " limit 1000";
        console.log(_SQL);

        var client = mysql.createConnection({
            "host": config.MYSQL.host,
            "user": config.MYSQL.user,
            "password": config.MYSQL.password,
            "database": config.MYSQL.database
        });
        client.connect();
        client.query(_SQL, function selectCb(err, results) {
                if (err) {
                    res.end(JSON.stringify(err));
                    next();
                }
                if (results) {
                    var DataList = results;
                    var DataListRteturn = [];
                    var FYA_Handler = require("../modules/fy4_datainfo_module.js");
                    DataListRteturn = FYA_Handler.getDataInfo(DataList);
                    /*  if (DataList && DataList.length > 0) {
                     DataList.forEach(function (DataItem) {
                     var DemoReturn = {};
                     if (DataItem.StartTime && DataItem.EndTime) {
                     var DataBeginTime = DataItem.StartTime.toString();
                     var DataEndTime = DataItem.EndTime.toString();
                     //格式转化
                     var DataBeginTimem = moment.utc(DataBeginTime, "YYYYMMDDHHmmss");
                     var DataEndTimem = moment.utc(DataEndTime, "YYYYMMDDHHmmss");
                     DemoReturn.BeginTime = DataBeginTimem.format("YYYY-MM-DD HH:mm:ss");
                     DemoReturn.EndTime = DataEndTimem.format("YYYY-MM-DD HH:mm:ss");
                     //对年月日时分秒 进行 判定
                     if (DemoReturn.BeginTime !== 'Invalid date' && DemoReturn.EndTime !== 'Invalid date') {
                     //加入处理
                     DataListRteturn.push(DemoReturn);
                     }
                     }
                     });
                     }*/
                    res.end(JSON.stringify(DataListRteturn));
                    next();
                }
                client.end();
            }
        );
        client.on('error', function (err) {
            if (err) {
                client.end();
            }
        });

    }


    /**
     * 获取数据字段 根据 长度
     * @private
     */
    function _getDataListByDataLength(results) {
        var dataList_Year = [];
        var dataList_Month = [];
        var dataList_Day = [];
        var dataList_Min = [];
        for (var i = 0; i < results.length; i++) {
            //加入数据
            var _Item = results[i].DataTime;
            switch (_Item.length) {
                case 4:
                {
                    //年
                    dataList_Year.push(_getTimeStrFormDataTime(_Item, 'year'));
                    break;
                }
                case 6:
                {
                    dataList_Year.push(_getTimeStrFormDataTime(_Item, 'year'));
                    dataList_Month.push(_getTimeStrFormDataTime(_Item, 'month'));
                    break;
                }
                case 8:
                {
                    dataList_Year.push(_getTimeStrFormDataTime(_Item, 'year'));
                    dataList_Month.push(_getTimeStrFormDataTime(_Item, 'month'));
                    dataList_Day.push(_getTimeStrFormDataTime(_Item, 'day'));
                    break;
                }
                case 13:
                {
                    dataList_Year.push(_getTimeStrFormDataTime(_Item, 'year'));
                    dataList_Month.push(_getTimeStrFormDataTime(_Item, 'month'));
                    dataList_Day.push(_getTimeStrFormDataTime(_Item, 'day'));
                    dataList_Min.push(_getTimeStrFormDataTime(_Item, 'minute'));
                    break;
                }
                default:
                {
                    // console.log(_Item);
                    break;
                }
            }
        }
        return {
            "dataList_Year": dataList_Year,
            "dataList_Month": dataList_Month,
            "dataList_Day": dataList_Day,
            "dataList_Min": dataList_Min
        };
    }

    function _getTimeStrFormDataTime(timeStr, timeMode) {
        var returnTimeStr = '';
        switch (timeMode) {
            case  "year":
            {
                returnTimeStr = timeStr.substring(0, 4);
                break;
            }
            case  "month":
            {
                returnTimeStr = timeStr.substr(0, 4) + "-" + parseInt(timeStr.substr(4, 2)).toString();

                break;
            }
            case  "day":
            {

                returnTimeStr = timeStr.substr(0, 4) + "-" + timeStr.substr(4, 2) + "-" + timeStr.substr(6, 2);

                break;
            }
            case  "minute":
            {
                returnTimeStr = timeStr.substr(0, 4) + "-" + timeStr.substr(4, 2) + "-" + timeStr.substr(6, 2)
                    + " " + timeStr.substr(9, 2) + ":" + timeStr.substr(11, 2);
                break;
            }
            default:
                break;
        }
        return returnTimeStr;

    }
})
();

