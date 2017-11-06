/**
 * Created by lenovo on 2017/9/8.
 */

function _GetTimeList(logStr) {
    var fs = require('fs');
    // var log_Data = fs.readFileSync('./wind_detect_radar.log', 'utf-8');
    var log_Data = logStr;
    //console.log(data);
    var log_Data_sp = log_Data.split("success");
    var TimeSp = [];
    console.log(log_Data_sp.length);
    for (var i = 0; i < log_Data_sp.length; i++) {
        // console.log(i);
        //  console.log(date_sp[i]);
        var data_sp1 = log_Data_sp[i].split("] ");
        var timesp = data_sp1[data_sp1.length - 1];
        // console.log(data_sp1[data_sp1.length - 1]);

        var patt1 = new RegExp(/[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])_(20|21|22|23|[0-1]\d)[0-5]\d/);
        var testResult = patt1.exec(timesp);
        if (testResult) {
            TimeSp.push(timesp);
        }
        //  console.log(patt1.exec(timesp));
    }
    console.log("时间码数目:" + TimeSp.length);
    console.log(TimeSp);
    return TimeSp;
}

_GetTimeList('');

//# sourceMappingURL=readtest-compiled.js.map