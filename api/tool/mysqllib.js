/**
 * Created by lenovo on 2017/4/25.
 */
//此处使用的是MySQL@2.11.1
var mysqldb = {version: "0.0.1"};
var mysql = require('mysql');

//连接池
var pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'mycrm'
});

mysqldb.isconnect = function (params, callback) {
};
//通用执行sql方法
mysqldb.query = function (sql, params, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            logger.error(err.message, err);
            if (callback) {
                callback(err);
            }
        } else {
            connection.query(sql, params, callback);
            connection.release();
        }
    });
};
module.exports = mysqldb;