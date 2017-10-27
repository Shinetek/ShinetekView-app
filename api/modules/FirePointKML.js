/**
 * Created by liuym on 2017/1/22.
 */

var fs = require("fs");
var ftp = require("ftp");
var ftpInfo = require("../config.json");

/**
 * 通过FTP目录进行 火点数据获取
 * @param req
 * @param res
 * @param next
 * @constructor
 */
var GetKMLFile = function (req, res, next) {
    console.log('GetKMLFile');

    //修改为kml格式的头  res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader('Content-Type', 'application/vnd.google-earth.kml+xml', "Access-Control-Allow-Origin", "*", 'Access-Control-Allow-Headers","X-Requested-With');

    //api字段检验
    var sat = req.params.sat;
    var sensor = req.params.sensor;

    var DateParam = req.params.date;
    var fullname = req.params.fullname;

    /* if (DateParam.length < 12) {
     res.end('Date format should be YYYYMMDDHHMM !');
     }*/
    var dateFormat = DateParam.substring(0, 8) + '_' + DateParam.substring(8, 12);

    //连接ftp，获取文件信息
    var clientFTP = new ftp();
    clientFTP.connect({
        host: ftpInfo.FirePointFTP.host,
        port: ftpInfo.FirePointFTP.port,
        user: ftpInfo.FirePointFTP.uid,
        password: ftpInfo.FirePointFTP.pw,
        connTimeout: '2000'
    });

    clientFTP.on('error', function (err) {
        if (err) {
            console.log(err);
            if (clientFTP != null) {
                clientFTP.end();
                clientFTP.destroy();
                clientFTP = null;
                console.log('err成功关闭连接ftp:' + ftpInfo.FirePointFTP.host + '!');
            }
        }
    });

    var data = null;
    clientFTP.on('ready', function () {
        console.log('ready成功连接至ftp:' + ftpInfo.FirePointFTP.host + '!');

        //方法一： 根据参数sat sensor date来拼接KML文件名称
        //clientFTP.list(ftpInfo.FirePointFTP.path + '*'+sat+'*'+sensor+'*'+dateFormat+'*.KML',function (err,list){
        //    if(err) {
        //        console.log(err);
        //
        //        if(clientFTP!=null){
        //            clientFTP.end();
        //            clientFTP.destroy();
        //            clientFTP=null;
        //            console.log('err已断开连接'+ftpInfo.FirePointFTP.host+'!');
        //        }
        //
        //        res.end('Get KML file error! '+err);
        //    }
        //    else
        //    {
        //        if(Boolean(list) && list.length==1){
        //
        //            clientFTP.get(ftpInfo.FirePointFTP.path +list[0].name, function (err, stream) {
        //                console.log(list[0].name);
        //                if (err) {
        //                    console.log(err);
        //
        //                    if(clientFTP!=null){
        //                        clientFTP.end();
        //                        clientFTP.destroy();
        //                        clientFTP=null;
        //                        console.log('err已断开连接'+ftpInfo.FirePointFTP.host+'!');
        //                    }
        //
        //                    res.end('Get KML file error! '+err);
        //                }
        //                stream.on('data',function(chunk){
        //                    if(data==null){
        //                        data ='';
        //                    }
        //                    data += chunk;
        //                });
        //
        //                stream.once('end', function () {
        //                    console.log('参数： '+sat+' '+sensor+ ' '+DateParam+ ' '+fullname);
        //
        //                    if(clientFTP!=null){
        //                        clientFTP.end();
        //                        clientFTP.destroy();
        //                        clientFTP=null;
        //                        console.log('ready已断开连接'+ftpInfo.FirePointFTP.host+'!');
        //                    }
        //                    res.end(data);
        //                });
        //                // stream.pipe(fs.createWriteStream(localPath + '/' + timeTableName));
        //            });
        //
        //        }else{
        //            res.end('Get KML file error! '+err);
        //        }
        //    }
        //});

        //方法二： 根据参数fullname来直接读取KML文件
        clientFTP.get(ftpInfo.FirePointFTP.path + fullname, function (err, stream) {
            console.log(ftpInfo.FirePointFTP.path + fullname);
            if (err) {
                console.log(err);

                if (clientFTP != null) {
                    clientFTP.end();
                    clientFTP.destroy();
                    clientFTP = null;
                    console.log('err已断开连接' + ftpInfo.FirePointFTP.host + '!');

                }

                res.end('Get KML file error! ' + err);
            }
            stream.on('data', function (chunk) {
                if (data == null) {
                    data = '';
                }
                data += chunk;
            });

            stream.once('end', function () {
                console.log('参数： ' + sat + ' ' + sensor + ' ' + DateParam + ' ' + fullname);

                if (clientFTP != null) {
                    clientFTP.end();
                    clientFTP.destroy();
                    clientFTP = null;
                    console.log('ready已断开连接' + ftpInfo.FirePointFTP.host + '!');
                }
                res.end(data);
                // res.end(data);
            });
            // stream.pipe(fs.createWriteStream(localPath + '/' + timeTableName));
        });

    });

    next();
};

exports._GetKMLFile = GetKMLFile;

/**
 * 通过本地文件目录进行火点文件获取
 * @param req
 * @param res
 * @param next
 * @constructor
 */
var GetKMLFilebyPath = function (req, res, next) {
    console.log('GetKMLFilebyPath');
    //修改为kml格式的头  res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader('Content-Type',

        'application/vnd.google-earth.kml+xml',
        "Access-Control-Allow-Origin", "*",
        'Access-Control-Allow-Headers","X-Requested-With');

    //api字段检验
    var sat = req.params.sat;
    var sensor = req.params.sensor;

    var DateParam = req.params.date;
    var fullname = req.params.fullname;


    //连接ftp，获取文件信息

    var m_kmldata = null;
    var FilePath = ftpInfo.FirePointFTP.path + fullname;
    var exist = fs.existsSync(FilePath);
    console.log(exist);
    console.log(FilePath);
    m_kmldata = fs.readFileSync(FilePath);
    console.log(m_kmldata);
    res.end(m_kmldata);
    next();
};

exports._GetKMLFilebyPath = GetKMLFilebyPath;
