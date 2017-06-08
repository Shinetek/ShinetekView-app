/**
 * Created by lenovo on 2017/3/9.
 * 调色板控件 返回json形式的调色板
 */
(function () {
    'use strict';
    var fs = require("fs");

    var _getpalettejson = function (req, res, next) {
        var m_proType = req.params.proType;
        var m_procbname = req.params.procbname;
        if (m_procbname.toString().indexOf('json') > 0 && m_proType != undefined) {
            var data = fs.readFileSync("./resource/palette/" + m_proType + "/" + m_procbname);
            res.end(data);
            next();
        }
        else {
            res.end("");
            next();
        }
    };
    exports._getpalettejson = _getpalettejson;
})();