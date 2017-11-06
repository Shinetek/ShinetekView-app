/**
 * Created by lenovo on 2017/6/5.
 */


function Convert() {
    var m_FilePath = "PGS.txt";
    var m_FilePath_json = "PGS.json";
    var fs = require('fs');
    var m_FileInfo = fs.readFileSync(m_FilePath);
    var m_Json = m_FileInfo.toString();
    for (var i = 0; i < 2241; i++) {
        var m_FileRe = "/* " + i + " */";
        console.log(m_FileRe);
        m_Json = m_Json.replace(m_FileRe, ",");
    }

    fs.writeFileSync(m_FilePath_json, m_Json);
}


function Dist() {
    var m_FilePath_json = "PGS.json";
    var m_FileInfo = fs.readFileSync(m_FilePath_json);
    console.log(m_FileInfo.Count);
}

