/**
 * Created by lenovo on 2017/4/12.
 * 动画右侧部分图层检测
 * 遍历文件夹打印文件夹内容
 * */

var m_TilePath = "D://项目工程//省级站//基础图层数据//tianditu//tianditu//7";
var fs = require("fs");

//CheckFile(m_TilePath);
function CheckFile(TilePath) {
    var m_LogJson = {};
    m_LogJson.Level1Path = TilePath;
    console.log("1级路径:" + TilePath);
    var filesList = fs.readdirSync(TilePath);
    //  console.log(filesList);
    m_LogJson.Level2Path = filesList;
    var m_Level3 = [];
    filesList.forEach(function (m_path1) {
        try {
            var m_itemPath = TilePath + "//" + m_path1;
            m_itemfilesList = fs.readdirSync(m_itemPath);
            if (m_itemfilesList.length != 144) {
                console.log(m_itemPath);
            }
            m_Level3.push(m_itemfilesList.length);
        } catch (err) {

        }

    });
    m_LogJson.Level3 = m_Level3;
    console.log(m_LogJson);
}

CheckImageFile();
function CheckImageFile() {

    var Path6 = 0.009765625;
    var Path7 = 0.0048828125;
    var local6_x = 46 * Path6;
    var local7_x = 90 * Path7;
    console.log(local6_x + ":" + local7_x);
    var local6_y = 57 * Path6;
    var local7_y = 113 * Path7;
    console.log(local6_y + ":" + local7_y);
    var n = Math.pow(2, 7 + 1);
    console.log(n);
}

