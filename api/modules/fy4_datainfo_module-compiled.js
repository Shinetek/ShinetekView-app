/**
 * Created by lenovo on 2017/10/27.
 */
(function () {
    'use strict';

    var fs = require("fs");
    var moment = require("moment");
    var _ = require("lodash");

    /**
     * 获取数据字段 根据 长度
     * @private
     */
    function _getDataInfo(results) {

        var dataList_Year = [];
        var dataList_Month = [];
        var dataList_Day = [];
        var dataList_Min = [];
        for (var i = 0; i < results.length; i++) {
            var TimeBegin = results[i].StartTime;
            var TimeEnd = results[i].EndTime;
            //console.log(TimeBegin + ":" + TimeEnd);
            var BeginMoment = moment.utc(TimeBegin, "YYYYMMDDHHmmss");
            var EndMoment = moment.utc(TimeEnd, "YYYYMMDDHHmmss");
            var BeginTimeStr = TimeBegin;
            var IsFlag = 0;
            /* if (results[i].ObserveType === 'DISK') {
             IsFlag = 1;
             }*/

            if (i % 2 === 1) {
                IsFlag = 1;
            }
            // console.log("i%2:" + i + "=" + i % 2);
            while (BeginMoment.isBefore(EndMoment)) {
                var timeYear = BeginMoment.format("YYYY");
                var timeMonth = BeginMoment.format("YYYY-MM");
                var timeDay = BeginMoment.format("YYYY-MM-DD");
                var timeMinute = BeginMoment.format("YYYY-MM-DD HH:mm");
                var YearJson = { TimeStr: timeYear, TimeBegin: BeginTimeStr, IsFlag: IsFlag };
                var MonthJson = { TimeStr: timeMonth, TimeBegin: BeginTimeStr, IsFlag: IsFlag };
                var DayJson = { TimeStr: timeDay, TimeBegin: BeginTimeStr, IsFlag: IsFlag };
                var MinuteJson = { TimeStr: timeMinute, TimeBegin: BeginTimeStr, IsFlag: IsFlag };
                dataList_Year.push(YearJson);
                dataList_Month.push(MonthJson);
                dataList_Day.push(DayJson);
                dataList_Min.push(MinuteJson);
                BeginMoment = BeginMoment.add(1.0, 'minute');
            }
        }
        dataList_Year = _.uniqBy(dataList_Year, "TimeStr");
        dataList_Month = _.uniqBy(dataList_Month, "TimeStr");
        dataList_Day = _.uniqBy(dataList_Day, "TimeStr");
        dataList_Min = _.uniqBy(dataList_Min, "TimeStr");
        return {
            "DataInfoYear": dataList_Year,
            "DataInfoMonth": dataList_Month,
            "DataInfoDay": dataList_Day,
            "DataInfoMinute": dataList_Min
        };
    }

    exports.getDataInfo = _getDataInfo;
})();

//# sourceMappingURL=fy4_datainfo_module-compiled.js.map