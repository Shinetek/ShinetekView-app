/**
 * Created by fanli on 2016/3/5.
 */

var shkUtil = {version: "0.0.2"};

module.exports = shkUtil;

/**
 * 获取本机IP
 * @returns {string} ip
 */
shkUtil.getLoacalIP = function () {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
};

/**
 * 获取客户端IP
 * @returns {string} ip
 */
shkUtil.getClientIP = function (req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};

/**
 * 日期格式化
 * @param fmt
 * @returns string
 * exp:
 * new Date().format("yyyyMMdd hhmmss")
 * new Date().format("yyyy-MM-dd hh:mm:ss")
 * new Date().format("yy-M-d")
 * new Date().format("hh:mm:ss")
 * ....
 */
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

Date.prototype.utcDate = function () {
    var utcYYYY = this.getUTCFullYear();
    var utcMM = this.getUTCMonth() + 1;
    var utcdd = this.getUTCDate();
    var utcHH = this.getUTCHours();
    var utcmm = this.getUTCMinutes();
    var utcss = this.getUTCSeconds();
    return new Date(utcYYYY + '-' + utcMM + '-' + utcdd + ' ' + utcHH + ':' + utcmm + ':' + utcss);
};

Date.prototype.addDay = function (num) {
    var n = this.getTime() + num * 24 * 60 * 60 * 1000;
    return new Date(n);
};

Date.prototype.addHour = function (num) {
    var n = this.getTime() + num * 60 * 60 * 1000;
    return new Date(n);
};

String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出

                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};



