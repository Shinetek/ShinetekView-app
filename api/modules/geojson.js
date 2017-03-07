/**
 * Created by lenovo on 2017/2/8.
 */
var fs = require("fs");

var _GetGEOJsonFile = function (req, res, next) {
    var m_FileName = req.params.fullname;
    if (m_FileName.toString().indexOf('json') > 0) {
        var data = fs.readFileSync("./resource/" + m_FileName);
        res.end(data);
        next();
    }
    else {
        res.end("");
        next();
    }
};
exports._GetGEOJsonFile = _GetGEOJsonFile;