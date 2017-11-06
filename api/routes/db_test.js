/**
 * Created by lenovo on 2017/2/23.
 */
/**
 * Created by FanTaSyLin on 2016/12/12
 *
 * 提供获取数据列表的API
 */


/// <reference path="./../../typings/index.d.ts" />


'use strict';

var mysql = require('mysql');
var config = require("../config.json");

_getDataListByCondition();

//静止卫星获取数据 FY4A()
function _getDataListByCondition() {
    //获取Select 语句
    var m_SQL = " select * from ProductInfo limit 10";
    var client = mysql.createConnection({
        host: config.MYSQL.host,
        user: config.MYSQL.user,
        password: config.MYSQL.password,
        database: config.MYSQL.database
    });

    client.connect();
    client.query(m_SQL, function selectCb(err, results, fields) {
            if (err) {
                console.log("db connect err" + err);
            }
            if (results) {
                console.log("mySQL 数据库连接正常。" + client.host);
            }
            client.end();
        }
    );
    client.on('error', function (err) {
        client.end();
    });


}



