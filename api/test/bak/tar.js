/**
 * Created by lenovo on 2017/6/12.
 */

var fs = require('fs');
var moment = require("moment");

var m_yTile = 1;
var m_levely = m_yTile << 8;
console.log(m_levely);
tar();
//untar();
function tar() {

    var m_FilePath = "/FY4COMM/FY4A/L2/IMAGE/PRJ/2000M/1120/";
    var m_FileTarPath = "/FY4COMM/webclient/Data/2000M/1120/";
    var m_Time = moment("2017-06-11 00:00:00");
    var m_FileName = 'tarPRJ2000_1120.sh';


    for (var i = 0; i < 143; i++) {
        var m_Time_now = m_Time.add(10, "minute");
        m_TimeStr = m_Time_now.format("YYYYMMDD_HHmm");
        var m_ZIP = "tar -zcvf " + m_FileTarPath + m_TimeStr + ".tar.gz " + "" + m_TimeStr + "  ";
        fs.appendFileSync(m_FileName, m_ZIP);
        console.log(m_ZIP);
    }
}


//demo "   tar zxvf 20170611_2340.tar.gz    --strip-components 5";
function untar() {
    var m_Time = moment("2017-06-11 00:00:00");

    var m_UnFileName = 'untarQPE.sh';
    var m_UnzipFilePath = "/shkdata/FY4COMM/FY4A/L2/IMAGE/RDC/";
    for (var i = 0; i < 143; i++) {
        var m_Time_now = m_Time.add(10, "minute");

        m_TimeStr = m_Time_now.format("YYYYMMDD_HHmm");
        var m_ZIP = "tar zxvf " + m_TimeStr + ".tar.gz   ";
        //var m_ZIP = "tar zxvf " + m_TimeStr + ".tar.gz  --strip-components 5";
        fs.appendFileSync(m_UnFileName, m_ZIP);
        console.log(m_ZIP);


    }
}